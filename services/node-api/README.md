# PS Laser Enquiry API (Node.js + Express)

CS3111 Unit VI. Stores website enquiries (with an optional CAD drawing) in the shared
`pslaser` MySQL database and returns a WhatsApp link, so every quote stays
WhatsApp-first. Staff routes accept the JWT issued by the Spring Boot API.
Syllabus mapping: [`docs/syllabus/unit-6-node.md`](../../docs/syllabus/unit-6-node.md).

## Run

```bash
cd services/node-api
npm install            # exact versions from package-lock.json
cp .env.example .env   # optional - the defaults already match services/CONTRACT.md
npm start              # Express API  -> http://localhost:4000  (docs page at /)
npm run dev            # same, restarts on file changes (node --watch)
npm run start:raw      # plain node:http server -> http://localhost:4001
npm test               # node:test + supertest (needs MySQL; cleans up its rows/files)
npm run lint           # syntax check of every .js/.cjs file
```

MySQL: XAMPP on `localhost:3306`, database `pslaser`, user `root`, no password
(`mysql -uroot < services/db/schema.sql && mysql -uroot pslaser < services/db/seed.sql`).

## Endpoints

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/health` | - | `{ok:true, db:true\|false, ...os/process info}` |
| POST | `/api/enquiries` | - (rate limited) | JSON or multipart; optional `drawing` (dxf/dwg/pdf/png/jpg, <= 10 MB) -> `201 {id, whatsappUrl}` |
| GET | `/api/enquiries` | admin/staff JWT | `?page&pageSize(<=100)&status` -> `{items, page, pageSize, total, totalPages}` |
| PATCH | `/api/enquiries/:id` | admin/staff JWT | `{status: new\|contacted\|quoted\|won\|lost}` -> updated enquiry |
| GET | `/api/enquiries/:id/drawing` | admin/staff JWT | streams the private upload as an attachment |
| GET | `/api/catalogue` | - | `{machines, services}`, 60 s memory cache, `X-Cache: HIT\|MISS` |
| GET | `/api/logs/requests` | admin JWT | tail of the request log (`?bytes=`), or `?download=1` |
| GET | `/` | - | static API docs page (`public/`) |

Errors use the Spring API shape: `{status, error, message, fieldErrors?, requestId}`.

`source` defaults to `node`; a caller may pass one of `next, react, php, laravel, jsp, spring, node`.

### curl

```bash
curl http://localhost:4000/api/health
curl -X POST http://localhost:4000/api/enquiries -H "Content-Type: application/json" \
  -d '{"name":"Asha Patil","phone":"9876543210","serviceSlug":"laser-cutting","message":"50 pcs MS 3 mm brackets"}'
curl -X POST http://localhost:4000/api/enquiries -F name="Asha Patil" -F phone=9876543210 \
  -F message="Please quote this part" -F drawing=@bracket.dxf

# Staff token: log in through Spring (POST http://localhost:8081/api/auth/login), or mint a
# dev token with the CONTRACT dev secret:
TOKEN=$(node -e "console.log(require('jsonwebtoken').sign({sub:'1',email:'admin@pslaser.local',role:'admin'},'pslaser-dev-secret-change-me-0123456789abcdef',{algorithm:'HS256',expiresIn:'8h'}))")
curl "http://localhost:4000/api/enquiries?status=new" -H "Authorization: Bearer $TOKEN"
curl -X PATCH http://localhost:4000/api/enquiries/12 -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" -d '{"status":"contacted"}'
```

## Layout

```
src/
  server.js          listen + graceful shutdown (SIGINT/SIGTERM)
  raw-server.js      the same idea with only node:http (no Express), port 4001
  app.js             Express app factory: middleware chain + routers + 404/error handler
  config/            index.js (dotenv, paths), file-rules.cjs (CommonJS, loaded via createRequire)
  db/pool.js         mysql2/promise pool, ping, withTransaction
  routes/            health, catalogue, enquiries, logs
  middleware/        request-id, request-logger, cors, auth (JWT), validate (zod), upload (multer), rate-limit, error-handler
  services/          enquiry-service (SQL), catalogue-service (60 s cache)
  schemas/           zod request schemas
  events/            EventEmitter 'enquiry:created' -> WhatsApp link + audit log
  utils/             ids (crypto), whatsapp, file-logger (write streams), async-handler, http-error
public/              API docs page, CSS, JS, logo, favicon (express.static)
storage/uploads/     private drawings (random names, never served statically)
storage/logs/        requests.log, events.log (JSON lines)
test/                api.test.js (integration), units.test.js
```

Security notes: uploads are checked by extension + MIME whitelist and, for pdf/png/jpg, by
magic bytes; a failed request never leaves a file behind. JWTs are verified with the
algorithm pinned to HS256. The JWT secret in `.env.example` is the shared dev value;
set a real one (same as Spring) before any deployment.
