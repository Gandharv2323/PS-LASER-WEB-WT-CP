@extends('layouts.app')

@section('title', 'Edit '.$service->title)

@section('content')
<div class="card"><div class="card-body">
    <form method="POST" action="{{ route('services.update', $service) }}">
        @method('PUT')
        @include('services._form')
        <button class="btn btn-primary" type="submit">Update service</button>
        <a href="{{ route('services.index') }}" class="btn btn-outline-secondary">Cancel</a>
    </form>
</div></div>
@endsection
