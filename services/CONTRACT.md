# PS Laser — full-stack contract (CS3111 Web Technologies mapping)

Every syllabus unit is implemented as a real PS Laser feature. All parts share one
MySQL database and the contracts below, so they can call each other.

## Folders, ports, units

| Folder | Tech | Port | Syllabus unit | Feature |
|---|---|---|---|---|
| `/` (Next.js app, `src/`) | Next.js 16, React 19, TypeScript | 3001 | Unit V Advanced React | Public website (classic design) + `/quote` estimator + `/track` order tracking, SSR/SSG, hooks, state libs, API integration |
| `services/react-portal/` | Vite + React + Redux + React Router + Flux | 5173 | Unit II React | Customer portal: machine catalogue, quote cart, login, my enquiries |
| `services/php-estimator/` | Plain PHP 8.2 + MySQL (PDO) | 8000 (`php -S`) | Unit I PHP | Laser-cutting cost estimator + drawing upload + enquiry form |
| `services/laravel-admin/` | Laravel (latest supporting PHP 8.2) | 8001 (`artisan serve`) | Unit I Laravel | Admin back office: enquiries, machines, rate card, work orders |
| `services/servlet-jsp/` | Java Servlets + JSP on XAMPP Tomcat 8.5 (javax.servlet) | 8080 | Unit III | Order tracking + staff job-status desk (MVC, sessions, cookies, URL rewriting, JDBC) |
| `services/spring-api/` | Spring Boot 3 (Java 21), Maven wrapper | 8081 | Unit IV | Main REST API: catalogue, estimates, work orders, auth (JWT), JPA MySQL + MongoDB |
| `services/node-api/` | Node 24 + Express | 4000 | Unit VI | Enquiry + drawing-upload API, file-system logging, static resources |
| `services/db/` | MySQL (XAMPP MariaDB 10.4) | 3306 | all | `schema.sql`, `seed.sql`, `generate-seed.ts` |

Other infra: MongoDB in Docker on 27017 (`docker run -d --name pslaser-mongo -p 27017:27017 mongo:7`), used by Spring Boot (NoSQL topic) and optionally Node.

## Database

- Host `localhost:3306`, database `pslaser`, user `root`, empty password (XAMPP default — dev only). Every service reads `DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD` env vars with those defaults.
- Start MySQL: `C:\xampp\mysql_start.bat` (or XAMPP control panel).
- Reset: `mysql -uroot < services/db/schema.sql && mysql -uroot pslaser < services/db/seed.sql`.
- Tables: `users` (Laravel-compatible, bcrypt `$2y$`), `machines`, `services`, `materials`, `rates` (SAMPLE prices, `is_sample=1`), `settings`, `enquiries`, `uploads`, `quotes`, `work_orders`, `work_order_events`. Framework-owned tables (Laravel sessions/cache/jobs, etc.) may be added with their own migrations — never alter or drop the shared tables above from a framework migration.
- Seed admin login: see `services/db/SEED_CREDENTIALS.md` (test values only).

## Auth

- JWT HS256, secret from env `JWT_SECRET` (dev default `pslaser-dev-secret-change-me-0123456789abcdef`, ≥32 bytes). Claims: `sub` = user id, `email`, `role` (`admin|staff|customer`), `exp` 8 h.
- Spring Boot issues tokens (`POST /api/auth/login`). Node verifies the same tokens for admin routes.
- Header: `Authorization: Bearer <token>`.

## Price estimate formula (identical in PHP, Spring, JSP, Next)

Inputs: `materialCode, thicknessMm, lengthMm, widthMm, cutLengthMm, pierces, bends, powderCoat (bool), quantity`.

1. Validate: material exists; `0 < thicknessMm ≤ materials.max_thickness_mm`; `quantity ≥ 1`; dims > 0, ≤ 3000 × 1500 (laser bed).
2. Rate row = `rates` where `material_code = code AND thickness BETWEEN thickness_from_mm AND thickness_to_mm`.
3. `areaM2 = lengthMm × widthMm / 1e6`
4. `weightKg = areaM2 × thicknessMm × density_g_cm3`
5. `material = weightKg × material_rate_per_kg`
6. `cutting = (cutLengthMm / 1000) × cut_rate_per_m`
7. `piercing = pierces × pierce_rate`
8. `bending = bends × settings.bend_rate_inr`
9. `coating = powderCoat ? areaM2 × 2 × settings.powder_coat_rate_per_sqm : 0`
10. `perPart = material + cutting + piercing + bending + coating` (round 2 dp)
11. `subtotal = perPart × quantity`; `gst = subtotal × settings.gst_percent / 100`; `total = subtotal + gst` (round 2 dp)
12. Response always includes `isSample: true` while `settings.rates_are_sample = '1'`, and every UI shows "Indicative estimate — final quote on WhatsApp".

Estimate response JSON: `{ "materialCode", "thicknessMm", "quantity", "breakdown": { "material", "cutting", "piercing", "bending", "coating" }, "perPart", "subtotal", "gst", "total", "currency": "INR", "isSample": true }`.

## Spring Boot REST API (base `http://localhost:8081`)

Public:
- `POST /api/auth/login` `{email,password}` → `{token, user:{id,name,email,role}}`
- `POST /api/auth/register` `{name,email,phone,password}` → customer user + token
- `GET /api/machines`, `GET /api/machines/{slug}`
- `GET /api/services`, `GET /api/materials`
- `POST /api/quotes/estimate` (body = estimate inputs) → estimate JSON (not saved)
- `POST /api/quotes` (estimate inputs + `customerName`, `customerPhone`) → saved quote with `quoteNo`
- `GET /api/work-orders/track?orderNo=...&phone=...` → order + events (phone must match)
Authenticated (JWT):
- `GET /api/me`, `GET /api/me/quotes` (customer's quotes by phone/email)
- Admin/staff: `GET/POST/PUT /api/admin/work-orders`, `POST /api/admin/work-orders/{id}/events`, `GET /api/admin/enquiries`, `GET /api/admin/activity` (MongoDB)
Ops: `/actuator/health`, `/actuator/info`, `/actuator/metrics`.
Errors: `{ "status", "error", "message", "fieldErrors"?: {field: msg} }`.

## Node/Express API (base `http://localhost:4000`)

- `GET /api/health` → `{ok:true, db:true|false}`
- `POST /api/enquiries` JSON `{name, phone, email?, serviceSlug?, machineSlug?, message, source?}` or `multipart/form-data` with optional `drawing` file (dxf, dwg, pdf, png, jpg; ≤ 10 MB) → `201 {id, whatsappUrl}`
- `GET /api/enquiries` (JWT admin/staff), `PATCH /api/enquiries/:id` `{status}` (JWT admin/staff)
- `GET /api/catalogue` → machines + services from MySQL
- Static: `GET /` serves `services/node-api/public/` (API docs page).

## CORS

All APIs allow origins `http://localhost:3001`, `http://localhost:5173`, `http://localhost:8000`, `http://localhost:8001`, `http://localhost:8080`.

## WhatsApp

`https://wa.me/917719976990?text=<urlencoded>` — every "Get Quote" stays WhatsApp-first; APIs additionally store the enquiry.

## Syllabus mapping

Each part writes `docs/syllabus/unit-<n>-<name>.md`: a table of EVERY topic listed for its unit in the CS3111 syllabus → file path(s) and line ranges / short explanation of where it is demonstrated, plus how to run and test it. `docs/SYLLABUS-MAPPING.md` (root index) links them.
