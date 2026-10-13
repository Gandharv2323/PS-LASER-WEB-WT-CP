<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/** Used by MachineController@store and @update. */
class MachineRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('admin', 'staff') ?? false;
    }

    /** Runs before validation: derive the slug from the name if left blank. */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'slug' => Str::slug($this->input('slug') ?: $this->input('name', '')),
            'sort_order' => $this->input('sort_order', 0) ?? 0,
        ]);
    }

    public function rules(): array
    {
        $id = $this->route('machine')?->id; // route model binding on update

        return [
            'name' => ['required', 'string', 'max:160'],
            'slug' => ['required', 'string', 'max:80', 'alpha_dash', Rule::unique('machines', 'slug')->ignore($id)],
            'short_name' => ['required', 'string', 'max:80'],
            'category' => ['required', 'string', 'max:60'],
            'specs' => ['required', 'string', 'max:2000'],
            'image' => ['required', 'string', 'max:255', 'regex:/^(\/|https?:\/\/)[^\s]+\.(jpe?g|png|webp|gif|svg)$/i'],
            'sort_order' => ['integer', 'min:0', 'max:999'],
        ];
    }

    public function messages(): array
    {
        return [
            'image.regex' => 'Image must be a path like /sites/pslaser/machines/name.jpg (jpg, png, webp, gif or svg).',
        ];
    }
}
