# Unit VI: Node JS, mapped to the PS Laser Enquiry API

Code: `services/node-api/` (Node 24, Express 5, MySQL). Port 4000 (Express) and 4001 (plain `http`).
All paths below are relative to `services/node-api/`.

## How to run and test

```bash
# MySQL (XAMPP) must be running with the pslaser schema + seed loaded
cd services/node-api
npm install          # installs the exact versions pinned in package.json / package-lock.json
npm test             # 33 tests: node:test + supertest against MySQL (removes its own rows/files)
npm start            # http://localhost:4000  (API docs page at /)
npm run start:raw    # http://localhost:4001  (node:http only, no Express)
npm run dev          # node --watch: restarts on every file save
npm run lint         # node --check on every .js/.cjs file
```

Quick manual check: open http://localhost:4000/ (docs page shows a live "API up / DB up" badge), then
`curl http://localhost:4000/api/health` and `curl http://localhost:4001/health`.

## Topic map

| # | Syllabus topic | Where | What it shows |
|---|---|---|---|
| 1 | **Introduction to Node JS** (V8 runtime, single thread, non-blocking I/O, event loop) | `src/server.js:10-14` | `listen()` returns at once; the callback runs later from the event loop once the port is bound, and only then pings the DB. |
| | | `src/db/pool.js:42-56` | Every DB call is `await`ed: the thread is free to serve other requests while MySQL works. |
| | | `src/middleware/request-logger.js:8-24` | Callback on the response's `'finish'` event. Timing uses `process.hrtime.bigint()`. |
| | | `src/events/enquiry-events.js:10-31` | `EventEmitter`: `'enquiry:created'` has two listeners (WhatsApp-link builder, audit logger). `emit()` is synchronous, so the URL is ready when `emit` returns (`src/routes/enquiries.js:30-34`). Proven by `test/units.test.js` "listeners run synchronously". |
| | | `src/server.js:23-45` | `process` object: `SIGINT`/`SIGTERM` handlers, `process.exit`, `unhandledRejection`. A `setTimeout(...).unref()` forces exit if close hangs. |
| 2 | **Installation of Node JS** | README "Run"; `package.json:8-10` | `"engines": {"node": ">=24.0.0"}`. Check with `node -v` (v24.12.0 here) and `npm -v` (11.10.1). Install from nodejs.org (Windows .msi, LTS) or with nvm-windows. |
| 3 | **Node JS modules: core/built-in** | `fs/promises` `src/middleware/upload.js:15,46`; `fs` streams `src/utils/file-logger.js:14`, `src/routes/logs.js:29`, `src/routes/enquiries.js:76`; `path` + `url` `src/config/index.js:2-9`; `events` `src/events/enquiry-events.js:4`; `os` `src/routes/health.js:21-26`; `crypto` `src/utils/ids.js:4-10`; `http` `src/raw-server.js:30`; `stream/promises` `src/routes/enquiries.js:3`; `module` `src/middleware/upload.js:4` | Each built-in is imported with the `node:` prefix and used for real work. |
| | **ES modules (ESM)** | `package.json:6` (`"type": "module"`), every `src/**/*.js` | `import`/`export`, `import.meta.url` → `__dirname` (`src/config/index.js:7-10`), top-level `await` (`src/middleware/upload.js:15`), dynamic `import()` (`test/api.test.js:15-19`). |
| | **CommonJS + interop** | `src/config/file-rules.cjs:1-35` | `'use strict'`, `require('node:path')`, `module.exports`. |
| | | `src/middleware/upload.js:11-13` | ESM consumes the CJS module through `createRequire(import.meta.url)`. Also in `test/units.test.js`. |
| | **Own (local) modules** | `src/config`, `src/db`, `src/routes`, `src/middleware`, `src/services`, `src/schemas`, `src/events`, `src/utils` | One responsibility per module, connected by named exports. |
| | **Third-party modules** | `package.json:26-39` | express, mysql2, multer, jsonwebtoken, cors, helmet, express-rate-limit, dotenv, zod; supertest (dev). |
| 4 | **NPM** | `package.json` | Created with `npm init -y`, then edited (name, `type`, `engines`, `private`). |
| | scripts | `package.json:11-17` | `npm start`, `npm run dev` (`node --watch`), `npm run start:raw`, `npm test`, `npm run lint`. |
| | install + exact versions | `package.json:26-39`, `package-lock.json` | `npm install --save-exact express mysql2 ...` and `npm install --save-exact --save-dev supertest`. Semver: `5.3.0` = MAJOR.MINOR.PATCH. `^5.3.0` would accept any 5.x ≥ 5.3.0 and `~5.3.0` any 5.3.x. We pin exact versions, and the lockfile records the whole dependency tree, so `npm ci` reproduces it byte-for-byte. |
| | npx / tooling | `scripts/lint.js` | `npx <pkg>` runs a package binary without a global install, e.g. `npx eslint .` or `npx nodemon src/server.js`. Our zero-dependency lint uses `node --check`. Other commands: `npm ls`, `npm outdated`, `npm audit` (0 vulnerabilities at install). |
| | env config | `.env.example`, `src/config/index.js:12-51` | `dotenv` loads `.env` into `process.env`. Typed defaults match services/CONTRACT.md. |
| 5 | **Creating a web server: without Express** | `src/raw-server.js:1-51` | `http.createServer((req,res)=>...)`: URL parsing by hand (`new URL`), routing with `if`, `res.writeHead` status/headers, JSON with `Content-Length`, static file via `fs.createReadStream(...).pipe(res)`, 404/405, `listen(4001)`. |
| | **with Express** (for contrast) | `src/app.js:17-42`, `src/server.js` | The same jobs are done by `express.json`, `express.static`, `Router`, the error handler and `app.listen`. The app factory is kept separate from `listen()` so tests can run it without a port. |
| 6 | **File system** | `src/utils/file-logger.js:1-32` | `fs.mkdirSync`, then one **`fs.createWriteStream` (append)** per log: `storage/logs/requests.log` (every request) and `events.log` (enquiry events). Streams are closed on shutdown. |
| | | `src/routes/logs.js:14-30` | **`fs.createReadStream`** with `{start}` streams the tail of the log (or the whole file with `?download=1`). `fs.promises.stat` gives the size. |
| | | `src/routes/enquiries.js:62-78` | Streams a private drawing to staff with `pipeline(fs.createReadStream(...), res)`. |
| | | `src/middleware/upload.js:15-61` | `fs/promises`: `mkdir`, `open` + `read` (magic-byte check of the first bytes), `rm` (discards a failed upload). multer `diskStorage` writes files with crypto-random names. |
| | | `test/api.test.js:44-57` | `readdir`/`readFile`/`rm` in tests. They check that a rejected upload leaves no file behind. |
| 7 | **Express JS: routing** | `src/routes/*.js`, mounted at `src/app.js:32-35` | `Router()` per resource. `enquiriesRouter` is a factory so the rate limiter can be injected. Route params `/:id`, query strings. |
| | **middleware chain** | `src/app.js:21-39` | Order: request-id → logger → helmet → cors → json/urlencoded (100 kb limit) → static → routers → 404 → error handler. Per-route chain at `src/routes/enquiries.js:20-36`: rate limit → multer → magic bytes → zod → handler. |
| | custom middleware | `src/middleware/request-id.js`, `request-logger.js`, `auth.js`, `validate.js`, `rate-limit.js`, `upload.js` | `(req,res,next)` functions and middleware *factories* (`validate(schema)`, `requireRole(...roles)`). |
| | auth (JWT from Spring) | `src/middleware/auth.js:8-35` | `jwt.verify` with `algorithms:['HS256']` and the shared secret. Gives 401 when the token is missing, invalid or expired, and 403 for the wrong role (`staffOnly` = admin/staff). |
| | validation | `src/schemas/enquiry-schemas.js`, `src/middleware/validate.js` | zod schemas and `safeParse`. Errors come back as 400 `{fieldErrors}`. |
| | CORS / security | `src/middleware/cors.js`, `src/app.js:23` | Only the 5 CONTRACT origins; preflight for PATCH + Authorization. helmet sets the security headers. |
| | async + errors | `src/utils/async-handler.js`, `src/middleware/error-handler.js:8-46`, `src/utils/http-error.js` | Async wrapper → `next(err)`. Centralized handler maps HttpError, MulterError (413 for files over 10 MB), and JSON parse/size errors to `{status,error,message,fieldErrors?,requestId}`. |
| | REST endpoints | `src/routes/enquiries.js:20-78`, `health.js`, `catalogue.js` | POST 201 + `Location`, GET with pagination/filter, PATCH, file download. |
| 8 | **Serving static resources** | `src/app.js:29` | `express.static('public', {index:'index.html', maxAge:'1h'})` serves `public/index.html` (brand-orange API docs with curl examples), `docs.css`, `docs.js`, `logo.png`, `favicon.png`. |
| | | `src/middleware/upload.js:1-3`, `test/api.test.js:79-81,155` | Uploads are kept in `storage/uploads`, *outside* `public/`, and tests prove they return 404. Staff can only download them through the authenticated stream route. |
| | | `src/raw-server.js:20-28` | The same static serving written by hand with `http` + streams, for comparison. |
| 9 | **Database connectivity** | `src/db/pool.js:6-23` | `mysql2/promise` `createPool` (connection limit 10). Each connection is pinned to UTC. |
| | prepared statements | `src/services/enquiry-service.js:27-41,52-58,78-95`, `catalogue-service.js:9-14` | `execute(sql, [params])` with `?` placeholders (server-side prepared statements, no SQL injection). LIMIT/OFFSET are zod-validated integers. |
| | transaction | `src/db/pool.js:42-56`, `src/services/enquiry-service.js:25-46` | `beginTransaction` → INSERT enquiry → INSERT upload → `commit`, with `rollback` on any error. |
| | caching | `src/services/catalogue-service.js:41-52` | 60 s in-memory cache. Concurrent misses share one query. `X-Cache` header. |
| | health / shutdown | `src/db/pool.js:25-38`, `src/server.js:23-45` | `conn.ping()` for `/api/health`. On SIGINT/SIGTERM: `server.close` → `pool.end()` → close log streams → exit 0. |

## Endpoints (services/CONTRACT.md)

| Endpoint | Result |
|---|---|
| `GET /api/health` | `{ok:true, db:true, node, uptimeSeconds, os:{...}}` |
| `POST /api/enquiries` (JSON or multipart `drawing`) | `201 {id, whatsappUrl}`. Returns 400 with fieldErrors, 400 for a bad file type, 413 for a file over 10 MB, 429 when rate limited. |
| `GET /api/enquiries` (admin/staff) | `{items[], page, pageSize, total, totalPages}`. Each item has `drawings[]` (no disk paths). |
| `PATCH /api/enquiries/:id` (admin/staff) | updated enquiry |
| `GET /api/enquiries/:id/drawing` (admin/staff) | file stream (attachment) |
| `GET /api/catalogue` | `{machines[], services[]}` |
| `GET /api/logs/requests` (admin) | text stream of the log tail |
| `GET /` | static docs page |

## Tests (`npm test`, 33 passing)

`test/api.test.js` covers health, static and 404, CORS (allowed origin, unknown origin, preflight), validation 400, malformed JSON, create 201 (JSON, `source` default and override, multipart `.dxf` with DB row + private file), rejecting `.exe` and fake `.png`, file removal after a validation failure, 429, JWT (401 for missing, forged and expired tokens, 403 for the customer role, 200 for admin/staff), PATCH 200/400/404/401, drawing download, log tail, and the catalogue cache HIT. The test JWTs are minted with the CONTRACT dev secret. `after()` deletes every created row and file.
`test/units.test.js` covers the CommonJS rules via `createRequire`, the WhatsApp URL, random file names, schema trimming and EventEmitter ordering.
