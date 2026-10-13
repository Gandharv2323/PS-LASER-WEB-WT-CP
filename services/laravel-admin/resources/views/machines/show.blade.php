@extends('layouts.app')

@section('title', $machine->short_name)

@section('actions')
    <a href="{{ route('machines.index') }}" class="btn btn-outline-secondary"><i class="bi bi-arrow-left me-1"></i>All machines</a>
    <a href="{{ route('machines.edit', $machine) }}" class="btn btn-primary"><i class="bi bi-pencil me-1"></i>Edit</a>
@endsection

@section('content')
<div class="card overflow-hidden">
    <div class="row g-0">
        <div class="col-md-5 bg-light">
            <img src="{{ $machine->image_url }}" alt="{{ $machine->name }}" class="img-fluid w-100 h-100" style="object-fit: cover; min-height: 220px">
        </div>
        <div class="col-md-7">
            <div class="card-body p-4">
                <span class="badge text-bg-light mb-2">{{ $machine->category }}</span>
                <h2 class="h4">{{ $machine->name }}</h2>
                <ul class="mb-3">
                    @foreach ($machine->spec_list as $spec)
                        <li>{{ $spec }}</li>
                    @endforeach
                </ul>
                <dl class="row small mb-0">
                    <dt class="col-5 text-muted fw-normal">Slug</dt><dd class="col-7"><code>{{ $machine->slug }}</code></dd>
                    <dt class="col-5 text-muted fw-normal">Image path</dt><dd class="col-7 text-break"><code>{{ $machine->image }}</code></dd>
                    <dt class="col-5 text-muted fw-normal">Work orders</dt><dd class="col-7">{{ $machine->work_orders_count }}</dd>
                    <dt class="col-5 text-muted fw-normal">Enquiries</dt><dd class="col-7">{{ $machine->enquiries_count }}</dd>
                    <dt class="col-5 text-muted fw-normal">Last updated</dt><dd class="col-7">{{ $machine->updated_at?->format('d M Y H:i') }}</dd>
                </dl>
            </div>
        </div>
    </div>
</div>
@endsection
