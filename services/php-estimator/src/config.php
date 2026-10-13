<?php
/**
 * PS Laser PHP Estimator — configuration.
 *
 * Syllabus (Unit I): constants (define + const), superglobals ($_ENV / getenv),
 * the null-coalescing operator and ternaries.
 * Every value can be overridden with an environment variable; the defaults
 * match services/CONTRACT.md (XAMPP MySQL on localhost:3306, db `pslaser`).
 */

declare(strict_types=1);

/** Read an environment variable with a default (works with `php -S` and Apache). */
function env(string $key, ?string $default = null): ?string
{
    $value = getenv($key);
    if ($value === false) {
        $value = $_ENV[$key] ?? $_SERVER[$key] ?? null;
    }
    return ($value === null || $value === '') ? $default : (string) $value;
}

// --- Constants -------------------------------------------------------------
const APP_NAME    = 'PS Laser Instant Estimator';
const APP_VERSION = '1.0.0';
const BRAND_COLOR = '#EF7D00';
const WHATSAPP_NUMBER = '917719976990';          // primary WhatsApp line (Swapnil Tanpure)
const CURRENCY    = 'INR';

// Laser bed limits (CONTRACT step 1): 3000 x 1500 mm.
const BED_MAX_LENGTH_MM = 3000;
const BED_MAX_WIDTH_MM  = 1500;

// Upload rules (shared with the Node API contract).
const UPLOAD_MAX_BYTES = 10 * 1024 * 1024;       // 10 MB
const UPLOAD_ALLOWED_EXT = ['dxf', 'dwg', 'pdf', 'png', 'jpg', 'jpeg'];

// Cookie lifetime for "remember my preferences".
const PREF_COOKIE_DAYS = 30;

// Paths (define() evaluates at runtime, so it can use __DIR__ + dirname()).
define('APP_ROOT', dirname(__DIR__));
define('STORAGE_DIR', APP_ROOT . DIRECTORY_SEPARATOR . 'storage');
define('UPLOAD_DIR', STORAGE_DIR . DIRECTORY_SEPARATOR . 'uploads');
define('LOG_FILE', STORAGE_DIR . DIRECTORY_SEPARATOR . 'logs' . DIRECTORY_SEPARATOR . 'estimates.log');

// Database settings from env vars with CONTRACT defaults.
define('DB_CONFIG', [
    'host'     => env('DB_HOST', '127.0.0.1'),
    'port'     => (int) env('DB_PORT', '3306'),
    'name'     => env('DB_NAME', 'pslaser'),
    'user'     => env('DB_USER', 'root'),
    'password' => env('DB_PASSWORD', ''),
]);

// Debug mode shows exception details on the error page (never enable in production).
define('APP_DEBUG', env('APP_DEBUG', '0') === '1');

// Optional DNS MX check for e-mail validation (off by default: needs internet).
define('EMAIL_MX_CHECK', env('EMAIL_MX_CHECK', '0') === '1');
