// Needs @gltf-transform/core, @gltf-transform/extensions, @gltf-transform/functions, meshoptimizer and pngjs.
// Run it on the uncolored exports; colors are the hex values in FIN, areas are the rules in RULES and PARTS.
// Paints the robotic arm in a detailed industrial colorway: orange panels, dark
// slate recesses and joints, cyan light strips, brass caps, steel gripper, a red
// accent and yellow and black hazard stripes. Each part's faces are sorted by
// shape (which way they face, whether they sit proud of or below the main
// surface, where they are along the part) and each group gets its own material
// named "<part>|<finish>", so the site can still select a whole part.
//
//   node paint.mjs <in.glb> <out.glb> [partName]   (partName for single part files)
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune, dedup } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import { PNG } from 'pngjs';
await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
const [, , IN, OUT, SINGLE] = process.argv;

// ── finishes (sRGB hex) ──
const lin = (h) => [1, 3, 5].map((i) => { const c = parseInt(h.slice(i, i + 2), 16) / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
const FIN = {
  orange: { c: '#e2662a', m: 0.0, r: 0.42 },
  orangeDeep: { c: '#b9491f', m: 0.0, r: 0.5 },
  slate: { c: '#323a42', m: 0.35, r: 0.5 },
  slateLight: { c: '#4b555f', m: 0.4, r: 0.45 },
  cyan: { c: '#1fb3c2', m: 0.0, r: 0.25, e: '#3fe6f2', ei: 1 },
  brass: { c: '#b88a4c', m: 0.75, r: 0.32 },
  steel: { c: '#a6adb4', m: 0.85, r: 0.3 },
  red: { c: '#c63f2a', m: 0.0, r: 0.45 },
  hazard: { c: '#ffffff', m: 0.0, r: 0.5, tex: true },
};

// ── geometry helpers ──
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
function jacobi(A) { // eigen decomposition of a symmetric 3x3
  const a = A.map((r) => [...r]), v = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  for (let s = 0; s < 50; s++) {
    let p = 0, q = 1; for (const [i, j] of [[0, 1], [0, 2], [1, 2]]) if (Math.abs(a[i][j]) > Math.abs(a[p][q])) { p = i; q = j; }
    if (Math.abs(a[p][q]) < 1e-14) break;
    const th = 0.5 * Math.atan2(2 * a[p][q], a[q][q] - a[p][p]), c = Math.cos(th), sn = Math.sin(th);
    for (let k = 0; k < 3; k++) { const x = a[k][p], y = a[k][q]; a[k][p] = c * x - sn * y; a[k][q] = sn * x + c * y; }
    for (let k = 0; k < 3; k++) { const x = a[p][k], y = a[q][k]; a[p][k] = c * x - sn * y; a[q][k] = sn * x + c * y; }
    for (let k = 0; k < 3; k++) { const x = v[k][p], y = v[k][q]; v[k][p] = c * x - sn * y; v[k][q] = sn * x + c * y; }
  }
  return [0, 1, 2].map((i) => ({ val: a[i][i], vec: [v[0][i], v[1][i], v[2][i]] })).sort((x, y) => y.val - x.val);
}

// Faces of one mesh, in its principal frame: a0 longest, a2 thinnest.
function analyse(P, I) {
  const tris = [];
  let W = 0, m = [0, 0, 0];
  for (let t = 0; t < I.length; t += 3) {
    const a = P[I[t]], b = P[I[t + 1]], c = P[I[t + 2]];
    const n = cross(sub(b, a), sub(c, a)), A = len(n) / 2;
    const ce = [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3, (a[2] + b[2] + c[2]) / 3];
    tris.push({ A, n: A > 0 ? n.map((x) => x / (2 * A)) : [0, 0, 0], c: ce }); W += A; m = m.map((x, k) => x + ce[k] * A);
  }
  m = m.map((x) => x / W);
  const C = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (const t of tris) { const d = sub(t.c, m); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) C[i][j] += d[i] * d[j] * t.A; }
  const ax = jacobi(C).map((e) => e.vec);
  for (const t of tris) { const d = sub(t.c, m); t.p = ax.map((v) => dot(d, v)); t.q = ax.map((v) => dot(t.n, v)); }
  // how far each face reaches through the part's thickness (a shallow wall is a groove side)
  for (let t = 0, k = 0; t < I.length; t += 3, k++) {
    const ts = [0, 1, 2].map((j) => dot(sub(P[I[t + j]], m), ax[2]));
    tris[k].tlo = Math.min(...ts); tris[k].thi = Math.max(...ts);
  }
  const ext = [0, 1, 2].map((k) => { let lo = Infinity, hi = -Infinity; for (const t of tris) { lo = Math.min(lo, t.p[k]); hi = Math.max(hi, t.p[k]); } return [lo, hi]; });
  return { tris, ext };
}
// the most common value (area weighted) of f over the faces that pass the filter
function mode(tris, filter, f, bins = 60) {
  const sel = tris.filter(filter); if (!sel.length) return 0;
  let lo = Infinity, hi = -Infinity; for (const t of sel) { const v = f(t); lo = Math.min(lo, v); hi = Math.max(hi, v); }
  const h = new Array(bins).fill(0); for (const t of sel) h[Math.min(bins - 1, Math.floor(((f(t) - lo) / (hi - lo || 1)) * bins))] += t.A;
  const i = h.indexOf(Math.max(...h)); return lo + ((i + 0.5) / bins) * (hi - lo);
}

// ── the colorway, part by part ──
// Each rule gets the face list in the part's own frame and returns a finish per face.
const RULES = {
  // Long flat links: orange plates, slate side walls, slate pockets with a cyan
  // light strip down the middle, brass on raised bosses (pin caps, bolt circle).
  plate(tris, ext, opt = {}) {
    const half = Math.max(Math.abs(ext[2][0]), Math.abs(ext[2][1]));
    const face = (t) => Math.abs(t.q[2]) > 0.8;
    const main = mode(tris, face, (t) => Math.abs(t.p[2]));
    const L = ext[0][1] - ext[0][0];
    return tris.map((t) => {
      const along = (t.p[0] - ext[0][0]) / L;
      if (face(t)) {
        const lvl = Math.abs(t.p[2]);
        if (lvl < main - half * 0.12) return opt.strips && along > opt.strips[0] && along < opt.strips[1] ? 'cyan' : 'slate';
        if (lvl > main + half * 0.08) return Math.abs(t.q[2]) > 0.97 ? 'brass' : 'slate';
        return opt.panel ?? 'orange';
      }
      if (Math.abs(t.q[2]) < 0.35) {
        // a shallow wall just under the panel surface, away from the ends: a light strip
        const shallow = t.thi - t.tlo < half * 0.3 && Math.min(Math.abs(t.tlo), Math.abs(t.thi)) > main * 0.55;
        if (opt.strips && shallow && along > opt.strips[0] && along < opt.strips[1]) return 'cyan';
        return opt.side ?? 'slate';
      }
      return 'orangeDeep';
    });
  },
  // Round housings: orange shell, slate end faces, cyan in recessed grooves,
  // brass on the shaft ends that stick out.
  cylinder(tris, ext, opt = {}) {
    const L = ext[0][1] - ext[0][0];
    const r = (t) => Math.hypot(t.p[1], t.p[2]);
    const shell = (t) => Math.abs(t.q[0]) < 0.3;
    const R = mode(tris, shell, r);
    return tris.map((t) => {
      const along = (t.p[0] - ext[0][0]) / L;
      if (opt.box && (opt.box > 0 ? along > opt.box : along < -opt.box)) return Math.abs(t.q[0]) > 0.8 ? 'slate' : 'orange';
      if (shell(t)) {
        if (r(t) < R * 0.9) return r(t) < R * 0.55 ? 'brass' : 'cyan';
        return opt.shell ?? 'orange';
      }
      if (Math.abs(t.q[0]) > 0.8) return opt.ends ?? 'slate';
      return 'slateLight';
    });
  },
  // The base: slate body, orange feet, a brass centre pin, a hazard band around the foot ring.
  base(tris, ext) {
    const r = (t) => Math.hypot(t.p[0], t.p[1]);
    const Rmax = Math.max(...tris.map(r));
    const h0 = ext[2][0], H = ext[2][1] - ext[2][0];
    // which way is up: the side with the small centre pin
    const up = tris.filter((t) => r(t) < Rmax * 0.12).reduce((s, t) => s + t.p[2] * t.A, 0) >= 0 ? 1 : -1;
    return tris.map((t) => {
      const z = ((up > 0 ? t.p[2] - h0 : ext[2][1] - t.p[2]) / H), rr = r(t) / Rmax;
      if (rr < 0.12 && z > 0.6) return 'brass';
      if (rr > 0.7) return 'orange';               // the four feet
      if (Math.abs(t.q[2]) < 0.35 && z < 0.45) return 'hazard'; // band around the lower ring
      if (Math.abs(t.q[2]) > 0.8 && z > 0.8) return 'slateLight'; // top deck
      return 'slate';
    });
  },
  // Gripper actuator: slate body, red faces on the gripper end.
  actuator(tris, ext) {
    const L = ext[0][1] - ext[0][0];
    return tris.map((t) => {
      const along = (t.p[0] - ext[0][0]) / L;
      if (Math.abs(t.q[2]) > 0.85 && along > 0.55) return 'red';
      if (Math.abs(t.q[0]) > 0.85) return 'slateLight';
      return 'slate';
    });
  },
  // Gripper jaws: steel, with slate pockets and slots.
  jaw(tris, ext) {
    const half = Math.max(Math.abs(ext[2][0]), Math.abs(ext[2][1]));
    const face = (t) => Math.abs(t.q[2]) > 0.8;
    const main = mode(tris, face, (t) => Math.abs(t.p[2]));
    return tris.map((t) => (face(t) && Math.abs(t.p[2]) < main - half * 0.15 ? 'slate' : 'steel'));
  },
};
const PARTS = {
  'Lower Arm Link': (t, e) => RULES.plate(t, e, { strips: [0.22, 0.85] }),
  'Upper Arm Link': (t, e) => RULES.plate(t, e, { strips: [0.12, 0.88] }),
  'Rotary Yoke Joint': (t, e) => RULES.plate(t, e, { side: 'orange' }),
  'Shoulder Drive Unit': (t, e) => RULES.cylinder(t, e, { shell: 'slate', ends: 'orange' }),
  'Wrist Modul': (t, e) => RULES.cylinder(t, e),
  'Gripper Actuator': (t, e) => RULES.actuator(t, e),
  'Base': (t, e) => RULES.base(t, e),
  'grip': (t, e) => RULES.jaw(t, e),
};

// ── hazard stripe texture: diagonal yellow and black ──
function stripes() {
  const S = 64, png = new PNG({ width: S, height: S });
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const on = ((x + y) % 32) < 16, i = (y * S + x) * 4;
    const c = on ? [242, 190, 40] : [28, 30, 34];
    png.data[i] = c[0]; png.data[i + 1] = c[1]; png.data[i + 2] = c[2]; png.data[i + 3] = 255;
  }
  return PNG.sync.write(png);
}

const doc = await io.read(IN);
const root = doc.getRoot();
const mats = {};
let tex = null;
function mat(part, fin) {
  const k = `${part}|${fin}`;
  if (mats[k]) return mats[k];
  const F = FIN[fin], m = doc.createMaterial(k).setBaseColorFactor([...lin(F.c), 1]).setMetallicFactor(F.m).setRoughnessFactor(F.r);
  if (F.e) m.setEmissiveFactor(lin(F.e).map((x) => x * F.ei));
  if (F.tex) { tex ??= doc.createTexture('hazard').setImage(stripes()).setMimeType('image/png'); m.setBaseColorTexture(tex); m.getBaseColorTextureInfo().setWrapS(10497).setWrapT(10497).setMagFilter(9728); }
  return (mats[k] = m);
}

const done = new Set();
const stats = {};
for (const node of root.listNodes()) {
  const mesh = node.getMesh(); if (!mesh || done.has(mesh)) continue; done.add(mesh);
  const part = SINGLE ?? node.getName().replace(/-\d+$/, '');
  const rule = PARTS[part]; if (!rule) { console.warn('no rule for', part); continue; }
  // treat all primitives of the mesh as one surface
  const prims = mesh.listPrimitives();
  for (const prim of prims) {
    const pos = prim.getAttribute('POSITION'), idxA = prim.getIndices();
    const P = []; for (let i = 0; i < pos.getCount(); i++) P.push(pos.getElement(i, [0, 0, 0]));
    const I = idxA ? Array.from(idxA.getArray()) : P.map((_, i) => i);
    const { tris, ext } = analyse(P, I);
    const fins = rule(tris, ext);
    // planar UVs (in metres x 60) for the stripes, from the part frame
    if (fins.includes('hazard')) {
      const uv = new Float32Array(P.length * 2);
      for (let t = 0, k = 0; t < I.length; t += 3, k++) for (let j = 0; j < 3; j++) {
        const v = P[I[t + j]], a = Math.atan2(v[2], v[0]);
        uv[I[t + j] * 2] = a * 0.07 * 22; uv[I[t + j] * 2 + 1] = v[1] * 22;
      }
      prim.setAttribute('TEXCOORD_0', doc.createAccessor().setType('VEC2').setArray(uv).setBuffer(root.listBuffers()[0]));
    }
    const groups = {};
    fins.forEach((f, k) => (groups[f] ??= []).push(I[k * 3], I[k * 3 + 1], I[k * 3 + 2]));
    const entries = Object.entries(groups);
    entries.forEach(([fin, ids], n) => {
      const ArrT = pos.getCount() > 65535 ? Uint32Array : Uint16Array;
      const acc = doc.createAccessor().setType('SCALAR').setArray(new ArrT(ids)).setBuffer(root.listBuffers()[0]);
      const p = n === 0 ? prim : prim.clone();
      p.setIndices(acc).setMaterial(mat(part, fin));
      if (n > 0) mesh.addPrimitive(p);
      stats[part] ??= {}; stats[part][fin] = (stats[part][fin] ?? 0) + ids.length / 3;
    });
  }
}
// keep each part's materials separate (merging them breaks per part selection)
await doc.transform(dedup({ propertyTypes: ['Accessor', 'Texture'] }), prune());
await io.write(OUT, doc);
for (const [p, s] of Object.entries(stats)) console.log(p.padEnd(22), Object.entries(s).map(([k, v]) => `${k}:${v}`).join('  '));
