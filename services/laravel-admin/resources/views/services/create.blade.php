@extends('layouts.app')

@section('title', 'Add service')

@section('content')
<div class="card"><div class="card-body">
    <form method="POST" action="{{ route('services.store') }}">
        @include('services._form')
        <button class="btn btn-primary" type="submit">Save service</button>
        <a href="{{ route('services.index') }}" class="btn btn-outline-secondary">Cancel</a>
    </form>
</div></div>
@endsection
