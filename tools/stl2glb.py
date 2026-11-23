"""
Convert a SolidWorks STL export to a GLB file for the website's 3D viewer.

Usage (from the project folder):
    python tools/stl2glb.py path/to/part.STL public/models/part.glb

What it does:
  1. Reads the STL (binary or text).
  2. Converts millimetres to metres (the unit GLB files expect).
  3. Smooths normals on curved surfaces but keeps sharp edges sharp,
     so fillets look round and corners stay crisp.
  4. Centers the part and writes a compact GLB.
Needs: numpy  (pip install numpy)
"""
import struct, sys, json
import numpy as np

CREASE_DEG = 35          # edges sharper than this stay sharp
MM_TO_M = 0.001

def read_stl(path):
    data = open(path, 'rb').read()
    n = struct.unpack_from('<I', data, 80)[0] if len(data) >= 84 else 0
    if len(data) == 84 + n * 50:  # binary
        rec = np.frombuffer(data, dtype=np.dtype([('n', '<3f4'), ('v', '<3f4', (3,)), ('a', '<u2')]), count=n, offset=84)
        return rec['v'].astype(np.float64)
    verts = [list(map(float, l.split()[1:4])) for l in data.decode(errors='ignore').splitlines() if l.strip().startswith('vertex')]
    return np.array(verts).reshape(-1, 3, 3)

def main(src, dst):
    tri = read_stl(src) * MM_TO_M
    tri -= (tri.reshape(-1, 3).min(0) + tri.reshape(-1, 3).max(0)) / 2   # center
    fn = np.cross(tri[:, 1] - tri[:, 0], tri[:, 2] - tri[:, 0])
    fn /= np.linalg.norm(fn, axis=1, keepdims=True) + 1e-20

    # group corners that share a position
    corners = tri.reshape(-1, 3)
    key = np.round(corners / 1e-7).astype(np.int64)
    _, pid = np.unique(key, axis=0, return_inverse=True)
    pid = pid.ravel()
    face_of = np.repeat(np.arange(len(tri)), 3)

    # for each corner, average the normals of neighbouring faces within the crease angle
    cos_t = np.cos(np.radians(CREASE_DEG))
    order = np.argsort(pid, kind='stable')
    bounds = np.flatnonzero(np.diff(pid[order])) + 1
    normals = np.zeros_like(corners)
    for group in np.split(order, bounds):
        fns = fn[face_of[group]]
        sim = fns @ fns.T >= cos_t
        acc = sim.astype(float) @ fns
        normals[group] = acc / (np.linalg.norm(acc, axis=1, keepdims=True) + 1e-20)

    # weld identical (position, normal) pairs into an index buffer
    nk = np.round(normals * 1e4).astype(np.int64)
    _, uniq, inv = np.unique(np.hstack([key, nk]), axis=0, return_index=True, return_inverse=True)
    pos = corners[uniq].astype('<f4'); nor = normals[uniq].astype('<f4')
    idx = inv.ravel().astype('<u4' if len(pos) > 65535 else '<u2')

    pb, nb, ib = pos.tobytes(), nor.tobytes(), idx.tobytes()
    ib += b'\0' * (-len(ib) % 4)
    blob = pb + nb + ib
    gltf = {
        'asset': {'version': '2.0', 'generator': 'stl2glb.py'},
        'scene': 0, 'scenes': [{'nodes': [0]}], 'nodes': [{'mesh': 0}],
        'meshes': [{'primitives': [{'attributes': {'POSITION': 0, 'NORMAL': 1}, 'indices': 2, 'material': 0}]}],
        'materials': [{'pbrMetallicRoughness': {'baseColorFactor': [0.55, 0.56, 0.58, 1], 'metallicFactor': 0.0, 'roughnessFactor': 0.55}}],
        'buffers': [{'byteLength': len(blob)}],
        'bufferViews': [
            {'buffer': 0, 'byteOffset': 0, 'byteLength': len(pb), 'target': 34962},
            {'buffer': 0, 'byteOffset': len(pb), 'byteLength': len(nb), 'target': 34962},
            {'buffer': 0, 'byteOffset': len(pb) + len(nb), 'byteLength': idx.nbytes, 'target': 34963}],
        'accessors': [
            {'bufferView': 0, 'componentType': 5126, 'count': len(pos), 'type': 'VEC3', 'min': pos.min(0).tolist(), 'max': pos.max(0).tolist()},
            {'bufferView': 1, 'componentType': 5126, 'count': len(nor), 'type': 'VEC3'},
            {'bufferView': 2, 'componentType': 5125 if idx.dtype.itemsize == 4 else 5123, 'count': len(idx), 'type': 'SCALAR'}],
    }
    j = json.dumps(gltf, separators=(',', ':')).encode(); j += b' ' * (-len(j) % 4)
    out = struct.pack('<III', 0x46546C67, 2, 28 + len(j) + len(blob)) + struct.pack('<II', len(j), 0x4E4F534A) + j + struct.pack('<II', len(blob), 0x004E4942) + blob
    open(dst, 'wb').write(out)
    size = (pos.max(0) - pos.min(0)) * 1000
    print(f'{len(tri)} triangles, {len(pos)} vertices, {len(out)/1024:.0f} KB')
    print(f'Bounding box: {size[0]:.1f} x {size[1]:.1f} x {size[2]:.1f} mm')

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
