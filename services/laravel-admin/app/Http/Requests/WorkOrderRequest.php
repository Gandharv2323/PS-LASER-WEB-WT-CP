<?php

namespace App\Http\Requests;

use App\Models\WorkOrder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class WorkOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('admin', 'staff') ?? false;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'customer_phone' => preg_replace('/[^\d+]/', '', (string) $this->input('customer_phone')),
            'order_no' => strtoupper(trim((string) $this->input('order_no'))) ?: null,
            'machine_slug' => $this->input('machine_slug') ?: null,
        ]);
    }

    public function rules(): array
    {
        $id = $this->route('work_order')?->id;

        return [
            'order_no' => ['nullable', 'string', 'max:30', 'regex:/^[A-Z0-9-]+$/', Rule::unique('work_orders', 'order_no')->ignore($id)],
            'customer_name' => ['required', 'string', 'max:120'],
            'customer_phone' => ['required', 'regex:/^\+?\d{10,13}$/'],
            'description' => ['required', 'string', 'max:255'],
            'machine_slug' => ['nullable', Rule::exists('machines', 'slug')],
            'quantity' => ['required', 'integer', 'min:1', 'max:1000000'],
            'status' => ['required', Rule::in(WorkOrder::STATUSES)],
            'due_date' => ['nullable', 'date'],
        ];
    }

    public function messages(): array
    {
        return ['customer_phone.regex' => 'Enter a 10-13 digit phone number.'];
    }
}
