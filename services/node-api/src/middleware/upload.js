// Drawing upload with multer (multipart/form-data). Files land in
// storage/uploads (NOT under public/, so never served statically) with random
// names from crypto; the customer's original name is only stored in the DB.
import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import multer from 'multer';
import { config } from '../config/index.js';
import { randomFileName } from '../utils/ids.js';
import { HttpError } from '../utils/http-error.js';

// ESM -> CommonJS interop: build a require() function scoped to this module.
const require = createRequire(import.meta.url);
const { ALLOWED_DRAWING_TYPES, MAGIC_BYTES, extensionOf, isAllowedDrawing } = require('../config/file-rules.cjs');

await fs.mkdir(config.paths.uploads, { recursive: true }); // top-level await (ESM only)

const allowedList = Object.keys(ALLOWED_DRAWING_TYPES).map((ext) => ext.slice(1)).join(', ');

const storage = multer.diskStorage({
  destination: config.paths.uploads,
  filename(req, file, cb) {
    const ext = extensionOf(file.originalname);
    cb(null, randomFileName(ext === '.jpeg' ? '.jpg' : ext));
  },
});

export const drawingUpload = multer({
  storage,
  limits: { fileSize: config.uploadMaxBytes, files: 1, fields: 20, fieldSize: 64 * 1024 },
  fileFilter(req, file, cb) {
    if (file.fieldname !== 'drawing') {
      return cb(new HttpError(400, 'Unexpected file field', { [file.fieldname]: 'Only a "drawing" file is accepted' }));
    }
    if (!isAllowedDrawing(file.originalname, file.mimetype)) {
      return cb(new HttpError(400, 'Unsupported drawing type', { drawing: `Allowed types: ${allowedList}` }));
    }
    return cb(null, true);
  },
}).single('drawing');

/** After upload: compare the file's first bytes with the expected signature (pdf/png/jpg). */
export async function verifyMagicBytes(req, res, next) {
  if (!req.file) return next();
  const expected = MAGIC_BYTES[extensionOf(req.file.originalname)];
  if (!expected) return next();
  const handle = await fs.open(req.file.path, 'r');
  try {
    const { buffer } = await handle.read(Buffer.alloc(expected.length), 0, expected.length, 0);
    if (!buffer.equals(expected)) {
      throw new HttpError(400, 'Unsupported drawing type', { drawing: 'File content does not match its extension' });
    }
  } finally {
    await handle.close();
  }
  return next();
}

/** Removes an uploaded file (used when validation or the DB insert fails). */
export async function discardUpload(file) {
  if (file?.path) await fs.rm(file.path, { force: true });
}
