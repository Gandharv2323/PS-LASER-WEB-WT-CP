@extends('layouts.app')

@section('title', 'Rate card')

@section('content')
    @php($isSample = ($settings['rates_are_sample'] ?? '1') === '1')

    <div @class(['rounded-3 px-3 py-2 mb-3 small', 'sample-banner' => $isSample, 'alert alert-success' => ! $isSample])>
        @if ($isSample)
            <i class="bi bi-exclamation-triangle me-1"></i>
            Prices below are <strong>SAMPLE</strong> values. Every estimator (website, PHP, Spring, JSP) shows
            "Indicative estimate — final quote on WhatsApp" and returns <code>isSample: true</code> until an admin
            switches the flag off below.
        @else
            <i class="bi bi-check-circle me-1"></i> Rate card is marked as <strong>real prices</strong>.
        @endif
    </div>

    <div class="row g-3">
        <div class="col-xl-8">
            <form method="POST" action="{{ route('rates.update') }}" class="card">
                @csrf
                @method('PUT')
                <div class="card-header bg-white fw-semibold">Cutting rates by material and thickness (INR)</div>
                <div class="table-responsive">
                    <table class="table table-sm mb-0 align-middle">
                        <thead>
                        <tr><th>Material</th><th>Thickness</th><th>Cut / m</th><th>Pierce</th><th>Material / kg</th><th title="Mark row as sample price">Sample</th></tr>
                        </thead>
                        <tbody>
                        @foreach ($materials as $material)
                            @foreach ($material->rates as $rate)
                                <tr>
                                    @if ($loop->first)
                                        <td rowspan="{{ $loop->count }}" class="fw-semibold text-nowrap">{{ $material->name }}<div class="small text-muted fw-normal">{{ $material->code }} · max {{ (float) $material->max_thickness_mm }} mm</div></td>
                                    @endif
                                    <td class="text-nowrap small">{{ (float) $rate->thickness_from_mm }}–{{ (float) $rate->thickness_to_mm }} mm</td>
                                    @foreach (['cut_rate_per_m', 'pierce_rate', 'material_rate_per_kg'] as $field)
                                        @php($key = "rates.{$rate->id}.{$field}")
                                        <td style="min-width: 96px">
                                            <input type="number" step="0.01" min="0" name="rates[{{ $rate->id }}][{{ $field }}]"
                                                   value="{{ old($key, $rate->$field) }}" aria-label="{{ $material->code }} {{ $field }}"
                                                   @class(['form-control form-control-sm', 'is-invalid' => $errors->has($key)])>
                                        </td>
                                    @endforeach
                                    <td class="text-center">
                                        <input type="hidden" name="rates[{{ $rate->id }}][is_sample]" value="0">
                                        <input class="form-check-input" type="checkbox" value="1" name="rates[{{ $rate->id }}][is_sample]"
                                               aria-label="Sample price" @checked(old("rates.{$rate->id}.is_sample", $rate->is_sample))>
                                    </td>
                                </tr>
                            @endforeach
                        @endforeach
                        </tbody>
                    </table>
                </div>
                <div class="card-footer bg-white d-flex justify-content-end">
                    <button class="btn btn-primary" type="submit">Save rate card</button>
                </div>
            </form>
        </div>

        <div class="col-xl-4">
            <form method="POST" action="{{ route('settings.update') }}" class="card">
                @csrf
                @method('PUT')
                <div class="card-header bg-white fw-semibold">Estimator settings</div>
                <div class="card-body">
                    <x-field name="bend_rate_inr" type="number" step="0.01" label="Bend rate (₹ per bend)" :value="$settings['bend_rate_inr'] ?? ''" />
                    <x-field name="powder_coat_rate_per_sqm" type="number" step="0.01" label="Powder coat (₹ per m²)" :value="$settings['powder_coat_rate_per_sqm'] ?? ''" />
                    <x-field name="gst_percent" type="number" step="0.01" label="GST %" :value="$settings['gst_percent'] ?? ''" />

                    <div class="form-check form-switch mb-1">
                        <input type="hidden" name="rates_are_sample" value="0">
                        <input class="form-check-input" type="checkbox" role="switch" id="rates_are_sample" name="rates_are_sample" value="1" @checked($isSample) @cannot('admin') disabled @endcannot>
                        <label class="form-check-label" for="rates_are_sample">Rates are SAMPLE prices</label>
                    </div>
                    <div class="form-text mb-3">Turn off only once PS Laser has entered its real prices.</div>

                    @can('admin')
                        <button class="btn btn-primary w-100" type="submit">Save settings</button>
                    @else
                        <div class="small text-muted">Only an admin can change these settings.</div>
                    @endcan
                </div>
            </form>
        </div>
    </div>
@endsection
