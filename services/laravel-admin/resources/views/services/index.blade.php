@extends('layouts.app')

@section('title', 'Services')

@section('actions')
    <a href="{{ route('services.create') }}" class="btn btn-primary"><i class="bi bi-plus-lg me-1"></i>Add service</a>
@endsection

@section('content')
    <div class="row g-3">
        @forelse ($services as $service)
            <div class="col-sm-6 col-lg-4">
                <div class="card h-100">
                    <img src="{{ $service->image_url }}" alt="" class="card-img-top" style="height: 150px; object-fit: cover" loading="lazy" onerror="this.style.display='none'">
                    <div class="card-body">
                        <div class="d-flex justify-content-between gap-2">
                            <h2 class="h6 fw-semibold mb-1">{{ $service->title }}</h2>
                            <span class="small text-muted">#{{ $service->sort_order }}</span>
                        </div>
                        <p class="small text-muted mb-2">{{ \Illuminate\Support\Str::limit($service->description, 120) }}</p>
                        <div class="small text-muted">{{ $service->enquiries_count }} {{ \Illuminate\Support\Str::plural('enquiry', $service->enquiries_count) }}</div>
                    </div>
                    <div class="card-footer bg-white d-flex gap-2">
                        <a href="{{ route('services.edit', $service) }}" class="btn btn-sm btn-outline-primary">Edit</a>
                        @include('partials.delete-form', ['action' => route('services.destroy', $service), 'btnClass' => 'btn-sm btn-outline-danger'])
                    </div>
                </div>
            </div>
        @empty
            <p class="text-muted">No services yet.</p>
        @endforelse
    </div>
    <div class="mt-3">{{ $services->links() }}</div>
@endsection
