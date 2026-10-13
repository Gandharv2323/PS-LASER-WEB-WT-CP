// Express application factory: builds the middleware chain + routers.
// Kept separate from server.js (which calls listen) so tests can import the
// app without opening a port.
import express from 'express';
import helmet from 'helmet';
import { config } from './config/index.js';
import { requestId } from './middleware/request-id.js';
import { requestLogger } from './middleware/request-logger.js';
import { corsMiddleware } from './middleware/cors.js';
import { enquiryRateLimiter } from './middleware/rate-limit.js';
import { notFound, errorHandler } from './middleware/error-handler.js';
import { healthRouter } from './routes/health.js';
import { catalogueRouter } from './routes/catalogue.js';
import { enquiriesRouter } from './routes/enquiries.js';
import { logsRouter } from './routes/logs.js';

export function createApp({ rateLimiter = enquiryRateLimiter() } = {}) {
  const app = express();

  // 1. Cross-cutting middleware - order matters, each calls next().
  app.use(requestId); // X-Request-Id for every response
  app.use(requestLogger); // access log -> storage/logs/requests.log (write stream)
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'same-site' } })); // security headers
  app.use(corsMiddleware); // CONTRACT origins only (also answers OPTIONS preflight)
  app.use(express.json({ limit: '100kb' })); // JSON bodies, capped
  app.use(express.urlencoded({ extended: false, limit: '100kb' })); // classic HTML form posts

  // 2. Static resources: API docs page, CSS, JS, logo, favicon (GET /).
  app.use(express.static(config.paths.public, { index: 'index.html', maxAge: '1h' }));

  // 3. API routers.
  app.use('/api/health', healthRouter);
  app.use('/api/catalogue', catalogueRouter);
  app.use('/api/enquiries', enquiriesRouter({ rateLimiter }));
  app.use('/api/logs', logsRouter);

  // 4. Fall-through 404 + centralized error handler (must be last).
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
