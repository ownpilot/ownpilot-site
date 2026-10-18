import http from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('out');
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.jpeg':'image/jpeg','.woff2':'font/woff2','.json':'application/json','.webmanifest':'application/manifest+json','.xml':'application/xml','.txt':'text/plain'};
const port=Number(process.env.PORT||3000);
http.createServer(async(req,res)=>{
  let url;
  try {url=decodeURIComponent(new URL(req.url,'http://localhost').pathname)} catch {res.writeHead(400);res.end('Bad request');return}
  let file=path.resolve(root,'.'+url);
  if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end('Forbidden');return}
  try {const s=await stat(file);if(s.isDirectory())file=path.join(file,'index.html');await stat(file)}catch{file=path.join(root,'404.html');res.statusCode=404}
  res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');
  createReadStream(file).on('error',()=>{res.statusCode=500;res.end()}).pipe(res);
}).listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}`));
