# Unit I: Laravel, the PHP framework (PS Laser Admin)

**Feature:** the PS Laser back office in `services/laravel-admin/`, built on Laravel 12.x and PHP 8.2. It runs at <http://localhost:8001>. Staff use it to handle enquiries, machines, services, the rate card, work orders (with a status timeline) and quotes. It uses the shared MySQL database `pslaser`.
Plain-PHP Unit I topics (syntax, loops, forms, cookies and so on) are covered separately in `services/php-estimator/` (see `unit-1-php.md`).

All paths below are relative to `services/laravel-admin/`.

## Topic map

| Syllabus topic / Laravel concept | Where | What it shows |
|---|---|---|
| **Laravel install / project structure** | `composer.json`, `artisan`, `bootstrap/app.php` | Created with `composer create-project laravel/laravel` (12.x, PHP 8.2). `bootstrap/app.php` holds the Laravel 11+/12 app configuration (routing, middleware, exceptions). |
| **Configuration and .env** | `.env.example`, `config/pslaser.php:1-10`, `config/app.php:68` | DB, session and cache settings come from `.env`. Custom config is read with `config('pslaser.per_page')`. The timezone comes from `APP_TIMEZONE`. |
| **MVC: Model** | `app/Models/*.php` | 12 Eloquent models over the shared tables (`Machine`, `Service`, `Material`, `Rate`, `Setting`, `Enquiry`, `Upload`, `Quote`, `WorkOrder`, `WorkOrderEvent`, `User`) plus `AuditLog`. |
| **MVC: View** | `resources/views/**` | Blade templates: layouts, pages, components and partials. |
| **MVC: Controller** | `app/Http/Controllers/*.php` | Resource controllers (`MachineController`, `WorkOrderController`…), an invokable controller (`DashboardController.php:15`) and a nested controller (`WorkOrderEventController.php:14`). |
| **Routing (basic, redirect, groups)** | `routes/web.php:22`, `:25-28`, `:31-51` | `Route::redirect`, plus route groups with `guest` and `auth` + `role` middleware. |
| **Named routes** | `routes/web.php:26-50`, used as `route('enquiries.show', $enquiry)` in every view | Links never hard-code URLs. |
| **Resource routes** | `routes/web.php:36` (`only`), `:38` (full), `:39` (`except`), `:46` | 7 RESTful actions. Check them with `php artisan route:list`. |
| **Route parameters and model binding** | `routes/web.php:47` `{work_order}`; `EnquiryController.php:32`, `MachineController.php:41` | `Enquiry $enquiry` is resolved with findOrFail, so an unknown id gives a 404. |
| **Controllers: request input, redirects, flash** | `EnquiryController.php:15-28`, `:39-46` | Uses `$request->query()`, `back()->with('success', …)` and `redirect()->route(...)`. |
| **Form Request validation** | `app/Http/Requests/MachineRequest.php:12-46`, `WorkOrderRequest.php`, `UpdateRatesRequest.php:18-27` (wildcard `rates.*.field`), `UpdateEnquiryStatusRequest.php` (`Rule::in`) | Covers `authorize()`, `rules()`, `messages()`, `attributes()`, `prepareForValidation()` (auto slug, `MachineRequest.php:18`) and `Rule::unique()->ignore()` (`:32`). |
| **Validation errors in views / old input** | `resources/views/components/field.blade.php:7-20`, `partials/flash.blade.php:14-23` | Uses `@error`, `$errors->any()` and `old()` to repopulate the form after a failed validation. |
| **Blade: layouts and sections** | `layouts/app.blade.php:8-26`, `enquiries/show.blade.php:1-5` | Uses `@extends`, `@section`, `@yield('title')`, `@yield('actions')` and `@stack('scripts')`. |
| **Blade: partials** | `layouts/app.blade.php:16`, `:24`; `machines/create.blade.php` → `@include('machines._form')` | Navigation, flash messages, shared create/edit forms and the delete form. |
| **Blade: components** | `components/field.blade.php:6` (`@props`), `components/status-badge.blade.php`, `components/stat-card.blade.php` | Used as `<x-field>`, `<x-status-badge :status=…>` and `<x-stat-card>`, with `$attributes->merge/class`. |
| **Blade: control structures** | `dashboard.blade.php` (`@forelse/@empty`, `@foreach`, `@if`), `rates/index.blade.php` (`$loop->first`, `$loop->count`), `partials/nav.blade.php` (`@class`, `@php`) | Directives `@checked`, `@selected`, `@can` / `@cannot`. Output is escaped with `{{ }}` (XSS-safe). |
| **Eloquent ORM: CRUD** | `MachineController.php:33-70` | `Machine::create`, `$machine->update`, `$machine->delete`, plus `$fillable` mass-assignment protection. |
| **Eloquent: relationships** | `Enquiry.php:24-42` (hasMany uploads/quotes, belongsTo service/machine by slug), `WorkOrder.php:25-33` (hasMany events, ordered), `Material.php:19`, `Rate.php:31`, `Quote.php:37-45` | Custom foreign and owner keys (`machine_slug` → `slug`). |
| **Eloquent: casts** | `Rate.php:19-29` (decimal, boolean), `WorkOrder.php:19` (date), `User.php:27` (`'password' => 'hashed'`) | |
| **Eloquent: local scopes** | `Enquiry.php:45-64` (`status()`, `search()`), `WorkOrder.php:35-55` (`open()`), `Machine.php:30`, `User.php:46` | Chained in controllers: `Enquiry::status($s)->search($q)`. |
| **Eloquent: accessors** | `Machine.php:36-48` (`spec_list`, `image_url`), `Upload.php:27` (`human_size`) | Uses `Attribute::get()`. |
| **Eloquent: non-standard tables** | `Setting.php:10-13` (string primary key, no timestamps), `Rate.php:12` (`CREATED_AT = null`), `Upload.php:12`, `Material.php:10` | Maps the existing shared schema without changing it. |
| **Eager loading, counts, aggregates** | `EnquiryController.php:18`, `:34`; `DashboardController.php:26-30`; `QuoteController.php` (`sum`) | Uses `with`, `load`, `withCount`, `loadCount`, `selectRaw … groupBy`, `pluck`. |
| **Query builder / transactions** | `RateController.php:33-50`, `WorkOrderController.php:44`, `:76`, `WorkOrderEventController.php:18` | `DB::transaction()` so the order and its timeline event are saved together. |
| **Pagination** | `EnquiryController.php:23-24`, `AppServiceProvider.php:23` | `paginate()->withQueryString()` keeps the filters, and `{{ $enquiries->links() }}` renders Bootstrap 5 links. |
| **Migrations** | `database/migrations/0001_01_01_000000_create_auth_support_tables.php:16-35` (guarded `Schema::hasTable`), `2026_10_13_000100_create_admin_audit_logs_table.php:15-24` | The schema builder runs `up` and `down`. Shared tables are never created or altered by Laravel. |
| **Seeders (idempotent)** | `database/seeders/DatabaseSeeder.php`, `DemoEnquirySeeder.php:33-58` | `firstOrCreate` keyed on phone + source or `quote_no`, so `db:seed` can run any number of times. |
| **Factories** | `database/factories/UserFactory.php` (`admin()`, `customer()` states) | Used by the tests. |
| **Middleware (custom, with parameters)** | `app/Http/Middleware/EnsureUserHasRole.php:16-38`, alias at `bootstrap/app.php:16-18`, used at `routes/web.php:31` | `role:admin,staff` uses variadic parameters. A customer session is logged out, and the wrong role gets a 403. |
| **Middleware (built-in)** | `routes/web.php:25` `guest`, `:31` `auth`, `:27` `throttle:login`, `:44` `can:admin` | `bootstrap/app.php:21-22` sets where guests and logged-in users are redirected. |
| **Authentication** | `app/Http/Requests/LoginRequest.php:33-52`, `Auth/LoginController.php:19-41` | `Auth::attempt([... closure whereIn role ...], $remember)` checks the bcrypt `$2y$` hash in the shared `users` table. Includes "remember me" and logout. |
| **Authorization (Gates)** | `AppServiceProvider.php:33`, `MachineController.php:63`, `UpdateSettingsRequest.php`, `partials/delete-form.blade.php` (`@can('admin')`) | Staff can edit. Only admins can delete or switch off the SAMPLE flag. |
| **Rate limiting** | `AppServiceProvider.php:27-29` (named limiter, 5/min per email+IP), `LoginRequest.php:46`, `:56-68` (`RateLimiter::hit/tooManyAttempts`, `Lockout` event) | Brute-force protection on login. |
| **Sessions** | `.env` `SESSION_DRIVER=file`; `LoginController.php:24-25` (`regenerate`, `put`), `:36-37` (`invalidate`, `regenerateToken`) | Session-fixation protection. Flash data is read with `session('success')` in `partials/flash.blade.php`. |
| **CSRF protection** | Every form has `@csrf` (e.g. `auth/login.blade.php`, `machines/_form.blade.php:2`); `layouts/app.blade.php:7` meta tag | A POST without `_token` gets **419**, which was verified with curl. |
| **Method spoofing** | `enquiries/show.blade.php:75` `@method('PATCH')`, `machines/edit.blade.php` `@method('PUT')`, `partials/delete-form.blade.php` `@method('DELETE')` | |
| **Artisan: custom command** | `app/Console/Commands/PslaserReport.php:17-76` | `pslaser:report {--days=30}` uses `$this->option`, `table()`, `warn()` and exit codes. |
| **Artisan: everyday commands** | — | `serve`, `migrate`, `db:seed`, `route:list`, `test`, `key:generate`, `make:*` |
| **Testing (Feature tests)** | `tests/Feature/AdminAccessTest.php:16-109`, `tests/RefreshPsLaserDatabase.php`, `tests/database/migrations/…` | 8 tests on SQLite `:memory:`: guest redirect, login/logout, wrong password and customer rejected, admin updates enquiry status, invalid status rejected, validation, staff 403 on delete, and the work-order timeline. |
| **MySQL with Laravel** | `.env` (`DB_CONNECTION=mysql`, `DB_DATABASE=pslaser`), `config/database.php` | The same tables are used by the PHP, Spring, Node and JSP services. |

## How to run and test

```bash
# MySQL (XAMPP) running with services/db/schema.sql + seed.sql loaded
cd services/laravel-admin
php artisan migrate            # Laravel-owned tables only
php artisan db:seed            # optional demo enquiries (idempotent)
php artisan serve --port=8001  # http://localhost:8001 → login with services/db/SEED_CREDENTIALS.md

php artisan route:list --except-vendor   # 33 routes
php artisan pslaser:report --days=30     # stats in the terminal
php artisan test                         # 8 passed (SQLite in-memory)
```

Demo walkthrough:
1. Sign in.
2. On the dashboard, open an enquiry and change its status to *contacted*. The flash message appears and an `admin_audit_logs` row is written.
3. Add a machine. Leave the slug blank to see it generated automatically, and submit an empty field to see the validation messages. Edit the machine, then delete it as admin.
4. Open work order PSL-DEMO-001 and add a *welding* event. The timeline and progress bar update.
5. On the rate card, edit the rows and the SAMPLE switch.
6. Sign out.
