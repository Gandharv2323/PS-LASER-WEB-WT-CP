<?php
/**
 * "Download my estimate" — generates a .txt or .csv file on the fly.
 *
 * File handling (Unit I): nothing is written to disk; the file is streamed to
 * the browser through the php://output stream with download headers
 * (Content-Type + Content-Disposition). Data comes from $_SESSION, so each
 * visitor can only download their own last estimate.
 */

declare(strict_types=1);

require __DIR__ . '/../src/bootstrap.php';

$estimate = $_SESSION['last_estimate'] ?? null;
if ($estimate === null) {
    flash('warning', 'There is no estimate to download yet — calculate one first.');
    redirect('index.php');
}

$format = strtolower((string) ($_GET['format'] ?? 'txt'));
if (!in_array($format, ['txt', 'csv'], true)) {
    http_response_code(400);
    exit('Unsupported format. Use ?format=txt or ?format=csv');
}

$ref = $estimate['quoteNo'] ?? ('estimate-' . date('Ymd-His'));
$filename = preg_replace('/[^A-Za-z0-9\-]/', '', $ref) . '.' . $format;

(new EstimateLog())->append('download_' . $format, [
    'material' => $estimate['materialCode'],
    'thickness' => $estimate['thicknessMm'],
    'quantity' => $estimate['quantity'],
    'total' => $estimate['total'],
]);

header('Content-Type: ' . ($format === 'csv' ? 'text/csv' : 'text/plain') . '; charset=utf-8');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Cache-Control: no-store');

$out = fopen('php://output', 'wb');

if ($format === 'csv') {
    fwrite($out, "\xEF\xBB\xBF");                  // UTF-8 BOM so Excel shows ₹/× correctly
    fputcsv($out, ['Field', 'Value']);
    $pairs = [
        'Reference'       => $ref,
        'Material'        => $estimate['materialName'] . ' (' . $estimate['materialCode'] . ')',
        'Thickness (mm)'  => $estimate['thicknessMm'],
        'Length (mm)'     => $estimate['lengthMm'],
        'Width (mm)'      => $estimate['widthMm'],
        'Cut length (mm)' => $estimate['cutLengthMm'],
        'Pierces'         => $estimate['pierces'],
        'Bends'           => $estimate['bends'],
        'Powder coat'     => $estimate['powderCoat'] ? 'Yes' : 'No',
        'Quantity'        => $estimate['quantity'],
    ];
    foreach ($estimate['breakdown'] as $key => $value) {
        $pairs['Per part - ' . ucfirst($key)] = amount($value);
    }
    $pairs += [
        'Per part'       => amount($estimate['perPart']),
        'Subtotal'       => amount($estimate['subtotal']),
        'GST ' . $estimate['gstPercent'] . '%' => amount($estimate['gst']),
        'Total INR'      => amount($estimate['total']),
        'Note'           => 'Indicative estimate - sample rates. Final quote on WhatsApp +91 77199 76990.',
    ];
    foreach ($pairs as $field => $value) {
        fputcsv($out, [$field, $value]);
    }
} else {
    // Plain-text receipt built with a heredoc and str_pad for aligned columns.
    $line = str_repeat('-', 46);
    $rows = '';
    foreach ($estimate['breakdown'] as $key => $value) {
        $rows .= str_pad(ucfirst($key), 30) . str_pad(amount($value), 16, ' ', STR_PAD_LEFT) . PHP_EOL;
    }
    $coat = $estimate['powderCoat'] ? 'Yes' : 'No';
    $perPart  = str_pad(amount($estimate['perPart']), 16, ' ', STR_PAD_LEFT);
    $subtotal = str_pad(amount($estimate['subtotal']), 16, ' ', STR_PAD_LEFT);
    $gst      = str_pad(amount($estimate['gst']), 16, ' ', STR_PAD_LEFT);
    $total    = str_pad(amount($estimate['total']), 16, ' ', STR_PAD_LEFT);
    $gstLabel = str_pad('GST @ ' . $estimate['gstPercent'] . '%', 30);
    $date     = date('d M Y, h:i A');
    $material = strtoupper($estimate['materialName']);

    $text = <<<TXT
    PS LASER - INDICATIVE ESTIMATE
    Gat No. 753, Velu, Tal. Bhor, Pune 412205
    WhatsApp +91 77199 76990 | pslaser24@gmail.com
    {$line}
    Reference : {$ref}
    Date      : {$date}
    Material  : {$material} {$estimate['thicknessMm']} mm
    Size      : {$estimate['lengthMm']} x {$estimate['widthMm']} mm
    Cut length: {$estimate['cutLengthMm']} mm
    Pierces   : {$estimate['pierces']}   Bends: {$estimate['bends']}   Powder coat: {$coat}
    Quantity  : {$estimate['quantity']}
    {$line}
    PER PART (INR)
    {$rows}Price per part                {$perPart}
    {$line}
    Subtotal                      {$subtotal}
    {$gstLabel}{$gst}
    TOTAL (INR)                   {$total}
    {$line}
    Indicative estimate - SAMPLE rates. The final quote is sent on
    WhatsApp after we check your drawing and current material prices.

    TXT;
    fwrite($out, str_replace("\n", "\r\n", $text));
}

fclose($out);
