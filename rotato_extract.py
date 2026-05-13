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

    prim_count   = int(elem_obj.get('primitiveCount', 0))
    bytes_per_idx = int(elem_obj.get('bytesPerIndex', 4))
    prim_type    = int(elem_obj.get('primitiveType', 0))  # 0=triangles

    if prim_count == 0:
        return None

    # prim_type 0 = triangles: count = prim_count * 3
    idx_count = prim_count * 3
    fmt = {1: 'B', 2: 'H', 4: 'I'}.get(bytes_per_idx, 'I')
    indices = list(struct.unpack_from(f'{idx_count}{fmt}', blob))

    return {
        'indices':    indices,
        'count':      idx_count,
        'bytes':      bytes_per_idx,
    }


def unwrap_nsarray(uid_or_obj, objects):
    """Resolve a UID to an NSArray and return its NS.objects items as resolved objects."""
    obj = resolve_uid(objects, uid_or_obj) if isinstance(uid_or_obj, plistlib.UID) else uid_or_obj
    if not isinstance(obj, dict):
        return []
    return [resolve_uid(objects, v) for v in obj.get('NS.objects', [])]


def extract_geometry(geom_obj, objects):
    """Return sources dict and elements list for one SCNGeometry."""
    sources = {}
    for sem_key in SEMANTIC_KEYS:
        ref = geom_obj.get(sem_key)
        if ref is None:
            continue
        # Semantic keys wrap an NSArray; take the first SCNGeometrySource in it
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

    accessors     = []
    buffer_views  = []
    gltf_meshes   = []
    gltf_nodes    = []

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

    FLOAT = 5126
    UINT16 = 5123
    UINT32 = 5125
    ARRAY_BUFFER = 34962
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
                'bufferView': bv_idx,
                'byteOffset': 0,
                'componentType': FLOAT,
                'count': src['count'],
                'type': TYPE_MAP.get(src['components'], 'VEC3'),
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
                'bufferView': bv_idx,
                'byteOffset': 0,
                'componentType': UINT32 if bpi == 4 else UINT16,
                'count': elem['count'],
                'type': 'SCALAR',
            })
            idx_acc = len(accessors) - 1

            prim = {
                'attributes': attrib_indices.copy(),
                'indices': idx_acc,
                'mode': 4,  # TRIANGLES
            }
            primitives.append(prim)

        if primitives:
            gltf_meshes.append({'name': mesh['name'], 'primitives': primitives})
            gltf_nodes.append({'mesh': len(gltf_meshes) - 1, 'name': mesh['name']})

    buffer_data = b''.join(buffer_chunks)
    b64 = base64.b64encode(buffer_data).decode()

    gltf = {
        'asset': {'version': '2.0', 'generator': 'rotato_extract.py'},
        'scene': 0,
        'scenes': [{'nodes': list(range(len(gltf_nodes)))}],
        'nodes': gltf_nodes,
        'meshes': gltf_meshes,
        'accessors': accessors,
        'bufferViews': buffer_views,
        'buffers': [{'byteLength': len(buffer_data), 'uri': f'data:application/octet-stream;base64,{b64}'}],
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
            # Try reading as-is (might already be uncompressed plist)
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

    # 3. Find all SCNGeometry objects
    geom_map = {}  # name -> {sources, elements}

    for i, obj in enumerate(objects):
        if not isinstance(obj, dict):
            continue
        cn = classname(obj, objects)
        if cn != 'SCNGeometry':
            continue

        # Get geometry name
        name_ref = obj.get('name')
        name = None
        if name_ref is not None:
            n = resolve_uid(objects, name_ref)
            if isinstance(n, str):
                name = n
        if not name:
            name = f'Geometry_{i}'

        sources, elements = extract_geometry(obj, objects)
        if sources and elements:
            # Deduplicate names
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

    # 4. Build GLTF
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
            print(f'  ERROR: {e}')
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
