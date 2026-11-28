// Re-encode a model's PNG textures as JPEG (opaque shell textures don't need PNG).
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import { createRequire } from 'module';
const sharp = createRequire(new URL('../package.json', import.meta.url))('sharp');
await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
for (const f of process.argv.slice(2)) {
  const doc = await io.read(f);
  for (const t of doc.getRoot().listTextures()) if (t.getMimeType() === 'image/png' && t.getName() !== 'hazard') {
    t.setImage(await sharp(Buffer.from(t.getImage())).jpeg({ quality: 82, mozjpeg: true }).toBuffer()).setMimeType('image/jpeg');
  }
  await io.write(f, doc);
}
