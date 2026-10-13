// CORS exactly as services/CONTRACT.md: only the five local front-end origins.
import cors from 'cors';
import { config } from '../config/index.js';

export const corsMiddleware = cors({
  origin(origin, callback) {
    // No Origin header = same-origin page, curl or server-to-server -> allowed.
    // Unknown origins simply get no CORS headers (the browser blocks), not a 500.
    callback(null, !origin || config.corsOrigins.includes(origin));
  },
  methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  exposedHeaders: ['X-Request-Id', 'X-Cache'],
  maxAge: 600,
});
