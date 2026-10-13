// GET /api/logs/requests (admin) - streams the request log with fs.createReadStream.
//   ?bytes=8192    tail: only the last N bytes (default 16 KB, max 1 MB)
//   ?download=1    whole file as an attachment
import fs from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../utils/async-handler.js';
import { HttpError } from '../utils/http-error.js';
import { requestLogPath } from '../utils/file-logger.js';

export const logsRouter = Router();

logsRouter.get(
  '/requests',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const file = requestLogPath();
    const stat = await fs.promises.stat(file).catch(() => null);
    if (!stat) throw new HttpError(404, 'No request log yet');

    const download = req.query.download === '1';
    const tailBytes = Math.min(Math.max(Number.parseInt(req.query.bytes, 10) || 16384, 1), 1048576);
    const start = download ? 0 : Math.max(0, stat.size - tailBytes);

    res.type('text/plain; charset=utf-8');
    if (download) res.attachment('requests.log');
    await pipeline(fs.createReadStream(file, { start }), res);
  }),
);
