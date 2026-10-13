<?php

namespace App\Http\Requests;

use App\Models\WorkOrder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreWorkOrderEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('admin', 'staff') ?? false;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in(WorkOrder::STATUSES)],
            'note' => ['nullable', 'string', 'max:255'],
        ];
    }
}
