@extends('layouts.app')

@section('title', 'Dashboard')

@section('actions')
    <a href="{{ route('work-orders.create') }}" class="btn btn-primary"><i class="bi bi-plus-lg me-1"></i>New work order</a>
@endsection

@section('content')
    @if ($ratesAreSample)
        <div class="sample-banner rounded-3 px-3 py-2 mb-3 small d-flex flex-wrap align-items-center gap-2">
            <i class="bi bi-exclamation-triangle"></i>
            <span>The rate card still holds <strong>SAMPLE</strong> prices. Estimators show "Indicative estimate — final quote on WhatsApp".</span>
            <a href="{{ route('rates.index') }}" class="ms-auto">Review rate card</a>
        </div>
    @endif

    <div class="row g-3 mb-4">
        <div class="col-6 col-lg"><x-stat-card label="New enquiries" :value="$counts['new_enquiries']" icon="inbox" :href="route('enquiries.index', ['status' => 'new'])" /></div>
        <div class="col-6 col-lg"><x-stat-card label="All enquiries" :value="$counts['enquiries']" icon="chat-left-text" :href="route('enquiries.index')" /></div>
        <div class="col-6 col-lg"><x-stat-card label="Open work orders" :value="$counts['open_orders']" icon="clipboard-check" :href="route('work-orders.index')" /></div>
        <div class="col-6 col-lg"><x-stat-card label="Saved quotes" :value="$counts['quotes']" icon="receipt" :href="route('quotes.index')" /></div>
        <div class="col-12 col-lg"><x-stat-card label="Machines listed" :value="$counts['machines']" icon="gear-wide-connected" :href="route('machines.index')" /></div>
    </div>

    <div class="row g-3">
        <div class="col-lg-7">
            <div class="card h-100">
                <div class="card-header bg-white d-flex justify-content-between align-items-center">
                    <span class="fw-semibold">Latest enquiries</span>
                    <a href="{{ route('enquiries.index') }}" class="small">View all</a>
                </div>
                <div class="list-group list-group-flush">
                    @forelse ($latestEnquiries as $enquiry)
                        <a href="{{ route('enquiries.show', $enquiry) }}" class="list-group-item list-group-item-action py-3">
                            <div class="d-flex justify-content-between gap-2">
                                <div class="min-w-0">
                                    <div class="fw-semibold">{{ $enquiry->name }}
                                        @if ($enquiry->uploads_count)
                                            <i class="bi bi-paperclip text-muted" title="Has drawing"></i>
                                        @endif
                                    </div>
                                    <div class="small text-muted text-truncate">{{ $enquiry->message }}</div>
                                </div>
                                <div class="text-end flex-shrink-0">
                                    <x-status-badge :status="$enquiry->status" />
                                    <div class="small text-muted mt-1">{{ $enquiry->created_at?->diffForHumans() }}</div>
                                </div>
                            </div>
                        </a>
                    @empty
                        <div class="list-group-item text-muted py-4 text-center">No enquiries yet.</div>
                    @endforelse
                </div>
            </div>
        </div>

        <div class="col-lg-5 d-flex flex-column gap-3">
            <div class="card">
                <div class="card-header bg-white fw-semibold">Work orders by status</div>
                <div class="card-body">
                    @php($max = max(1, $ordersByStatus->max()))
                    @foreach ($ordersByStatus as $status => $total)
                        <a href="{{ route('work-orders.index', ['status' => $status]) }}" class="d-flex align-items-center gap-2 mb-2 text-reset text-decoration-none">
                            <span class="text-capitalize small" style="width: 90px">{{ $status }}</span>
                            <div class="progress flex-grow-1" role="progressbar" aria-label="{{ $status }}" aria-valuenow="{{ $total }}" aria-valuemin="0" aria-valuemax="{{ $max }}" style="height: 10px">
                                <div class="progress-bar bg-brand" style="width: {{ round($total / $max * 100) }}%"></div>
                            </div>
                            <span class="small fw-semibold" style="width: 24px; text-align: right">{{ $total }}</span>
                        </a>
                    @endforeach
                </div>
            </div>

            <div class="card">
                <div class="card-header bg-white fw-semibold">Due next</div>
                <ul class="list-group list-group-flush">
                    @forelse ($dueSoon as $order)
                        <li class="list-group-item d-flex justify-content-between align-items-center gap-2">
                            <a href="{{ route('work-orders.show', $order) }}" class="text-truncate">{{ $order->order_no }} · {{ $order->customer_name }}</a>
                            <span @class(['small flex-shrink-0', 'text-danger fw-semibold' => $order->isOverdue(), 'text-muted' => ! $order->isOverdue()])>
                                {{ $order->due_date->format('d M') }}
                            </span>
                        </li>
                    @empty
                        <li class="list-group-item text-muted">Nothing scheduled.</li>
                    @endforelse
                </ul>
            </div>
        </div>
    </div>
@endsection
