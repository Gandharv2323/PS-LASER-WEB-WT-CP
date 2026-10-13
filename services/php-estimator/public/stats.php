<?php
/**
 * Estimate log & stats — reads the tail of storage/logs/estimates.log
 * (file handling) and summarises it with array functions
 * (array_column, array_count_values, array_filter, array_sum, arsort).
 * Also shows a few MySQL counts and this session's recent estimates.
 */

declare(strict_types=1);

require __DIR__ . '/../src/bootstrap.php';

$log     = new EstimateLog();
$entries = $log->tail(25);

// Only the ESTIMATE events carry a material + total.
$estimates = array_values(array_filter($entries, fn (array $row) => $row['event'] === 'ESTIMATE'));
$byMaterial = array_count_values(array_column($estimates, 'material'));
arsort($byMaterial);
$totals = array_map('floatval', array_column($estimates, 'total'));
$avg = $totals ? array_sum($totals) / count($totals) : 0.0;

// DB counts are optional on this page: if MySQL is down we still show the log.
$counts = null;
$latest = [];
try {
    $repo = new Repository(Database::pdo());
    $counts = $repo->counts();
    $latest = $repo->latestQuotes(5);
} catch (RuntimeException | PDOException $ex) {
    $dbError = $ex->getMessage();
}

$session = summarize_estimates($_SESSION['recent'] ?? []);

$pageTitle = 'Estimate Log & Stats';
$pageLead  = 'Last entries of storage/logs/estimates.log, read with fopen / flock / fgets.';
$activeNav = 'stats';
require APP_ROOT . '/templates/header.php';

$tiles = [
    ['label' => 'Log lines',             'value' => number_format($log->lineCount())],
    ['label' => 'Log file size',         'value' => human_bytes($log->sizeBytes())],
    ['label' => 'Quotes saved (PHP)',    'value' => $counts ? number_format($counts['quotes']) : '—'],
    ['label' => 'Enquiries (PHP)',       'value' => $counts ? number_format($counts['enquiries']) : '—'],
];
?>

<div class="row">
    <?php foreach ($tiles as $tile): ?>
        <div class="col-6 col-md-3 mb-3">
            <div class="card stat-tile h-100"><div class="card-body p-3">
                <div class="num"><?= e($tile['value']) ?></div>
                <div class="small text-muted"><?= e($tile['label']) ?></div>
            </div></div>
        </div>
    <?php endforeach; ?>
</div>

<?php if (!empty($dbError)): ?>
    <div class="alert alert-warning">Database not reachable — showing the log file only. (<?= e($dbError) ?>)</div>
<?php endif; ?>

<div class="row">
    <div class="col-lg-8 mb-4">
        <h2 class="section-title h5">Latest log entries</h2>
        <div class="table-responsive">
            <table class="table table-sm table-striped small">
                <thead class="thead-dark"><tr><th>Time</th><th>Event</th><th>Material</th><th class="money">mm</th><th class="money">Qty</th><th class="money">Total ₹</th></tr></thead>
                <tbody>
                <?php if (!$entries): ?>
                    <tr><td colspan="6" class="text-muted">The log is empty — make an estimate first.</td></tr>
                <?php endif; ?>
                <?php foreach ($entries as $row): ?>
                    <tr>
                        <td><?= e(date('d M H:i:s', strtotime($row['time']) ?: time())) ?></td>
                        <td><span class="badge badge-<?= $row['event'] === 'ESTIMATE' ? 'warning' : ($row['event'] === 'QUOTE_SAVED' ? 'success' : 'secondary') ?>"><?= e($row['event']) ?></span></td>
                        <td><?= e($row['material']) ?></td>
                        <td class="money"><?= e($row['thickness']) ?></td>
                        <td class="money"><?= e($row['quantity']) ?></td>
                        <td class="money"><?= e($row['total'] === '-' ? '-' : inr((float) $row['total'], false)) ?></td>
                    </tr>
                <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>

    <div class="col-lg-4">
        <div class="card shadow-sm mb-4">
            <div class="card-header">Estimates in the log tail</div>
            <div class="card-body small">
                <p class="mb-2">Average total: <strong><?= e(inr($avg)) ?></strong> over <?= count($totals) ?> estimates.</p>
                <?php if ($byMaterial): ?>
                    <?php $max = max($byMaterial); ?>
                    <?php foreach ($byMaterial as $code => $n): ?>
                        <div class="d-flex align-items-center mb-1">
                            <span style="width:40px"><?= e($code) ?></span>
                            <div class="progress flex-fill" style="height:10px">
                                <div class="progress-bar" style="width:<?= (int) round($n / $max * 100) ?>%;background:#EF7D00"></div>
                            </div>
                            <span class="ml-2"><?= (int) $n ?></span>
                        </div>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>
        </div>

        <div class="card shadow-sm mb-4">
            <div class="card-header">Your session (<?= (int) ($_SESSION['views'] ?? 0) ?> page views)</div>
            <div class="card-body small">
                <?php if ($session['count'] === 0): ?>
                    <span class="text-muted">No estimates in this session yet.</span>
                <?php else: ?>
                    <p class="mb-1"><?= $session['count'] ?> estimates, total <?= e(inr($session['sum'])) ?>, <?= $session['coated'] ?> powder coated.</p>
                    <p class="mb-1">Largest: <?= e($session['highest']['material']) ?> <?= e($session['highest']['thickness']) ?> mm × <?= e($session['highest']['quantity']) ?> = <?= e(inr($session['highest']['total'])) ?></p>
                    <p class="mb-0 text-muted">Sorted by value (usort): <?= e(implode(' > ', array_map(fn ($r) => inr($r['total'], false), $session['byTotal']))) ?></p>
                <?php endif; ?>
            </div>
        </div>

        <?php if ($latest): ?>
            <div class="card shadow-sm">
                <div class="card-header">Latest saved quotes (MySQL)</div>
                <ul class="list-group list-group-flush small">
                    <?php foreach ($latest as $q): ?>
                        <li class="list-group-item d-flex justify-content-between">
                            <span><?= e($q['quote_no']) ?> · <?= e($q['material_code']) ?> <?= e((float) $q['thickness_mm']) ?> mm × <?= e($q['quantity']) ?></span>
                            <strong><?= e(inr((float) $q['amount_inr'], false)) ?></strong>
                        </li>
                    <?php endforeach; ?>
                </ul>
            </div>
        <?php endif; ?>
    </div>
</div>

<?php require APP_ROOT . '/templates/footer.php';
