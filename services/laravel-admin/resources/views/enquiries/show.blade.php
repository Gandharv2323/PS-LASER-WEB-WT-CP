@extends('layouts.app')

@section('title', "Enquiry #{$enquiry->id}")

@section('actions')
    <a href="{{ route('enquiries.index') }}" class="btn btn-outline-secondary"><i class="bi bi-arrow-left me-1"></i>Back</a>
    <a href="{{ $enquiry->whatsappUrl() }}" target="_blank" rel="noopener" class="btn btn-success"><i class="bi bi-whatsapp me-1"></i>WhatsApp</a>
@endsection

@section('content')
<div class="row g-3">
    <div class="col-lg-8">
        <div class="card mb-3">
            <div class="card-body">
                <div class="d-flex flex-wrap justify-content-between gap-2 mb-3">
                    <div>
                        <h2 class="h5 mb-1">{{ $enquiry->name }}</h2>
                        <div class="text-muted small">
                            <i class="bi bi-telephone"></i> <a href="tel:{{ $enquiry->phone }}">{{ $enquiry->phone }}</a>
                            @if ($enquiry->email) · <i class="bi bi-envelope"></i> <a href="mailto:{{ $enquiry->email }}">{{ $enquiry->email }}</a>@endif
                        </div>
                    </div>
                    <x-status-badge :status="$enquiry->status" class="fs-6 align-self-start" />
                </div>
                <p class="mb-3" style="white-space: pre-line">{{ $enquiry->message }}</p>
                <dl class="row small mb-0">
                    <dt class="col-sm-3 text-muted fw-normal">Service</dt>
                    <dd class="col-sm-9">{{ $enquiry->service?->title ?? $enquiry->service_slug ?? '—' }}</dd>
                    <dt class="col-sm-3 text-muted fw-normal">Machine</dt>
                    <dd class="col-sm-9">{{ $enquiry->machine?->short_name ?? $enquiry->machine_slug ?? '—' }}</dd>
                    <dt class="col-sm-3 text-muted fw-normal">Source</dt>
                    <dd class="col-sm-9 text-capitalize">{{ $enquiry->source }}</dd>
                    <dt class="col-sm-3 text-muted fw-normal">Received</dt>
                    <dd class="col-sm-9">{{ $enquiry->created_at?->format('d M Y, H:i') }}</dd>
                </dl>
            </div>
        </div>

        <div class="card mb-3">
            <div class="card-header bg-white fw-semibold"><i class="bi bi-paperclip me-1"></i>Drawings ({{ $enquiry->uploads->count() }})</div>
            <ul class="list-group list-group-flush">
                @forelse ($enquiry->uploads as $upload)
                    <li class="list-group-item">
                        <div class="fw-medium text-break">{{ $upload->original_name }}</div>
                        <div class="small text-muted">{{ $upload->mime ?? 'unknown type' }} · {{ $upload->human_size }} · uploaded {{ $upload->created_at?->format('d M Y H:i') }}</div>
                        <div class="small text-muted text-break"><code>{{ $upload->stored_path }}</code></div>
                    </li>
                @empty
                    <li class="list-group-item text-muted small">No drawing was attached. Ask the customer to send DXF/PDF on WhatsApp.</li>
                @endforelse
            </ul>
        </div>

        @if ($enquiry->quotes->isNotEmpty())
            <div class="card">
                <div class="card-header bg-white fw-semibold">Linked quotes</div>
                <ul class="list-group list-group-flush">
                    @foreach ($enquiry->quotes as $quote)
                        <li class="list-group-item d-flex justify-content-between">
                            <span>{{ $quote->quote_no }} · {{ $quote->material_code }} {{ $quote->thickness_mm }} mm × {{ $quote->quantity }}</span>
                            <span class="fw-semibold">₹{{ number_format($quote->amount_inr, 2) }}</span>
                        </li>
                    @endforeach
                </ul>
            </div>
        @endif
    </div>

    <div class="col-lg-4">
        <div class="card">
            <div class="card-header bg-white fw-semibold">Update status</div>
            <div class="card-body">
                <form method="POST" action="{{ route('enquiries.update', $enquiry) }}">
                    @csrf
                    @method('PATCH') {{-- HTML forms only send GET/POST: method spoofing via _method --}}
                    <div class="d-grid gap-2 mb-3">
                        @foreach (\App\Models\Enquiry::STATUSES as $status)
                            <input type="radio" class="btn-check" name="status" id="status-{{ $status }}" value="{{ $status }}" @checked(old('status', $enquiry->status) === $status)>
                            <label class="btn btn-outline-primary text-capitalize text-start" for="status-{{ $status }}">{{ $status }}</label>
                        @endforeach
                    </div>
                    @error('status')<div class="text-danger small mb-2">{{ $message }}</div>@enderror
                    <button class="btn btn-primary w-100" type="submit">Save status</button>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection
