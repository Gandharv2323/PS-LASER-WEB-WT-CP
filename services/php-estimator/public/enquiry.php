<?php
/**
 * Enquiry + drawing upload (Unit I: form handling, e-mail validation,
 * file upload handling, MySQL with PHP, try/catch/finally, sessions).
 *
 * POST/Redirect/GET: a successful submit stores a flash message in the
 * session and redirects, so refreshing the page never submits twice.
 */

declare(strict_types=1);

require __DIR__ . '/../src/bootstrap.php';

$pdo      = Database::pdo();
$repo     = new Repository($pdo);
$services = $repo->services();
$slugs    = array_column($services, 'slug');
$uploader = new Uploader();
$log      = new EstimateLog();

$errors = [];
$prefill = [
    'service' => in_array($_GET['service'] ?? '', $slugs, true) ? $_GET['service'] : '',
    // If the visitor just made an estimate, offer it as the message.
    'message' => isset($_SESSION['last_estimate'])
        ? "Please quote for the part I estimated online:\n" . estimate_whatsapp_text($_SESSION['last_estimate'])
        : '',
];

/**
 * Validate the enquiry form. Returns clean data or throws ValidationException.
 */
function validate_enquiry(array $post, array $allowedSlugs): array
{
    $errors = [];

    $name = person_name((string) ($post['name'] ?? ''));
    if ($name === '') {
        $errors['name'] = 'Please tell us your name.';
    } elseif (!preg_match("/^[\\p{L} .'\\-]{2,120}$/u", $name)) {
        $errors['name'] = 'Name can contain letters, spaces, dots and hyphens only.';
    }

    $phone = normalize_phone((string) ($post['phone'] ?? ''));
    if (!is_indian_mobile($phone)) {
        $errors['phone'] = 'Enter a 10-digit Indian mobile number (starting 6–9), e.g. 77199 76990.';
    }

    $email = strtolower(trim((string) ($post['email'] ?? '')));
    if ($email !== '' && ($emailError = validate_email($email, EMAIL_MX_CHECK)) !== null) {
        $errors['email'] = $emailError;
    }

    $service = (string) ($post['service'] ?? '');
    if ($service !== '' && !in_array($service, $allowedSlugs, true)) {
        $errors['service'] = 'Please pick a service from the list.';
    }

    $message = clean_text((string) ($post['message'] ?? ''), 2000);
    $length = mb_strlen($message);
    if ($length < 10) {
        $errors['message'] = 'Please describe the job in at least 10 characters (material, thickness, quantity…).';
    }

    if ($errors) {
        throw new ValidationException($errors);
    }
    return compact('name', 'phone', 'email', 'service', 'message');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // A POST larger than post_max_size arrives with EMPTY $_POST and $_FILES.
    if (empty($_POST) && (int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 0) {
        flash('danger', 'The upload was too large. Drawings must be 10 MB or smaller.');
        redirect('enquiry.php');
    }
    if (!csrf_valid($_POST['_token'] ?? null)) {
        flash('warning', 'Your session had expired, so nothing was sent. Please submit again.');
        redirect('enquiry.php');
    }

    $stored = null;
    try {
        $data = validate_enquiry($_POST, $slugs);

        // Validate the optional drawing BEFORE touching the database.
        $fileMeta = null;
        if (Uploader::hasFile($_FILES['drawing'] ?? null)) {
            try {
                $fileMeta = $uploader->validate($_FILES['drawing']);
            } catch (UploadException $ex) {
                throw new ValidationException(['drawing' => $ex->getMessage()]);
            }
        }

        $pdo->beginTransaction();
        $enquiryId = $repo->insertEnquiry($data);
        if ($fileMeta !== null) {
            $stored = $uploader->store($fileMeta);
            $repo->insertUpload($enquiryId, $stored);
        }
        $pdo->commit();

        $log->append('enquiry', ['material' => $data['service'] ?: 'general', 'quantity' => $stored ? 1 : 0]);
        $_SESSION['enquiries'][] = $enquiryId;
        session_regenerate_id(true);

        $wa = whatsapp_url(sprintf(
            "Hi PS Laser, I sent enquiry #%d from your website (%s, %s).%s",
            $enquiryId,
            $data['name'],
            $data['phone'],
            $stored ? ' Drawing: ' . $stored['original'] : ''
        ));
        flash('success', sprintf(
            'Thank you, %s! Enquiry <strong>#%d</strong> received%s. We usually reply the same working day. '
            . '<a class="alert-link" href="%s" target="_blank" rel="noopener">Ping us on WhatsApp</a> for a faster reply.',
            e($data['name']),
            $enquiryId,
            $stored ? ' with drawing <em>' . e($stored['original']) . '</em> (' . e(human_bytes($stored['size'])) . ')' : '',
            e($wa)
        ));
        redirect('enquiry.php');
    } catch (ValidationException $ex) {
        $errors = $ex->getErrors();
    } catch (PDOException | UploadException $ex) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        // Remove an orphan file if the DB insert failed after the move.
        if ($stored !== null && is_file($stored['abs'])) {
            unlink($stored['abs']);
        }
        error_log('[php-estimator] enquiry failed: ' . $ex->getMessage());
        $errors['form'] = $ex instanceof UploadException
            ? $ex->getMessage()
            : 'We could not save your enquiry right now. Please WhatsApp us on +91 77199 76990.';
    } finally {
        if ($errors) {
            $log->append('enquiry_rejected', ['material' => implode(',', array_keys($errors))]);
        }
    }
}

$pageTitle = 'Send Your Drawing';
$pageLead  = 'Share your DXF / DWG / PDF and job details — we reply with a firm quotation, usually the same working day.';
$activeNav = 'enquiry';
require APP_ROOT . '/templates/header.php';
?>

<div class="row">
    <div class="col-lg-8 mb-4">
        <?php if ($errors): ?>
            <div class="alert alert-danger" role="alert">
                <strong>Please check the form:</strong>
                <ul class="mb-0">
                    <?php foreach ($errors as $message): ?><li><?= e($message) ?></li><?php endforeach; ?>
                </ul>
            </div>
        <?php endif; ?>

        <div class="card shadow-sm">
            <div class="card-header brand">Enquiry details</div>
            <div class="card-body">
                <form method="post" action="enquiry.php" enctype="multipart/form-data" novalidate>
                    <?= csrf_field() ?>
                    <input type="hidden" name="MAX_FILE_SIZE" value="<?= UPLOAD_MAX_BYTES ?>">

                    <div class="form-row">
                        <div class="form-group col-md-6">
                            <label for="name">Your name *</label>
                            <input class="form-control<?= invalid($errors, 'name') ?>" id="name" name="name" maxlength="120" autocomplete="name" value="<?= e(old('name')) ?>" required>
                            <?= field_error($errors, 'name') ?>
                        </div>
                        <div class="form-group col-md-6">
                            <label for="phone">Mobile / WhatsApp *</label>
                            <input class="form-control<?= invalid($errors, 'phone') ?>" id="phone" name="phone" inputmode="tel" maxlength="16" autocomplete="tel" placeholder="98XXXXXXXX" value="<?= e(old('phone')) ?>" required>
                            <?= field_error($errors, 'phone') ?>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group col-md-6">
                            <label for="email">E-mail <span class="text-muted">(optional)</span></label>
                            <input type="email" class="form-control<?= invalid($errors, 'email') ?>" id="email" name="email" maxlength="190" autocomplete="email" value="<?= e(old('email')) ?>">
                            <?= field_error($errors, 'email') ?>
                        </div>
                        <div class="form-group col-md-6">
                            <label for="service">Service</label>
                            <select class="custom-select<?= invalid($errors, 'service') ?>" id="service" name="service">
                                <option value="">— Choose a service —</option>
                                <?php foreach ($services as $s): ?>
                                    <option value="<?= e($s['slug']) ?>"<?= selected(old('service', $prefill) === $s['slug']) ?>><?= e($s['title']) ?></option>
                                <?php endforeach; ?>
                            </select>
                            <?= field_error($errors, 'service') ?>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="message">Job details *</label>
                        <textarea class="form-control<?= invalid($errors, 'message') ?>" id="message" name="message" rows="6" maxlength="2000"
                                  placeholder="Material & thickness, quantity, finish (powder coat colour), delivery date…" required><?= e(old('message', $prefill)) ?></textarea>
                        <?= field_error($errors, 'message') ?>
                    </div>

                    <div class="form-group">
                        <label for="drawing">Drawing <span class="text-muted">(optional — DXF, DWG, PDF, PNG or JPG, max 10 MB)</span></label>
                        <div class="custom-file">
                            <input type="file" class="custom-file-input<?= invalid($errors, 'drawing') ?>" id="drawing" name="drawing" accept=".dxf,.dwg,.pdf,.png,.jpg,.jpeg">
                            <label class="custom-file-label" for="drawing">Choose file…</label>
                        </div>
                        <?= field_error($errors, 'drawing') ?>
                        <small class="form-text text-muted">Files are stored privately on our server with a random name and are never published.</small>
                    </div>

                    <button type="submit" class="btn btn-brand btn-lg">Send enquiry</button>
                </form>
            </div>
        </div>
    </div>

    <div class="col-lg-4">
        <div class="card shadow-sm mb-4">
            <div class="card-body">
                <h2 class="section-title h5">Prefer WhatsApp?</h2>
                <p class="small">Send your drawing straight to our team — it is the fastest way to get a quote.</p>
                <a class="btn btn-whatsapp btn-block" target="_blank" rel="noopener"
                   href="<?= e(whatsapp_url('Hi, I would like to get a quotation for CNC laser cutting, bending, powder coating, or fabrication work.')) ?>">WhatsApp +91 77199 76990</a>
            </div>
        </div>
        <div class="card shadow-sm">
            <div class="card-body small">
                <h2 class="section-title h6">What we can make</h2>
                <ul class="pl-3 mb-0">
                    <li>Fiber laser cutting — MS 16 mm, SS 12 mm, Al 8 mm, brass &amp; copper 4 mm, bed 3 × 1.5 m</li>
                    <li>CNC bending — 175 T × 3 m press brake</li>
                    <li>CNC turret punching — Amada 32 T &amp; 16 T</li>
                    <li>Laser welding, fabrication &amp; PLC powder coating</li>
                </ul>
            </div>
        </div>
    </div>
</div>

<?php
$pageScript = <<<'JS'
$(function () {
  $('#drawing').on('change', function () {
    var name = this.files && this.files[0] ? this.files[0].name : 'Choose file…';
    $(this).next('.custom-file-label').text(name);
  });
});
JS;
require APP_ROOT . '/templates/footer.php';
