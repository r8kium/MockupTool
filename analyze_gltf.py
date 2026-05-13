#!/usr/bin/env python3
"""
Analyze GLTF files: extract mesh names, compute bounding box height,
and calculate scale factor to reach 14 units tall.
"""

import json
import os
import struct
import base64
from pathlib import Path

MODELS_DIR = Path("/Users/Shahrukh/Documents/Personal CodeWorkspace/MockupTool/iphone-mockup-tool/public/models")

def decode_accessor_data(gltf, accessor_idx, base64_buffers):
    """Decode an accessor's data from inline base64 buffer views."""
    accessor = gltf["accessors"][accessor_idx]
    bv_idx = accessor.get("bufferView")
    if bv_idx is None:
        return None

    buffer_view = gltf["bufferViews"][bv_idx]
    buffer_idx = buffer_view["buffer"]
    buf = gltf["buffers"][buffer_idx]

    uri = buf.get("uri", "")
    if uri.startswith("data:"):
        # inline base64
        comma = uri.index(",")
        raw = base64.b64decode(uri[comma+1:])
    else:
        return None  # external file, skip

    byte_offset = buffer_view.get("byteOffset", 0) + accessor.get("byteOffset", 0)
    byte_stride = buffer_view.get("byteStride")
    count = accessor["count"]
    component_type = accessor["componentType"]
    type_ = accessor["type"]

    # component sizes
    comp_size = {5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4}[component_type]
    num_components = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4, "MAT2": 4, "MAT3": 9, "MAT4": 16}[type_]
    element_size = comp_size * num_components

    fmt_char = {5120: "b", 5121: "B", 5122: "h", 5123: "H", 5125: "I", 5126: "f"}[component_type]
    fmt = f"{num_components}{fmt_char}"

    if byte_stride is None:
        byte_stride = element_size

    results = []
    for i in range(count):
        offset = byte_offset + i * byte_stride
        chunk = raw[offset:offset + element_size]
        if len(chunk) < element_size:
            break
        vals = struct.unpack_from(fmt, chunk)
        results.append(vals)
    return results


def get_global_bbox(gltf, base64_buffers):
    """
    Compute global bounding box by scanning all POSITION accessors,
    using the min/max fields if available (faster), otherwise decode data.
    Also tries node transforms (translation only, no rotation/scale for simplicity).
    Returns (min_y, max_y, min_x, max_x, min_z, max_z).
    """
    global_min = [float('inf')] * 3
    global_max = [float('-inf')] * 3

    for accessor in gltf.get("accessors", []):
        # We only want POSITION-like accessors (VEC3 float)
        if accessor.get("type") != "VEC3":
            continue
        if accessor.get("componentType") != 5126:  # FLOAT
            continue

        mn = accessor.get("min")
        mx = accessor.get("max")
        if mn and mx:
            for i in range(3):
                if mn[i] < global_min[i]:
                    global_min[i] = mn[i]
                if mx[i] > global_max[i]:
                    global_max[i] = mx[i]

    if any(v == float('inf') for v in global_min):
        return None

    return global_min, global_max


def analyze_gltf(filepath):
    """Analyze a single GLTF file. Returns dict with analysis results."""
    with open(filepath, "r", encoding="utf-8") as f:
        try:
            gltf = json.load(f)
        except json.JSONDecodeError as e:
            return {"error": str(e)}

    meshes = gltf.get("meshes", [])
    mesh_names = [m.get("name", f"mesh_{i}") for i, m in enumerate(meshes)]

    # Find screen-like mesh names
    screen_candidates = []
    screen_keywords = ["screen", "display", "glass", "front", "face"]
    for name in mesh_names:
        nl = name.lower()
        for kw in screen_keywords:
            if kw in nl:
                screen_candidates.append(name)
                break

    result = get_global_bbox(gltf, None)
    if result is None:
        return {
            "mesh_names": mesh_names,
            "screen_candidates": screen_candidates,
            "height": None,
            "scale_factor": None,
            "bbox": None,
        }

    global_min, global_max = result
    width  = global_max[0] - global_min[0]
    height = global_max[1] - global_min[1]
    depth  = global_max[2] - global_min[2]

    # Use the largest dimension as "height" for scale calculation
    # For phones/tablets: Y is usually height; for MacBooks lying flat: Z might be depth
    # We'll compute based on Y-axis first, then report all dims
    scale_factor = 14.0 / height if height > 0 else None

    return {
        "mesh_names": mesh_names,
        "screen_candidates": screen_candidates,
        "height_y": round(height, 4),
        "width_x": round(width, 4),
        "depth_z": round(depth, 4),
        "scale_factor_y": round(scale_factor, 6) if scale_factor else None,
        "bbox_min": [round(v, 4) for v in global_min],
        "bbox_max": [round(v, 4) for v in global_max],
    }


def main():
    gltf_files = sorted(MODELS_DIR.glob("*.gltf"))

    print(f"{'Filename':<35} | {'Mesh Names':<70} | {'Screen Mesh':<30} | {'H(Y)':>8} | {'W(X)':>8} | {'D(Z)':>8} | {'Scale(14/H)':>12}")
    print("-" * 200)

    all_results = {}
    for fpath in gltf_files:
        result = analyze_gltf(fpath)
        fname = fpath.name
        all_results[fname] = result

        if "error" in result:
            print(f"{fname:<35} | ERROR: {result['error']}")
            continue

        mesh_names_str = ", ".join(result["mesh_names"])
        if len(mesh_names_str) > 68:
            mesh_names_str = mesh_names_str[:65] + "..."

        screen_str = ", ".join(result["screen_candidates"]) if result["screen_candidates"] else "(none)"
        if len(screen_str) > 28:
            screen_str = screen_str[:25] + "..."

        h = result.get("height_y", "N/A")
        w = result.get("width_x", "N/A")
        d = result.get("depth_z", "N/A")
        s = result.get("scale_factor_y", "N/A")

        print(f"{fname:<35} | {mesh_names_str:<70} | {screen_str:<30} | {h:>8} | {w:>8} | {d:>8} | {s:>12}")

    print()
    print("=" * 200)
    print("DETAILED MESH NAMES PER FILE:")
    print("=" * 200)
    for fname, result in all_results.items():
        if "error" in result:
            continue
        print(f"\n{fname}:")
        for mn in result["mesh_names"]:
            marker = " <-- SCREEN CANDIDATE" if mn in result.get("screen_candidates", []) else ""
            print(f"  - {mn}{marker}")
        print(f"  BBox min: {result.get('bbox_min')}  max: {result.get('bbox_max')}")
        print(f"  Height(Y)={result.get('height_y')}  Width(X)={result.get('width_x')}  Depth(Z)={result.get('depth_z')}")
        print(f"  Scale to 14 units: {result.get('scale_factor_y')}")


if __name__ == "__main__":
    main()
