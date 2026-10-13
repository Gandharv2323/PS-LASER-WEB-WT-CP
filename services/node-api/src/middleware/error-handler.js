// 404 + centralized error handler. Every error leaves the API in the same JSON
// shape as the Spring API: { status, error, message, fieldErrors?, requestId }.
import { STATUS_CODES } from 'node:http';
import multer from 'multer';
import { HttpError } from '../utils/http-error.js';
import { discardUpload } from './upload.js';

export function notFound(req, res, next) {
  next(new HttpError(404, `No route for ${req.method} ${req.path}`));
}

// Express recognises an error handler by its 4 parameters.
// eslint-disable-next-line no-unused-vars
export async function errorHandler(err, req, res, next) {
  let status = 500;
  let message = 'Internal server error';
  let fieldErrors;

  if (err instanceof HttpError) {
    ({ status, message, fieldErrors } = err);
  } else if (err instanceof multer.MulterError) {
    status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'Drawing is larger than the 10 MB limit' : err.message;
    fieldErrors = { [err.field || 'drawing']: message };
  } else if (err?.type === 'entity.too.large') {
    status = 413;
    message = 'Request body too large';
  } else if (err?.type === 'entity.parse.failed') {
    status = 400;
    message = 'Malformed JSON body';
  } else {
    console.error(`[error] ${req.id}`, err);
  }

  // Never keep a stored drawing for a request that failed.
  await discardUpload(req.file).catch(() => {});

  if (res.headersSent) return;
  res.status(status).json({
    status,
    error: STATUS_CODES[status] ?? 'Error',
    message,
    ...(fieldErrors ? { fieldErrors } : {}),
    requestId: req.id,
  });
}
