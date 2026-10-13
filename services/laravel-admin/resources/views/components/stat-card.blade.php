{{-- Usage: <x-stat-card label="New enquiries" :value="5" icon="inbox" :href="route('enquiries.index')" /> --}}
@props(['label', 'value', 'icon' => 'bar-chart', 'href' => null])
<div class="card stat-card h-100">
    <div class="card-body d-flex align-items-center gap-2 gap-sm-3">
        <div class="stat-icon"><i class="bi bi-{{ $icon }}"></i></div>
        <div class="min-w-0">
            <div class="stat-value">{{ $value }}</div>
            <div class="small text-muted lh-sm">
                @if ($href)
                    <a href="{{ $href }}" class="stretched-link text-reset text-decoration-none">{{ $label }}</a>
                @else
                    {{ $label }}
                @endif
            </div>
        </div>
    </div>
</div>
