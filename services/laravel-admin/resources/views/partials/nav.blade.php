@php
    // [route name, pattern for "active", label, icon]
    $links = [
        ['dashboard', 'dashboard', 'Dashboard', 'speedometer2'],
        ['enquiries.index', 'enquiries.*', 'Enquiries', 'inbox'],
        ['work-orders.index', 'work-orders.*', 'Work orders', 'clipboard-check'],
        ['quotes.index', 'quotes.*', 'Quotes', 'receipt'],
        ['machines.index', 'machines.*', 'Machines', 'gear-wide-connected'],
        ['services.index', 'services.*', 'Services', 'tools'],
        ['rates.index', 'rates.*', 'Rate card', 'currency-rupee'],
    ];
@endphp
<nav class="navbar navbar-expand-lg psl-topbar sticky-top" data-bs-theme="dark">
    <div class="container-xl px-3">
        <a class="navbar-brand d-flex align-items-center gap-2" href="{{ route('dashboard') }}">
            <img src="{{ asset('images/ps-laser-logo.png') }}" alt="PS Laser">
            <span class="fw-semibold">Admin</span>
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav"
                aria-controls="mainNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="mainNav">
            <ul class="navbar-nav me-auto gap-lg-1 mt-2 mt-lg-0">
                @foreach ($links as [$route, $pattern, $label, $icon])
                    <li class="nav-item">
                        <a @class(['nav-link px-2', 'active' => request()->routeIs($pattern)]) href="{{ route($route) }}">
                            <i class="bi bi-{{ $icon }} me-1"></i>{{ $label }}
                        </a>
                    </li>
                @endforeach
            </ul>
            <form method="POST" action="{{ route('logout') }}" class="d-flex my-2 my-lg-0">
                @csrf
                <button class="btn btn-sm btn-outline-light" type="submit">
                    <i class="bi bi-box-arrow-right me-1"></i>Sign out
                </button>
            </form>
        </div>
    </div>
</nav>
