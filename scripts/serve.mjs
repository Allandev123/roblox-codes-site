// Serves dist/ the way Vercel will: /x -> /x/, /x/ -> /x/index.html, 404.html otherwise.
//
//   node scripts/serve.mjs [port]      (builds first)

import http from 'http';
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { ROOT } from '../lib/store.mjs';

const PORT = Number(process.argv[2] ?? process.env.PORT ?? 4321);
const DIST = path.join(ROOT, 'dist');
execFileSync(process.execPath, [path.join(ROOT, 'build.mjs')], { stdio: 'inherit' });

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.webp': 'image/webp', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain', '.ico': 'image/x-icon' };

http.createServer((req, res) => {
  const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let f = path.join(DIST, url);
  if (!f.startsWith(DIST)) { res.writeHead(400); return res.end(); }
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) {
    if (!url.endsWith('/')) { res.writeHead(308, { location: url + '/' }); return res.end(); }
    f = path.join(f, 'index.html');
  }
  if (!fs.existsSync(f)) {
    res.writeHead(404, { 'content-type': TYPES['.html'] });
    return res.end(fs.readFileSync(path.join(DIST, '404.html')));
  }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] ?? 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
}).listen(PORT, () => console.log(`http://localhost:${PORT}/`));
