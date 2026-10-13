// CommonJS module (note the .cjs extension + module.exports / require syntax).
// The rest of the app is ES modules; src/middleware/upload.js loads this file
// with module.createRequire() to show how ESM code consumes a CommonJS module.
'use strict';

const path = require('node:path');

/** Allowed drawing types: extension -> accepted MIME types (browsers/curl vary for CAD files). */
const ALLOWED_DRAWING_TYPES = Object.freeze({
  '.dxf': ['application/dxf', 'application/x-dxf', 'image/vnd.dxf', 'image/x-dxf', 'text/plain', 'application/octet-stream'],
  '.dwg': ['application/acad', 'application/x-acad', 'application/dwg', 'application/x-dwg', 'image/vnd.dwg', 'image/x-dwg', 'application/octet-stream'],
  '.pdf': ['application/pdf'],
  '.png': ['image/png'],
  '.jpg': ['image/jpeg', 'image/pjpeg'],
  '.jpeg': ['image/jpeg', 'image/pjpeg'],
});

/** First bytes ("magic numbers") for the binary formats we can sniff cheaply. */
const MAGIC_BYTES = Object.freeze({
  '.pdf': Buffer.from('%PDF'),
  '.png': Buffer.from([0x89, 0x50, 0x4e, 0x47]),
  '.jpg': Buffer.from([0xff, 0xd8, 0xff]),
  '.jpeg': Buffer.from([0xff, 0xd8, 0xff]),
});

function extensionOf(fileName) {
  return path.extname(String(fileName || '')).toLowerCase();
}

function isAllowedDrawing(fileName, mimeType) {
  const allowed = ALLOWED_DRAWING_TYPES[extensionOf(fileName)];
  return Boolean(allowed && allowed.includes(String(mimeType || '').toLowerCase()));
}

module.exports = { ALLOWED_DRAWING_TYPES, MAGIC_BYTES, extensionOf, isAllowedDrawing };
