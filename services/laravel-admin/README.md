# PS Laser Admin (Laravel 12)

The back office for PS Laser, Pune (sheet-metal and CNC laser job shop). Staff use it to handle website enquiries, the machine and service catalogue, the estimator rate card, customer work orders with a status timeline, and saved quotes.
CS3111 **Unit I: Laravel**. The topic-by-topic map is in [`docs/syllabus/unit-1-laravel.md`](../../docs/syllabus/unit-1-laravel.md).

- Stack: Laravel 12.x on PHP 8.2 (XAMPP), Blade + Bootstrap 5.3 (CDN) with the PS Laser orange `#EF7D00`, and MySQL/MariaDB `pslaser`, which it shares with the other services.
- URL: <http://localhost:8001>. Log in with the seed admin from `services/db/SEED_CREDENTIALS.md`. Only `admin` and `staff` roles can sign in.

## Run

```bash
# 0. MySQL running, shared schema + seed loaded (see services/CONTRACT.md)
cd services/laravel-admin
php composer.phar install          # or: composer install (vendor/ is already present)
cp .env.example .env && php artisan key:generate   # first time only (.env is already set up)
php artisan migrate                # ONLY Laravel-owned tables: sessions, password_reset_tokens, cache, jobs, admin_audit_logs
php artisan db:seed                # optional, idempotent demo enquiries/quote (phones 90000001xx)
php artisan serve --port=8001
```

Useful commands:

| Command | What it does |
|---|---|
| `php artisan route:list --except-vendor` | 33 named routes (resource controllers, nested events route) |
| `php artisan pslaser:report --days=30` | Custom Artisan command: enquiry, quote and work-order stats |
| `php artisan test` | 8 Feature tests on SQLite `:memory:`. They never touch MySQL. |

## Shared-database rules

- The shared tables (`users`, `machines`, `services`, `materials`, `rates`, `settings`, `enquiries`, `uploads`, `quotes`, `work_orders`, `work_order_events`) come from `services/db/schema.sql`. **No Laravel migration creates, alters or drops them.** The default `create_users_table` migration was replaced by `0001_01_01_000000_create_auth_support_tables.php`, which only adds `password_reset_tokens` and `sessions`, and only when they are missing (`Schema::hasTable`).
- The Laravel-owned tables are `migrations`, `sessions`, `password_reset_tokens`, `cache`, `cache_locks`, `jobs`, `job_batches`, `failed_jobs` and `admin_audit_logs` (this app's audit trail). The `jobs` queue table does not clash, because the shared job-tracking table is named `work_orders`.
- `.env` uses `SESSION_DRIVER=file` and `CACHE_STORE=file`, so the app does not depend on the DB tables for those.
- Tests: `tests/RefreshPsLaserDatabase.php` runs the normal migrations plus the test-only `tests/database/migrations/` against SQLite in memory. That folder holds SQLite copies of the shared tables.

## Screens

| Screen | Route | Notes |
|---|---|---|
| Login / logout | `/login`, `POST /logout` | bcrypt check against the shared `users` table. Role filter is admin/staff. Two layers of rate limiting. CSRF. |
| Dashboard | `/dashboard` | Counts, latest enquiries, work orders by status, due next, SAMPLE-rates banner |
| Enquiries | `/enquiries` | Status pills, search, source filter, pagination. The detail page shows drawing upload info, linked quotes, a status update and a WhatsApp link. |
| Machines | `/machines` (full resource) | CRUD with an image path field and preview. Delete is admin only. |
| Services | `/services` | CRUD (no show). Delete is admin only. |
| Rate card | `/rates` | Bulk edit of every `rates` row with a per-row `is_sample` flag. The estimator settings include the `settings.rates_are_sample` switch, which only an admin can change. |
| Work orders | `/work-orders` (full resource) | Creating an order also adds its first timeline event. `POST /work-orders/{id}/events` adds a status event and updates the current status. |
| Quotes | `/quotes` | Read-only list of saved estimates with search and material filter |

## Layout

```
app/Console/Commands/PslaserReport.php      custom artisan command
app/Http/Controllers/…                       resource + invokable controllers
app/Http/Middleware/EnsureUserHasRole.php    `role:admin,staff`
app/Http/Requests/…                          Form Request validation
app/Models/…                                 Eloquent models (relationships, casts, scopes, accessors)
app/Providers/AppServiceProvider.php         rate limiter, gate, Bootstrap pagination
bootstrap/app.php                            middleware alias + guest/user redirects
config/pslaser.php                           app config (asset base URL, WhatsApp, page size)
database/migrations/                         Laravel-owned tables only
database/seeders/                            idempotent demo seeder
resources/views/                             layouts, components, partials, pages
routes/web.php                               named routes
tests/Feature/AdminAccessTest.php            Feature tests
```

Machine and service images are stored as paths such as `/sites/pslaser/machines/…jpg`. They are served by the Next.js site at `PSLASER_ASSET_BASE` (default `http://localhost:3001`).
