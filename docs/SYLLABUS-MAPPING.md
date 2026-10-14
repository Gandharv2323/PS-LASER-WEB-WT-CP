# CS3111 Web Technologies — PS Laser project: syllabus mapping

One real business project (PS Laser, a sheet-metal / laser-cutting job shop) covers all six
units of the CS3111 syllabus. Each unit is a working feature that shares one MySQL database
(`pslaser`) and one set of contracts ([services/CONTRACT.md](../services/CONTRACT.md)).

| Unit | Topic | Where it lives | Port | Feature | Topic-by-topic mapping |
|---|---|---|---|---|---|
| I | PHP | `services/php-estimator/` | 8000 | Laser-cutting cost estimator, drawing upload, enquiry form | [unit-1-php.md](syllabus/unit-1-php.md) |
| I | Laravel | `services/laravel-admin/` | 8001 | Admin back office (enquiries, machines, rate card, work orders) | [unit-1-laravel.md](syllabus/unit-1-laravel.md) |
| II | React, Router, Flux, Redux | `services/react-portal/` | 5173 | Customer portal: catalogue, quote cart, login, tracking | [unit-2-react.md](syllabus/unit-2-react.md) |
| III | Servlet + JSP | `services/servlet-jsp/` | 8080 (`/pslaser`) | Order tracking and staff job-status desk | [unit-3-servlet-jsp.md](syllabus/unit-3-servlet-jsp.md) |
| IV | Spring Boot | `services/spring-api/` | 8081 | Main REST API: JWT security, JPA, MongoDB, events/WebSocket | [unit-4-spring-boot.md](syllabus/unit-4-spring-boot.md) |
| V | Advanced React | `src/` (Next.js, TypeScript) | 3001 | `/quote`, `/track`, `/dashboard` on the main website | [unit-5-advanced-react.md](syllabus/unit-5-advanced-react.md) |
| VI | Node.js + Express | `services/node-api/` | 4000 | Enquiry + drawing-upload API, file logging, static docs | [unit-6-node.md](syllabus/unit-6-node.md) |

The public website itself (classic multi-page design, 8 pages) is the Next.js app in `src/`.

## How the parts connect

```
Browser ─► Next.js site :3001 ──► Spring Boot API :8081 ──► MySQL pslaser  (+ MongoDB activity log)
        ─► React portal :5173 ──► Spring :8081 / Node API :4000
        ─► PHP estimator :8000 ─► MySQL
        ─► Laravel admin :8001 ─► MySQL
        ─► Servlet/JSP  :8080 ─► MySQL
```

All estimators (PHP, Java servlet, Spring, TypeScript) use the same formula and rounding rule,
so the reference case below gives the same total everywhere:

> MS 2 mm, 500 × 300 mm, cut length 1600 mm, 4 pierces, 2 bends, powder coat, qty 10
> → per part ₹248.63, subtotal ₹2,486.30, GST ₹447.53, **total ₹2,933.83**
> (SAMPLE rate card — real prices are set by the owner in the Laravel admin).

## Run everything (Windows)

1. MySQL: `C:\xampp\mysql_start.bat` (or XAMPP control panel). Load data once:
   `mysql -uroot --default-character-set=utf8mb4 < services/db/schema.sql` then
   `mysql -uroot --default-character-set=utf8mb4 pslaser < services/db/seed.sql`.
2. Each service has its own README with the exact start command (PHP: `php -S`, Laravel:
   `php artisan serve --port=8001`, Tomcat: `C:\xampp\tomcat\bin\startup.bat`,
   Spring: `mvnw.cmd spring-boot:run`, Node: `npm start`, React portal: `npm run dev`,
   Next.js: `npm run dev -- -p 3001`).
3. Admin login for all back offices: see `services/db/SEED_CREDENTIALS.md` (local test values).

## Honest notes for the viva / owner

- The rate card is **sample data** (`rates.is_sample = 1`); estimates are labelled "Indicative".
- The lab practicals list of the syllabus (electricity bill, book store, etc.) is not part of
  this project by design; only the unit topics are covered.
- MongoDB runs in Docker (`pslaser-mongo`) or falls back to an embedded instance.
