<?php
/**
 * Error page rendered by the global set_exception_handler in src/bootstrap.php.
 * Expects $error (Throwable). Details are only shown when APP_DEBUG=1.
 */
$code = http_response_code() ?: 500;
$friendly = match (true) {
    $code === 503 => 'Our database is not reachable right now. Please try again in a minute, or send your drawing on WhatsApp.',
    $code === 404 => 'That page does not exist.',
    $code < 500   => $error->getMessage(),
    default       => 'Something went wrong on our side. Your data was not lost — please try again or message us on WhatsApp.',
};
?><!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Error <?= (int) $code ?> | PS Laser</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css" crossorigin="anonymous">
    <link rel="stylesheet" href="assets/css/app.css">
</head>
<body class="error-page">
<div class="container py-5 text-center">
    <img src="assets/img/ps-laser-logo.png" alt="PS Laser" height="48" class="mb-4">
    <h1 class="display-4 text-brand"><?= (int) $code ?></h1>
    <p class="lead"><?= htmlspecialchars($friendly, ENT_QUOTES, 'UTF-8') ?></p>
    <p>
        <a class="btn btn-brand" href="index.php">Back to the estimator</a>
        <a class="btn btn-outline-success" href="https://wa.me/917719976990" target="_blank" rel="noopener">WhatsApp us</a>
    </p>
    <?php if (defined('APP_DEBUG') && APP_DEBUG): ?>
        <pre class="text-left small bg-light p-3 mt-4"><?= htmlspecialchars($error::class . ': ' . $error->getMessage() . "\n" . $error->getTraceAsString(), ENT_QUOTES, 'UTF-8') ?></pre>
    <?php endif; ?>
</div>
</body>
</html>
