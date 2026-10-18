import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
const root = path.resolve('out');
let errors = [];
let count = 0;
let links = 0;
async function exists(file) {
  try {
    return await stat(file);
  } catch {
    return null;
  }
}
async function walk(dir) {
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, item.name);
    if (item.isDirectory()) {
      await walk(file);
      continue;
    }
    if (!file.endsWith('.html')) continue;
    count++;
    const html = await readFile(file, 'utf8');
    if (!html.includes('<h1')) errors.push(`${file}: missing h1`);
    if (!html.includes('rel="canonical"')) errors.push(`${file}: missing canonical`);
    if (!html.includes('<meta property="og:image" content="https://ownpilot.dev/og.png"'))
      errors.push(`${path.relative(root, file)}: missing Open Graph sharing image`);
    if (!html.includes('<meta name="twitter:image" content="https://ownpilot.dev/og.png"'))
      errors.push(`${path.relative(root, file)}: missing Twitter sharing image`);
    for (const m of html.matchAll(/(?:href|src)="([^"<>]+)"/g)) {
      let href = m[1].replaceAll('&amp;', '&');
      if (!href.startsWith('/') || href.startsWith('//')) continue;
      links++;
      href = href.split(/[?#]/)[0];
      const target = path.join(root, decodeURIComponent(href));
      const s = await exists(target);
      if (!s) errors.push(`${path.relative(root, file)}: missing ${href}`);
      else if (s.isDirectory() && !(await exists(path.join(target, 'index.html'))))
        errors.push(`Missing index: ${href}`);
    }
  }
}
await walk(root);
for (const name of [
  '.nojekyll',
  'CNAME',
  'sitemap.xml',
  'robots.txt',
  'og.png',
  'social-card.png',
  'favicon.svg',
  'icon-192.png',
  'icon-512.png',
  'apple-touch-icon.png',
])
  if (!(await exists(path.join(root, name)))) errors.push(`Missing deployment asset ${name}`);
if ((await readFile(path.join(root, 'CNAME'), 'utf8')).trim() !== 'ownpilot.dev')
  errors.push('Incorrect custom domain');
if (await exists(path.join(root, 'og.png'))) {
  const og = await readFile(path.join(root, 'og.png'));
  const { width, height, format } = await sharp(og).metadata();
  if (width !== 1200 || height !== 630 || format !== 'png')
    errors.push('OG image must be a 1200×630 PNG');
  if (
    (await exists(path.join(root, 'social-card.png'))) &&
    !og.equals(await readFile(path.join(root, 'social-card.png')))
  )
    errors.push('Legacy social image must match the current OG card');
}
errors = [...new Set(errors)];
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(
  `PASS: ${count} exported HTML files, ${links} internal link/asset references, canonical metadata, Pages files and brand assets.`,
);
