// Central configuration (ES module). Reads process.env (optionally filled from
// a .env file by dotenv) and exposes typed, defaulted settings to the app.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

// ESM has no __dirname: rebuild it from import.meta.url with the url + path modules.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const ROOT_DIR = path.resolve(__dirname, '..', '..'); // services/node-api

dotenv.config({ path: path.join(ROOT_DIR, '.env'), quiet: true });

const env = process.env;
const int = (value, fallback) => {
  const n = Number.parseInt(value ?? '', 10);
  return Number.isFinite(n) ? n : fallback;
};

export const config = Object.freeze({
  env: env.NODE_ENV ?? 'development',
  port: int(env.PORT, 4000),
  rawPort: int(env.RAW_PORT, 4001),
  db: Object.freeze({
    host: env.DB_HOST ?? 'localhost',
    port: int(env.DB_PORT, 3306),
    database: env.DB_NAME ?? 'pslaser',
    user: env.DB_USER ?? 'root',
    password: env.DB_PASSWORD ?? '',
    connectionLimit: int(env.DB_POOL_SIZE, 10),
  }),
  // Same secret + claims as the Spring Boot API (services/CONTRACT.md -> Auth).
  jwtSecret: env.JWT_SECRET ?? 'pslaser-dev-secret-change-me-0123456789abcdef',
  corsOrigins: (env.CORS_ORIGINS ??
    'http://localhost:3001,http://localhost:5173,http://localhost:8000,http://localhost:8001,http://localhost:8080')
    .split(',').map((s) => s.trim()).filter(Boolean),
  whatsappNumber: env.WHATSAPP_NUMBER ?? '917719976990',
  uploadMaxBytes: int(env.UPLOAD_MAX_MB, 10) * 1024 * 1024,
  enquiryRateLimit: Object.freeze({
    windowMs: int(env.ENQUIRY_RATE_WINDOW_MIN, 15) * 60 * 1000,
    max: int(env.ENQUIRY_RATE_MAX, 20),
  }),
  catalogueCacheMs: int(env.CATALOGUE_CACHE_SECONDS, 60) * 1000,
  paths: Object.freeze({
    public: path.join(ROOT_DIR, 'public'),
    uploads: path.join(ROOT_DIR, 'storage', 'uploads'),
    logs: path.join(ROOT_DIR, 'storage', 'logs'),
  }),
  requestLogFile: env.REQUEST_LOG_FILE ?? 'requests.log',
  eventLogFile: env.EVENT_LOG_FILE ?? 'events.log',
});
