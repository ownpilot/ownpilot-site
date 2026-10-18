import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
const social = await readFile(new URL('../public/social-card.svg', import.meta.url));
await sharp(social)
  .png()
  .toFile(fileURLToPath(new URL('../public/social-card.png', import.meta.url)));
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
console.log('Social card and application icons generated from SVG sources.');
