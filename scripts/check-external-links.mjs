import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
const urls = new Set();
async function collect(dir) {
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, item.name);
    if (item.isDirectory()) await collect(file);
    else if (file.endsWith('.html')) {
      for (const match of (await readFile(file, 'utf8')).matchAll(
        /<a\b[^>]*href="(https:\/\/[^"<>]+)"/g,
      )) {
        const url = new URL(match[1].replaceAll('&amp;', '&'));
        url.hash = '';
        if (url.hostname !== 'ownpilot.dev') urls.add(url.href);
      }
    }
  }
}
await collect('out');
const results = [];
const pending = [...urls];
await Promise.all(
  Array.from({ length: 4 }, async () => {
    while (pending.length) {
      const url = pending.shift();
      try {
        const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(15000) });
        results.push({ url, status: response.status, ok: response.ok });
      } catch (error) {
        results.push({ url, ok: false, error: error.message });
      }
    }
  }),
);
const failures = results.filter((r) => !r.ok);
if (failures.length) {
  console.error(JSON.stringify(failures, null, 2));
  process.exitCode = 1;
}
console.log(
  `${results.length - failures.length}/${results.length} external anchor targets returned successful HTTPS responses.`,
);
