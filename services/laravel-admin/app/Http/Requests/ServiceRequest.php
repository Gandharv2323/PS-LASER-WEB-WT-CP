<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('admin', 'staff') ?? false;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'slug' => Str::slug($this->input('slug') ?: $this->input('title', '')),
            'sort_order' => $this->input('sort_order', 0) ?? 0,
        ]);
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:160'],
            'slug' => ['required', 'alpha_dash', 'max:80', Rule::unique('services', 'slug')->ignore($this->route('service')?->id)],
            'description' => ['required', 'string', 'max:2000'],
            'image' => ['required', 'string', 'max:255'],
            'sort_order' => ['integer', 'min:0', 'max:999'],
        ];
    }
}
