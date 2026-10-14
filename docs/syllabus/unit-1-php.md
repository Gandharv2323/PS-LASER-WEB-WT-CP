# Unit I — Server-Side Technologies (PHP) → PS Laser Instant Estimator

**Feature:** a plain-PHP 8.2 app (no framework, no Composer) where a customer gets an indicative
laser-cutting price, saves it as a quote, downloads it and sends a drawing enquiry.
**Folder:** `services/php-estimator/` (all paths below are relative to that folder).
**Port:** 8000. **DB:** shared MySQL `pslaser` (tables `materials`, `rates`, `settings`, `services`, `quotes`, `enquiries`, `uploads`).
The Laravel topic is covered separately in [unit-1-laravel.md](unit-1-laravel.md).

## Topic → code map

| Syllabus topic | Where (file:line) | What it shows |
|---|---|---|
| Introduction to PHP | `public/learn-php.php:81-86` | "What is PHP?" section, written around this app |
| Features of PHP | `public/learn-php.php:62-71`, rendered `:150-158` | Eight features, each pointing to the file that uses it |
| Sample code | `public/learn-php.php:13-40`, `:102-106` | A short nowdoc program shown with `highlight_string()` and also run live through `ob_start()`, so the page prints its real output |
| PHP script working | `public/learn-php.php:88-100` (+ live facts `:44-58`) | Request → web server (`php -S`/Apache) → interpreter fills superglobals → Zend opcodes → MySQL → response. Shows live SAPI, PHP_VERSION and the loaded-extension count (no `phpinfo()`) |
| PHP syntax | `public/learn-php.php:108-123` table; `src/config.php:11,24-60` | Tags, `<?= ?>`, `$variables`, `const` and `define()`, `declare(strict_types=1)`, the four string kinds (single, double, heredoc `public/download.php:87`, nowdoc `public/learn-php.php:13`) |
| Conditions | `src/Estimator.php:57-66` (if/elseif), `src/functions.php:72-78` (`match`), `src/Uploader.php:47-59` (`switch` on upload error codes), `public/index.php:47-150` (`switch` on form action), `src/bootstrap.php:34-39` (`match(true)`) | Validation branches, unit conversion, upload errors, routing |
| Loops | `src/Estimator.php:124-128` (`foreach` rate-band lookup), `:69-81` (`foreach` + `continue`), `src/Database.php:109` (`for` retry), `src/EstimateLog.php:83-92` (`while` + `fgets`), `src/functions.php:191` (`while`), templates `foreach` (`templates/header.php:45`) | Picks the rate band, validates dimensions, retries a quote number, reads the log, builds the nav and tables |
| Functions | `src/functions.php` (whole file) | Scalar type hints and return types (`:21`, `:31`), default params (`:46`, `:173`), nullable params (`:173`), variadic `float ...$values` (`:37`) plus spread `...` (`src/Estimator.php:164`), closures with `use` (`:244-254`), arrow functions (`:267-272`, `src/Estimator.php:47-55`), `never` return type (`:326`) |
| String manipulation | `src/functions.php` | `htmlspecialchars` `:23`, `number_format` and Indian grouping with `preg_replace` `:46-63`, `sprintf` `:68`/`:176`/`:212-216`, `str_pad` quote numbers `:176`, `strtoupper` material codes `:88`, `ucwords` names `:102`, `preg_replace` sanitising `:94-95`/`:108`, `explode`/`implode` `:169`/`:221`, `rawurlencode` WhatsApp `:204`; `str_pad` receipt `public/download.php:76-83` |
| Arrays & array functions | `src/functions.php:235-288`, `public/stats.php:17-19`, `public/index.php:54,159`, `src/EstimateLog.php:98-103` | Associative and multidimensional arrays (`$sizeFields`, `$breakdown`, rate rows). Uses `array_map`, `array_filter`, `array_reduce`, `array_column`, `array_sum`, `usort` with `<=>`, `in_array`, `array_key_exists`, `array_slice`, `array_unshift`, `array_count_values`, `arsort`, `array_combine`, `array_intersect_key`, `compact`, and list destructuring `[$int, $dec]` |
| Form handling | `public/index.php:39-155`, `public/enquiry.php:33-143` | `$_POST`/`$_GET`/`$_FILES`/`$_SERVER`, server-side validation with per-field errors (`invalid()`/`field_error()`), sticky values (`old()`), `filter_var` for numbers, CSRF token (`src/functions.php:308-324`), Post/Redirect/Get with flash messages, `multipart/form-data` upload |
| Cookies | `src/bootstrap.php:70-109` | `setcookie()` with `httponly`, `samesite=Lax` and a 30-day expiry for the preferred material and units. Read back from `$_COOKIE` and re-validated (`preferences()`). "Clear preferences" deletes them with an expiry in the past (`public/index.php:136-140`) |
| Sessions | `src/bootstrap.php:49-66`, `public/index.php:54-66` | Session cookie params (`httponly`), `use_strict_mode`, `session_regenerate_id(true)` on the first visit, after a quote is saved and after an enquiry. `$_SESSION` holds the last inputs, last estimate, the five recent estimates, the CSRF token, flash messages and the view counter |
| File handling | `src/EstimateLog.php:36-56` (write), `:63-104` (tail read), `public/download.php:41-110`, `src/Uploader.php:44-115` | `fopen('ab')` + `flock(LOCK_EX)` + `fwrite` + `fclose` in `finally`. Reads use `fseek`/`fgets`/`filesize`. A `.txt`/`.csv` download streams through `php://output` with `Content-Disposition` and `fputcsv`. Uploads use `is_uploaded_file`, `move_uploaded_file`, a random file name and storage outside the web root |
| Exception handling | `src/exceptions.php:12-46`, `src/bootstrap.php:24-46`, `templates/error.php`, `public/index.php:76-84,106-122`, `public/enquiry.php:85-143`, `src/Database.php:19-35,109-132` | Custom `ValidationException` (field-error map), `EstimateException` and `UploadException`. Has `try/catch/finally` around DB transactions (rollback, removing orphan files, logging in `finally`) and multi-catch `PDOException \| UploadException`. `set_error_handler` turns warnings into `ErrorException`, and a global `set_exception_handler` renders a 4xx/5xx error page. PDO runs in `ERRMODE_EXCEPTION` |
| E-mail validation | `src/functions.php:128-162`, used at `public/enquiry.php:49-52` | Three layers: `filter_var(FILTER_VALIDATE_EMAIL)`, a custom regex (`is_email_by_regex`) and an optional `checkdnsrr` MX/A lookup (`EMAIL_MX_CHECK=1`). The lookup is wrapped in try/finally with a temporary error handler so an offline DNS never breaks the form |
| MySQL with PHP | `src/Database.php` | PDO DSN from env vars (`src/config.php:48-54`), `ERRMODE_EXCEPTION`, `EMULATE_PREPARES=false`, prepared statements with `?` and `:named` placeholders, `bindValue(PARAM_INT)`, `FETCH_KEY_PAIR` for settings, transactions, `lastInsertId`, and a retry on duplicate key 1062 for `PSL-Q-YYYYMMDD-####` |
| Laravel | → [unit-1-laravel.md](unit-1-laravel.md) | Covered by `services/laravel-admin/` |

Other things worth knowing for the viva:
- `require`/`require_once` and layout partials: `src/bootstrap.php:11-17`, `templates/header.php` and `templates/footer.php`, included by every page.
- Constants: `src/config.php:24-60`.
- Heredoc: the `.txt` receipt (`public/download.php:87`) and the inline jQuery (`public/index.php`, end of file).
- Security basics: the `e()` escaping helper, prepared statements, CSRF, upload allow-list plus finfo, private storage, `session_regenerate_id`, and headers (`src/bootstrap.php:112-115`).

## Estimate formula (CONTRACT) — `src/Estimator.php:140-185`

Each breakdown line is rounded to 2 dp, and `perPart` is the rounded sum of those lines, so the table always adds up. Subtotal, GST and total are each rounded to 2 dp.

Hand check (seed sample rates): MS, 2 mm, 500 × 300 mm, cut 1600 mm, 4 pierces, 2 bends, powder coated, qty 10.
- MS 0.5–3 mm band: ₹10/m cut, ₹1/pierce, ₹75/kg. Bend rate ₹8, coating ₹120/m², GST 18%.
- area = 0.15 m² → weight = 0.15 × 2 × 7.85 = 2.355 kg → material = 176.63
- cutting = 1.6 × 10 = 16.00 · piercing = 4.00 · bending = 16.00 · coating = 0.15 × 2 × 120 = 36.00
- per part = 248.63 → subtotal = 2,486.30 → GST = 447.53 → **total ₹2,933.83** (the app prints `₹ 2,933.83`)

## Run

```
C:\xampp\mysql_start.bat                     # if MySQL is not running
C:\xampp\php\php.exe -S localhost:8000 -t services/php-estimator/public
```
Open http://localhost:8000. Pages: `index.php`, `enquiry.php`, `stats.php`, `learn-php.php`, `download.php?format=txt|csv`.

## Test

1. Calculate the case above → total ₹2,933.83. Tick "Remember…" → `pref_material`/`pref_units` cookies (30 days, HttpOnly).
2. Try AL 10 mm, length 4000, width 0, quantity 0 → you should see a field error under each of those fields.
3. Click "Save quote" → `PSL-Q-YYYYMMDD-0001` appears. Clicking again shows "already saved". Check it with
   `C:\xampp\mysql\bin\mysql.exe -uroot pslaser -e "select * from quotes where source='php'"`.
4. Download .txt / .csv. Then open `stats.php` and the new lines are at the top of the log tail.
5. `enquiry.php`: submit bad values (phone 12345, e-mail `bad..mail@x`) → field errors. Upload a `.dxf` → saved under
   `storage/uploads/` (random name, not reachable by URL) and in the `uploads` table. Uploading `.exe`, or an `.exe` renamed to `.png`, is rejected.
6. Run `DB_PORT=3999` on another port → you get the friendly 503 error page from the global exception handler.
