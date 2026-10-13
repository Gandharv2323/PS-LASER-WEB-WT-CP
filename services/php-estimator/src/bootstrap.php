<?php
/**
 * Bootstrap — every page starts with:  require __DIR__ . '/../src/bootstrap.php';
 *
 * Unit I topics: require_once (includes), error -> exception conversion,
 * a global set_exception_handler, secure session settings, cookies.
 */

declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/exceptions.php';
require_once __DIR__ . '/functions.php';
require_once __DIR__ . '/Database.php';
require_once __DIR__ . '/Estimator.php';
require_once __DIR__ . '/EstimateLog.php';
require_once __DIR__ . '/Uploader.php';

date_default_timezone_set('Asia/Kolkata');
mb_internal_encoding('UTF-8');
ini_set('display_errors', APP_DEBUG ? '1' : '0');
error_reporting(E_ALL);

// Turn PHP warnings/notices into ErrorException so they can be caught too.
set_error_handler(function (int $severity, string $message, string $file, int $line): bool {
    if (!(error_reporting() & $severity)) {
        return false;                       // silenced with @
    }
    throw new ErrorException($message, 0, $severity, $file, $line);
});

// Last line of defence: any uncaught exception renders a friendly error page.
set_exception_handler(function (Throwable $ex): void {
    $status = match (true) {
        $ex instanceof ValidationException => 422,
        $ex instanceof EstimateException, $ex instanceof UploadException => 400,
        $ex instanceof RuntimeException && $ex->getCode() === 503 => 503,
        default => 500,
    };
    error_log(sprintf('[php-estimator] %s: %s in %s:%d', $ex::class, $ex->getMessage(), $ex->getFile(), $ex->getLine()));
    if (!headers_sent()) {
        http_response_code($status);
        header('Content-Type: text/html; charset=utf-8');
    }
    $error = $ex;
    require APP_ROOT . '/templates/error.php';
});

// --- Sessions ---------------------------------------------------------------
session_name('PSLASER_EST');
session_set_cookie_params([
    'lifetime' => 0,                 // until the browser closes
    'path'     => '/',
    'httponly' => true,              // JavaScript cannot read the session id
    'samesite' => 'Lax',
    'secure'   => !empty($_SERVER['HTTPS']),
]);
ini_set('session.use_strict_mode', '1');
session_start();

// New visitor: issue a fresh id once (defends against session fixation).
if (empty($_SESSION['initiated'])) {
    session_regenerate_id(true);
    $_SESSION['initiated'] = time();
    $_SESSION['recent'] = [];
}
$_SESSION['views'] = ($_SESSION['views'] ?? 0) + 1;

// --- Cookies: remembered preferences (30 days) -------------------------------
const PREF_COOKIES = ['pref_material', 'pref_units'];

/** Current preferences from $_COOKIE (validated — cookies are user input!). */
function preferences(): array
{
    $material = material_code($_COOKIE['pref_material'] ?? '');
    $units = $_COOKIE['pref_units'] ?? 'mm';
    return [
        'material' => $material,
        'units'    => in_array($units, ['mm', 'in'], true) ? $units : 'mm',
    ];
}

function cookie_options(int $expires): array
{
    return [
        'expires'  => $expires,
        'path'     => '/',
        'httponly' => true,
        'samesite' => 'Lax',
        'secure'   => !empty($_SERVER['HTTPS']),
    ];
}

function remember_preferences(string $material, string $units): void
{
    $expires = time() + PREF_COOKIE_DAYS * 24 * 60 * 60;
    setcookie('pref_material', $material, cookie_options($expires));
    setcookie('pref_units', $units, cookie_options($expires));
    $_COOKIE['pref_material'] = $material;          // visible in this same request too
    $_COOKIE['pref_units'] = $units;
}

function clear_preferences(): void
{
    foreach (PREF_COOKIES as $name) {
        setcookie($name, '', cookie_options(time() - 3600));   // expiry in the past = delete
        unset($_COOKIE[$name]);
    }
}

// Security headers for every page.
if (!headers_sent()) {
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: SAMEORIGIN');
    header('Referrer-Policy: strict-origin-when-cross-origin');
}
