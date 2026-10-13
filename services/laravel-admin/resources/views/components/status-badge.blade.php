{{-- Usage: <x-status-badge :status="$enquiry->status" /> --}}
@props(['status'])
@php
    $map = [
        // enquiries
        'new' => 'warning', 'contacted' => 'info', 'quoted' => 'primary', 'won' => 'success', 'lost' => 'secondary',
        // work orders
        'received' => 'secondary', 'cutting' => 'warning', 'bending' => 'warning', 'welding' => 'warning',
        'coating' => 'info', 'inspection' => 'primary', 'dispatched' => 'success',
    ];
    $tone = $map[$status] ?? 'light';
@endphp
<span {{ $attributes->merge(['class' => "badge rounded-pill text-bg-{$tone} text-capitalize"]) }}>{{ $status }}</span>
