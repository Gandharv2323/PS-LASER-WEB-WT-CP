@extends('layouts.app')

@section('title', 'Edit '.$order->order_no)

@section('actions')
    @include('partials.delete-form', ['action' => route('work-orders.destroy', $order), 'confirm' => "Delete {$order->order_no} and its timeline?"])
@endsection

@section('content')
<div class="card"><div class="card-body">
    <form method="POST" action="{{ route('work-orders.update', $order) }}">
        @method('PUT')
        @include('work-orders._form')
        <button class="btn btn-primary" type="submit">Update work order</button>
        <a href="{{ route('work-orders.show', $order) }}" class="btn btn-outline-secondary">Cancel</a>
    </form>
</div></div>
@endsection
