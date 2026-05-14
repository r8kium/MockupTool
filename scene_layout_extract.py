#!/usr/bin/env python3
"""
Extract device positions and rotations from multi-device Rotato .rotato scene files.
This reads the plist SCNNode hierarchy and prints each device's world-space transform.
"""
import plistlib, struct, subprocess, tempfile, sys, math
from pathlib import Path

def decompress_rotato(path: Path) -> bytes:
    with tempfile.NamedTemporaryFile(suffix='.plist', delete=False) as tmp:
        subprocess.run(
            ['compression_tool', '-decode', '-i', str(path), '-o', tmp.name, '-a', 'lzfse'],
            check=True, capture_output=True
        )
        return Path(tmp.name).read_bytes()

def resolve(objects, uid):
    if isinstance(uid, plistlib.UID):
        return objects[uid.data]
    return uid

def get_class_name(objects, obj):
    if isinstance(obj, dict):
        cls_uid = obj.get('$class')
        if cls_uid:
            cls = resolve(objects, cls_uid)
            return cls.get('$classname', '')
    return ''

def read_float3(data):
    if isinstance(data, bytes) and len(data) >= 12:
        return struct.unpack('<3f', data[:12])
    return (0.0, 0.0, 0.0)

def read_float4(data):
    if isinstance(data, bytes) and len(data) >= 16:
        return struct.unpack('<4f', data[:16])
    return (0.0, 0.0, 0.0, 0.0)

def axis_angle_to_euler_deg(ax, ay, az, angle):
    """Convert axis-angle to Euler XYZ in degrees (approximate)."""
    # Normalize axis
    length = math.sqrt(ax*ax + ay*ay + az*az)
    if length < 1e-6:
        return (0.0, 0.0, 0.0)
    ax, ay, az = ax/length, ay/length, az/length
    
    # Build rotation matrix from axis-angle
    c = math.cos(angle)
    s = math.sin(angle)
    t = 1 - c
    
    m00 = t*ax*ax + c
    m01 = t*ax*ay - s*az
    m02 = t*ax*az + s*ay
    m10 = t*ax*ay + s*az
    m11 = t*ay*ay + c
    m12 = t*ay*az - s*ax
    m20 = t*ax*az - s*ay
    m21 = t*ay*az + s*ax
    m22 = t*az*az + c
    
    # Extract Euler XYZ
    if abs(m20) < 0.99999:
        ry = math.asin(-m20)
        rx = math.atan2(m21, m22)
        rz = math.atan2(m10, m00)
    else:
        ry = math.pi/2 if m20 < 0 else -math.pi/2
        rx = math.atan2(m01, m11)
        rz = 0
    
    return (math.degrees(rx), math.degrees(ry), math.degrees(rz))

def get_children(objects, node):
    children_uid = node.get('childNodes')
    if not children_uid:
        return []
    children_obj = resolve(objects, children_uid)
    cn = get_class_name(objects, children_obj)
    if cn in ('NSArray', 'NSMutableArray'):
        return [resolve(objects, uid) for uid in children_obj.get('NS.objects', [])]
    return []

def has_geometry(objects, node):
    geo_uid = node.get('geometry')
    if not geo_uid:
        return False
    geo = resolve(objects, geo_uid)
    cn = get_class_name(objects, geo)
    return cn == 'SCNGeometry'

def get_node_name(objects, node):
    name_uid = node.get('name')
    if name_uid:
        name = resolve(objects, name_uid)
        if isinstance(name, str):
            return name
    return None

def get_transform(node):
    pos = read_float3(node.get('position', b'\x00'*12))
    rot_data = node.get('rotation', b'\x00'*16)
    rot = read_float4(rot_data)
    scale = read_float3(node.get('scale', b'\x00'*12))
    # Default scale to 1,1,1 if zero
    if all(abs(s) < 1e-6 for s in scale):
        scale = (1.0, 1.0, 1.0)
    euler = axis_angle_to_euler_deg(*rot)
    return pos, euler, scale

def walk_tree(objects, node, depth=0, parent_name=""):
    """Walk the SCNNode tree and print nodes with geometry or significant children."""
    name = get_node_name(objects, node) or f"<unnamed_{id(node)}>"
    pos, euler, scale = get_transform(node)
    
    has_geo = has_geometry(objects, node)
    children = get_children(objects, node)
    has_animation = 'animation-keys' in node or 'animations' in node
    
    # Count geometry descendants
    geo_count = 1 if has_geo else 0
    for child in children:
        if isinstance(child, dict):
            geo_count += count_geo_descendants(objects, child)
    
    # Print nodes that are "device roots" — nodes with multiple geometry descendants
    # or named nodes at depth 1-2 that have geometry
    if depth <= 2 and (geo_count > 0 or has_geo):
        indent = "  " * depth
        print(f"{indent}[depth={depth}] '{name}' pos=({pos[0]:.2f}, {pos[1]:.2f}, {pos[2]:.2f}) "
              f"euler=({euler[0]:.1f}, {euler[1]:.1f}, {euler[2]:.1f}) "
              f"scale=({scale[0]:.2f}, {scale[1]:.2f}, {scale[2]:.2f}) "
              f"geoDescendants={geo_count} hasGeo={has_geo} animated={has_animation}")
    
    for child in children:
        if isinstance(child, dict):
            cn = get_class_name(objects, child)
            if cn == 'SCNNode':
                walk_tree(objects, child, depth + 1, name)

def count_geo_descendants(objects, node):
    count = 1 if has_geometry(objects, node) else 0
    for child in get_children(objects, node):
        if isinstance(child, dict):
            count += count_geo_descendants(objects, child)
    return count

def analyze_scene(path: Path):
    print(f"\n{'='*60}")
    print(f"Scene: {path.name}")
    print(f"{'='*60}")
    
    try:
        raw = decompress_rotato(path)
        plist = plistlib.loads(raw)
    except Exception as e:
        print(f"  ERROR: {e}")
        return
    
    objects = plist.get('$objects', [])
    top = plist.get('$top', {})
    root_uid = top.get('root')
    if not root_uid:
        print("  No root node found")
        return
    
    root = resolve(objects, root_uid)
    cn = get_class_name(objects, root)
    
    # If root is SCNScene, get its rootNode
    if cn == 'SCNScene':
        rn_uid = root.get('rootNode')
        if rn_uid:
            root = resolve(objects, rn_uid)
    
    walk_tree(objects, root)

if __name__ == '__main__':
    scenes_dir = Path.home() / "Library/Application Support/Rotato/Scenes"
    
    # Multi-device scene files
    targets = [
        "Family Phone On Macbook.rotato",
        "Family iPhoneDown Macbook.rotato",
        "Family iPhoneFloatX Macbook.rotato",
        "Family iPhoneOut Macbook.rotato",
        "Family iPhoneUp Macbook.rotato",
        "Family iPhoneUp45 Macbook.rotato",
        "Apple Device Family.rotato",
        "iPhone 12 Pro Double.rotato",
        "iPhone 12 Pro Triple.rotato",
        "CleanPhone x 2.rotato",
    ]
    
    for name in targets:
        p = scenes_dir / name
        if p.exists():
            analyze_scene(p)
        else:
            print(f"\n⚠️  Not found: {name}")
