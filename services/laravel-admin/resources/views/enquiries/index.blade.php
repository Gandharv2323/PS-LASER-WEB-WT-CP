@extends('layouts.app')

@section('title', 'Enquiries')

@section('content')
    {{-- Status filter pills (GET query string, kept across pagination by withQueryString()) --}}
    <ul class="nav nav-pills gap-1 mb-3 flex-nowrap overflow-auto pb-1">
        <li class="nav-item">
            <a @class(['nav-link py-1', 'active bg-brand' => ! request('status')]) href="{{ route('enquiries.index', request()->except('status', 'page')) }}">All</a>
        </li>
        @foreach (\App\Models\Enquiry::STATUSES as $status)
            <li class="nav-item">
                <a @class(['nav-link py-1 text-capitalize text-nowrap', 'active bg-brand' => request('status') === $status])
                   href="{{ route('enquiries.index', array_merge(request()->except('page'), ['status' => $status])) }}">
                    {{ $status }} <span class="badge text-bg-light">{{ $statusCounts[$status] ?? 0 }}</span>
                </a>
            </li>
        @endforeach
    </ul>

    <form method="GET" action="{{ route('enquiries.index') }}" class="row g-2 mb-3">
        <input type="hidden" name="status" value="{{ request('status') }}">
        <div class="col-12 col-md">
            <input type="search" name="q" value="{{ request('q') }}" class="form-control" placeholder="Search name, phone, email or message">
        </div>
        <div class="col-8 col-md-3">
            <select name="source" class="form-select" aria-label="Source">
                <option value="">Any source</option>
                @foreach (\App\Models\Enquiry::SOURCES as $source)
                    <option value="{{ $source }}" @selected(request('source') === $source)>{{ ucfirst($source) }}</option>
                @endforeach
            </select>
        </div>
        <div class="col-4 col-md-auto d-grid"><button class="btn btn-primary" type="submit">Filter</button></div>
    </form>

    <div class="card">
        <div class="table-responsive">
            <table class="table table-hover mb-0">
                <thead>
                <tr>
                    <th>#</th><th>Customer</th><th class="d-none d-md-table-cell">Message</th>
                    <th class="d-none d-sm-table-cell">Source</th><th>Status</th><th class="d-none d-lg-table-cell">Received</th><th></th>
                </tr>
                </thead>
                <tbody>
                @forelse ($enquiries as $enquiry)
                    <tr>
                        <td class="text-muted">{{ $enquiry->id }}</td>
                        <td>
                            <div class="fw-semibold">{{ $enquiry->name }}</div>
                            <div class="small text-muted">{{ $enquiry->phone }}</div>
                        </td>
                        <td class="d-none d-md-table-cell small" style="max-width: 320px">
                            {{ \Illuminate\Support\Str::limit($enquiry->message, 80) }}
                            @if ($enquiry->uploads_count)<i class="bi bi-paperclip text-muted" title="{{ $enquiry->uploads_count }} drawing(s)"></i>@endif
                        </td>
                        <td class="d-none d-sm-table-cell small text-capitalize">{{ $enquiry->source }}</td>
                        <td><x-status-badge :status="$enquiry->status" /></td>
                        <td class="d-none d-lg-table-cell small text-muted text-nowrap">{{ $enquiry->created_at?->format('d M Y, H:i') }}</td>
                        <td class="text-end"><a href="{{ route('enquiries.show', $enquiry) }}" class="btn btn-sm btn-outline-primary">Open</a></td>
                    </tr>
                @empty
                    <tr><td colspan="7" class="text-center text-muted py-4">No enquiries match these filters.</td></tr>
                @endforelse
                </tbody>
            </table>
        </div>
    </div>

    <div class="mt-3">{{ $enquiries->links() }}</div>
@endsection
