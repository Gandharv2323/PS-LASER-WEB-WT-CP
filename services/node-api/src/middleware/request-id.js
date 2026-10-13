// Gives every request an id (crypto.randomUUID) - echoed in X-Request-Id and in
// error bodies/logs so a customer complaint can be matched to a log line.
import { newRequestId } from '../utils/ids.js';

const SAFE_ID = /^[A-Za-z0-9._-]{8,64}$/;

export function requestId(req, res, next) {
  const incoming = req.get('x-request-id');
  req.id = incoming && SAFE_ID.test(incoming) ? incoming : newRequestId();
  res.set('X-Request-Id', req.id);
  next();
}
