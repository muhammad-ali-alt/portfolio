// Run from a folder with @gltf-transform/core, @gltf-transform/extensions and meshoptimizer installed:
//   node tools/recolor-arm.mjs
// Change the hex colors in LOOK, run it, then rerender the part pictures.
// Colors the robotic arm: orange links, off white joint housings, graphite base
// and actuator, aluminium jaws. Values are sRGB hex, converted to glTF's linear space.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
const lin = (h) => [1, 3, 5].map((i) => { const c = parseInt(h.slice(i, i + 2), 16) / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }).concat(1);
const LOOK = {
  'Lower Arm Link':      { c: '#e8741c', m: 0.0, r: 0.38 },
  'Upper Arm Link':      { c: '#e8741c', m: 0.0, r: 0.38 },
  'Shoulder Drive Unit': { c: '#e4e6e8', m: 0.0, r: 0.42 },
  'Rotary Yoke Joint':   { c: '#e4e6e8', m: 0.0, r: 0.42 },
  'Wrist Modul':         { c: '#e4e6e8', m: 0.0, r: 0.42 },
  'Gripper Actuator':    { c: '#4a5058', m: 0.45, r: 0.4 },
  'Base':                { c: '#3d424a', m: 0.5, r: 0.45 },
  'grip':                { c: '#b9c0c8', m: 0.85, r: 0.3 },
};
const FILES = { 'grip.glb': 'grip', 'gripper-actuator.glb': 'Gripper Actuator', 'wrist-module.glb': 'Wrist Modul', 'rotary-yoke-joint.glb': 'Rotary Yoke Joint',
  'shoulder-drive-unit.glb': 'Shoulder Drive Unit', 'upper-arm-link.glb': 'Upper Arm Link', 'lower-arm-link.glb': 'Lower Arm Link', 'base.glb': 'Base' };
const dir = new URL('../public/models/', import.meta.url).pathname;
const paint = (m, k) => { const L = LOOK[k]; m.setBaseColorFactor(lin(L.c)).setMetallicFactor(L.m).setRoughnessFactor(L.r); };
const asm = await io.read(dir + 'robotic-arm-assembly.glb');
for (const m of asm.getRoot().listMaterials()) paint(m, m.getName());
await io.write(dir + 'robotic-arm-assembly.glb', asm);
for (const [f, k] of Object.entries(FILES)) { const d = await io.read(dir + f); d.getRoot().listMaterials().forEach((m) => paint(m, k)); await io.write(dir + f, d); }
console.log('done');
