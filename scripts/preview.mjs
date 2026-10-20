import http from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve('out');
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpeg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
};
const port = Number(process.env.PORT || 3000);
http
  .createServer(async (req, res) => {
    let url;
    try {
      url = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    } catch {
      res.writeHead(400);
      res.end('Bad request');
      return;
    }
    let file = path.resolve(root, '.' + url);
    if (file !== root && !file.startsWith(root + path.sep)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    try {
      const s = await stat(file);
      if (s.isDirectory()) file = path.join(file, 'index.html');
      await stat(file);
    } catch {
      // Next's Windows export nests route-data segments that clients request with dots.
      const name = path.basename(file);
      const segments =
        name.startsWith('__next.') && name.endsWith('.txt') ? name.slice(7, -4).split('.') : [];
      let matched = false;
      if (segments.length > 1 && segments.every((segment) => /^[\w$-]+$/.test(segment))) {
        const nested =
          path.join(path.dirname(file), `__next.${segments[0]}`, ...segments.slice(1)) + '.txt';
        try {
          matched = (await stat(nested)).isFile();
          if (matched) file = nested;
        } catch {
          // Unknown routes still receive a real 404 response.
        }
      }
      if (!matched) {
        file = path.join(root, '404.html');
        res.statusCode = 404;
      }
    }
    res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
    createReadStream(file)
      .on('error', () => {
        res.statusCode = 500;
        res.end();
      })
      .pipe(res);
  })
  .listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}`));
