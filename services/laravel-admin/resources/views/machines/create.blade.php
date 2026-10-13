@extends('layouts.app')

@section('title', 'Add machine')

@section('content')
<div class="card"><div class="card-body">
    <form method="POST" action="{{ route('machines.store') }}">
        @include('machines._form')
        <div class="d-flex gap-2">
            <button class="btn btn-primary" type="submit">Save machine</button>
            <a href="{{ route('machines.index') }}" class="btn btn-outline-secondary">Cancel</a>
        </div>
    </form>
</div></div>
@endsection
