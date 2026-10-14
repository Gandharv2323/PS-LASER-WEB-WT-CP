# Website Operations & User Handbook

**Project:** PS Laser website + full-stack syllabus project (CS3111 Web Technologies)
**Handbook version:** 1.0 · written on 14 Oct 2026 from the real repository and a live test run
**Where it lives:** `kakadelaser-clone/` (folder name is historical — the site is **PS Laser**, not Kakade Laser)

> **How to read this book.** Part A is for *using* the website (no coding). Part B is for
> *running and fixing* the project on your PC. Part C is learning and reference.
> Every statement is tagged where it matters: **[verified]** = I ran it on 14 Oct 2026,
> **[from code]** = read in the source but not executed by me, **[agent-tested]** = reported by
> the build agents, not re-run by me.

---

## Contents

1. [Project overview](#1-project-overview)
2. [System architecture](#2-system-architecture)
3. [Local environment and prerequisites](#3-local-environment-and-prerequisites)
4. [Service and port reference](#4-service-and-port-reference)
5. [Quick start](#5-quick-start)
6. [How to access and use the website](#6-how-to-access-and-use-the-website)
7. [Feature-by-feature tutorials](#7-feature-by-feature-tutorials)
8. [Real-world use cases](#8-real-world-use-cases)
9. [Admin panel guide](#9-admin-panel-guide)
10. [API and database overview](#10-api-and-database-overview)
11. [Startup, shutdown and restart](#11-startup-shutdown-and-restart)
12. [Troubleshooting](#12-troubleshooting)
13. [QA checklist and results](#13-qa-checklist-and-results)
14. [Learning roadmap](#14-learning-roadmap)
15. [Glossary and useful commands](#15-glossary-and-useful-commands)
16. [Known limitations and future improvements](#16-known-limitations-and-future-improvements)

---

## 1. Project overview

### What it is
Two things in one repository:

1. **The PS Laser business website** — a multi-page, mobile-friendly website for *PS Laser*,
   a sheet-metal and CNC laser-cutting job shop at Velu, Bhor, Pune. Customers can see the
   machines and services, get an indicative price estimate, track an order and send a quote
   request on WhatsApp (+91 77199 76990).
2. **A full-stack college project** — the same business is implemented with every technology in
   the CS3111 *Web Technologies* syllabus (PHP, Laravel, React/Redux, Servlet/JSP, Spring Boot,
   Advanced React, Node/Express). Each technology is a small real feature, not a toy demo.

### Who it is for
| Person | What they do here |
|---|---|
| **Customer** | Browses services, estimates a price, tracks an order, sends enquiries / WhatsApp |
| **PS Laser staff / owner** | Manages enquiries, machines, rate card, work orders in admin screens |
| **You (student/developer)** | Runs and explains each technology for the viva; extends the project |

### The business facts the site is built on
Seven machines/facilities, all from the company profile PDF: HSG 3 kW fiber laser,
Genesis 1.5 kW fiber laser, 175 T CNC press brake, Amada 32 T turret punch, Amada 16 T turret punch,
HSG 1.5 kW handheld laser welder, PLC powder-coating plant. Cutting capacity: mild steel 16 mm,
stainless 12 mm, aluminium 8 mm, brass 4 mm, copper 4 mm. Source details: `docs/research/pslaser/brief.md`.

### What is real and what is sample
| Item | Status |
|---|---|
| Machines, services, specs, address, phone numbers | Real (from the PDF / signboard) |
| Price rates in the estimator | **SAMPLE** placeholder numbers (`rates.is_sample = 1`). Every estimate says "Indicative". |
| Product and gallery pictures | Representative renders from the old site, **not** photos of finished PS Laser jobs |
| Machine pictures | Manufacturer catalogue images, labelled as such |
| Blog articles, pattern designs | Original writing / original SVG drawings made for this project |
| Orders `PSL-DEMO-001`, `PSL-DEMO-002`, "Demo …" enquiries | Fake demo data for testing |

---

## 2. System architecture

### Diagram

```
                           ┌───────────────────────────── BROWSER ─────────────────────────────┐
                           │  customer / staff / you                                           │
                           └───┬──────────┬──────────┬───────────┬───────────┬───────────┬─────┘
                               │          │          │           │           │           │
                         :3001 │    :5173 │    :8000 │     :8001 │     :8080 │           │
                  ┌────────────▼─┐ ┌──────▼──────┐ ┌─▼────────┐ ┌▼─────────┐ ┌▼─────────┐ │
                  │ Next.js site │ │ React portal│ │ PHP      │ │ Laravel  │ │ Servlet/ │ │
                  │ 8 pages +    │ │ (Vite,      │ │ estimator│ │ admin    │ │ JSP desk │ │
                  │ /quote       │ │ Redux)      │ │ + upload │ │ panel    │ │ (Tomcat) │ │
                  │ /track       │ └───┬─────┬───┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ │
                  │ /dashboard   │     │     │          │            │            │       │
                  └──┬───────┬───┘     │     │          │            │            │       │
        /api/estimate│       │         │     │          │            │            │       │
        /api/auth    │       │ enquiry │     │ enquiry  │            │            │       │
        /api/work-…  │       │ (Node)  │     │          │            │            │       │
                  :8081      │         │     │          │            │            │       │
                  ┌──▼───────▼─────────▼─┐ ┌─▼──────────▼┐           │            │       │
                  │ Spring Boot REST API │ │ Node/Express │           │            │       │
                  │ JWT · JPA · events   │ │ enquiry +    │ :4000     │            │       │
                  │ :8081                │ │ drawing      │           │            │       │
                  └───┬──────────┬───────┘ │ upload       │           │            │       │
                      │          │         └──────┬───────┘           │            │       │
                      │ activity │ SQL            │ SQL               │ SQL        │ SQL   │ (PHP/Laravel/JSP
                      │ log      │                │                   │            │       │  also read & write
                ┌─────▼────┐  ┌──▼────────────────▼───────────────────▼────────────▼──┐    │  MySQL directly)
                │ MongoDB  │  │  MySQL / MariaDB 10.4  ·  database `pslaser`  :3306    │◄───┘
                │ :27017   │  │  users · machines · services · materials · rates ·     │
                │ (activity│  │  settings · enquiries · uploads · quotes ·             │
                │  log)    │  │  work_orders · work_order_events                       │
                └──────────┘  └────────────────────────────────────────────────────────┘
                 WhatsApp: every "Get Quote" opens https://wa.me/917719976990?text=…  (no server needed)
```

*(The HTML version of this handbook shows the same diagram as a picture.)*

### What each component is for
| Component | Purpose | Depends on |
|---|---|---|
| **Next.js site** (`src/`) | The public website: 8 classic pages, plus `/quote`, `/track`, `/dashboard` (Advanced React). Also two old/alternate designs at `/modern` and `/advanced`. | Spring API (optional – it has an offline fallback), Node API for enquiries |
| **React portal** (`services/react-portal`) | Customer portal: machines, estimate, cart, login, my quotes, track order. Shows "Offline demo data" if the API is down. | Spring (:8081), Node (:4000) |
| **PHP estimator** (`services/php-estimator`) | Stand-alone estimator form, drawing upload and enquiry form in plain PHP. | MySQL |
| **Laravel admin** (`services/laravel-admin`) | Back office for staff: enquiries, machines, services, rate card, work orders, quotes. | MySQL |
| **Servlet/JSP desk** (`services/servlet-jsp`) | Customer order tracking + staff job-status desk in Java. | MySQL |
| **Spring Boot API** (`services/spring-api`) | The main REST API: catalogue, estimate, quotes, tracking, login (JWT), admin endpoints. | MySQL, MongoDB (optional) |
| **Node API** (`services/node-api`) | Receives enquiries and drawing uploads; also lists/updates them for staff. | MySQL |
| **MySQL** | The single shared database for everything. | — |
| **MongoDB** | Spring's activity log only (logins, estimates, status changes). Optional. | — |

### Which services must run together
| You want to… | Start at least |
|---|---|
| Just look at the website | Next.js (3001) — works alone, with offline fallbacks |
| Live estimate + tracking on the website | MySQL + Spring (8081) + Next.js (3001) |
| Enquiry saved in the database | + Node (4000) |
| Staff dashboard on the website | MySQL + Spring + Next.js |
| React portal | MySQL + Spring + Node + portal (5173) |
| Admin panel | MySQL + Laravel (8001) |
| Java order desk | MySQL + Tomcat (8080) |
| PHP estimator | MySQL + PHP (8000) |

### Data flow for the key actions
1. **Estimate on `/quote`** → browser → Next.js route `/api/estimate` → Spring `POST /api/quotes/estimate`
   → Spring reads `materials`, `rates`, `settings` from MySQL → returns breakdown → page shows it.
   If Spring is down, the page computes the same formula in TypeScript and shows "Offline estimate (sample)".
2. **Track an order** → `/track?orderNo=…&phone=…` (server-rendered) → Spring `GET /api/work-orders/track`
   → MySQL `work_orders` + `work_order_events` → timeline.
3. **Staff changes a status** (Laravel, JSP or Spring admin) → row in `work_orders` updated + a row in
   `work_order_events` → the customer sees it on next lookup; Spring also pushes a live message on
   `/topic/work-orders` that the `/dashboard` board listens to.
4. **Enquiry** → Next/React form → Node `POST /api/enquiries` (optionally with a drawing file) → rows in
   `enquiries` + `uploads` → reply contains a WhatsApp link with the message pre-filled.
5. **Admin login** → Spring `POST /api/auth/login` returns a **JWT**; Node accepts the same token because
   both share one secret. Laravel and JSP have their own session login against the same `users` table.

---

## 3. Local environment and prerequisites

### What is installed on this PC (checked 14 Oct 2026)
| Tool | Version | Used for |
|---|---|---|
| Windows 11 | 10.0.26300 | — |
| Node.js / npm | 24.12.0 / 11.10.1 | Next.js, React portal, Node API |
| Java (Eclipse Adoptium) | OpenJDK 21.0.12 | Spring Boot, Tomcat |
| XAMPP | PHP 8.2.12, MariaDB 10.4.32, Tomcat 8.5.96 | PHP, MySQL, Servlet/JSP |
| Composer | 2.10.3 (kept in a temp folder, not on PATH) | Laravel dependencies |
| Maven | via `mvnw.cmd` wrapper inside `services/spring-api` | Spring build |
| Docker Desktop | 29.6.1 — **engine currently stopped** | Optional (MongoDB container) |
| Git | 2.52 | — |

### Disk space — read this first
`C:` is **100 % full with ~330 MB free** (14 Oct 2026). Biggest project folders:
`.next` 790 MB, `node_modules` 608 MB, `services/laravel-admin/vendor` 84 MB,
`services/react-portal/node_modules` 79 MB, `services/spring-api/target` 74 MB, `~/.m2` 129 MB.
Free some space before installing or building anything. See [Troubleshooting](#12-troubleshooting).

### Configuration and secrets (where they live — values are NOT in this book)
| What | Where |
|---|---|
| Admin login (email + password, local test values) | `services/db/SEED_CREDENTIALS.md` |
| Database host/port/name/user/password | Environment variables `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`. Defaults: `localhost`, `3306`, `pslaser`, `root`, *(empty)* |
| JWT secret (Spring + Node) | Environment variable `JWT_SECRET` (a development default exists in code — **change before any real deployment**) |
| Laravel settings | `services/laravel-admin/.env` (example: `.env.example`) |
| Node settings | `services/node-api/.env.example` (copy to `.env` if you want to override) |
| React portal API addresses | `services/react-portal/.env.example` |
| Spring settings | `services/spring-api/src/main/resources/application*.yml` |

---

## 4. Service and port reference

| # | Service | URL | Folder | Start command (run from the folder shown) | Health check |
|---|---|---|---|---|---|
| 1 | **MySQL / MariaDB** | `localhost:3306` | `C:\xampp\mysql` | `C:\xampp\mysql_start.bat` | `C:\xampp\mysql\bin\mysql.exe -uroot -e "SELECT 1"` |
| 2 | **Next.js website** | http://localhost:3001 | project root | `npm run dev -- -p 3001` | open `/` → 200 |
| 3 | **PHP estimator** | http://localhost:8000 | project root | `C:\xampp\php\php.exe -S localhost:8000 -t services/php-estimator/public` | `/` → 200 |
| 4 | **Laravel admin** | http://localhost:8001 | `services/laravel-admin` | `php artisan serve --port=8001` | `/login` → 200 |
| 5 | **Tomcat (Servlet/JSP)** | http://localhost:8080/pslaser/ | `C:\xampp\tomcat` | `C:\xampp\tomcat\bin\startup.bat` | `/pslaser/hello` → 200 |
| 6 | **Spring Boot API** | http://localhost:8081 | `services/spring-api` | `mvnw.cmd spring-boot:run` (add `-Dspring-boot.run.profiles=dev,mongo-embedded` if Docker is off) | `/actuator/health` → `{"status":"UP"}` |
| 7 | **Node API** | http://localhost:4000 | `services/node-api` | `npm start` | `/api/health` → `{"ok":true,"db":true}` |
| 8 | **React portal** | http://localhost:5173 | `services/react-portal` | `npm run dev` | `/` → 200 |
| 9 | MongoDB | `localhost:27017` | Docker or embedded | `docker run -d --name pslaser-mongo -p 27017:27017 mongo:7` | Spring `/actuator/health` shows `mongo` UP |
| 10 | Node raw-http demo (optional) | http://localhost:4001 | `services/node-api` | `npm run start:raw` | `/health` |

**Status on 14 Oct 2026 [verified]:** rows 1–8 and 9 (embedded) were up. Row 10 was not running (optional).
Port 3000 is used by the separate `portfolio` project — that is why this site uses 3001.

> **`localhost` vs `127.0.0.1`.** Windows can resolve `localhost` to IPv6 (`::1`). The PHP server and
> React dev server listen on `::1`/`127.0.0.1` only in some cases. If one address fails, try the other.
> The React portal intentionally calls the APIs on `127.0.0.1`.

---

## 5. Quick start

**Goal:** get the whole project running from a cold PC.

1. **Free disk space** (≥ 2 GB recommended) — see Troubleshooting §12.1.
2. **Start MySQL**: double-click `C:\xampp\mysql_start.bat` (or use XAMPP Control Panel → MySQL → Start).
   Check: `C:\xampp\mysql\bin\mysql.exe -uroot -e "SELECT COUNT(*) FROM pslaser.machines;"` → `7`.
   *First time only:* load the data —
   `C:\xampp\mysql\bin\mysql.exe -uroot --default-character-set=utf8mb4 < services\db\schema.sql` then
   `C:\xampp\mysql\bin\mysql.exe -uroot --default-character-set=utf8mb4 pslaser < services\db\seed.sql`
   (**this erases and recreates the `pslaser` database**).
3. **Spring API** (the main backend): in a terminal
   `cd services\spring-api` → `mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev,mongo-embedded`
   (wait for "Started …Application"; first run downloads dependencies and ~100 MB of embedded MongoDB).
4. **Node API**: new terminal → `cd services\node-api` → `npm start`.
5. **Website**: new terminal → project root → `npm run dev -- -p 3001` → open http://localhost:3001.
6. Optional extras: PHP (row 3), Laravel (row 4), Tomcat (row 5), React portal (row 8).

**Success check:** `http://localhost:3001/quote` → choose Mild Steel, 2 mm, press *Calculate*; the badge should say
**"Live materials (Spring API)"**. If it says "Offline estimate (sample)", Spring is not reachable.

---

## 6. How to access and use the website

### Page map of the main site (all verified 200 on 14 Oct 2026)
| Page | URL | What it is |
|---|---|---|
| Home | `/` | Hero, services, machines, equipment brands, gallery preview, contacts |
| About Us | `/about-us` | Who we are, mission, vision, values |
| Engineering | `/engineering-services` | One section per service (laser cutting, bending, punching, welding, fabrication, powder coating, design/CAM) |
| Architectural | `/architectural-services` | Jaali panels, grills, decorative work |
| Gallery | `/gallery` | Filterable image grid with a lightbox |
| Pattern Design | `/pattern-design` | 18 original jaali patterns (PS-G01 … PS-L06) with WhatsApp enquiry |
| Blog | `/blogs` | 3 technical guides, each at `/blogs/<slug>` |
| Contact Us | `/contact-us` | Map, address, 4 phone contacts, email, enquiry form |
| **Instant Estimate** | `/quote` | Price estimator (Unit V) |
| **Track Order** | `/track` | Order tracking (Unit V) |
| **Staff Dashboard** | `/dashboard` | Live work-order board, login required |
| Alternate designs | `/modern`, `/advanced` | Other visual designs of the same content |

The menu at the top is the same on every page; the current page is highlighted. On a phone, tap the
☰ icon. The green WhatsApp button (bottom right) is on every page.

---

## 7. Feature-by-feature tutorials

Each tutorial follows: **Where → What it does → What you need → Steps → Expected result → If it fails.**

### 7.1 WhatsApp "Get Quote" (every page)
- **Where:** header button *Get Quote*, every machine/service card, the floating green button, each pattern/product card.
- **What it does:** opens WhatsApp (app or web) to **+91 77199 76990** with a message already typed, specific to that machine/service
  (for example the press-brake button writes *"…quote for CNC bending on your 175 Ton x 3m press brake. Material: ___, Thickness: ___ mm…"*).
- **Steps:** click the button → WhatsApp opens in a new tab → fill the blanks (`___`) → send.
- **Expected:** a WhatsApp chat with the message ready. No data is stored on the server for this path.
- **If it fails:** pop-up blocker (allow pop-ups for the site); no WhatsApp on the PC (use WhatsApp Web, you will be asked to log in).

### 7.2 Instant estimate — Next.js `/quote` (Unit V)
- **Where:** menu → *Estimate* (or http://localhost:3001/quote).
- **What you need:** material, thickness (mm), sheet length and width (mm), total cut length (mm), number of pierces (start points),
  number of bends, powder coat yes/no, quantity.
- **Steps:** fill the form → read the breakdown (material, cutting, piercing, bending, coating → per part → subtotal → GST → total).
  Use *Breakdown* for the pop-up, *Compare materials* to see the chart (loads only when clicked), *Save estimate* to keep it in this browser
  (it then appears on `/track`), *Send on WhatsApp* to quote the numbers.
- **Expected for the reference case** (MS, 2 mm, 500 × 300, cut 1600 mm, 4 pierces, 2 bends, powder coat, qty 10):
  per part **₹248.63**, subtotal **₹2,486.30**, GST **₹447.53**, total **₹2,933.83** [verified on Spring, Next, PHP, JSP].
- **Rules the form enforces:** thickness must not exceed the material maximum (MS 16, SS 12, AL 8, BR 4, CU 4 mm);
  size must fit the 3000 × 1500 mm laser bed; thickness values that fall in a gap between rate bands (e.g. 3.005 mm) are rejected
  with "No rate band for this thickness".
- **If it fails:** badge "Offline estimate" → start Spring (§11). Error under a field → fix that value.

### 7.3 Instant estimate — PHP version (Unit I)
- **Where:** http://localhost:8000 → pages: **Estimator** (`/`), **Enquiry** (`/enquiry.php`), **Stats** (`/stats.php`), **How it works** (`/learn-php.php`).
- **Steps:** same fields as above (units can be mm or inches) → *Calculate*. Then *Save quote* (asks for name + Indian mobile number, creates
  a number like `PSL-Q-20261014-0001`) or *Download* the estimate as `.txt` / `.csv`.
- **Expected:** `₹ 2,933.83` for the reference case [verified]. A form posted without its hidden security token is bounced back (303) [verified].
- **Extras:** your last inputs are remembered for 30 days in cookies (button *Clear preferences* removes them); recent estimates show in the session.
- **If it fails:** blank page/503 → MySQL is not running.

### 7.4 Enquiry with drawing upload — PHP and Node
- **Where:** PHP: `/enquiry.php`. Node API: `POST http://localhost:4000/api/enquiries` (used by the Next.js and React forms).
- **What you need:** name, mobile number, optional e-mail, service, message, optional drawing (`.dxf .dwg .pdf .png .jpg`, ≤ 10 MB).
- **Expected:** success message; a row in `enquiries` (and `uploads` if a file was sent). Node replies with `{id, whatsappUrl}`.
  Files are saved with random names in a private folder (not downloadable by URL).
- **If it fails:** "Unsupported drawing type" → use one of the allowed types (a renamed `.exe` is rejected by content check).

### 7.5 Track an order
- **Where:** Next.js `/track`, React portal `/track`, Java `http://localhost:8080/pslaser/track`.
- **What you need:** order number + the phone number given when the order was placed.
- **Try it:** order `PSL-DEMO-001`, phone `9000000001` → status **bending**, with 3 events (received → cutting → bending) [verified].
- **Expected:** a status timeline. A wrong phone number gives "not found" on purpose (it never reveals whether the order exists).
- **If it fails:** with Spring down, `/track` shows a built-in demo order marked as such.

### 7.6 Machines, gallery, patterns, blog (browse-only)
- **Machines:** home page and `/engineering-services` — each card shows specs and its own WhatsApp quote button.
- **Gallery:** `/gallery` → category buttons (All / Products / Machines / Facility / Quality) → click a picture for the large view;
  arrow keys move between pictures, `Esc` closes. Captions say *Representative work* where the image is not a real PS Laser job.
- **Patterns:** `/pattern-design` → filter Geometric / Floral-inspired / Linear → click to enlarge → *Enquire on WhatsApp* includes the pattern code.
- **Blog:** `/blogs` → open an article for the full guide.

### 7.7 Contact page
- **Where:** `/contact-us`. Shows the Google map for the PS Laser location (**Open in Maps**, **Get directions**), address, four named phone contacts (tap to call),
  e-mail, and an enquiry form.
- **Form behaviour:** validates name, phone and message, then **opens WhatsApp** with your text (labelled *Send via WhatsApp*). It does not
  store anything on a server.

### 7.8 React customer portal (Unit II) — http://localhost:5173
| Route | What it does |
|---|---|
| `/` | Dashboard with quick links |
| `/machines`, `/machines/:slug` | Catalogue and machine detail with WhatsApp quote |
| `/estimate` | Estimator form → breakdown → *Add to cart* |
| `/cart` | Quote cart (kept in the browser) → *Send all on WhatsApp* or *Submit enquiry* |
| `/login`, `/register` | Account (JWT from Spring) |
| `/my-quotes` | Your saved quotes (**login required**) |
| `/track` | Order tracking |

A yellow **"Offline demo data"** banner means the API was unreachable and sample data is shown. Submitting an enquiry
while Node is down tells you nothing was sent (it never pretends).

### 7.9 Java order desk (Unit III) — http://localhost:8080/pslaser/
Public: `/track`, `/estimate`, `/hello`, `/about`. Teaching demos: `/lifecycle`, `/concurrency`, `/session-demo`, `/basics.jsp`.
Staff (login): `/staff/orders` (list/filter), `/staff/orders/new`, `/staff/order?…` (update status). Without login you are redirected to `/login`.

---

## 8. Real-world use cases

> Cases marked *(hypothetical)* use invented customers/numbers only to illustrate.

### UC-1 — "How much will 100 brackets cost?" *(hypothetical inputs, real logic)*
- **Objective:** get an indicative price for 100 mild-steel brackets.
- **Prerequisites:** site running (§5); `/quote` open.
- **Steps:** Material **MS** · thickness **3 mm** · length **200** · width **150** · cut length **900** · pierces **6** · bends **2** · powder coat **yes** · qty **100** → Calculate → open *Breakdown*.
- **Expected:** a total with a GST line, and the banner "Indicative estimate — final quote on WhatsApp". (Numbers use the sample rate card.)
- **Common mistakes:** entering cut length as metres (it is **mm**); leaving pierces at 0; using a thickness above 16 mm for MS.

### UC-2 — Reproduce the reference estimate on all four stacks (good for the viva)
- **Objective:** prove four independent implementations agree.
- **Inputs:** MS, 2 mm, 500 × 300 mm, cut 1600 mm, 4 pierces, 2 bends, powder coat, qty 10.
- **Steps:** enter the same values at PHP (:8000), Next `/quote` (:3001), Java `/pslaser/estimate` (:8080), and `POST /api/quotes/estimate` (Spring :8081).
- **Expected:** **₹2,933.83** everywhere [verified]. Rounding rule: each cost line is rounded to 2 decimals, per-part = sum of rounded lines.

### UC-3 — Send a customer's drawing and get an enquiry number
- **Steps:** PHP `/enquiry.php` → name, 10-digit mobile (starts 6–9), service *Laser Cutting*, message, attach `part.dxf` → Submit.
- **Expected:** success page; in Laravel admin → *Enquiries* the new row appears with its upload info and a WhatsApp link (source shows `php`).
- **Common mistakes:** file > 10 MB; wrong type; phone with spaces/+91 in a field that wants 10 digits.

### UC-4 — Follow an order from received to dispatched
- **Steps:** Laravel admin → *Work orders* → open an order → add a status event (e.g. *welding*) → open Next `/track` with the order number and phone.
- **Expected:** the timeline shows the new status. (Use the demo order and set it back afterwards.)

### UC-5 — Change a price and see it everywhere
- **Steps:** Laravel admin → *Rate card* → edit a value → Save. Then run UC-1 again on `/quote`.
- **Expected:** new totals (Spring reads the table on each request; the website's materials list is cached up to one hour).
- **Common mistake:** forgetting the sample/real flag — set `rates_are_sample` to 0 only when the prices are really final.

### UC-6 — Staff watches orders live
- **Steps:** `/dashboard` → log in with the admin e-mail from `SEED_CREDENTIALS.md` → board shows both demo orders and a badge
  **"Live (STOMP /topic/work-orders)"**. Change a status in Laravel; the board updates (polling is the fallback).
- **Note:** end-to-end live push was observed connecting but not fully exercised by an automated test.

### UC-7 — Test the API with Postman
- **Steps:** import `services/spring-api/postman/PSLaser.postman_collection.json` and the `…localhost.postman_environment.json`;
  fill the empty `adminPassword` secret; run *Login* first (it stores the token), then the other requests.
- **Expected:** green test marks on all 32 requests.

---

## 9. Admin panel guide

There are **three** staff-facing places. They use the same user table and the same admin e-mail.

| Panel | URL | Technology | Best for |
|---|---|---|---|
| **Laravel admin** | http://localhost:8001/login | PHP / Laravel | Everything: enquiries, machines, services, rates, work orders, quotes |
| **Java staff desk** | http://localhost:8080/pslaser/login | Servlet/JSP | Order status updates |
| **Website dashboard** | http://localhost:3001/dashboard | Next.js | Live board of work orders |

### Logging in
E-mail and password are in `services/db/SEED_CREDENTIALS.md` (local test values; not repeated here).
Only roles **admin** and **staff** can enter; customers are refused. Laravel allows 5 failed attempts per minute.

### Laravel admin screens [verified: all return 200 after login]
| Menu | What you can do |
|---|---|
| **Dashboard** | Counts, latest enquiries, orders by status, orders due soon; a banner while rates are SAMPLE |
| **Enquiries** | Search/filter, open details (drawing info, linked quotes), change status (`new → contacted → quoted → won/lost`), WhatsApp link |
| **Machines** | Add / edit / delete machines (name, category, specs one per line, image path) |
| **Services** | Add / edit / delete services |
| **Rate card** | Edit cutting, piercing and material rates per material and thickness band; mark rows as sample; edit bend rate, coating rate, GST %; the *rates are sample* switch |
| **Work orders** | Create, edit; *Add status event* extends the timeline |
| **Quotes** | Read-only list of saved quotes |

**Permissions:** staff can view and update; only **admin** can delete records and change estimator settings (staff get a 403).
Every change is written to the `admin_audit_logs` table.

**Command-line report:** `php artisan pslaser:report --days=30` (run in `services/laravel-admin`) prints enquiry, quote and order totals.

### Safe habits
Don't delete the two `PSL-DEMO-*` orders (the tracking examples depend on them). Take a database backup before bulk edits (§11.5).

---

## 10. API and database overview

### Spring Boot REST API — base http://localhost:8081
| Method + path | Access | Purpose |
|---|---|---|
| `POST /api/auth/login`, `/api/auth/register` | public | Get a JWT / create a customer |
| `GET /api/machines`, `/api/machines/{slug}`, `/api/services`, `/api/materials` | public | Catalogue |
| `POST /api/quotes/estimate` | public | Calculate (not saved) |
| `POST /api/quotes` | public | Calculate and save → `quoteNo` |
| `GET /api/work-orders/track?orderNo=&phone=` | public | Tracking (phone must match, shown masked) |
| `GET /api/me`, `/api/me/quotes` | JWT | Own profile / quotes |
| `GET/POST/PUT /api/admin/work-orders`, `POST …/{id}/events` | JWT admin/staff | Manage orders |
| `GET /api/admin/enquiries`, `/api/admin/activity` | JWT admin/staff | Enquiries / Mongo activity log |
| `/actuator/health`, `/actuator/info` | public | Monitoring |

Errors always look like `{status, error, message, fieldErrors?}`. Send the token as `Authorization: Bearer <token>`.

### Node/Express API — base http://localhost:4000
`GET /api/health` · `POST /api/enquiries` (JSON or multipart with `drawing`) · `GET /api/enquiries` and `PATCH /api/enquiries/:id` (JWT admin/staff) ·
`GET /api/catalogue` · documentation page at `/`.

### Website server routes (Next.js)
`POST /api/estimate` (proxy to Spring with offline fallback) · `POST /api/auth/login`, `/api/auth/logout` (token kept in an **httpOnly cookie**) · `GET /api/work-orders`.

### Database `pslaser` (MySQL/MariaDB)
| Table | Holds |
|---|---|
| `users` | Admin / staff / customers (passwords are bcrypt hashes) |
| `machines`, `services`, `materials` | Catalogue (seeded from `src/lib/pslaser/data.ts`) |
| `rates`, `settings` | Estimator rate card and constants (bend rate, coating rate, GST %, sample flag) |
| `enquiries`, `uploads` | Customer enquiries and their drawing files |
| `quotes` | Saved estimates (`PSL-Q-YYYYMMDD-####`) |
| `work_orders`, `work_order_events` | Jobs and their status history |
| Laravel-owned: `migrations`, `sessions`, `password_reset_tokens`, `cache`, `cache_locks`, `jobs`, `job_batches`, `failed_jobs`, `admin_audit_logs` | Framework tables — do not edit by hand |

Schema: `services/db/schema.sql` · data: `services/db/seed.sql` (generated by `services/db/generate-seed.ts`) ·
cross-service rules: `services/CONTRACT.md`.

---

## 11. Startup, shutdown and restart

### 11.1 Start order (always this order)
1. MySQL → 2. Spring → 3. Node → 4. Next.js → 5. any of PHP / Laravel / Tomcat / React portal.
(Everything that needs the database must start after it; the website starts fine without Spring/Node but shows fallback data.)

For each command: **where** = the folder to `cd` into, **expect** = what you will see, **success** = the check, **recover** = what to do if not.

| Service | Where | Command | Expect | Success | Recover |
|---|---|---|---|---|---|
| MySQL | any | `C:\xampp\mysql_start.bat` | a console window stays open | `mysql.exe -uroot -e "SELECT 1"` prints 1 | "port 3306 in use" → another MySQL is running (check Task Manager / `netstat -ano \| findstr :3306`) |
| Spring | `services\spring-api` | `mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev,mongo-embedded` | log ends with "Started …" | `/actuator/health` UP | "Access denied"/"Unknown database" → MySQL not loaded; "port 8081 in use" → see §11.4 |
| Node | `services\node-api` | `npm start` | "listening on 4000" | `/api/health` ok | "ECONNREFUSED 3306" → start MySQL |
| Website | project root | `npm run dev -- -p 3001` | "Ready" | `/` 200 | "port 3001 in use" → another dev server; stop it first |
| PHP | project root | `C:\xampp\php\php.exe -S localhost:8000 -t services/php-estimator/public` | "Development Server started" | `/` 200 | wrong folder → 404 |
| Laravel | `services\laravel-admin` | `php artisan serve --port=8001` | "Server running on [http://127.0.0.1:8001]" | `/login` 200 | `vendor` missing → `composer install` |
| Tomcat | any | `C:\xampp\tomcat\bin\startup.bat` (needs `JAVA_HOME` = JDK folder) | new Tomcat window | `/pslaser/hello` 200 | "JAVA_HOME not defined" → set it to `C:\Program Files\Eclipse Adoptium\jdk-21.0.12.8-hotspot` |
| React portal | `services\react-portal` | `npm run dev` | "Local: http://localhost:5173" | page loads | "Port 5173 is already in use" → it is already running |

### 11.2 Shutdown
Press **Ctrl+C** in the terminal window of each service (Node, Next, Spring, Laravel, PHP, React). Special cases:
- **MySQL:** `C:\xampp\mysql_stop.bat` or `C:\xampp\mysql\bin\mysqladmin.exe -uroot shutdown`
- **Tomcat:** `C:\xampp\tomcat\bin\shutdown.bat`
- **MongoDB container:** `docker stop pslaser-mongo` (the embedded one stops with Spring)
Stop in the reverse order of §11.1, MySQL last. Never end MySQL from Task Manager while it is writing — use the stop script.

### 11.3 Restart a single service
Stop it (11.2), then start it (11.1). Restarting Spring does **not** require restarting Next.js or Node (they re-connect).
Restarting MySQL needs Spring to be restarted too (its connection pool must reconnect).

### 11.4 Find and free a port
```
netstat -ano | findstr :8081        (shows the PID in the last column)
tasklist /FI "PID eq 12345"         (shows which program owns it)
taskkill /PID 12345 /F              (ONLY if you are sure it is a leftover of this project)
```
On Windows, stopping `npm` sometimes leaves the `node` child alive — that is the usual reason a port stays busy.

### 11.5 Back up and restore the database
```
C:\xampp\mysql\bin\mysqldump.exe -uroot --default-character-set=utf8mb4 pslaser > pslaser-backup.sql
C:\xampp\mysql\bin\mysql.exe -uroot --default-character-set=utf8mb4 pslaser < pslaser-backup.sql
```
First command writes a backup file (success: file size > 0). Second **overwrites** the current data with the backup.
Always keep `--default-character-set=utf8mb4`, otherwise `–` and `·` become garbled (this already happened once and was fixed).

---

## 12. Troubleshooting

### 12.1 "C: is full" (current situation)
- **Symptom:** builds fail, MySQL or logs stop writing, "no space left".
- **Check:** `df -h /c` (Git Bash) or *Settings → System → Storage*.
- **Safe wins (ask yourself first, then do):**
  - `.next` (≈ 790 MB) is only a build cache: stop the Next dev server, delete the folder, it rebuilds on next start.
  - `node_modules` folders can be re-created with `npm install` (but need space and internet to do so).
  - Windows *Disk Cleanup* / Downloads / old Docker images.
- **Do not** delete `services/laravel-admin/vendor` or `~/.m2` without a plan — re-downloading needs space.
- **Prevent:** keep ≥ 2 GB free before running `npm install`, `mvnw`, or `composer`.

### 12.2 Symptom table
| Symptom | Likely cause | Fix |
|---|---|---|
| `/quote` shows "Offline estimate (sample)" | Spring not running or wrong port | Start Spring (§11.1); check `/actuator/health` |
| React portal shows "Offline demo data" | Spring/Node down | Start them; hard-refresh the portal |
| Names show `ÔÇô` or `┬À` | Database loaded without UTF-8 | Reload with `--default-character-set=utf8mb4` (§11.5) |
| Laravel pages: **419 Page Expired** | Missing/expired CSRF token | Reload the form page and submit again |
| Laravel images missing | Images load from the Next.js site | Start the website on 3001 (`PSLASER_ASSET_BASE`) |
| Spring won't start: Mongo error | Docker/Mongo not available | Use profile `dev,mongo-embedded` |
| Docker error "dockerDesktopLinuxEngine … not found" | Docker Desktop not running / crashed | Start Docker Desktop; if it crashes with "dockerInference", remove the stale socket files in `%LOCALAPPDATA%\Docker\run` (do **not** "Reset to factory defaults") |
| Tomcat 404 on `/pslaser/` | WAR not deployed | `bash build.sh deploy` in `services\servlet-jsp`, restart Tomcat |
| JSP page 500 | See `C:\xampp\tomcat\logs\localhost.*.log` | Read the stack trace's first "Caused by" |
| Upload rejected | Type/size rule | `.dxf .dwg .pdf .png .jpg`, ≤ 10 MB |
| Login fails everywhere | Wrong credentials / users table changed | Re-read `SEED_CREDENTIALS.md`; reload seed if needed |
| Estimates differ by 1 paisa between stacks | Different rounding | Rule: round each line to 2 decimals, per-part = sum of rounded lines |
| `localhost` doesn't open but `127.0.0.1` does | IPv6 vs IPv4 | Use the address that works |

### 12.3 Reading logs
- Next.js: the terminal where `npm run dev` runs. Spring: its terminal + `/actuator/health`. Node: terminal +
  `services/node-api/storage/logs/requests.log`. PHP estimator: `services/php-estimator/storage/logs/estimates.log`.
  Laravel: `services/laravel-admin/storage/logs/laravel.log`. Tomcat: `C:\xampp\tomcat\logs\`.

---

## 13. QA checklist and results

Run on **14 Oct 2026** on this PC. Method noted per row. **PASS** = I ran it and saw the expected result.
**NOT TESTED** = not re-run by me in this session. **BLOCKED** = the needed tool is unavailable. **FAIL** = tested, wrong result.

| # | Area | Check | Result | Evidence / next action |
|---|---|---|---|---|
| 1 | Startup | All 8 services respond | **PASS** | HTTP 200 on 3001, 8000, 8001, 8080, 8081, 4000, 5173; MySQL query OK |
| 2 | Startup | Raw Node demo server (4001) | **NOT TESTED** | Not running; optional (`npm run start:raw`) |
| 3 | Environment | Disk space | **FAIL** | ~330 MB free on C: (100 %). Free ≥ 2 GB |
| 4 | Environment | Docker engine | **BLOCKED** | Engine stopped; MongoDB runs embedded instead |
| 5 | Navigation | 12 site pages + blog article return 200 | **PASS** | `/ /about-us /engineering-services /architectural-services /gallery /pattern-design /blogs /blogs/<slug> /contact-us /quote /track /dashboard /modern /advanced` |
| 6 | Navigation | Unknown URL gives 404 | **PASS** | `/no-such-page` → 404 |
| 7 | Navigation | Active-menu highlight, mobile ☰ menu | **NOT TESTED** | Agent-tested; open the site on a phone width to confirm |
| 8 | Workflow | Estimate = ₹2,933.83 on Spring | **PASS** | perPart 248.63 · subtotal 2486.30 · GST 447.53 · total 2933.83, `isSample:true` |
| 9 | Workflow | Same estimate via Next `/api/estimate` | **PASS** | same numbers, source = spring |
| 10 | Workflow | Same estimate on PHP | **PASS** | `₹ 2,933.83` (CSRF token + cookie flow) |
| 11 | Workflow | Same estimate on Java servlet | **PASS** | `"total":2933.83` |
| 12 | Workflow | Order tracking correct phone / wrong phone | **PASS** | Spring: 200 with data / 404; JSP page shows "bending" |
| 13 | Validation | Thickness over limit rejected | **PASS** | MS 20 mm → HTTP 400 |
| 14 | Validation | PHP bad CSRF token | **PASS** | 303 redirect, nothing processed |
| 15 | Validation | Laravel POST without CSRF | **PASS** | 419 |
| 16 | Validation | Upload type/size, field messages in forms | **NOT TESTED** | Agent-tested (exe rejected, dxf accepted); re-test with a file |
| 17 | API | Spring catalogue | **PASS** | 7 machines, 5 materials |
| 18 | API | Node health + catalogue | **PASS** | `{"ok":true,"db":true}`; machines + services returned |
| 19 | API | Spring ↔ Node share one JWT | **PASS** | token from Spring accepted by Node `/api/enquiries` (200) |
| 20 | Database | MySQL up, 19 tables, 7 machines, 8 services | **PASS** | queried |
| 21 | Auth | Admin endpoints without token | **PASS** | Spring 401, Node 401 |
| 22 | Auth | Spring login: valid / wrong password | **PASS** | token issued (length 221) / 401 |
| 23 | Auth | Laravel login → 7 admin screens | **PASS** | 302 to dashboard; dashboard, enquiries, machines, services, rates, work-orders, quotes all 200 |
| 24 | Auth | Guest redirected from admin pages | **PASS** | Laravel `/dashboard` → 302 `/login`; JSP `/staff/orders` → 302 |
| 25 | Permissions | Staff cannot delete (403) | **NOT TESTED** | Covered by Laravel's own automated test (8 passed per agent) |
| 26 | Assets | Logo, machine image, video, brand sources load | **PASS** | HTTP 200 on 4 sample files |
| 27 | Assets | Every image on every page | **NOT TESTED** | Do a browser pass with DevTools → Network → filter 404 |
| 28 | Responsive | 375 / 768 / 1440 px layouts | **NOT TESTED** | Agent-tested with measurements; do a visual pass |
| 29 | Integration | Live status push to `/dashboard` | **NOT TESTED** | Socket connects; push not triggered end-to-end |
| 30 | Integration | Enquiry from React portal → Node → DB | **NOT TESTED** | Needs a manual run |
| 31 | Build | `npm run check` (lint + types + build) | **PASS** | completed earlier today after the last code change |
| 32 | Automated tests | Spring 15, Node 33, Laravel 8 | **NOT TESTED** | Reported by build agents; re-run with each service's test command |

---

## 14. Learning roadmap

### Beginner (week 1–2) — *use it*
1. Run the Quick Start (§5) and open every page in §6.
2. Do UC-1 and UC-2. Change one rate in Laravel and watch the estimate change.
3. Read `docs/SYLLABUS-MAPPING.md` and open one unit file (`docs/syllabus/unit-1-php.md`).
4. Learn: what a URL, port, HTTP status code and form POST are.

### Intermediate (week 3–6) — *read it*
1. Follow one request end-to-end: `/quote` → `src/app/api/estimate/route.ts` → Spring `EstimateService`.
2. Read `services/CONTRACT.md` fully — it explains how the pieces agree.
3. Read `services/db/schema.sql`; write 5 SQL queries (orders by status, enquiries per day…).
4. Use Postman collection; read each response.
5. Learn: MVC, REST, JWT, sessions vs cookies, CSRF, SQL joins.

### Advanced (week 7+) — *change it*
1. Add a field (e.g. "finish colour") through DB → Spring → Next → PHP → JSP.
2. Add a new service and machine from Laravel and see it everywhere.
3. Add real prices; set `rates_are_sample = 0`.
4. Containerise with Docker; add HTTPS and a real domain; set `metadataBase`, sitemap and robots.txt.
5. Learn: CI, tests, caching, observability, security hardening.

### Viva preparation
For each unit file, pick 3 topics and be ready to open the exact file:line given there and explain it in plain words.

---

## 15. Glossary and useful commands

### Glossary
| Term | Plain meaning |
|---|---|
| **Port** | A numbered door on your PC; each service listens on its own number |
| **localhost / 127.0.0.1** | "This computer" |
| **HTTP 200 / 302 / 400 / 401 / 403 / 404 / 419 / 500** | OK / redirect / bad input / not logged in / not allowed / not found / expired form token (Laravel) / server error |
| **API** | A URL a program calls to get or send data (usually JSON) |
| **REST** | Style of API using URLs + GET/POST/PUT/PATCH/DELETE |
| **JWT** | A signed login ticket the server hands you; you send it back on each call |
| **bcrypt** | One-way scrambling used to store passwords safely |
| **CSRF token** | Hidden form value that proves the form came from the real site |
| **CORS** | Browser rule about which websites may call which API |
| **ORM / JPA / Eloquent** | Code that maps database rows to objects (Java / Laravel) |
| **MVC** | Model (data) – View (screen) – Controller (logic) |
| **SSR / SSG / ISR** | Page built per request / at build time / rebuilt periodically |
| **Redux / Zustand / Flux** | Ways to keep shared app state in React |
| **Servlet / JSP** | Java classes / Java-flavoured HTML pages run by Tomcat |
| **Actuator** | Spring's built-in health/metrics endpoints |
| **Seed** | Starter data loaded into a database |
| **Idempotent** | Safe to run twice with the same result |

### Handy commands (Windows; run where noted)
| Purpose | Command | Run in | Success looks like |
|---|---|---|---|
| Is a port in use? | `netstat -ano \| findstr :8081` | any terminal | a line with LISTENING |
| Test a URL | `curl -i http://localhost:8081/actuator/health` | any | `HTTP/1.1 200` |
| Count machines | `C:\xampp\mysql\bin\mysql.exe -uroot -e "SELECT COUNT(*) FROM pslaser.machines"` | any | `7` |
| Website check | `npm run check` | project root | build summary, no errors |
| Laravel routes | `php artisan route:list` | `services\laravel-admin` | table of 33 routes |
| Laravel tests | `php artisan test` | same | `8 passed` |
| Spring tests | `mvnw.cmd test` | `services\spring-api` | `BUILD SUCCESS` |
| Node tests | `npm test` | `services\node-api` | `pass 33` |
| Disk space | `df -h /c` | Git Bash | Avail column |

---

## 16. Known limitations and future improvements

### Limitations (today)
- **Estimator prices are samples.** Do not quote customers from them.
- **Photos:** only the factory front is a real photo; products/gallery are representative renders.
- **No payment, no real e-mail sending, no SMS.** Enquiry delivery = database row + WhatsApp.
- **Contact and Next enquiry forms** open WhatsApp; they are not guaranteed to reach a human unless you press Send.
- **Secrets:** development defaults for the database (root, empty password) and the JWT secret must not be used on a public server.
- **Local only:** nothing is deployed; no domain, HTTPS, sitemap/robots, or `metadataBase`.
- **MongoDB** data is lost on restart when using the embedded instance.
- **Windows quirks:** stopping `npm` may leave a child `node` process holding a port.
- **Docker** is currently not running; the Spring Dockerfile image was never built (disk space).
- Engineering text about "3 kW for thick plate, 1.5 kW for thin sheet" and "turret punching for grills" is inferred, awaiting owner confirmation.
- The syllabus lab-practicals list is intentionally not part of this project.

### Future improvements
1. Free disk space and move heavy folders (Docker, Maven cache) to another drive.
2. Replace sample rates with the real rate card; add a "valid until" date on quotes.
3. Add owner-supplied photos and a real client list / testimonials (only if genuine).
4. E-mail/WhatsApp Business API notifications when status changes.
5. Production deployment: managed MySQL, HTTPS, secrets manager, backups, CI pipeline.
6. A single start script (`start-all.bat`) and a docker-compose file for the whole stack.
7. End-to-end browser tests (Playwright) for the main workflows.

---

*End of handbook. Companion files: `docs/handbook/index.html` (visual version), `docs/SYLLABUS-MAPPING.md`,
`services/CONTRACT.md`, `docs/syllabus/unit-*.md`.*
