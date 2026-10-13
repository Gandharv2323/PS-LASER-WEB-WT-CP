@extends('layouts.app')

@section('title', 'Quotes')

@section('content')
    <p class="text-muted small">
        Estimates saved by the website / PHP estimator / Spring API. All amounts are indicative — the final quote is sent on WhatsApp.
        Total value of saved quotes: <strong>₹{{ number_format($totalValue, 2) }}</strong>
    </p>

    <form method="GET" class="row g-2 mb-3">
        <div class="col-12 col-md"><input type="search" name="q" value="{{ request('q') }}" class="form-control" placeholder="Quote no, customer or phone"></div>
        <div class="col-8 col-md-3">
            <select name="material" class="form-select" aria-label="Material">
                <option value="">Any material</option>
                @foreach (['MS' => 'Mild Steel', 'SS' => 'Stainless Steel', 'AL' => 'Aluminium', 'BR' => 'Brass', 'CU' => 'Copper'] as $code => $label)
                    <option value="{{ $code }}" @selected(request('material') === $code)>{{ $label }}</option>
                @endforeach
            </select>
        </div>
        <div class="col-4 col-md-auto d-grid"><button class="btn btn-primary">Filter</button></div>
    </form>

    <div class="card">
        <div class="table-responsive">
            <table class="table table-hover mb-0">
                <thead><tr><th>Quote</th><th>Customer</th><th class="d-none d-md-table-cell">Part</th><th class="text-end">Amount</th><th class="d-none d-sm-table-cell">Source</th><th class="d-none d-lg-table-cell">Date</th></tr></thead>
                <tbody>
                @forelse ($quotes as $quote)
                    <tr>
                        <td class="fw-semibold text-nowrap">{{ $quote->quote_no }}
                            @if ($quote->is_estimate)<span class="badge text-bg-light">estimate</span>@endif
                        </td>
                        <td>
                            {{ $quote->customer_name ?? '—' }}<div class="small text-muted">{{ $quote->customer_phone }}</div>
                            @if ($quote->enquiry)<a class="small" href="{{ route('enquiries.show', $quote->enquiry) }}">Enquiry #{{ $quote->enquiry_id }}</a>@endif
                        </td>
                        <td class="d-none d-md-table-cell small">
                            {{ $quote->material?->name ?? $quote->material_code }} {{ (float) $quote->thickness_mm }} mm,
                            {{ (float) $quote->length_mm }}×{{ (float) $quote->width_mm }} mm × {{ $quote->quantity }}
                            <div class="text-muted">{{ $quote->pierces }} pierces · {{ $quote->bends }} bends @if ($quote->powder_coat) · powder coat @endif</div>
                        </td>
                        <td class="text-end fw-semibold text-nowrap">₹{{ number_format($quote->amount_inr, 2) }}</td>
                        <td class="d-none d-sm-table-cell small text-capitalize">{{ $quote->source }}</td>
                        <td class="d-none d-lg-table-cell small text-muted text-nowrap">{{ $quote->created_at?->format('d M Y') }}</td>
                    </tr>
                @empty
                    <tr><td colspan="6" class="text-center text-muted py-4">No quotes saved yet.</td></tr>
                @endforelse
                </tbody>
            </table>
        </div>
    </div>
    <div class="mt-3">{{ $quotes->links() }}</div>
@endsection
