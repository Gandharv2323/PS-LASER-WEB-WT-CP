// "Creating a web server" WITHOUT Express - only Node's built-in http module.
// Run: npm run start:raw  ->  http://localhost:4001
// Compare with src/app.js: here routing, headers, content types, 404s and
// static-file streaming are all done by hand.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { config } from './config/index.js';

const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png' };

function sendJson(res, status, body) {
  const json = JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(json) });
  res.end(json);
}

function serveStatic(res, fileName) {
  // Only files directly inside public/ - path.basename strips any "../" tricks.
  const filePath = path.join(config.paths.public, path.basename(fileName));
  const stream = fs.createReadStream(filePath);
  stream.on('open', () => {
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] ?? 'application/octet-stream' });
    stream.pipe(res); // readable file stream -> writable HTTP response
  });
  stream.on('error', () => sendJson(res, 404, { status: 404, error: 'Not Found', message: `No file ${fileName}` }));
}

export const rawServer = http.createServer((req, res) => {
  // The url module parses path + query string (no router to do it for us).
  const { pathname } = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`);

  if (req.method !== 'GET') return sendJson(res, 405, { status: 405, error: 'Method Not Allowed' });
  if (pathname === '/health') {
    return sendJson(res, 200, { ok: true, server: 'node:http (no Express)', host: os.hostname(), pid: process.pid });
  }
  if (pathname === '/') return serveStatic(res, 'index.html');
  if (pathname === '/logo.png' || pathname === '/favicon.png' || pathname === '/docs.css') {
    return serveStatic(res, pathname.slice(1));
  }
  return sendJson(res, 404, { status: 404, error: 'Not Found', message: `No route for GET ${pathname}` });
});

rawServer.listen(config.rawPort, () => {
  console.log(`Raw node:http server on http://localhost:${config.rawPort}  (try /health and /)`);
});

const stop = () => rawServer.close(() => process.exit(0));
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
