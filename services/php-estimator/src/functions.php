<?php
/**
 * Pure helper functions (Unit I: functions, string manipulation, arrays).
 *
 * - scalar type hints + return types (strict_types)
 * - default parameters, nullable parameters, variadic parameters (...$values)
 * - closures (function () use (...)) and arrow functions (fn () =>)
 * - string functions: htmlspecialchars, number_format, str_pad, sprintf,
 *   ucwords, strtoupper, preg_replace, preg_match, explode/implode, rawurlencode
 * - array functions: array_map, array_filter, array_reduce, array_column,
 *   array_sum, usort, in_array, array_key_exists, array_slice, array_values
 */

declare(strict_types=1);

// ---------------------------------------------------------------------------
// Output escaping (security basics)
// ---------------------------------------------------------------------------

/** Escape anything for safe HTML output. Use it for EVERY dynamic value. */
function e(string|int|float|null $value): string
{
    return htmlspecialchars((string) ($value ?? ''), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

// ---------------------------------------------------------------------------
// Numbers & money
// ---------------------------------------------------------------------------

/** Round to 2 decimal places (paise). */
function round2(float $value): float
{
    return round($value, 2);
}

/** Variadic sum: sum_values(1, 2.5, 3) === 6.5 */
function sum_values(float ...$values): float
{
    return array_sum($values);
}

/**
 * Format rupees with number_format(). With $indian = true (default) the integer
 * part is regrouped the Indian way (1,23,456.00) using preg_replace.
 */
function inr(float $amount, bool $symbol = true, bool $indian = true): string
{
    $formatted = number_format($amount, 2, '.', ',');
    if ($indian) {
        [$int, $dec] = explode('.', number_format($amount, 2, '.', ''));
        $negative = str_starts_with($int, '-');
        $int = ltrim($int, '-');
        if (strlen($int) > 3) {
            $last3 = substr($int, -3);
            $rest  = substr($int, 0, -3);
            // Insert a comma every 2 digits in the remaining part (Indian lakh/crore grouping).
            $rest  = preg_replace('/\B(?=(\d{2})+(?!\d))/', ',', $rest);
            $int   = $rest . ',' . $last3;
        }
        $formatted = ($negative ? '-' : '') . $int . '.' . $dec;
    }
    return ($symbol ? '₹ ' : '') . $formatted;
}

/** Plain machine-readable amount for CSV/WhatsApp ("1234.50"). */
function amount(float $value): string
{
    return sprintf('%.2f', $value);
}

/** Convert a length to millimetres. */
function to_mm(float $value, string $unit = 'mm'): float
{
    return match ($unit) {
        'in'    => $value * 25.4,
        'cm'    => $value * 10,
        default => $value,
    };
}

// ---------------------------------------------------------------------------
// Strings
// ---------------------------------------------------------------------------

/** "ms" / " M.S. " -> "MS" — upper-case material codes, letters only. */
function material_code(string $raw): string
{
    return strtoupper(preg_replace('/[^A-Za-z]/', '', $raw) ?? '');
}

/** Trim, collapse whitespace, strip control characters and cap the length. */
function clean_text(string $raw, int $maxLength = 2000): string
{
    $text = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $raw) ?? '';
    $text = preg_replace('/[ \t]+/', ' ', $text) ?? '';
    return mb_substr(trim($text), 0, $maxLength);
}

/** "  rAHUL   pATIL " -> "Rahul Patil" */
function person_name(string $raw): string
{
    return ucwords(strtolower(clean_text($raw, 120)));
}

/** Keep digits only and drop a leading +91 / 91 / 0 so "+91 77199-76990" -> "7719976990". */
function normalize_phone(string $raw): string
{
    $digits = preg_replace('/\D+/', '', $raw) ?? '';
    if (strlen($digits) === 12 && str_starts_with($digits, '91')) {
        $digits = substr($digits, 2);
    } elseif (strlen($digits) === 11 && $digits[0] === '0') {
        $digits = substr($digits, 1);
    }
    return $digits;
}

/** Indian mobile: 10 digits starting 6–9. */
function is_indian_mobile(string $phone): bool
{
    return preg_match('/^[6-9]\d{9}$/', normalize_phone($phone)) === 1;
}

/**
 * Custom e-mail regex (Unit I: e-mail validation).
 * local part: letters, digits and . _ % + - (no leading/trailing/double dot)
 * domain: labels of letters/digits/hyphens, TLD of 2+ letters.
 */
function is_email_by_regex(string $email): bool
{
    $pattern = '/^(?!\.)(?!.*\.\.)[A-Za-z0-9._%+\-]{1,64}(?<!\.)@(?:[A-Za-z0-9](?:[A-Za-z0-9\-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,24}$/';
    return preg_match($pattern, $email) === 1;
}

/**
 * Full e-mail check: filter_var (PHP's built-in validator) AND our regex,
 * plus an optional DNS MX lookup. The MX lookup is wrapped so that a DNS
 * failure (offline laptop in the viva!) never crashes the form.
 *
 * @return string|null error message, or null when valid
 */
function validate_email(string $email, bool $checkMx = false): ?string
{
    if (filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
        return 'This e-mail address is not valid.';
    }
    if (!is_email_by_regex($email)) {
        return 'This e-mail address has an unusual format — please re-check it.';
    }
    if ($checkMx) {
        $domain = substr(strrchr($email, '@') ?: '', 1);
        try {
            set_error_handler(static fn () => true);      // silence DNS warnings
            $hasMx = checkdnsrr($domain, 'MX') || checkdnsrr($domain, 'A');
        } catch (Throwable) {
            $hasMx = true;                                // DNS unavailable: don't block the customer
        } finally {
            restore_error_handler();
        }
        if (!$hasMx) {
            return "The domain \"{$domain}\" does not accept e-mail.";
        }
    }
    return null;
}

/** Split machine/spec text (one per line) into a clean array. */
function spec_lines(string $specs): array
{
    return array_values(array_filter(array_map('trim', explode("\n", $specs)), fn ($l) => $l !== ''));
}

/** Quote number: PSL-Q-YYYYMMDD-#### (str_pad with leading zeros). */
function quote_number(int $sequence, ?DateTimeInterface $date = null): string
{
    $date ??= new DateTimeImmutable('now');
    return sprintf('PSL-Q-%s-%s', $date->format('Ymd'), str_pad((string) $sequence, 4, '0', STR_PAD_LEFT));
}

/** Random, safe file name for uploads: never trust the client's name. */
function safe_upload_name(string $extension): string
{
    return date('Ymd') . '-' . bin2hex(random_bytes(12)) . '.' . strtolower($extension);
}

/** Human readable bytes: 1536 -> "1.5 KB" */
function human_bytes(int $bytes, int $decimals = 1): string
{
    $units = ['B', 'KB', 'MB', 'GB'];
    $i = 0;
    $size = (float) $bytes;
    while ($size >= 1024 && $i < count($units) - 1) {
        $size /= 1024;
        $i++;
    }
    return sprintf("%.{$decimals}f %s", $size, $units[$i]);
}

// ---------------------------------------------------------------------------
// WhatsApp
// ---------------------------------------------------------------------------

function whatsapp_url(string $text): string
{
    return 'https://wa.me/' . WHATSAPP_NUMBER . '?text=' . rawurlencode($text);
}

/** Build the WhatsApp message for an estimate (implode of lines). */
function estimate_whatsapp_text(array $est): string
{
    $lines = [
        'Hi PS Laser, I used your online estimator. Please send a final quotation:',
        sprintf('Material: %s %s mm', $est['materialName'], rtrim(rtrim(amount($est['thicknessMm']), '0'), '.')),
        sprintf('Size: %d x %d mm, cut length %d mm', $est['lengthMm'], $est['widthMm'], $est['cutLengthMm']),
        sprintf('Pierces: %d, Bends: %d, Powder coat: %s', $est['pierces'], $est['bends'], $est['powderCoat'] ? 'Yes' : 'No'),
        sprintf('Quantity: %d', $est['quantity']),
        sprintf('Indicative total: Rs %s incl. %s%% GST (sample rates)', amount($est['total']), $est['gstPercent']),
    ];
    if (!empty($est['quoteNo'])) {
        $lines[] = 'Ref: ' . $est['quoteNo'];
    }
    return implode("\n", $lines);
}

// ---------------------------------------------------------------------------
// Arrays
// ---------------------------------------------------------------------------

/**
 * Breakdown rows for the result table, using array_map with a closure that
 * captures $total by value (use).
 *
 * @param array<string,float> $breakdown
 * @return list<array{label:string,amount:float,share:float}>
 */
function breakdown_rows(array $breakdown, float $perPart): array
{
    $labels = [
        'material' => 'Material (sheet weight × rate/kg)',
        'cutting'  => 'Laser cutting (metres × rate/m)',
        'piercing' => 'Piercing (starts × rate)',
        'bending'  => 'CNC bending (bends × rate)',
        'coating'  => 'Powder coating (both sides)',
    ];
    return array_map(
        function (string $key) use ($breakdown, $labels, $perPart): array {
            $value = $breakdown[$key] ?? 0.0;
            return [
                'label'  => $labels[$key] ?? ucwords($key),
                'amount' => $value,
                'share'  => $perPart > 0 ? round($value / $perPart * 100, 1) : 0.0,
            ];
        },
        array_keys($breakdown)
    );
}

/**
 * Summary of the session's recent estimates — array_column, array_sum,
 * array_reduce, array_filter, usort.
 *
 * @param list<array<string,mixed>> $recent
 */
function summarize_estimates(array $recent): array
{
    $totals = array_column($recent, 'total');
    $count  = count($totals);
    $highest = array_reduce($recent, fn (?array $carry, array $row) =>
        ($carry === null || $row['total'] > $carry['total']) ? $row : $carry, null);
    $coated = array_filter($recent, fn (array $row): bool => (bool) ($row['powderCoat'] ?? false));

    $byTotal = $recent;
    usort($byTotal, fn (array $a, array $b): int => $b['total'] <=> $a['total']);

    return [
        'count'   => $count,
        'sum'     => array_sum($totals),
        'average' => $count ? array_sum($totals) / $count : 0.0,
        'highest' => $highest,
        'coated'  => count($coated),
        'byTotal' => $byTotal,
    ];
}

/** Push onto the front of a list and keep only $max items. */
function push_recent(array $list, array $item, int $max = 5): array
{
    array_unshift($list, $item);
    return array_slice($list, 0, $max);
}

// ---------------------------------------------------------------------------
// Session helpers: flash messages, CSRF, old input
// ---------------------------------------------------------------------------

function flash(string $type, string $message): void
{
    $_SESSION['flash'][] = ['type' => $type, 'message' => $message];
}

/** Read and clear the flash messages (shown once). */
function take_flashes(): array
{
    $messages = $_SESSION['flash'] ?? [];
    unset($_SESSION['flash']);
    return $messages;
}

function csrf_token(): string
{
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf'];
}

function csrf_field(): string
{
    return '<input type="hidden" name="_token" value="' . e(csrf_token()) . '">';
}

function csrf_valid(?string $token): bool
{
    return is_string($token) && isset($_SESSION['csrf']) && hash_equals($_SESSION['csrf'], $token);
}

function redirect(string $to): never
{
    header('Location: ' . $to, true, 303);
    exit;
}

/** Old form value: POST first, then the given fallback array, then default. */
function old(string $key, array $fallback = [], string|int|float $default = ''): string
{
    if (array_key_exists($key, $_POST)) {
        return is_scalar($_POST[$key]) ? (string) $_POST[$key] : '';
    }
    return (string) ($fallback[$key] ?? $default);
}

function selected(bool $condition): string
{
    return $condition ? ' selected' : '';
}

function checked(bool $condition): string
{
    return $condition ? ' checked' : '';
}

/** Bootstrap "is-invalid" class + message for a field. */
function field_error(array $errors, string $field): string
{
    return isset($errors[$field])
        ? '<div class="invalid-feedback d-block">' . e($errors[$field]) . '</div>'
        : '';
}

function invalid(array $errors, string $field): string
{
    return isset($errors[$field]) ? ' is-invalid' : '';
}

function client_ip(): string
{
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    return filter_var($ip, FILTER_VALIDATE_IP) ? $ip : '0.0.0.0';
}
