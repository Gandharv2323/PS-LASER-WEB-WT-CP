@extends('layouts.app')

@section('title', 'New work order')

@section('content')
<div class="card"><div class="card-body">
    <form method="POST" action="{{ route('work-orders.store') }}">
        @include('work-orders._form')
        <button class="btn btn-primary" type="submit">Create work order</button>
        <a href="{{ route('work-orders.index') }}" class="btn btn-outline-secondary">Cancel</a>
    </form>
</div></div>
@endsection
