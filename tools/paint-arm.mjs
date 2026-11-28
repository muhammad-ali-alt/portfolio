// Needs @gltf-transform/core, @gltf-transform/extensions, @gltf-transform/functions and meshoptimizer.
// Run on the uncolored exports. Colors are FIN; which faces get which color is RECIPE.
// Paints the robotic arm face by face. Each mesh is split into the CAD faces it
// came from (triangles joined across soft edges only), so a color can only change
// where the model has a real edge. Each face is then classed by its shape:
//   recessed floor      every edge around it folds inward      -> deep slate
//   groove or slot wall a thin strip with an inward fold       -> glowing cyan
//   hardware            a small compact face (bolt, pin, cap)  -> brass
//   main body           big faces                              -> orange panels, slate sides
// and each part gets its own accents on top of that (PARTS below).
// Materials are named "<part>|<finish>" so the site can still select whole parts.
//   node paint2.mjs <in.glb> <out.glb> [partName]
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune, dedup } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import { segment } from './arm-faces.mjs';
await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
const [, , IN, OUT, SINGLE] = process.argv;

const lin = (h) => [1, 3, 5].map((i) => { const c = parseInt(h.slice(i, i + 2), 16) / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
export const FIN = {
  orange:   { c: '#e5682a', m: 0.0, r: 0.4 },
  slate:    { c: '#343c44', m: 0.3, r: 0.5 },
  deep:     { c: '#1d2227', m: 0.2, r: 0.6 },
  cyan:     { c: '#22c3d3', m: 0.0, r: 0.3, e: '#3fe9f5', ei: 1.1 },
  brass:    { c: '#c0914f', m: 0.8, r: 0.3 },
  steel:    { c: '#aab1b8', m: 0.85, r: 0.28 },
  red:      { c: '#c8402b', m: 0.0, r: 0.42 },
  bone:     { c: '#e4e2dc', m: 0.0, r: 0.45 },
};

// ── geometry ──
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
function jacobi(A) {
  const a = A.map((r) => [...r]), v = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  for (let s = 0; s < 60; s++) {
    let p = 0, q = 1; for (const [i, j] of [[0, 1], [0, 2], [1, 2]]) if (Math.abs(a[i][j]) > Math.abs(a[p][q])) { p = i; q = j; }
    if (Math.abs(a[p][q]) < 1e-16) break;
    const th = 0.5 * Math.atan2(2 * a[p][q], a[q][q] - a[p][p]), c = Math.cos(th), sn = Math.sin(th);
    for (let k = 0; k < 3; k++) { const x = a[k][p], y = a[k][q]; a[k][p] = c * x - sn * y; a[k][q] = sn * x + c * y; }
    for (let k = 0; k < 3; k++) { const x = a[p][k], y = a[q][k]; a[p][k] = c * x - sn * y; a[q][k] = sn * x + c * y; }
    for (let k = 0; k < 3; k++) { const x = v[k][p], y = v[k][q]; v[k][p] = c * x - sn * y; v[k][q] = sn * x + c * y; }
  }
  return [0, 1, 2].map((i) => ({ val: a[i][i], vec: [v[0][i], v[1][i], v[2][i]] })).sort((x, y) => y.val - x.val).map((e) => e.vec);
}

// Faces of one mesh with their shape features, in the part's principal frame (a0 long, a2 thin).
function faces(P, I) {
  const S = segment(P, I, 28), T = I.length / 3;
  let W = 0, m = [0, 0, 0];
  for (let t = 0; t < T; t++) { W += S.A[t]; for (let k = 0; k < 3; k++) m[k] += S.C[t][k] * S.A[t]; }
  m = m.map((x) => x / W);
  const Cv = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (let t = 0; t < T; t++) { const d = sub(S.C[t], m); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) Cv[i][j] += d[i] * d[j] * S.A[t]; }
  const ax = jacobi(Cv);
  const loc = (p) => ax.map((v) => dot(sub(p, m), v));
  const tri = Array.from({ length: T }, (_, t) => ({ p: loc(S.C[t]), q: ax.map((v) => dot(S.N[t], v)), A: S.A[t], f: S.patch[t] }));
  const ext = [0, 1, 2].map((k) => [Math.min(...tri.map((t) => t.p[k])), Math.max(...tri.map((t) => t.p[k]))]);
  const diag = Math.hypot(...ext.map(([a, b]) => b - a));
  const F = Array.from({ length: S.count }, (_, i) => ({ id: i, A: 0, n: [0, 0, 0], c: [0, 0, 0], lo: [1e9, 1e9, 1e9], hi: [-1e9, -1e9, -1e9], conc: 0, conv: 0, tris: [] }));
  for (let t = 0; t < T; t++) {
    const f = F[S.patch[t]], r = tri[t]; f.A += r.A; f.tris.push(t);
    for (let k = 0; k < 3; k++) { f.n[k] += r.q[k] * r.A; f.c[k] += r.p[k] * r.A; f.lo[k] = Math.min(f.lo[k], r.p[k]); f.hi[k] = Math.max(f.hi[k], r.p[k]); }
    // edges to other faces: inward fold (concave) or outward (convex)
    for (const u of S.nb[t]) if (S.patch[u] !== S.patch[t]) {
      const concave = dot(sub(S.C[u], S.C[t]), S.N[t]) > 0;
      concave ? f.conc++ : f.conv++;
    }
  }
  const total = F.reduce((s, f) => s + f.A, 0);
  for (const f of F) {
    f.c = f.c.map((x) => x / f.A); f.pl = Math.hypot(...f.n) / f.A; f.n = f.n.map((x) => x / (Math.hypot(...f.n) || 1));
    const dims = [0, 1, 2].map((k) => f.hi[k] - f.lo[k]).sort((a, b) => b - a);
    f.size = Math.hypot(...dims) / diag;            // 0..1 of the part
    f.share = f.A / total;
    f.long = dims[0] / Math.max(dims[1], diag * 0.004); // elongation
    f.inward = f.conc / Math.max(1, f.conc + f.conv);   // share of its boundary that folds inward
  }
  return { tri, F, ext, diag };
}

// ── generic classes ──
function generic(f) {
  if (f.share > 0.06) return 'body';
  if (f.inward > 0.6 && f.pl > 0.9 && f.share > 0.004) return 'floor';
  if (f.inward > 0.3 && f.long > 4 && f.share < 0.03) return 'groove';
  if (f.size < 0.12 && f.long < 3) return 'hardware';
  if (f.inward > 0.6) return 'floor';
  return 'body';
}
const plateBody = (t, opt) => (Math.abs(t.q[2]) > 0.6 ? opt.face ?? 'orange' : opt.side ?? 'slate');

// ── part recipes: map each face (and, for body faces, each triangle) to a finish ──
const PARTS = {
  plate: (opt = {}) => ({ tri, F }) => tri.map((t) => {
    const f = F[t.f], g = generic(f);
    if (g === 'floor') return opt.floor ?? 'deep';
    if (g === 'groove') return opt.groove ?? 'cyan';
    if (g === 'hardware') return opt.hardware ?? 'brass';
    return plateBody(t, opt);
  }),
  // round housings along a0: shell in one color, ends in another
  barrel: (opt = {}) => ({ tri, F }) => tri.map((t) => {
    const f = F[t.f], g = generic(f);
    if (g === 'groove') return opt.groove ?? 'cyan';
    if (g === 'floor') return 'deep';
    if (g === 'hardware') return opt.hardware ?? 'brass';
    return Math.abs(t.q[0]) > 0.75 ? opt.ends ?? 'slate' : opt.shell ?? 'orange';
  }),
};
const RECIPE = {
  'Upper Arm Link': PARTS.plate(),
  'Lower Arm Link': PARTS.plate(),
  'Rotary Yoke Joint': PARTS.plate({ side: 'orange' }),
  'Wrist Modul': PARTS.barrel({ shell: 'orange', ends: 'slate' }),
  'Shoulder Drive Unit': PARTS.barrel({ shell: 'slate', ends: 'orange', groove: 'cyan' }),
  'Gripper Actuator': ({ tri, F, ext }) => tri.map((t) => {
    const f = F[t.f], g = generic(f);
    if (g === 'groove') return 'cyan';
    if (g === 'hardware') return 'steel';
    if (g === 'floor') return 'deep';
    return Math.abs(t.q[0]) > 0.8 && f.share > 0.01 ? 'red' : 'slate';
  }),
  'grip': ({ tri, F }) => tri.map((t) => (generic(F[t.f]) === 'floor' || generic(F[t.f]) === 'groove' ? 'deep' : 'steel')),
  // base: slate body, orange feet out at the corners, brass only on the small centre pin
  'Base': ({ tri, F, ext }) => { const R = Math.max(...tri.map((t) => Math.hypot(t.p[0], t.p[1]))); return tri.map((t) => {
    const f = F[t.f], g = generic(f), fr = Math.hypot(f.c[0], f.c[1]) / R;
    if (g === 'groove') return 'cyan';
    if (fr > 0.62) return 'orange';
    if (g === 'hardware' && f.size < 0.08 && fr < 0.2) return 'brass';
    if (g === 'groove') return 'cyan';
    if (g === 'floor') return 'deep';
    return 'slate';
  }); },
};

const doc = await io.read(IN), root = doc.getRoot(), buf = root.listBuffers()[0];
const mats = {};
const mat = (part, fin) => {
  const k = `${part}|${fin}`; if (mats[k]) return mats[k];
  const F0 = FIN[fin], m = doc.createMaterial(k).setBaseColorFactor([...lin(F0.c), 1]).setMetallicFactor(F0.m).setRoughnessFactor(F0.r);
  if (F0.e) m.setEmissiveFactor(lin(F0.e).map((x) => x * F0.ei));
  return (mats[k] = m);
};
const done = new Set(), stats = {};
export let last = null;
for (const node of root.listNodes()) {
  const mesh = node.getMesh(); if (!mesh || done.has(mesh)) continue; done.add(mesh);
  const part = SINGLE ?? node.getName().replace(/-\d+$/, '');
  const recipe = RECIPE[part]; if (!recipe) { console.warn('no recipe', part); continue; }
  for (const prim of [...mesh.listPrimitives()]) {
    const pos = prim.getAttribute('POSITION'); const P = []; for (let i = 0; i < pos.getCount(); i++) P.push(pos.getElement(i, [0, 0, 0]));
    const I = Array.from(prim.getIndices().getArray());
    const info = faces(P, I), fins = recipe(info);
    const groups = {}; fins.forEach((f, t) => (groups[f] ??= []).push(I[3 * t], I[3 * t + 1], I[3 * t + 2]));
    Object.entries(groups).forEach(([fin, ids], n) => {
      const p = n === 0 ? prim : prim.clone();
      p.setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(ids)).setBuffer(buf)).setMaterial(mat(part, fin));
      if (n) mesh.addPrimitive(p);
      stats[part] ??= {}; stats[part][fin] = (stats[part][fin] ?? 0) + ids.length / 3;
    });
  }
}
await doc.transform(dedup({ propertyTypes: ['Accessor', 'Texture'] }), prune());
await io.write(OUT, doc);
for (const [p, s] of Object.entries(stats)) console.log(p.padEnd(22), Object.entries(s).map(([k, v]) => `${k}:${v}`).join('  '));
