<?php
/**
 * PS Laser — Instant Estimate (front controller for the estimator form).
 *
 * Form handling: POST → validate → calculate → render (or PRG redirect for
 * "save quote" and "clear preferences"). Uses $_POST, $_GET, $_SERVER,
 * $_SESSION and $_COOKIE superglobals.
 */

declare(strict_types=1);

require __DIR__ . '/../src/bootstrap.php';

$repo      = new Repository(Database::pdo());
$estimator = new Estimator($repo);
$log       = new EstimateLog();
$materials = $repo->materials();
$prefs     = preferences();

$errors   = [];
$estimate = null;

// Defaults for a first visit: cookie preferences win over hard-coded defaults.
$defaults = [
    'material'   => $prefs['material'] !== '' ? $prefs['material'] : 'MS',
    'units'      => $prefs['units'],
    'thickness'  => '2',
    'length'     => '500',
    'width'      => '300',
    'cut_length' => '1600',
    'pierces'    => '4',
    'bends'      => '2',
    'quantity'   => '10',
    'powder_coat' => '',
];
// Returning visitor in the same session: show their last inputs instead.
$form = array_merge($defaults, $_SESSION['last_input'] ?? []);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_valid($_POST['_token'] ?? null)) {
        flash('warning', 'Your session had expired, so nothing was submitted. Please try again.');
        redirect('index.php');
    }

    $action = $_POST['action'] ?? 'estimate';

    switch ($action) {
        case 'estimate':
            try {
                $input    = $estimator->parseInput($_POST);
                $estimate = $estimator->calculate($input);

                // Remember the raw inputs (only known keys, as strings) for this session.
                $keep = array_intersect_key($_POST, $defaults);
                $_SESSION['last_input'] = array_map(fn ($v) => is_scalar($v) ? clean_text((string) $v, 30) : '', $keep);
                $_SESSION['last_input']['powder_coat'] = $input['powderCoat'] ? '1' : '';
                $_SESSION['last_estimate'] = $estimate;
                $_SESSION['recent'] = push_recent($_SESSION['recent'] ?? [], [
                    'at'         => date('d M, H:i'),
                    'material'   => $estimate['materialCode'],
                    'thickness'  => $estimate['thicknessMm'],
                    'size'       => sprintf('%g×%g', $estimate['lengthMm'], $estimate['widthMm']),
                    'quantity'   => $estimate['quantity'],
                    'powderCoat' => $estimate['powderCoat'],
                    'total'      => $estimate['total'],
                ]);

                if (!empty($_POST['remember'])) {
                    remember_preferences($estimate['materialCode'], $input['units']);
                }

                $log->append('estimate', [
                    'material'  => $estimate['materialCode'],
                    'thickness' => $estimate['thicknessMm'],
                    'quantity'  => $estimate['quantity'],
                    'total'     => $estimate['total'],
                ]);
            } catch (ValidationException $ex) {
                $errors = $ex->getErrors();
                flash('danger', e($ex->getMessage()));
            } catch (EstimateException $ex) {
                $errors['thickness'] = $ex->getMessage();
                $log->append('no_rate', ['material' => $ex->getContext()]);
            }
            break;

        case 'save_quote':
            $last = $_SESSION['last_estimate'] ?? null;
            if ($last === null) {
                flash('warning', 'Calculate an estimate first, then save it.');
                redirect('index.php');
            }
            if (!empty($last['quoteNo'])) {           // double-click / refresh guard
                flash('info', 'This estimate is already saved as <strong>' . e($last['quoteNo']) . '</strong>.');
                redirect('index.php?show=last#result');
            }
            $name  = person_name((string) ($_POST['customer_name'] ?? ''));
            $phone = normalize_phone((string) ($_POST['customer_phone'] ?? ''));
            if ($phone !== '' && !is_indian_mobile($phone)) {
                flash('danger', 'Please enter a 10-digit Indian mobile number (or leave it blank).');
                redirect('index.php?show=last#result');
            }

            $pdo = Database::pdo();
            $saved = false;
            try {
                $pdo->beginTransaction();
                $quoteNo = $repo->insertQuote($last, $name ?: null, $phone ?: null);
                $pdo->commit();
                $saved = true;
            } catch (PDOException $ex) {
                if ($pdo->inTransaction()) {
                    $pdo->rollBack();
                }
                throw new RuntimeException('Could not save the quote: ' . $ex->getMessage(), 500, $ex);
            } finally {
                // Runs on success AND failure — the log records both outcomes.
                $log->append($saved ? 'quote_saved' : 'quote_failed', [
                    'material'  => $last['materialCode'],
                    'thickness' => $last['thicknessMm'],
                    'quantity'  => $last['quantity'],
                    'total'     => $last['total'],
                ]);
            }

            $_SESSION['last_estimate']['quoteNo'] = $quoteNo;
            session_regenerate_id(true);      // the visitor now "owns" a saved quote
            $wa = whatsapp_url(estimate_whatsapp_text($_SESSION['last_estimate']));
            flash('success', sprintf(
                'Saved as <strong>%s</strong>. <a href="%s" target="_blank" rel="noopener" class="alert-link">Send it on WhatsApp</a> to get the final price.',
                e($quoteNo),
                e($wa)
            ));
            redirect('index.php?show=last#result');

        case 'clear_prefs':
            clear_preferences();
            unset($_SESSION['last_input']);
            flash('info', 'Your saved material and unit preferences were cleared.');
            redirect('index.php');

        case 'clear_recent':
            $_SESSION['recent'] = [];
            flash('info', 'Recent estimates cleared for this session.');
            redirect('index.php');

        default:
            flash('warning', 'Unknown action.');
            redirect('index.php');
    }
}

if (($_GET['show'] ?? '') === 'last') {
    $estimate = $_SESSION['last_estimate'] ?? null;
}

$recent      = $_SESSION['recent'] ?? [];
$unitLabel   = old('units', $form) === 'in' ? 'in' : 'mm';
$materialMax = array_column($materials, 'max_thickness_mm', 'code');   // code => max

$pageTitle = 'Instant Laser Cutting Estimate';
$pageLead  = 'Get an indicative price for CNC laser cut parts in seconds — then send it to us on WhatsApp for the final quote.';
$activeNav = 'estimate';
require APP_ROOT . '/templates/header.php';
?>

<div class="alert sample-banner" role="note">
    <strong>Indicative estimate — sample rates.</strong>
    Final quote on WhatsApp after we check your drawing, nesting and current material prices.
</div>

<div class="row">
    <div class="col-lg-7 mb-4">
        <div class="card shadow-sm">
            <div class="card-header brand">Part details</div>
            <div class="card-body">
                <form method="post" action="index.php#result" novalidate id="estimateForm">
                    <?= csrf_field() ?>
                    <input type="hidden" name="action" value="estimate">

                    <div class="form-row">
                        <div class="form-group col-sm-6">
                            <label for="material">Material</label>
                            <select class="custom-select<?= invalid($errors, 'material') ?>" id="material" name="material" required>
                                <?php foreach ($materials as $m): ?>
                                    <option value="<?= e($m['code']) ?>" data-max="<?= e((float) $m['max_thickness_mm']) ?>"<?= selected(old('material', $form) === $m['code']) ?>>
                                        <?= e($m['name']) ?> (<?= e($m['code']) ?>) — up to <?= e((float) $m['max_thickness_mm']) ?> mm
                                    </option>
                                <?php endforeach; ?>
                            </select>
                            <?= field_error($errors, 'material') ?>
                        </div>
                        <div class="form-group col-sm-6">
                            <label for="thickness">Sheet thickness (mm)</label>
                            <input type="number" step="0.01" min="0.5" class="form-control<?= invalid($errors, 'thickness') ?>"
                                   id="thickness" name="thickness" value="<?= e(old('thickness', $form)) ?>" required>
                            <small class="form-text text-muted" id="thicknessHelp">Max <?= e((float) ($materialMax[old('material', $form)] ?? 16)) ?> mm for this material.</small>
                            <?= field_error($errors, 'thickness') ?>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="d-block">Units for size &amp; cut length</label>
                        <?php foreach (['mm' => 'Millimetres', 'in' => 'Inches'] as $value => $label): ?>
                            <div class="custom-control custom-radio custom-control-inline">
                                <input type="radio" id="units-<?= e($value) ?>" name="units" value="<?= e($value) ?>" class="custom-control-input"<?= checked($unitLabel === $value) ?>>
                                <label class="custom-control-label" for="units-<?= e($value) ?>"><?= e($label) ?></label>
                            </div>
                        <?php endforeach; ?>
                    </div>

                    <div class="form-row">
                        <?php
                        // A loop over a multidimensional array builds the three size inputs.
                        $sizeFields = [
                            ['name' => 'length',     'label' => 'Part length',      'help' => 'Bounding box, max 3000 mm'],
                            ['name' => 'width',      'label' => 'Part width',       'help' => 'Bounding box, max 1500 mm'],
                            ['name' => 'cut_length', 'label' => 'Total cut length', 'help' => 'Outer profile + all holes'],
                        ];
                        foreach ($sizeFields as $f): ?>
                            <div class="form-group col-sm-4">
                                <label for="<?= e($f['name']) ?>"><?= e($f['label']) ?> (<span class="unit"><?= e($unitLabel) ?></span>)</label>
                                <input type="number" step="any" min="0" class="form-control<?= invalid($errors, $f['name']) ?>"
                                       id="<?= e($f['name']) ?>" name="<?= e($f['name']) ?>" value="<?= e(old($f['name'], $form)) ?>" required>
                                <small class="form-text text-muted"><?= e($f['help']) ?></small>
                                <?= field_error($errors, $f['name']) ?>
                            </div>
                        <?php endforeach; ?>
                    </div>

                    <div class="form-row">
                        <div class="form-group col-4">
                            <label for="pierces">Pierces</label>
                            <input type="number" min="0" step="1" class="form-control<?= invalid($errors, 'pierces') ?>" id="pierces" name="pierces" value="<?= e(old('pierces', $form)) ?>">
                            <?= field_error($errors, 'pierces') ?>
                        </div>
                        <div class="form-group col-4">
                            <label for="bends">Bends</label>
                            <input type="number" min="0" step="1" class="form-control<?= invalid($errors, 'bends') ?>" id="bends" name="bends" value="<?= e(old('bends', $form)) ?>">
                            <?= field_error($errors, 'bends') ?>
                        </div>
                        <div class="form-group col-4">
                            <label for="quantity">Quantity</label>
                            <input type="number" min="1" step="1" class="form-control<?= invalid($errors, 'quantity') ?>" id="quantity" name="quantity" value="<?= e(old('quantity', $form)) ?>">
                            <?= field_error($errors, 'quantity') ?>
                        </div>
                    </div>

                    <div class="custom-control custom-checkbox mb-2">
                        <input type="checkbox" class="custom-control-input" id="powder_coat" name="powder_coat" value="1"<?= checked($_SERVER['REQUEST_METHOD'] === 'POST' ? isset($_POST['powder_coat']) : ($form['powder_coat'] ?? '') !== '') ?>>
                        <label class="custom-control-label" for="powder_coat">Powder coat both sides</label>
                    </div>
                    <div class="custom-control custom-checkbox mb-3">
                        <input type="checkbox" class="custom-control-input" id="remember" name="remember" value="1"<?= checked(isset($_COOKIE['pref_material'])) ?>>
                        <label class="custom-control-label" for="remember">Remember my material &amp; units on this device (30-day cookie)</label>
                    </div>

                    <button type="submit" class="btn btn-brand btn-lg btn-block">Calculate estimate</button>
                </form>
            </div>
        </div>
    </div>

    <div class="col-lg-5">
        <?php if ($estimate !== null):
            $rows = breakdown_rows($estimate['breakdown'], $estimate['perPart']);
            $waText = estimate_whatsapp_text($estimate);
        ?>
            <div class="card shadow-sm mb-4" id="result">
                <div class="card-header brand d-flex justify-content-between align-items-center">
                    <span>Your estimate<?= !empty($estimate['quoteNo']) ? ' · ' . e($estimate['quoteNo']) : '' ?></span>
                    <span class="badge badge-light"><?= e($estimate['isSample'] ? 'SAMPLE RATES' : 'LIVE RATES') ?></span>
                </div>
                <div class="card-body p-0">
                    <p class="px-3 pt-3 mb-2 small text-muted">
                        <?= e($estimate['materialName']) ?> <?= e($estimate['thicknessMm']) ?> mm ·
                        <?= e($estimate['lengthMm']) ?> × <?= e($estimate['widthMm']) ?> mm ·
                        area <?= e($estimate['areaM2']) ?> m² · weight <?= e($estimate['weightKg']) ?> kg each
                    </p>
                    <div class="table-responsive">
                        <table class="table table-sm mb-0">
                            <thead class="thead-light"><tr><th>Per part</th><th class="money">₹</th><th class="money">%</th></tr></thead>
                            <tbody>
                            <?php foreach ($rows as $row): ?>
                                <tr<?= $row['amount'] == 0 ? ' class="text-muted"' : '' ?>>
                                    <td><?= e($row['label']) ?></td>
                                    <td class="money"><?= e(inr($row['amount'], false)) ?></td>
                                    <td class="money"><?= e($row['share']) ?></td>
                                </tr>
                            <?php endforeach; ?>
                            <tr class="font-weight-bold"><td>Price per part</td><td class="money"><?= e(inr($estimate['perPart'], false)) ?></td><td></td></tr>
                            <tr><td>× Quantity</td><td class="money"><?= e($estimate['quantity']) ?></td><td></td></tr>
                            <tr><td>Subtotal</td><td class="money"><?= e(inr($estimate['subtotal'], false)) ?></td><td></td></tr>
                            <tr><td>GST @ <?= e($estimate['gstPercent']) ?>%</td><td class="money"><?= e(inr($estimate['gst'], false)) ?></td><td></td></tr>
                            <tr class="total-row"><th>Total (incl. GST)</th><td class="money" id="estimateTotal"><?= e(inr($estimate['total'])) ?></td><td></td></tr>
                            </tbody>
                        </table>
                    </div>
                    <p class="px-3 pt-2 small text-muted mb-2">
                        Rate band <?= e($estimate['rate']['thickness_from_mm']) ?>–<?= e($estimate['rate']['thickness_to_mm']) ?> mm:
                        cut ₹<?= e($estimate['rate']['cut_rate_per_m']) ?>/m, pierce ₹<?= e($estimate['rate']['pierce_rate']) ?>,
                        material ₹<?= e($estimate['rate']['material_rate_per_kg']) ?>/kg.
                    </p>
                </div>
                <div class="card-footer bg-white">
                    <a class="btn btn-whatsapp btn-block mb-2" target="_blank" rel="noopener" href="<?= e(whatsapp_url($waText)) ?>">
                        Send this estimate on WhatsApp
                    </a>
                    <div class="d-flex mb-3">
                        <a class="btn btn-outline-secondary btn-sm flex-fill mr-1" href="download.php?format=txt">Download .txt</a>
                        <a class="btn btn-outline-secondary btn-sm flex-fill ml-1" href="download.php?format=csv">Download .csv</a>
                    </div>
                    <?php if (empty($estimate['quoteNo'])): ?>
                        <form method="post" action="index.php">
                            <?= csrf_field() ?>
                            <input type="hidden" name="action" value="save_quote">
                            <div class="form-row">
                                <div class="col-6 mb-2"><input class="form-control form-control-sm" name="customer_name" placeholder="Your name (optional)" maxlength="120"></div>
                                <div class="col-6 mb-2"><input class="form-control form-control-sm" name="customer_phone" placeholder="Mobile (optional)" inputmode="tel" maxlength="16"></div>
                            </div>
                            <button class="btn btn-outline-dark btn-sm btn-block" type="submit">Save quote &amp; get a reference number</button>
                        </form>
                    <?php endif; ?>
                </div>
            </div>
        <?php else: ?>
            <div class="card shadow-sm mb-4">
                <div class="card-body">
                    <h2 class="section-title h5">How the estimate is built</h2>
                    <ol class="small pl-3 mb-0">
                        <li>Sheet weight = length × width × thickness × density.</li>
                        <li>Material = weight × ₹/kg for your thickness band.</li>
                        <li>Cutting = metres of cut × ₹/m; piercing = starts × ₹/pierce.</li>
                        <li>Bending ₹ per bend; powder coat ₹ per m² (both sides).</li>
                        <li>× quantity, + GST.</li>
                    </ol>
                </div>
            </div>
        <?php endif; ?>

        <div class="card shadow-sm mb-4">
            <div class="card-header d-flex justify-content-between align-items-center">
                <span>Recent estimates (this session)</span>
                <?php if ($recent): ?>
                    <form method="post" action="index.php" class="m-0">
                        <?= csrf_field() ?><input type="hidden" name="action" value="clear_recent">
                        <button class="btn btn-link btn-sm p-0">clear</button>
                    </form>
                <?php endif; ?>
            </div>
            <ul class="list-group list-group-flush">
                <?php if (!$recent): ?>
                    <li class="list-group-item small text-muted">No estimates yet — they are kept in your PHP session.</li>
                <?php endif; ?>
                <?php foreach ($recent as $i => $r): ?>
                    <li class="list-group-item d-flex justify-content-between small">
                        <span><?= $i + 1 ?>. <?= e($r['material']) ?> <?= e($r['thickness']) ?> mm · <?= e($r['size']) ?> · qty <?= e($r['quantity']) ?></span>
                        <strong><?= e(inr($r['total'])) ?></strong>
                    </li>
                <?php endforeach; ?>
            </ul>
        </div>

        <div class="card shadow-sm">
            <div class="card-body small">
                <strong>Saved preferences (cookie):</strong>
                <?= $prefs['material'] !== ''
                    ? e($prefs['material']) . ', ' . e($prefs['units'])
                    : '<span class="text-muted">none</span>' ?>
                <form method="post" action="index.php" class="d-inline ml-2">
                    <?= csrf_field() ?><input type="hidden" name="action" value="clear_prefs">
                    <button class="btn btn-sm btn-outline-secondary">Clear preferences</button>
                </form>
            </div>
        </div>
    </div>
</div>

<?php
// Small jQuery enhancement: update unit labels and the max-thickness hint.
$pageScript = <<<'JS'
$(function () {
  function syncMax() {
    var max = $('#material option:selected').data('max');
    $('#thickness').attr('max', max);
    $('#thicknessHelp').text('Max ' + max + ' mm for this material.');
  }
  $('#material').on('change', syncMax);
  $('input[name="units"]').on('change', function () { $('.unit').text(this.value); });
  syncMax();
});
JS;
require APP_ROOT . '/templates/footer.php';
