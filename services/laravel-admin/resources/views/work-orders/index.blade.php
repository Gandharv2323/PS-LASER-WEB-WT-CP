@extends('layouts.app')

@section('title', 'Work orders')

@section('actions')
    <a href="{{ route('work-orders.create') }}" class="btn btn-primary"><i class="bi bi-plus-lg me-1"></i>New work order</a>
@endsection

@section('content')
    <form method="GET" class="row g-2 mb-3">
        <div class="col-12 col-md"><input type="search" name="q" value="{{ request('q') }}" class="form-control" placeholder="Order no, customer or phone"></div>
        <div class="col-8 col-md-3">
            <select name="status" class="form-select" aria-label="Status">
                <option value="">Any status</option>
                @foreach (\App\Models\WorkOrder::STATUSES as $status)
                    <option value="{{ $status }}" @selected(request('status') === $status)>{{ ucfirst($status) }}</option>
                @endforeach
            </select>
        </div>
        <div class="col-4 col-md-auto d-grid"><button class="btn btn-primary">Filter</button></div>
    </form>

    <div class="card">
        <div class="table-responsive">
            <table class="table table-hover mb-0">
                <thead><tr><th>Order</th><th>Customer</th><th class="d-none d-md-table-cell">Job</th><th>Status</th><th class="d-none d-sm-table-cell">Due</th></tr></thead>
                <tbody>
                @forelse ($orders as $order)
                    <tr>
                        <td class="text-nowrap"><a href="{{ route('work-orders.show', $order) }}" class="fw-semibold">{{ $order->order_no }}</a></td>
                        <td><div>{{ $order->customer_name }}</div><div class="small text-muted">{{ $order->customer_phone }}</div></td>
                        <td class="d-none d-md-table-cell small">
                            {{ \Illuminate\Support\Str::limit($order->description, 60) }}
                            <div class="text-muted">Qty {{ $order->quantity }}@if ($order->machine) · {{ $order->machine->short_name }}@endif</div>
                        </td>
                        <td><x-status-badge :status="$order->status" /></td>
                        <td class="d-none d-sm-table-cell small text-nowrap @if ($order->isOverdue()) text-danger fw-semibold @endif">
                            {{ $order->due_date?->format('d M Y') ?? '—' }}
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="5" class="text-center text-muted py-4">No work orders found.</td></tr>
                @endforelse
                </tbody>
            </table>
        </div>
    </div>
    <div class="mt-3">{{ $orders->links() }}</div>
@endsection
