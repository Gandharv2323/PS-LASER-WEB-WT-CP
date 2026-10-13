<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateRatesRequest;
use App\Http\Requests\UpdateSettingsRequest;
use App\Models\AuditLog;
use App\Models\Material;
use App\Models\Rate;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\View\View;

/** Rate card editor: bulk-edit the `rates` table + estimator `settings`. */
class RateController extends Controller
{
    public const SETTING_KEYS = ['bend_rate_inr', 'powder_coat_rate_per_sqm', 'gst_percent', 'rates_are_sample'];

    public function index(): View
    {
        $materials = Material::with('rates')->orderBy('id')->get();
        $settings = Setting::query()->whereIn('key', self::SETTING_KEYS)->pluck('value', 'key');

        return view('rates.index', compact('materials', 'settings'));
    }

    public function update(UpdateRatesRequest $request): RedirectResponse
    {
        $rows = $request->validated('rates');

        // All rows or none: wrap the bulk update in a DB transaction.
        DB::transaction(function () use ($rows) {
            foreach ($rows as $id => $data) {
                $rate = Rate::find($id);
                if (! $rate) {
                    continue;
                }
                $rate->fill([
                    'cut_rate_per_m' => $data['cut_rate_per_m'],
                    'pierce_rate' => $data['pierce_rate'],
                    'material_rate_per_kg' => $data['material_rate_per_kg'],
                    'is_sample' => (bool) ($data['is_sample'] ?? false),
                ]);
                if ($rate->isDirty()) {
                    $rate->save();
                    AuditLog::record('rate.update', $rate, "{$rate->material_code} {$rate->thickness_from_mm}-{$rate->thickness_to_mm} mm");
                }
            }
        });

        return back()->with('success', 'Rate card saved.');
    }

    public function updateSettings(UpdateSettingsRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['rates_are_sample'] = $request->boolean('rates_are_sample') ? '1' : '0';

        foreach (self::SETTING_KEYS as $key) {
            Setting::put($key, (string) $data[$key]);
        }
        AuditLog::record('settings.update', 'Settings', 'rates_are_sample='.$data['rates_are_sample']);

        return back()->with('success', $data['rates_are_sample'] === '1'
            ? 'Settings saved. Prices are still flagged as SAMPLE on every estimator.'
            : 'Settings saved. Rate card is now marked as REAL prices.');
    }
}
