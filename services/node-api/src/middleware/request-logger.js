// Own access logger (instead of morgan): measures each request with
// process.hrtime.bigint() and appends one JSON line to storage/logs/requests.log
// when the response 'finish' event fires.
import { logRequest } from '../utils/file-logger.js';
import { config } from '../config/index.js';

export function requestLogger(req, res, next) {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    const record = {
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      ms: Math.round(ms * 10) / 10,
      ip: req.ip,
      user: req.user?.sub ?? null,
    };
    logRequest(record);
    if (config.env === 'development') {
      console.log(`${record.method} ${record.url} -> ${record.status} (${record.ms} ms) [${record.requestId}]`);
    }
  });
  next();
}
