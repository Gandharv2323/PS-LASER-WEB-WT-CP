<?php
/**
 * Layout partial — included by every page with:  require APP_ROOT . '/templates/header.php';
 * Expects: $pageTitle (string), $activeNav (string). Uses $_SERVER (superglobal).
 */
$pageTitle = $pageTitle ?? APP_NAME;
$activeNav = $activeNav ?? '';
$nav = [
    'estimate' => ['href' => 'index.php',     'label' => 'Instant Estimate'],
    'enquiry'  => ['href' => 'enquiry.php',   'label' => 'Send Drawing'],
    'stats'    => ['href' => 'stats.php',     'label' => 'Estimate Log'],
    'learn'    => ['href' => 'learn-php.php', 'label' => 'How it works'],
];
$flashes = take_flashes();
?><!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title><?= e($pageTitle) ?> | PS Laser</title>
    <meta name="description" content="PS Laser, Pune — instant indicative estimate for CNC laser cutting, bending and powder coating. Send your DXF/DWG drawing for a final quote on WhatsApp.">
    <link rel="icon" href="assets/img/favicon.png">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css" integrity="sha384-TX8t27EcRE3e/ihU7zmQxVncDAy5uIKz4rEkgIXeMed4M0jlfIDPvg6uqKI2xXr2" crossorigin="anonymous">
    <link rel="stylesheet" href="assets/css/app.css?v=<?= e(APP_VERSION) ?>">
</head>
<body>
<div class="topbar d-none d-md-block">
    <div class="container d-flex justify-content-between">
        <span>Gat No. 753, Velu, Tal. Bhor, Pune 412205</span>
        <span><a href="tel:+917719976990">+91 77199 76990</a> &middot; <a href="mailto:pslaser24@gmail.com">pslaser24@gmail.com</a></span>
    </div>
</div>
<nav class="navbar navbar-expand-lg navbar-light bg-white site-nav">
    <div class="container">
        <a class="navbar-brand" href="index.php">
            <img src="assets/img/ps-laser-logo.png" alt="PS Laser" height="44">
        </a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#mainNav" aria-controls="mainNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="mainNav">
            <ul class="navbar-nav ml-auto">
                <?php foreach ($nav as $key => $item): ?>
                    <li class="nav-item<?= $key === $activeNav ? ' active' : '' ?>">
                        <a class="nav-link" href="<?= e($item['href']) ?>"><?= e($item['label']) ?></a>
                    </li>
                <?php endforeach; ?>
            </ul>
            <a class="btn btn-brand ml-lg-3 my-2 my-lg-0" target="_blank" rel="noopener"
               href="<?= e(whatsapp_url('Hi, I would like to get a quotation for CNC laser cutting, bending, powder coating, or fabrication work.')) ?>">
                WhatsApp Quote
            </a>
        </div>
    </div>
</nav>
<header class="page-banner">
    <div class="container">
        <h1><?= e($pageTitle) ?></h1>
        <?php if (!empty($pageLead)): ?><p class="lead mb-0"><?= e($pageLead) ?></p><?php endif; ?>
    </div>
</header>
<main class="container py-4">
    <?php foreach ($flashes as $flash): ?>
        <div class="alert alert-<?= e($flash['type']) ?> alert-dismissible fade show" role="alert">
            <?= $flash['message'] /* flash messages are built by our code with e() already applied */ ?>
            <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        </div>
    <?php endforeach; ?>
