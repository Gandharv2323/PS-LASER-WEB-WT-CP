<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

/** Estimator settings (bend rate, powder coat rate, GST, rates_are_sample). Admin only. */
class UpdateSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Gate::allows('admin');
    }

    public function rules(): array
    {
        return [
            'bend_rate_inr' => ['required', 'numeric', 'min:0', 'max:10000'],
            'powder_coat_rate_per_sqm' => ['required', 'numeric', 'min:0', 'max:10000'],
            'gst_percent' => ['required', 'numeric', 'min:0', 'max:28'],
            'rates_are_sample' => ['nullable', 'boolean'],
        ];
    }
}
