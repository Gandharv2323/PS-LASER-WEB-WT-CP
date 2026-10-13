@extends('layouts.app')

@section('title', 'Edit '.$machine->short_name)

@section('actions')
    @include('partials.delete-form', ['action' => route('machines.destroy', $machine), 'confirm' => "Delete {$machine->short_name}? It disappears from the website catalogue."])
@endsection

@section('content')
<div class="card"><div class="card-body">
    <form method="POST" action="{{ route('machines.update', $machine) }}">
        @method('PUT')
        @include('machines._form')
        <div class="d-flex gap-2">
            <button class="btn btn-primary" type="submit">Update machine</button>
            <a href="{{ route('machines.show', $machine) }}" class="btn btn-outline-secondary">Cancel</a>
        </div>
    </form>
</div></div>
@endsection
