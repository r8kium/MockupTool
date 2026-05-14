#!/usr/bin/env python3
"""
Convert Rotato .rotato device files to GLTF 2.0.

Usage:
  python3 rotato_extract.py <input.rotato> <output.gltf>
  python3 rotato_extract.py --batch <scenes_dir> <output_dir>

Rotato .rotato files are LZFSE-compressed NSKeyedArchive binary plists
containing a SceneKit scene graph (SCNNode / SCNGeometry hierarchy).
"""

import sys
import os
import json
import struct
import base64
import math
import plistlib
import subprocess
import tempfile
from pathlib import Path


# ── UID resolution ────────────────────────────────────────────────────────────

def make_resolver(objects):
    def resolve(v, depth=0):
        if depth > 64:
            return None
        if isinstance(v, plistlib.UID):
            return resolve(objects[v.data], depth + 1)
        if isinstance(v, dict):
            return {k: resolve(vv, depth + 1) for k, vv in v.items()}
        if isinstance(v, list):
            return [resolve(vv, depth + 1) for vv in v]
        return v
    return resolve


def resolve_uid(objects, v):
    if isinstance(v, plistlib.UID):
        return objects[v.data]
    return v


# ── NSKeyedArchive helpers ────────────────────────────────────────────────────

def classname(obj, objects):
    """Return the $classname of an NSKeyedArchive object dict."""
    cls_ref = obj.get('$class')
    if cls_ref is None:
        return None
    cls_obj = resolve_uid(objects, cls_ref)
    if isinstance(cls_obj, dict):
        return cls_obj.get('$classname')
    return None


def ns_objects_list(obj, objects):
    """Resolve NS.objects array from a container object."""
    raw = obj.get('NS.objects', [])
    return [resolve_uid(objects, v) for v in raw]


def get_bytes(obj, objects, key='NS.data'):
    """Get raw bytes from an NSData-wrapped object."""
    raw = obj.get(key)
    if raw is None:
        return None
    if isinstance(raw, bytes):
        return raw
    resolved = resolve_uid(objects, raw)
    if isinstance(resolved, dict):
        inner = resolved.get('NS.data') or resolved.get('NS.bytes')
        if isinstance(inner, bytes):
            return inner
    return None


# ── Matrix math ───────────────────────────────────────────────────────────────

def mat4_identity():
    return [1.0,0.0,0.0,0.0, 0.0,1.0,0.0,0.0, 0.0,0.0,1.0,0.0, 0.0,0.0,0.0,1.0]


def mat4_mul(A, B):
    """Multiply 4x4 row-major matrices: C = A * B."""
    C = [0.0] * 16
    for r in range(4):
        for c in range(4):
            for k in range(4):
                C[r*4+c] += A[r*4+k] * B[k*4+c]
    return C


def mat4_from_trs(pos, axis_angle, scale, translation_only=False):
    """
    Build 4x4 row-major TRS matrix (p' = M * p, column vector convention).
    axis_angle = (ax, ay, az, angle_radians).
    translation_only: ignore rotation (for animated lid-hinge nodes).
    """
    tx, ty, tz = pos if pos else (0.0, 0.0, 0.0)
    sx, sy, sz = scale if scale else (1.0, 1.0, 1.0)

    if not translation_only and axis_angle:
        ax, ay, az, angle = axis_angle
        ln = math.sqrt(ax*ax + ay*ay + az*az)
        if ln > 1e-9 and abs(angle) > 1e-9:
            ax, ay, az = ax/ln, ay/ln, az/ln
            c = math.cos(angle); s = math.sin(angle); t = 1.0 - c
            r00 = t*ax*ax + c;      r01 = t*ax*ay - s*az; r02 = t*ax*az + s*ay
            r10 = t*ax*ay + s*az;   r11 = t*ay*ay + c;    r12 = t*ay*az - s*ax
            r20 = t*ax*az - s*ay;   r21 = t*ay*az + s*ax; r22 = t*az*az + c
        else:
            r00=r11=r22=1.0; r01=r02=r10=r12=r20=r21=0.0
    else:
        r00=r11=r22=1.0; r01=r02=r10=r12=r20=r21=0.0

    # Row-major column-vector M = T * R * S
    return [
        r00*sx, r01*sy, r02*sz, tx,
        r10*sx, r11*sy, r12*sz, ty,
        r20*sx, r21*sy, r22*sz, tz,
        0.0,    0.0,    0.0,    1.0,
    ]


def is_identity(mat):
    ident = mat4_identity()
    return all(abs(mat[i] - ident[i]) < 1e-6 for i in range(16))


def transform_positions(vecs, mat):
    """Apply 4x4 row-major matrix to list of (x,y,z) position tuples."""
    m = mat
    return [
        (v[0]*m[0] + v[1]*m[1] + v[2]*m[2]  + m[3],
         v[0]*m[4] + v[1]*m[5] + v[2]*m[6]  + m[7],
         v[0]*m[8] + v[1]*m[9] + v[2]*m[10] + m[11])
        for v in vecs
    ]


def transform_normals(vecs, mat):
    """Apply inverse-transpose of upper 3x3 to normals, then renormalize."""
    m = mat
    # Cofactor matrix (= adjugate^T of upper 3x3; handles uniform scale correctly)
    c00 = m[5]*m[10] - m[6]*m[9]
    c01 = m[6]*m[8]  - m[4]*m[10]
    c02 = m[4]*m[9]  - m[5]*m[8]
    c10 = m[2]*m[9]  - m[1]*m[10]
    c11 = m[0]*m[10] - m[2]*m[8]
    c12 = m[1]*m[8]  - m[0]*m[9]
    c20 = m[1]*m[6]  - m[2]*m[5]
    c21 = m[2]*m[4]  - m[0]*m[6]
    c22 = m[0]*m[5]  - m[1]*m[4]
    result = []
    for v in vecs:
        nx = v[0]*c00 + v[1]*c10 + v[2]*c20
        ny = v[0]*c01 + v[1]*c11 + v[2]*c21
        nz = v[0]*c02 + v[1]*c12 + v[2]*c22
        ln = math.sqrt(nx*nx + ny*ny + nz*nz)
        result.append((nx/ln, ny/ln, nz/ln) if ln > 1e-9 else v)
    return result


# ── SCNNode transform reading ─────────────────────────────────────────────────

def read_bytes_vec(val, objects, n):
    """Read n floats from a bytes field (position=3, rotation=4, scale=3)."""
    val = resolve_uid(objects, val) if isinstance(val, plistlib.UID) else val
    if isinstance(val, bytes) and len(val) == n * 4:
        return struct.unpack(f'{n}f', val)
    return None


def read_node_transform(node_obj, objects):
    """
    Returns (pos, axis_angle, scale, is_animated).
    pos = (x,y,z), axis_angle = (ax,ay,az,angle_rad), scale = (x,y,z).
    is_animated = True if this node has an animation-driven transform (e.g. lid hinge).
    """
    pos         = read_bytes_vec(node_obj.get('position'), objects, 3) or (0.0, 0.0, 0.0)
    axis_angle  = read_bytes_vec(node_obj.get('rotation'), objects, 4)
    scale       = read_bytes_vec(node_obj.get('scale'),    objects, 3) or (1.0, 1.0, 1.0)
    is_animated = ('animation-keys' in node_obj or 'animations' in node_obj)
    return pos, axis_angle, scale, is_animated


# ── SCNNode tree traversal ────────────────────────────────────────────────────

def _sample_geometry_y_range(geom_obj, objects, max_verts=200):
    """Sample up to max_verts vertices and return (y_min, y_max) of the POSITION source."""
    vkey = 'kGeometrySourceSemanticVertex'
    vref = geom_obj.get(vkey)
    if vref is None:
        return None
    items = unwrap_nsarray(vref, objects)
    if not items:
        return None
    src_obj = items[0]
    if not isinstance(src_obj, dict):
        return None
    data_ref = src_obj.get('data') or src_obj.get('NS.data')
    if data_ref is None:
        return None
    raw = resolve_uid(objects, data_ref)
    if isinstance(raw, dict):
        blob = raw.get('NS.data') or raw.get('NS.bytes')
    elif isinstance(raw, bytes):
        blob = raw
    else:
        return None
    if not isinstance(blob, bytes):
        return None
    comps   = int(src_obj.get('componentsPerVector', 3))
    bpc     = int(src_obj.get('bytesPerComponent', 4))
    count   = int(src_obj.get('vectorCount', 0))
    stride  = int(src_obj.get('dataStride', comps * bpc))
    if count == 0 or bpc != 4:
        return None
    ys = []
    for k in range(min(count, max_verts)):
        try:
            v = struct.unpack_from(f'{comps}f', blob, k * stride)
            ys.append(v[1])
        except struct.error:
            break
    if not ys:
        return None
    return min(ys), max(ys)


def _detect_translation_only(objects):
    """
    Decide whether to use translation-only (vs full TRS) for all nodes.

    Two patterns observed across Rotato models:

    Pattern A — translation-only (MacBook Pro M3 14/16):
      Large Hinge position (≥ 1 unit). Lid-child positions are near zero, so
      translations accumulate and position the lid correctly. Geometry is already
      authored in the open/upright orientation; applying rotations would flatten it.

    Pattern B — full TRS (M1, Air M1/M2):
      Either:
        (a) Small Hinge position (< 1 unit): geometry is flat, rotation opens lid.
        (b) Large Hinge position but lid-child positions nearly cancel Hinge
            (child pos magnitude ≈ Hinge pos magnitude): translations sum to ~zero
            so positions alone don't assemble the model; need full TRS.

    Discrimination: check child positions relative to Hinge position.
    """
    for obj in objects:
        if not isinstance(obj, dict):
            continue
        if not ('animation-keys' in obj or 'animations' in obj):
            continue
        pos = read_bytes_vec(obj.get('position'), objects, 3)
        if not pos:
            continue
        hinge_mag = max(abs(p) for p in pos)

        if hinge_mag <= 1.0:
            # Small hinge position → pattern B(a): full TRS
            return False

        # Large hinge position: check the first lid child's own position magnitude.
        # If the child has a large position (> hinge_mag * 0.5) that would largely
        # cancel the Hinge offset, we need full TRS (pattern B(b)).
        # If the child position is small, translations properly assemble the model
        # and translation-only is correct (pattern A).
        cn_ref = obj.get('childNodes')
        if cn_ref is None:
            continue
        cn_obj = resolve_uid(objects, cn_ref)
        if not isinstance(cn_obj, dict):
            continue
        for child_ref in cn_obj.get('NS.objects', []):
            child = resolve_uid(objects, child_ref)
            if not isinstance(child, dict):
                continue
            if child.get('geometry') is None:
                continue  # skip non-geometry children (lid_default, etc.)
            child_pos = read_bytes_vec(child.get('position'), objects, 3)
            if not child_pos:
                return True  # no child pos → translation-only
            child_mag = max(abs(p) for p in child_pos)
            # If child position is large relative to hinge: translations cancel → full TRS
            if child_mag > hinge_mag * 0.5:
                return False
            return True  # child position small → translation-only

    return False


def build_world_transforms(objects):
    """
    Walk the SCNNode hierarchy starting from the SCNScene rootNode.
    Returns: dict mapping plist-object-index -> 4x4 world transform matrix.
    Only includes nodes that have a 'geometry' field.
    """
    translation_only = _detect_translation_only(objects)

    # Find SCNScene root
    scene_root_idx = None
    for i, obj in enumerate(objects):
        if isinstance(obj, dict) and classname(obj, objects) == 'SCNScene':
            root_ref = obj.get('rootNode')
            if root_ref is not None:
                scene_root_idx = root_ref.data if isinstance(root_ref, plistlib.UID) else None
            break

    if scene_root_idx is None:
        return {}

    # DFS traversal: stack of (node_idx, parent_world_mat)
    geom_transforms = {}  # geom_plist_idx -> world_mat
    stack = [(scene_root_idx, mat4_identity())]

    visited = set()
    while stack:
        node_idx, parent_world = stack.pop()
        if node_idx in visited:
            continue
        visited.add(node_idx)

        node_obj = objects[node_idx]
        if not isinstance(node_obj, dict):
            continue

        pos, axis_angle, scale, is_animated = read_node_transform(node_obj, objects)

        if translation_only:
            # In translation-only mode (MacBook Pro M3), most geometry is authored
            # upright and only needs positional offsets.
            # Exception: non-animated nodes with large own-positions (e.g. Matte_Top
            # at (-13.985, 0.27, 12.97) inside the Hinge) have geometry that is NOT
            # authored in the upright orientation and DO need their rotation applied.
            # Animated nodes (Hinge) always skip rotation so the lid stays open.
            if is_animated:
                node_translation_only = True
            else:
                own_pos_mag = max(abs(p) for p in pos) if pos else 0.0
                node_translation_only = own_pos_mag <= 1.0
        else:
            node_translation_only = False

        local_mat = mat4_from_trs(pos, axis_angle, scale, translation_only=node_translation_only)
        world_mat = mat4_mul(parent_world, local_mat)

        # If this node has a geometry, record the world transform
        geom_ref = node_obj.get('geometry')
        if geom_ref is not None:
            geom_idx = geom_ref.data if isinstance(geom_ref, plistlib.UID) else None
            if geom_idx is not None:
                geom_transforms[geom_idx] = world_mat

        # Queue children
        cn_ref = node_obj.get('childNodes')
        if cn_ref is not None:
            cn_obj = resolve_uid(objects, cn_ref)
            if isinstance(cn_obj, dict):
                for child_ref in cn_obj.get('NS.objects', []):
                    child_idx = child_ref.data if isinstance(child_ref, plistlib.UID) else None
                    if child_idx is not None and child_idx not in visited:
                        stack.append((child_idx, world_mat))

    return geom_transforms


# ── SceneKit geometry extraction ──────────────────────────────────────────────

SEMANTIC_KEYS = [
    'kGeometrySourceSemanticVertex',
    'kGeometrySourceSemanticNormal',
    'kGeometrySourceSemanticTexcoord',
    'kGeometrySourceSemanticColor',
    'kGeometrySourceSemanticTangent',
]

SEMANTIC_GLTF = {
    'kGeometrySourceSemanticVertex':   'POSITION',
    'kGeometrySourceSemanticNormal':   'NORMAL',
    'kGeometrySourceSemanticTexcoord': 'TEXCOORD_0',
    'kGeometrySourceSemanticColor':    'COLOR_0',
    'kGeometrySourceSemanticTangent':  'TANGENT',
}


def extract_source(src_obj, objects):
    """Return dict with parsed geometry source data."""
    data_ref = src_obj.get('data') or src_obj.get('NS.data')
    if data_ref is None:
        return None

    raw = resolve_uid(objects, data_ref)
    if isinstance(raw, dict):
        blob = raw.get('NS.data') or raw.get('NS.bytes')
    elif isinstance(raw, bytes):
        blob = raw
    else:
        return None

    if not isinstance(blob, bytes):
        return None

    components = int(src_obj.get('componentsPerVector', 3))
    bpc        = int(src_obj.get('bytesPerComponent', 4))
    count      = int(src_obj.get('vectorCount', 0))
    offset     = int(src_obj.get('dataOffset', 0))
    stride     = int(src_obj.get('dataStride', components * bpc))

    if count == 0:
        return None

    fmt = 'f' if bpc == 4 else 'e' if bpc == 2 else None
    if fmt is None:
        return None

    vecs = []
    for i in range(count):
        base = offset + i * stride
        vec = struct.unpack_from(f'{components}{fmt}', blob, base)
        vecs.append(vec)

    return {
        'data':       vecs,
        'components': components,
        'count':      count,
        'bpc':        bpc,
    }


def extract_element(elem_obj, objects):
    """Return dict with parsed index buffer."""
    data_ref = elem_obj.get('elementData') or elem_obj.get('data')
    if data_ref is None:
        return None

    raw = resolve_uid(objects, data_ref)
    if isinstance(raw, dict):
        blob = raw.get('NS.data') or raw.get('NS.bytes')
    elif isinstance(raw, bytes):
        blob = raw
    else:
        return None

    if not isinstance(blob, bytes):
        return None

    prim_count    = int(elem_obj.get('primitiveCount', 0))
    bytes_per_idx = int(elem_obj.get('bytesPerIndex', 4))
    prim_type     = int(elem_obj.get('primitiveType', 0))  # 0=triangles

    if prim_count == 0:
        return None

    idx_count = prim_count * 3
    fmt = {1: 'B', 2: 'H', 4: 'I'}.get(bytes_per_idx, 'I')
    indices = list(struct.unpack_from(f'{idx_count}{fmt}', blob))

    return {
        'indices': indices,
        'count':   idx_count,
        'bytes':   bytes_per_idx,
    }


def unwrap_nsarray(uid_or_obj, objects):
    """Resolve a UID to an NSArray and return its NS.objects items as resolved objects."""
    obj = resolve_uid(objects, uid_or_obj) if isinstance(uid_or_obj, plistlib.UID) else uid_or_obj
    if not isinstance(obj, dict):
        return []
    return [resolve_uid(objects, v) for v in obj.get('NS.objects', [])]


def extract_geometry(geom_obj, objects, world_mat=None):
    """
    Return sources dict and elements list for one SCNGeometry.
    If world_mat is provided and non-identity, transforms POSITION and NORMAL in-place.
    """
    sources = {}
    for sem_key in SEMANTIC_KEYS:
        ref = geom_obj.get(sem_key)
        if ref is None:
            continue
        items = unwrap_nsarray(ref, objects)
        if not items:
            continue
        src_obj = items[0]
        if not isinstance(src_obj, dict):
            continue
        parsed = extract_source(src_obj, objects)
        if parsed:
            gltf_attr = SEMANTIC_GLTF[sem_key]
            sources[gltf_attr] = parsed

    # Apply world transform to positions and normals
    if world_mat and not is_identity(world_mat):
        if 'POSITION' in sources:
            sources['POSITION']['data'] = transform_positions(sources['POSITION']['data'], world_mat)
        if 'NORMAL' in sources:
            sources['NORMAL']['data'] = transform_normals(sources['NORMAL']['data'], world_mat)

    elements = []
    elems_ref = geom_obj.get('elements')
    if elems_ref is not None:
        for elem_obj in unwrap_nsarray(elems_ref, objects):
            if isinstance(elem_obj, dict):
                parsed = extract_element(elem_obj, objects)
                if parsed:
                    elements.append(parsed)

    return sources, elements


# ── GLTF builder ──────────────────────────────────────────────────────────────

def pack_floats(vecs):
    flat = [c for v in vecs for c in v]
    return struct.pack(f'{len(flat)}f', *flat)


def pack_indices(indices, bpi):
    fmt = {2: 'H', 4: 'I'}[bpi]
    return struct.pack(f'{len(indices)}{fmt}', *indices)


def vec_min_max(vecs):
    if not vecs:
        return [], []
    n = len(vecs[0])
    mn = [min(v[i] for v in vecs) for i in range(n)]
    mx = [max(v[i] for v in vecs) for i in range(n)]
    return mn, mx


def build_gltf(meshes_data):
    """
    meshes_data: list of {'name': str, 'sources': dict, 'elements': list}
    Returns GLTF dict (JSON-serialisable).
    """
    buffer_chunks = []
    offset = 0

    accessors    = []
    buffer_views = []
    gltf_meshes  = []
    gltf_nodes   = []

    def add_chunk(data: bytes, target=None):
        nonlocal offset
        pad = (4 - len(data) % 4) % 4
        data = data + b'\x00' * pad
        buffer_chunks.append(data)
        bv = {'buffer': 0, 'byteOffset': offset, 'byteLength': len(data) - pad}
        if target:
            bv['target'] = target
        buffer_views.append(bv)
        bv_idx = len(buffer_views) - 1
        offset += len(data)
        return bv_idx

    FLOAT  = 5126
    UINT16 = 5123
    UINT32 = 5125
    ARRAY_BUFFER         = 34962
    ELEMENT_ARRAY_BUFFER = 34963
    TYPE_MAP = {1: 'SCALAR', 2: 'VEC2', 3: 'VEC3', 4: 'VEC4'}

    for mesh in meshes_data:
        primitives = []
        sources  = mesh['sources']
        elements = mesh['elements']

        if 'POSITION' not in sources or not elements:
            continue

        attrib_indices = {}
        for attr_name, src in sources.items():
            vecs = src['data']
            blob = pack_floats(vecs)
            bv_idx = add_chunk(blob, ARRAY_BUFFER)

            mn, mx = vec_min_max(vecs)
            acc = {
                'bufferView':    bv_idx,
                'byteOffset':    0,
                'componentType': FLOAT,
                'count':         src['count'],
                'type':          TYPE_MAP.get(src['components'], 'VEC3'),
            }
            if attr_name == 'POSITION':
                acc['min'] = mn
                acc['max'] = mx
            accessors.append(acc)
            attrib_indices[attr_name] = len(accessors) - 1

        for elem in elements:
            idx = elem['indices']
            bpi = 4 if max(idx) > 65535 else 2
            blob = pack_indices(idx, bpi)
            bv_idx = add_chunk(blob, ELEMENT_ARRAY_BUFFER)

            accessors.append({
                'bufferView':    bv_idx,
                'byteOffset':    0,
                'componentType': UINT32 if bpi == 4 else UINT16,
                'count':         elem['count'],
                'type':          'SCALAR',
            })
            idx_acc = len(accessors) - 1

            prim = {
                'attributes': attrib_indices.copy(),
                'indices':    idx_acc,
                'mode':       4,  # TRIANGLES
            }
            primitives.append(prim)

        if primitives:
            gltf_meshes.append({'name': mesh['name'], 'primitives': primitives})
            gltf_nodes.append({'mesh': len(gltf_meshes) - 1, 'name': mesh['name']})

    buffer_data = b''.join(buffer_chunks)
    b64 = base64.b64encode(buffer_data).decode()

    gltf = {
        'asset':       {'version': '2.0', 'generator': 'rotato_extract.py'},
        'scene':       0,
        'scenes':      [{'nodes': list(range(len(gltf_nodes)))}],
        'nodes':       gltf_nodes,
        'meshes':      gltf_meshes,
        'accessors':   accessors,
        'bufferViews': buffer_views,
        'buffers':     [{'byteLength': len(buffer_data), 'uri': f'data:application/octet-stream;base64,{b64}'}],
    }
    return gltf


# ── Main conversion ───────────────────────────────────────────────────────────

def convert(input_path: Path, output_path: Path, verbose=True):
    def log(*a):
        if verbose:
            print(*a)

    # 1. Decompress LZFSE
    with tempfile.NamedTemporaryFile(delete=False, suffix='.plist') as tf:
        tmp = tf.name

    try:
        result = subprocess.run(
            ['compression_tool', '-decode', '-i', str(input_path), '-o', tmp, '-a', 'lzfse'],
            capture_output=True
        )
        if result.returncode != 0:
            with open(input_path, 'rb') as f:
                raw = f.read()
        else:
            with open(tmp, 'rb') as f:
                raw = f.read()
    finally:
        try:
            os.unlink(tmp)
        except Exception:
            pass

    # 2. Parse NSKeyedArchive
    plist = plistlib.loads(raw)
    objects = plist['$objects']
    log(f'  Objects: {len(objects)}')

    # 3. Build world transforms by traversing SCNNode hierarchy
    translation_only_mode = _detect_translation_only(objects)
    log(f'  Transform mode: {"translation-only" if translation_only_mode else "full-TRS"}')
    geom_transforms = build_world_transforms(objects)
    log(f'  Nodes with geometry found via tree: {len(geom_transforms)}')

    # 4. Find all SCNGeometry objects and extract with world transform
    geom_map = {}  # name -> {sources, elements}

    for i, obj in enumerate(objects):
        if not isinstance(obj, dict):
            continue
        cn = classname(obj, objects)
        if cn != 'SCNGeometry':
            continue

        name_ref = obj.get('name')
        name = None
        if name_ref is not None:
            n = resolve_uid(objects, name_ref)
            if isinstance(n, str):
                name = n
        if not name:
            name = f'Geometry_{i}'

        world_mat = geom_transforms.get(i)
        sources, elements = extract_geometry(obj, objects, world_mat=world_mat)
        if sources and elements:
            base = name
            counter = 1
            while name in geom_map:
                name = f'{base}_{counter}'
                counter += 1
            geom_map[name] = {'name': name, 'sources': sources, 'elements': elements}

    log(f'  Geometries with data: {len(geom_map)}')

    if not geom_map:
        log('  WARNING: no geometry found')
        return False

    # 5. Build GLTF
    meshes_data = list(geom_map.values())
    gltf = build_gltf(meshes_data)

    log(f'  Meshes: {len(gltf["meshes"])}  Nodes: {len(gltf["nodes"])}  Accessors: {len(gltf["accessors"])}')

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, 'w') as f:
        json.dump(gltf, f, separators=(',', ':'))

    size_kb = output_path.stat().st_size // 1024
    log(f'  ✅ {output_path} ({size_kb} KB)')
    return True


def batch_convert(scenes_dir: Path, output_dir: Path):
    rotato_files = sorted(scenes_dir.glob('*.rotato'))
    print(f'Found {len(rotato_files)} .rotato files')

    ok = 0
    fail = 0
    for rf in rotato_files:
        out = output_dir / (rf.stem + '.gltf')
        print(f'\n[{rf.name}]')
        try:
            success = convert(rf, out)
            if success:
                ok += 1
            else:
                fail += 1
        except Exception as e:
            import traceback
            print(f'  ERROR: {e}')
            traceback.print_exc()
            fail += 1

    print(f'\nDone: {ok} ok, {fail} failed')


if __name__ == '__main__':
    args = sys.argv[1:]

    if len(args) == 3 and args[0] == '--batch':
        batch_convert(Path(args[1]), Path(args[2]))
    elif len(args) == 2:
        convert(Path(args[0]), Path(args[1]))
    else:
        print(__doc__)
        sys.exit(1)
