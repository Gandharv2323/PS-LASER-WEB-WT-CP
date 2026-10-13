<?php
/**
 * Laser-cutting price estimator — implements the formula in services/CONTRACT.md.
 *
 * Unit I topics shown here: classes, conditions (if/elseif/match), loops
 * (foreach over rate bands), associative + multidimensional arrays, type
 * hints, custom exceptions (ValidationException / EstimateException).
 */

declare(strict_types=1);

final class Estimator
{
    /** Field name => human label, used in validation messages. */
    public const FIELDS = [
        'material'    => 'Material',
        'thickness'   => 'Thickness',
        'length'      => 'Length',
        'width'       => 'Width',
        'cut_length'  => 'Cut length',
        'pierces'     => 'Pierces',
        'bends'       => 'Bends',
        'quantity'    => 'Quantity',
    ];

    public function __construct(private Repository $repo)
    {
    }

    /**
     * Read and validate raw form input ($_POST) into clean numbers in mm.
     *
     * @throws ValidationException
     */
    public function parseInput(array $raw): array
    {
        $errors = [];
        $unit = in_array($raw['units'] ?? 'mm', ['mm', 'in'], true) ? $raw['units'] : 'mm';

        $code = material_code((string) ($raw['material'] ?? ''));
        $material = $code !== '' ? $this->repo->material($code) : null;
        if ($material === null) {
            $errors['material'] = 'Please choose a material from the list.';
        }

        // Numeric fields: filter_var gives us float/int or false.
        $num = static fn (string $key): float|false => filter_var(
            str_replace(',', '', (string) ($raw[$key] ?? '')),
            FILTER_VALIDATE_FLOAT
        );
        $int = static fn (string $key, int $min): int|false => filter_var(
            (string) ($raw[$key] ?? ''),
            FILTER_VALIDATE_INT,
            ['options' => ['min_range' => $min, 'max_range' => 100000]]
        );

        $thickness = $num('thickness');
        if ($thickness === false || $thickness <= 0) {
            $errors['thickness'] = 'Thickness must be a number greater than 0 mm.';
        } elseif ($material !== null && $thickness > (float) $material['max_thickness_mm']) {
            $errors['thickness'] = sprintf(
                '%s can be cut up to %s mm on our lasers.',
                $material['name'],
                rtrim(rtrim($material['max_thickness_mm'], '0'), '.')
            );
        }

        $dims = [];
        foreach (['length' => BED_MAX_LENGTH_MM, 'width' => BED_MAX_WIDTH_MM, 'cut_length' => null] as $field => $max) {
            $value = $num($field);
            if ($value === false || $value <= 0) {
                $errors[$field] = self::FIELDS[$field] . ' must be greater than 0.';
                continue;
            }
            $mm = round(to_mm($value, $unit), 2);
            if ($max !== null && $mm > $max) {
                $errors[$field] = sprintf('%s exceeds the laser bed (%d × %d mm).', self::FIELDS[$field], BED_MAX_LENGTH_MM, BED_MAX_WIDTH_MM);
                continue;
            }
            $dims[$field] = $mm;
        }

        $pierces  = $int('pierces', 0);
        $bends    = $int('bends', 0);
        $quantity = $int('quantity', 1);
        if ($pierces === false) {
            $errors['pierces'] = 'Pierces must be a whole number (0 or more).';
        }
        if ($bends === false) {
            $errors['bends'] = 'Bends must be a whole number (0 or more).';
        }
        if ($quantity === false) {
            $errors['quantity'] = 'Quantity must be at least 1.';
        }

        if ($errors) {
            throw new ValidationException($errors);
        }

        return [
            'materialCode' => $material['code'],
            'materialName' => $material['name'],
            'density'      => (float) $material['density_g_cm3'],
            'thicknessMm'  => (float) $thickness,
            'lengthMm'     => $dims['length'],
            'widthMm'      => $dims['width'],
            'cutLengthMm'  => $dims['cut_length'],
            'pierces'      => $pierces,
            'bends'        => $bends,
            'powderCoat'   => !empty($raw['powder_coat']),
            'quantity'     => $quantity,
            'units'        => $unit,
        ];
    }

    /**
     * Pick the rate band whose [from, to] range contains the thickness.
     *
     * @throws EstimateException when no band matches
     */
    public function findRate(string $code, float $thickness): array
    {
        $bands = $this->repo->ratesFor($code);
        foreach ($bands as $band) {
            if ($thickness >= (float) $band['thickness_from_mm'] && $thickness <= (float) $band['thickness_to_mm']) {
                return $band;
            }
        }
        throw new EstimateException(
            sprintf('No rate band covers %s at %s mm — please ask us on WhatsApp.', $code, $thickness),
            $code,
            $thickness
        );
    }

    /**
     * CONTRACT formula, steps 2–12. Each breakdown line is rounded to 2 dp
     * and perPart is the rounded sum, so the table always adds up.
     */
    public function calculate(array $in): array
    {
        $rate     = $this->findRate($in['materialCode'], $in['thicknessMm']);
        $settings = $this->repo->settings();

        foreach (['bend_rate_inr', 'powder_coat_rate_per_sqm', 'gst_percent'] as $required) {
            if (!array_key_exists($required, $settings)) {
                throw new EstimateException("Setting '{$required}' is missing in the database.");
            }
        }

        $areaM2   = $in['lengthMm'] * $in['widthMm'] / 1e6;                       // step 3
        $weightKg = $areaM2 * $in['thicknessMm'] * $in['density'];               // step 4

        $breakdown = [
            'material' => round2($weightKg * (float) $rate['material_rate_per_kg']),                  // 5
            'cutting'  => round2(($in['cutLengthMm'] / 1000) * (float) $rate['cut_rate_per_m']),       // 6
            'piercing' => round2($in['pierces'] * (float) $rate['pierce_rate']),                       // 7
            'bending'  => round2($in['bends'] * (float) $settings['bend_rate_inr']),                   // 8
            'coating'  => $in['powderCoat']                                                            // 9
                ? round2($areaM2 * 2 * (float) $settings['powder_coat_rate_per_sqm'])
                : 0.0,
        ];

        $perPart    = round2(sum_values(...array_values($breakdown)));            // 10
        $subtotal   = round2($perPart * $in['quantity']);                          // 11
        $gstPercent = (float) $settings['gst_percent'];
        $gst        = round2($subtotal * $gstPercent / 100);
        $total      = round2($subtotal + $gst);

        return $in + [
            'areaM2'     => round($areaM2, 4),
            'weightKg'   => round($weightKg, 3),
            'rate'       => array_map('floatval', $rate),
            'breakdown'  => $breakdown,
            'perPart'    => $perPart,
            'subtotal'   => $subtotal,
            'gstPercent' => $gstPercent + 0,      // 18.0 -> 18 for display
            'gst'        => $gst,
            'total'      => $total,
            'currency'   => CURRENCY,
            'isSample'   => ($settings['rates_are_sample'] ?? '1') === '1',
            'at'         => date('c'),
        ];
    }

    /** The CONTRACT JSON shape (used by the .txt/.csv download and the learn page). */
    public static function toContractJson(array $est): array
    {
        return [
            'materialCode' => $est['materialCode'],
            'thicknessMm'  => $est['thicknessMm'],
            'quantity'     => $est['quantity'],
            'breakdown'    => $est['breakdown'],
            'perPart'      => $est['perPart'],
            'subtotal'     => $est['subtotal'],
            'gst'          => $est['gst'],
            'total'        => $est['total'],
            'currency'     => $est['currency'],
            'isSample'     => $est['isSample'],
        ];
    }
}
