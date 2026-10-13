@extends('layouts.app')

@section('title', 'Machines')

@section('actions')
    <a href="{{ route('machines.create') }}" class="btn btn-primary"><i class="bi bi-plus-lg me-1"></i>Add machine</a>
@endsection

@section('content')
    <form method="GET" class="row g-2 mb-3">
        <div class="col"><input type="search" name="q" value="{{ request('q') }}" class="form-control" placeholder="Search name or category"></div>
        <div class="col-auto"><button class="btn btn-primary">Search</button></div>
    </form>

    <div class="card">
        <div class="table-responsive">
            <table class="table table-hover mb-0">
                <thead><tr><th style="width:90px">Image</th><th>Machine</th><th class="d-none d-md-table-cell">Category</th><th class="d-none d-sm-table-cell">Order</th><th></th></tr></thead>
                <tbody>
                @forelse ($machines as $machine)
                    <tr>
                        <td><img src="{{ $machine->image_url }}" alt="" class="machine-thumb" loading="lazy" onerror="this.style.visibility='hidden'"></td>
                        <td>
                            <a href="{{ route('machines.show', $machine) }}" class="fw-semibold">{{ $machine->short_name }}</a>
                            <div class="small text-muted">{{ $machine->name }}</div>
                        </td>
                        <td class="d-none d-md-table-cell small">{{ $machine->category }}</td>
                        <td class="d-none d-sm-table-cell small text-muted">{{ $machine->sort_order }}</td>
                        <td class="text-end text-nowrap">
                            <a href="{{ route('machines.edit', $machine) }}" class="btn btn-sm btn-outline-primary">Edit</a>
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="5" class="text-center text-muted py-4">No machines found.</td></tr>
                @endforelse
                </tbody>
            </table>
        </div>
    </div>
    <div class="mt-3">{{ $machines->links() }}</div>
@endsection
