import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
const social = await readFile(new URL('../assets/og-master.png', import.meta.url));
const og = await sharp(social)
  .resize(1200, 630, { fit: 'cover', position: 'centre' })
  .png({ compressionLevel: 9 })
  .toBuffer();
await writeFile(new URL('../public/og.png', import.meta.url), og);
// Keep existing shared URLs working while metadata uses the new canonical asset.
await writeFile(new URL('../public/social-card.png', import.meta.url), og);
const logo = await readFile(new URL('../public/favicon.svg', import.meta.url));
for (const [size, name] of [
  [192, 'icon-192.png'],
  [512, 'icon-512.png'],
  [180, 'apple-touch-icon.png'],
]) {
  await sharp(logo)
    .resize(size, size, { fit: 'contain', background: '#111415' })
    .png()
    .toFile(fileURLToPath(new URL(`../public/${name}`, import.meta.url)));
}
console.log('1200×630 OG card, compatibility image and application icons generated.');
