<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Bulk rate-card edit. The form posts arrays: rates[<id>][cut_rate_per_m] etc.
 * Wildcard rules (rates.*.field) validate every row.
 */
class UpdateRatesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('admin', 'staff') ?? false;
    }

    public function rules(): array
    {
        return [
            'rates' => ['required', 'array'],
            'rates.*.cut_rate_per_m' => ['required', 'numeric', 'min:0', 'max:100000'],
            'rates.*.pierce_rate' => ['required', 'numeric', 'min:0', 'max:100000'],
            'rates.*.material_rate_per_kg' => ['required', 'numeric', 'min:0', 'max:100000'],
            'rates.*.is_sample' => ['nullable', 'boolean'],
        ];
    }

    public function attributes(): array
    {
        return [
            'rates.*.cut_rate_per_m' => 'cut rate',
            'rates.*.pierce_rate' => 'pierce rate',
            'rates.*.material_rate_per_kg' => 'material rate',
        ];
    }
}
