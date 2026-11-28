// Splits each mesh into the CAD faces it came from: triangles are joined when they
// share an edge and their normals differ by less than ANGLE. Exported for paint2.
export function segment(P, I, ANGLE = 28) {
  const T = I.length / 3, cos = Math.cos((ANGLE * Math.PI) / 180);
  const key = (v) => `${Math.round(v[0] * 2e5)},${Math.round(v[1] * 2e5)},${Math.round(v[2] * 2e5)}`;
  const vid = new Map(), V = P.map((p) => { const k = key(p); if (!vid.has(k)) vid.set(k, vid.size); return vid.get(k); });
  const N = [], A = [], C = [];
  for (let t = 0; t < T; t++) {
    const a = P[I[3 * t]], b = P[I[3 * t + 1]], c = P[I[3 * t + 2]];
    const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], w = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    // zero area triangles get no normal and no weight
    const n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]], l = Math.hypot(...n);
    N.push(l > 0 ? n.map((x) => x / l) : [0, 0, 0]); A.push(l / 2); C.push([(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3, (a[2] + b[2] + c[2]) / 3]);
  }
  // some exports wind triangles backwards: use the signed volume to make every normal point out
  let vol = 0;
  for (let t = 0; t < T; t++) { const a = P[I[3 * t]], b = P[I[3 * t + 1]], c = P[I[3 * t + 2]];
    vol += a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0]); }
  const flipped = vol < 0;
  if (flipped) for (const n of N) { n[0] = -n[0]; n[1] = -n[1]; n[2] = -n[2]; }
  const edges = new Map();
  for (let t = 0; t < T; t++) for (let j = 0; j < 3; j++) {
    const x = V[I[3 * t + j]], y = V[I[3 * t + ((j + 1) % 3)]], k = x < y ? `${x}_${y}` : `${y}_${x}`;
    (edges.get(k) ?? edges.set(k, []).get(k)).push(t);
  }
  const nb = Array.from({ length: T }, () => []);
  for (const ts of edges.values()) for (let i = 0; i < ts.length; i++) for (let j = i + 1; j < ts.length; j++) { nb[ts[i]].push(ts[j]); nb[ts[j]].push(ts[i]); }
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const patch = new Int32Array(T).fill(-1); let n = 0;
  for (let s = 0; s < T; s++) {
    if (patch[s] >= 0) continue;
    const stack = [s]; patch[s] = n;
    while (stack.length) { const t = stack.pop(); for (const u of nb[t]) if (patch[u] < 0 && dot(N[t], N[u]) > cos) { patch[u] = n; stack.push(u); } }
    n++;
  }
  return { patch, count: n, N, A, C, nb, flipped };
}
