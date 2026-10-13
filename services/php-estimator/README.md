# PS Laser Instant Estimator & Drawing Upload (plain PHP)

CS3111 Unit I — Server-side technologies (PHP). Dependency-free PHP 8.2 + MySQL (PDO),
Bootstrap 4.5 + jQuery from CDN. Syllabus mapping: `docs/syllabus/unit-1-php.md`.

## Run

1. Start MySQL (XAMPP): `C:\xampp\mysql_start.bat`. The `pslaser` database must be loaded
   (`services/db/schema.sql` + `seed.sql`, see `services/CONTRACT.md`).
2. From the project root:

   ```
   C:\xampp\php\php.exe -S localhost:8000 -t services/php-estimator/public
   ```

3. Open http://localhost:8000

Environment variables (optional, CONTRACT defaults shown):
`DB_HOST=127.0.0.1 DB_PORT=3306 DB_NAME=pslaser DB_USER=root DB_PASSWORD=` ·
`APP_DEBUG=1` shows exception details on the error page · `EMAIL_MX_CHECK=1` enables the DNS MX lookup.

## Pages

| URL | What it does |
|---|---|
| `index.php` | Estimator form → server-side calculation (CONTRACT formula), breakdown + GST, WhatsApp link, "Save quote" (`quotes`, `PSL-Q-YYYYMMDD-####`, source `php`), recent estimates (session), preferences (30-day cookies) |
| `enquiry.php` | Enquiry form with validation, CSRF, optional drawing upload (dxf/dwg/pdf/png/jpg ≤ 10 MB, finfo MIME check) → `enquiries` + `uploads` |
| `download.php?format=txt\|csv` | Downloads your last estimate, streamed through `php://output` |
| `stats.php` | Tail of `storage/logs/estimates.log`, DB counts, session summary |
| `learn-php.php` | "How this estimator works" — PHP intro, features, request lifecycle, live sample code |

## Layout

```
public/      document root (only these files are reachable by URL)
src/         config.php, functions.php, exceptions.php, Database.php (PDO + Repository),
             Estimator.php, EstimateLog.php, Uploader.php, bootstrap.php
templates/   header.php, footer.php, error.php (layout partials)
storage/     uploads/ (private drawings) and logs/estimates.log — outside the web root
```

## Quick test (curl)

```bash
# grab a CSRF token + session cookie, then post an estimate
TOK=$(curl -s -c jar -b jar localhost:8000/ | grep -o 'name="_token" value="[a-f0-9]*"' | head -1 | cut -d'"' -f4)
curl -s -c jar -b jar localhost:8000/index.php -d "_token=$TOK&action=estimate&material=MS&thickness=2&units=mm&length=500&width=300&cut_length=1600&pierces=4&bends=2&quantity=10&powder_coat=1" | grep -o 'estimateTotal">[^<]*'
# -> ₹ 2,933.83
```

Rates are SAMPLE values (`rates.is_sample = 1`); every estimate says "Indicative estimate — sample rates".
