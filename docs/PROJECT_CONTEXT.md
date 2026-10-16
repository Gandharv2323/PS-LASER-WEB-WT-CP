# Project context (read this first)

Written 16 Oct 2026 by the session that built the project. This folder, `D:\WT CP PS LASER`, is the
**canonical home** of the project. It was copied from
`C:\Users\shind\OneDrive\Dokumen\Claude-Pro\kakadelaser-clone` (the "old C: copy").

## What this project is
- **PS Laser** website (the user owns the business): sheet-metal / CNC laser job shop at Velu, Bhor, Pune.
  Brand is "PS Laser". The folder/repo names containing "kakadelaser" are historical (the first step was
  cloning kakadelaser.in's *design*). **Never** show Kakade Laser content, and never show the text
  "(Unit of P S Enterprises)" anywhere.
- It is **also a college project** for CS3111 Web Technologies: every syllabus unit is a real feature.
  Mapping: `docs/SYLLABUS-MAPPING.md` and `docs/syllabus/unit-*.md`.
- Full operating manual (architecture, ports, QA results, troubleshooting):
  `docs/handbook/WEBSITE_USER_HANDBOOK.md` and `docs/handbook/index.html`.
- Cross-service rules (DB, JWT, price formula, API shapes): `services/CONTRACT.md`.
- Business facts and image inventory: `docs/research/pslaser/brief.md`; shared content: `src/lib/pslaser/data.ts`.

## Services and ports
| Service | Folder | Port | Start (see "Starting things" for pitfalls) |
|---|---|---|---|
| MySQL/MariaDB (XAMPP, db `pslaser`) | `C:\xampp\mysql` | 3306 | `C:\xampp\mysql_start.bat` |
| Next.js website (8 classic pages, /quote, /track, /dashboard; also /modern, /advanced) | project root | 3001 | `npm run dev -- -p 3001` |
| Spring Boot API (Unit IV) | `services/spring-api` | 8081 | `mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev,mongo-embedded` |
| Node/Express API (Unit VI) | `services/node-api` | 4000 | `npm start` |
| React portal (Unit II) | `services/react-portal` | 5173 | `npm run dev` |
| PHP estimator (Unit I) | `services/php-estimator` | 8000 | `C:\xampp\php\php.exe -S localhost:8000 -t services/php-estimator/public` |
| Laravel admin (Unit I) | `services/laravel-admin` | 8001 | `C:\xampp\php\php.exe artisan serve --port=8001` |
| Tomcat Servlet/JSP (Unit III) | `C:\xampp\tomcat` (WAR `pslaser`) | 8080 | `C:\xampp\tomcat\bin\startup.bat` (needs JAVA_HOME) |
| MongoDB (Spring activity log only) | embedded in Spring, or Docker `pslaser-mongo` | 27017 | embedded profile `mongo-embedded` |

Port 3000 belongs to another project (`gandharv-portfolio`) — that is why this site uses 3001.

## IMPORTANT right now: two copies exist
- On 16 Oct the old C: copy was **still running** the servers (ports 3001, 8081, 4000, 8001, 8080, 5173, 8000).
  Starting the same service from `D:` will hit "port in use" until the old process is stopped.
- Before starting anything, run `netstat -ano | findstr LISTENING | findstr ":3001 :4000 :5173 :8000 :8001 :8080 :8081"`.
  If a port is taken by a node/java/php process whose command line points into `C:\...\kakadelaser-clone`,
  it is the old copy. **Ask the user** before stopping it (they may want to compare first), and **do not
  delete the old C: folder** until the user explicitly says so — that question was left open.
- MySQL, Tomcat, PHP binaries live in `C:\xampp` and are shared by both copies (they are not moved).
- Tomcat serves the WAR from `C:\xampp\tomcat\webapps\pslaser*` (built from `services/servlet-jsp`);
  it does not read from either project folder at runtime.

## Starting things (known pitfalls on this PC)
- Shell is Git Bash/PowerShell on Windows 11. `cmd //c mvnw.cmd` from Git Bash failed ("not recognized")
  when the working directory was wrong. Do: `cd services/spring-api` then `./mvnw spring-boot:run …`
  (Git Bash) or `.\mvnw.cmd spring-boot:run …` (PowerShell). Set
  `JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.12.8-hotspot`.
- Start order: MySQL → Spring → Node → website → the rest. MySQL must be started by hand
  (`C:\xampp\mysql_start.bat` or `cd C:\xampp\mysql && ./bin/mysqld.exe --defaults-file=./bin/my.ini --standalone`).
- **Docker Desktop is unreliable/stopped** on this PC. Use the embedded Mongo profile (`dev,mongo-embedded`).
- **`.next` was not copied** to D:. After copying, run `npx next typegen` once (creates the generated
  `PageProps` types) before `npm run typecheck`; `npm run dev` rebuilds the cache on first start.
- Use `127.0.0.1` vs `localhost` carefully: some dev servers listen on IPv6 only (`::1`).
- Long-running servers must be started as background tasks; stopping `npm` can leave an orphan `node` process.
- Do not run commands that restart MySQL or kill processes without telling the user first.

## Database and credentials
- DB `pslaser` on `localhost:3306`, user `root`, empty password (XAMPP dev default). Always use
  `--default-character-set=utf8mb4` with the mysql client (a past import without it garbled "–" and "·").
- Reset: `services/db/schema.sql` then `services/db/seed.sql` (**drops and recreates** the database).
- Local admin login (admin e-mail + password) is in `services/db/SEED_CREDENTIALS.md`. Never print or
  copy the password into docs, chat summaries or commits. `JWT_SECRET` has a dev default — change for production.
- Estimator rates are **SAMPLE** (`rates.is_sample = 1`); every estimate is labelled "Indicative".
  Reference check (must be identical on PHP, Java, Spring, Next): MS 2 mm, 500×300, cut 1600 mm, 4 pierces,
  2 bends, powder coat, qty 10 → per part 248.63, subtotal 2486.30, GST 447.53, **total ₹2,933.83**.

## Decisions already made by the user (do not re-litigate)
- Design = the classic Kakade-style Bootstrap look, recoloured **orange #EF7D00**, content = PS Laser only.
  `/modern` and `/advanced` are alternates kept for comparison.
- Only PS Laser's real machines are shown (2 fiber lasers, 175 T press brake, Amada 32 T and 16 T turret
  punches, 1.5 kW laser welder, powder-coating plant). No waterjet, wirecut, EDM, router etc.
- Every "Get Quote" goes to WhatsApp +91 77199 76990 with a machine/service-specific message.
- Syllabus lab practicals (electricity bill, book store…) are intentionally NOT part of the project.
- No fake testimonials, clients, certifications, dates, or reviews.

## Verified vs not verified (from the 14 Oct QA run — see handbook §13)
Verified PASS: all 8 services up; 12 site pages 200; same estimate on Spring/Next/PHP/Java; logins; JWT shared
by Spring↔Node; Laravel's 7 admin screens. NOT yet tested: responsive visual pass (375/768/1440),
every image on every page, React-portal → Node enquiry end-to-end, live STOMP push to /dashboard, `.exe` upload re-test.
Known problems: C: drive nearly full (this is why the project moved to D:); Docker engine down.

## Guardrails
- Inspect before changing; small reversible edits; no destructive actions (deleting the C: copy, dropping the
  database, killing processes) without the user's explicit OK.
- Keep secrets out of files. Reuse existing conventions (`services/CONTRACT.md`, route group layout:
  `src/app/(classic)` = main site, `(site)` = /modern, `(legacy)` = /advanced).
- Tell the user honestly what was tested and what was not.
