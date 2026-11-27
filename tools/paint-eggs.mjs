// Needs @gltf-transform/core, @gltf-transform/extensions, @gltf-transform/functions, meshoptimizer and pngjs.
// Run it on the uncolored exports. Egg types and their spot patterns are in EGGS.
// Paints the egg holders like eggs: a matte shell color plus a tileable speckle
// texture. Walls get the texture wrapped around the cylinder, flat faces get it
// laid flat from above, so spots stay round everywhere.
//   node egg.mjs <in.glb> <out.glb> <quail|robin>
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { unweld, prune } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import { PNG } from 'pngjs';
await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
const [, , IN, OUT, KIND] = process.argv;

// seeded random so the spots are the same every run
let seed = KIND === 'quail' ? 7 : 11;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

const S = 1024; // one tile = TILE metres of surface
const EGGS = {
  // Quail: cream shell with big irregular dark brown blotches and small dots
  quail: { tile: 0.06, base: '#e9dcbf', vary: 10, spots: [
    { n: 70, r: [14, 46], lobes: 4, col: '#3a2a1e', a: [0.85, 1] },
    { n: 110, r: [6, 16], lobes: 2, col: '#5a4130', a: [0.6, 0.9] },
    { n: 420, r: [1.5, 4], lobes: 1, col: '#3a2a1e', a: [0.5, 0.9] } ] },
  // Robin: pale blue green shell with fine sparse brown freckles
  robin: { tile: 0.06, base: '#98d0d3', vary: 4, spots: [
    { n: 260, r: [1.2, 3.2], lobes: 1, col: '#6b4a32', a: [0.35, 0.75] },
    { n: 26, r: [5, 10], lobes: 2, col: '#7d5a40', a: [0.2, 0.4] } ] },
};
const E = EGGS[KIND];

function texture() {
  const img = new Float32Array(S * S * 3), b = hex(E.base);
  // soft mottling in the base color (low frequency value noise, tileable)
  const G = 8, g = Array.from({ length: G * G }, () => rnd() * 2 - 1);
  const noise = (x, y) => { const fx = (x / S) * G, fy = (y / S) * G, x0 = Math.floor(fx), y0 = Math.floor(fy), tx = fx - x0, ty = fy - y0;
    const v = (i, j) => g[((j % G + G) % G) * G + ((i % G + G) % G)], sm = (t) => t * t * (3 - 2 * t);
    return (v(x0, y0) * (1 - sm(tx)) + v(x0 + 1, y0) * sm(tx)) * (1 - sm(ty)) + (v(x0, y0 + 1) * (1 - sm(tx)) + v(x0 + 1, y0 + 1) * sm(tx)) * sm(ty); };
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const k = noise(x, y) * E.vary, i = (y * S + x) * 3; img[i] = b[0] + k; img[i + 1] = b[1] + k; img[i + 2] = b[2] + k * 0.8; }
  // spots: each is a few overlapping soft discs, drawn with wraparound so the tile repeats
  for (const L of E.spots) {
    const c = hex(L.col);
    for (let n = 0; n < L.n; n++) {
      const cx = rnd() * S, cy = rnd() * S, R = L.r[0] + rnd() * (L.r[1] - L.r[0]), A = L.a[0] + rnd() * (L.a[1] - L.a[0]);
      const lobes = Array.from({ length: L.lobes }, (_, k) => ({ dx: k ? (rnd() - 0.5) * R * 1.4 : 0, dy: k ? (rnd() - 0.5) * R * 1.1 : 0, r: k ? R * (0.4 + rnd() * 0.5) : R }));
      const ext = Math.ceil(R * 2);
      for (let yy = -ext; yy <= ext; yy++) for (let xx = -ext; xx <= ext; xx++) {
        let cov = 0;
        for (const l of lobes) { const d = Math.hypot(xx - l.dx, yy - l.dy) / l.r; cov = Math.max(cov, Math.min(1, Math.max(0, (1 - d) * 2.2))); }
        if (!cov) continue;
        const px = ((Math.round(cx + xx) % S) + S) % S, py = ((Math.round(cy + yy) % S) + S) % S, i = (py * S + px) * 3, a = cov * A;
        for (let k = 0; k < 3; k++) img[i + k] = img[i + k] * (1 - a) + c[k] * a;
      }
    }
  }
  const png = new PNG({ width: S, height: S });
  for (let i = 0; i < S * S; i++) { for (let k = 0; k < 3; k++) png.data[i * 4 + k] = Math.max(0, Math.min(255, Math.round(img[i * 3 + k]))); png.data[i * 4 + 3] = 255; }
  return PNG.sync.write(png);
}

const doc = await io.read(IN);
await doc.transform(unweld()); // each triangle gets its own corners, so walls and tops can use different mappings
const root = doc.getRoot();
const tex = doc.createTexture(`${KIND}-shell`).setImage(texture()).setMimeType('image/png');
const mat = doc.createMaterial(`${KIND} egg shell`).setBaseColorFactor([1, 1, 1, 1]).setMetallicFactor(0).setRoughnessFactor(0.62).setBaseColorTexture(tex);
for (const mesh of root.listMeshes()) for (const prim of mesh.listPrimitives()) {
  const pos = prim.getAttribute('POSITION'), nor = prim.getAttribute('NORMAL'), n = pos.getCount();
  const uv = new Float32Array(n * 2), p = [0, 0, 0], q = [0, 0, 0], fn = [0, 0, 0];
  for (let t = 0; t < n; t += 3) {
    fn[0] = fn[1] = fn[2] = 0;
    for (let j = 0; j < 3; j++) { nor.getElement(t + j, q); fn[0] += q[0]; fn[1] += q[1]; fn[2] += q[2]; }
    const flat = Math.abs(fn[1]) > 0.7 * Math.hypot(...fn);
    // keep a wall triangle on one side of the angle seam
    let a0 = null;
    for (let j = 0; j < 3; j++) {
      pos.getElement(t + j, p);
      if (flat) { uv[(t + j) * 2] = p[0] / E.tile; uv[(t + j) * 2 + 1] = p[2] / E.tile; continue; }
      let a = Math.atan2(p[2], p[0]);
      if (a0 === null) a0 = a; else if (a - a0 > Math.PI) a -= 2 * Math.PI; else if (a0 - a > Math.PI) a += 2 * Math.PI;
      const r = 0.06; // arc length on the outer wall, in metres
      uv[(t + j) * 2] = (a * r) / E.tile; uv[(t + j) * 2 + 1] = p[1] / E.tile;
    }
  }
  prim.setAttribute('TEXCOORD_0', doc.createAccessor().setType('VEC2').setArray(uv).setBuffer(root.listBuffers()[0]));
  prim.setMaterial(mat);
}
await doc.transform(prune());
await io.write(OUT, doc);
console.log(KIND, 'done');
