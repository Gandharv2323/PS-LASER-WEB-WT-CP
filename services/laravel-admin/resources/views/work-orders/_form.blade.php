@csrf
<div class="row">
    <div class="col-md-4"><x-field name="order_no" label="Order number" :value="$order->order_no" maxlength="30" help="Blank = auto (PSL-yymm-0001)." /></div>
    <div class="col-md-4"><x-field name="customer_name" label="Customer name" :value="$order->customer_name" required /></div>
    <div class="col-md-4"><x-field name="customer_phone" type="tel" label="Customer phone" :value="$order->customer_phone" required help="Customer tracks the order with order no + this phone." /></div>
</div>
<x-field name="description" label="Job description" :value="$order->description" required maxlength="255" placeholder="e.g. MS 2 mm brackets, bent + powder coated" />
<div class="row">
    <div class="col-md-4 mb-3">
        <label for="machine_slug" class="form-label fw-medium">Machine</label>
        <select id="machine_slug" name="machine_slug" @class(['form-select', 'is-invalid' => $errors->has('machine_slug')])>
            <option value="">— none —</option>
            @foreach ($machines as $slug => $label)
                <option value="{{ $slug }}" @selected(old('machine_slug', $order->machine_slug) === $slug)>{{ $label }}</option>
            @endforeach
        </select>
        @error('machine_slug')<div class="invalid-feedback">{{ $message }}</div>@enderror
    </div>
    <div class="col-6 col-md-2"><x-field name="quantity" type="number" label="Quantity" :value="$order->quantity" min="1" required /></div>
    <div class="col-6 col-md-3 mb-3">
        <label for="status" class="form-label fw-medium">Status</label>
        <select id="status" name="status" @class(['form-select', 'is-invalid' => $errors->has('status')])>
            @foreach (\App\Models\WorkOrder::STATUSES as $status)
                <option value="{{ $status }}" @selected(old('status', $order->status) === $status)>{{ ucfirst($status) }}</option>
            @endforeach
        </select>
        @error('status')<div class="invalid-feedback">{{ $message }}</div>@enderror
    </div>
    <div class="col-md-3"><x-field name="due_date" type="date" label="Due date" :value="$order->due_date" /></div>
</div>
