<?php
/**
 * "How this estimator works" — a viva-friendly page about PHP itself:
 * introduction, features, how a PHP script runs, syntax, and a tiny live
 * sample whose output is produced by this very request.
 */

declare(strict_types=1);

require __DIR__ . '/../src/bootstrap.php';

// --- The tiny sample program (shown as source AND executed below) -----------
$sampleSource = <<<'PHP'
<?php
$cutMetres = 1.6;                                  // variable (no type declaration needed)
$rates = ['MS' => 10, 'SS' => 18, 'AL' => 16];     // associative array: code => ₹ per metre

foreach ($rates as $code => $rate) {               // loop
    $cost = $cutMetres * $rate;
    $tag  = $cost > 20 ? 'premium' : 'standard';   // condition (ternary)
    echo "$code cutting: ₹" . number_format($cost, 2) . " ($tag)\n";
}
echo 'Running on PHP ' . PHP_VERSION;              // built-in constant
PHP;

/** The same program as a function, so the page can run it and show the output. */
function run_sample(): string
{
    ob_start();                                       // capture echo output
    $cutMetres = 1.6;
    $rates = ['MS' => 10, 'SS' => 18, 'AL' => 16];
    foreach ($rates as $code => $rate) {
        $cost = $cutMetres * $rate;
        $tag  = $cost > 20 ? 'premium' : 'standard';
        echo "$code cutting: ₹" . number_format($cost, 2) . " ($tag)\n";
    }
    echo 'Running on PHP ' . PHP_VERSION;
    return (string) ob_get_clean();
}

$sampleOutput = run_sample();

// --- Live facts about this request (no phpinfo(): it leaks too much) -------
$extensions = get_loaded_extensions();
sort($extensions, SORT_STRING | SORT_FLAG_CASE);
$facts = [
    'PHP version'              => PHP_VERSION,
    'Server API (SAPI)'        => php_sapi_name(),
    'Operating system family'  => PHP_OS_FAMILY,
    'Web server'               => $_SERVER['SERVER_SOFTWARE'] ?? 'unknown',
    'Loaded extensions'        => count($extensions),
    'pdo_mysql available'      => extension_loaded('pdo_mysql') ? 'yes' : 'no',
    'Request method'           => $_SERVER['REQUEST_METHOD'] ?? 'GET',
    'Script being run'         => basename($_SERVER['SCRIPT_FILENAME'] ?? __FILE__),
    'Page views this session'  => (int) ($_SESSION['views'] ?? 0),
    'Time to build this page'  => sprintf('%.2f ms', (microtime(true) - ($_SERVER['REQUEST_TIME_FLOAT'] ?? microtime(true))) * 1000),
    'Peak memory'              => human_bytes(memory_get_peak_usage(true)),
    'Server time (Asia/Kolkata)' => date('d M Y, h:i:s A'),
];
$keyExtensions = array_values(array_intersect(['Core', 'date', 'fileinfo', 'filter', 'json', 'mbstring', 'openssl', 'pcre', 'PDO', 'pdo_mysql', 'session'], $extensions));

$features = [
    ['Server-side & open source', 'Code runs on the server; the browser only receives the HTML it prints.'],
    ['Embedded in HTML', 'Templates mix <?php ?> blocks with markup — see templates/header.php.'],
    ['Loosely typed, optionally strict', 'declare(strict_types=1) + type hints make helpers safer (src/functions.php).'],
    ['Huge standard library', 'Strings, arrays, files, dates, finfo, filter_var — no Composer needed here.'],
    ['Database support', 'PDO talks to MySQL with prepared statements (src/Database.php).'],
    ['Sessions & cookies built in', 'session_start(), $_SESSION, setcookie() (src/bootstrap.php).'],
    ['Cross-platform', 'Same code on Windows/XAMPP, Linux/Apache or the built-in php -S server.'],
    ['OOP + functional', 'Classes (Estimator, Uploader), closures and arrow functions.'],
];

$pageTitle = 'How This Estimator Works';
$pageLead  = 'A quick tour of PHP for the CS3111 viva — using this very page as the example.';
$activeNav = 'learn';
require APP_ROOT . '/templates/header.php';
?>

<div class="row">
    <div class="col-lg-7 mb-4">
        <h2 class="section-title h5">1. What is PHP?</h2>
        <p>
            PHP (<em>PHP: Hypertext Preprocessor</em>) is a server-side scripting language for building dynamic web pages.
            When you press <strong>Calculate estimate</strong>, PHP code on our server reads your form, looks up the
            rate card in MySQL, does the maths and sends back ordinary HTML. Your browser never sees the PHP code.
        </p>

        <h2 class="section-title h5 mt-4">2. How a PHP script runs</h2>
        <ol class="flow">
            <li><strong>Browser sends a request</strong> — e.g. <code>POST /index.php</code> with the form fields.</li>
            <li><strong>Web server receives it</strong> — Apache (XAMPP) or here the built-in server started with
                <code>php -S localhost:8000 -t public</code>.</li>
            <li><strong>PHP interpreter is invoked</strong> for <code>.php</code> files: it fills the superglobals
                (<code>$_GET</code>, <code>$_POST</code>, <code>$_FILES</code>, <code>$_COOKIE</code>, <code>$_SERVER</code>) and starts the session.</li>
            <li><strong>Zend Engine compiles the script to opcodes</strong> and executes them top to bottom —
                <code>require</code> pulls in config, helpers, classes and layout partials.</li>
            <li><strong>Script talks to MySQL</strong> through PDO prepared statements and writes to the log file.</li>
            <li><strong>Output is buffered and sent</strong> with headers (cookies, redirects, content type) as an HTML response.</li>
            <li><strong>Request ends</strong> — variables are freed; only the session file, cookies, DB rows and log lines persist.</li>
        </ol>

        <h2 class="section-title h5 mt-4">3. Sample code — running live</h2>
        <p class="small text-muted mb-1">Source (highlighted with <code>highlight_string()</code>):</p>
        <div class="php-source"><?= highlight_string($sampleSource, true) /* highlight_string escapes the code itself */ ?></div>
        <p class="small text-muted mb-1 mt-3">Output produced by this request:</p>
        <pre class="code-block"><code><?= e($sampleOutput) ?></code></pre>

        <h2 class="section-title h5 mt-4">4. PHP syntax in one glance</h2>
        <div class="table-responsive">
            <table class="table table-sm small">
                <thead class="thead-light"><tr><th>Syntax</th><th>Example in this project</th></tr></thead>
                <tbody>
                <tr><td>Tags &amp; statements end with <code>;</code></td><td><code>&lt;?php … ?&gt;</code>, short echo <code>&lt;?= e($x) ?&gt;</code> in every template</td></tr>
                <tr><td>Variables start with <code>$</code></td><td><code>$estimate['total']</code></td></tr>
                <tr><td>Constants</td><td><code>const WHATSAPP_NUMBER</code>, <code>define('UPLOAD_DIR', …)</code> in src/config.php</td></tr>
                <tr><td>Strings: single, double, heredoc, nowdoc</td><td>WhatsApp text (double quotes), .txt receipt (heredoc), this sample (nowdoc)</td></tr>
                <tr><td>Conditions</td><td><code>if/elseif/else</code>, <code>switch</code> (upload errors), <code>match</code> (unit conversion)</td></tr>
                <tr><td>Loops</td><td><code>foreach</code> rate bands, <code>for</code> quote-number retry, <code>while</code> reading the log</td></tr>
                <tr><td>Functions</td><td>type hints, default &amp; variadic params, closures, arrow functions — src/functions.php</td></tr>
                <tr><td>Classes &amp; exceptions</td><td><code>Estimator</code>, <code>ValidationException</code>, <code>try/catch/finally</code></td></tr>
                </tbody>
            </table>
        </div>

        <h2 class="section-title h5 mt-4">5. The estimate formula</h2>
        <pre class="code-block"><code>area   = length × width / 1,000,000            (m²)
weight = area × thickness × density             (kg)
material = weight × ₹/kg     cutting = cut metres × ₹/m
piercing = pierces × ₹       bending = bends × ₹8
coating  = area × 2 × ₹120   (if powder coated)
per part = sum   subtotal = per part × qty
GST 18%  total = subtotal + GST</code></pre>
    </div>

    <div class="col-lg-5">
        <div class="card shadow-sm mb-4">
            <div class="card-header brand">This request, right now</div>
            <div class="table-responsive">
                <table class="table table-sm mb-0 small">
                    <?php foreach ($facts as $label => $value): ?>
                        <tr><th class="font-weight-normal text-muted"><?= e($label) ?></th><td><?= e($value) ?></td></tr>
                    <?php endforeach; ?>
                </table>
            </div>
            <div class="card-body small">
                Key extensions used: <?= e(implode(', ', $keyExtensions)) ?>.
            </div>
        </div>

        <div class="card shadow-sm">
            <div class="card-header">Features of PHP</div>
            <ul class="list-group list-group-flush small">
                <?php foreach ($features as [$title, $text]): ?>
                    <li class="list-group-item"><strong><?= e($title) ?></strong><br><?= e($text) ?></li>
                <?php endforeach; ?>
            </ul>
        </div>
    </div>
</div>

<?php require APP_ROOT . '/templates/footer.php';
