@extends('layouts.app')

@section('title', $order->order_no)

@section('actions')
    <a href="{{ route('work-orders.index') }}" class="btn btn-outline-secondary"><i class="bi bi-arrow-left me-1"></i>All orders</a>
    <a href="{{ route('work-orders.edit', $order) }}" class="btn btn-primary"><i class="bi bi-pencil me-1"></i>Edit</a>
@endsection

@section('content')
@php($currentIndex = array_search($order->status, \App\Models\WorkOrder::STATUSES, true))
<div class="row g-3">
    <div class="col-lg-7">
        <div class="card mb-3">
            <div class="card-body">
                <div class="d-flex flex-wrap justify-content-between gap-2 mb-2">
                    <div>
                        <h2 class="h5 mb-1">{{ $order->description }}</h2>
                        <div class="small text-muted">{{ $order->customer_name }} · {{ $order->customer_phone }}</div>
                    </div>
                    <x-status-badge :status="$order->status" class="fs-6 align-self-start" />
                </div>

                <div class="pipeline-bar my-3" aria-label="Progress {{ $order->progress() }}%">
                    @foreach (\App\Models\WorkOrder::STATUSES as $i => $status)
                        <span @class(['done' => $i <= $currentIndex]) title="{{ ucfirst($status) }}"></span>
                    @endforeach
                </div>

                <dl class="row small mb-0">
                    <dt class="col-5 col-sm-3 text-muted fw-normal">Quantity</dt><dd class="col-7 col-sm-9">{{ $order->quantity }}</dd>
                    <dt class="col-5 col-sm-3 text-muted fw-normal">Machine</dt><dd class="col-7 col-sm-9">{{ $order->machine?->short_name ?? '—' }}</dd>
                    <dt class="col-5 col-sm-3 text-muted fw-normal">Due</dt>
                    <dd @class(['col-7 col-sm-9', 'text-danger fw-semibold' => $order->isOverdue()])>{{ $order->due_date?->format('d M Y') ?? '—' }} @if ($order->isOverdue()) (overdue) @endif</dd>
                    <dt class="col-5 col-sm-3 text-muted fw-normal">Created</dt><dd class="col-7 col-sm-9">{{ $order->created_at?->format('d M Y H:i') }}</dd>
                </dl>
            </div>
        </div>

        <div class="card">
            <div class="card-header bg-white fw-semibold">Add status update</div>
            <div class="card-body">
                <form method="POST" action="{{ route('work-orders.events.store', $order) }}" class="row g-2">
                    @csrf
                    <div class="col-sm-4">
                        <select name="status" class="form-select @error('status') is-invalid @enderror" aria-label="New status">
                            @foreach (\App\Models\WorkOrder::STATUSES as $status)
                                <option value="{{ $status }}" @selected(old('status', \App\Models\WorkOrder::STATUSES[min($currentIndex + 1, 6)]) === $status)>{{ ucfirst($status) }}</option>
                            @endforeach
                        </select>
                    </div>
                    <div class="col-sm-8">
                        <input type="text" name="note" value="{{ old('note') }}" maxlength="255" class="form-control @error('note') is-invalid @enderror" placeholder="Note visible on tracking (optional)">
                    </div>
                    <div class="col-12"><button class="btn btn-primary" type="submit"><i class="bi bi-plus-lg me-1"></i>Add to timeline</button></div>
                </form>
            </div>
        </div>
    </div>

    <div class="col-lg-5">
        <div class="card">
            <div class="card-header bg-white fw-semibold">Timeline</div>
            <div class="card-body">
                <ul class="timeline">
                    @forelse ($order->events as $event)
                        <li @class(['current' => $loop->last])>
                            <div class="d-flex justify-content-between gap-2">
                                <span class="fw-semibold text-capitalize">{{ $event->status }}</span>
                                <span class="small text-muted text-nowrap">{{ $event->created_at?->format('d M, H:i') }}</span>
                            </div>
                            @if ($event->note)<div class="small text-muted">{{ $event->note }}</div>@endif
                        </li>
                    @empty
                        <li class="text-muted small">No events yet.</li>
                    @endforelse
                </ul>
            </div>
        </div>
    </div>
</div>
@endsection
