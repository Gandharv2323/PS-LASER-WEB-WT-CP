<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    {{-- CSRF token for any JS requests; forms use @csrf --}}
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Dashboard') · PS Laser Admin</title>
    <link rel="icon" href="{{ asset('images/ps-laser-logo.png') }}">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link href="{{ asset('css/admin.css') }}" rel="stylesheet">
    @stack('styles')
</head>
<body>
    @include('partials.nav')

    <main class="container-xl py-4 px-3">
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
            <h1 class="page-title h3 mb-0">@yield('title', 'Dashboard')</h1>
            <div class="d-flex flex-wrap gap-2">@yield('actions')</div>
        </div>

        @include('partials.flash')

        @yield('content')
    </main>

    <footer class="container-xl px-3 pb-4 small text-muted d-flex flex-wrap justify-content-between gap-2">
        <span>&copy; {{ date('Y') }} PS Laser, Pune · Back office</span>
        <span>Signed in as {{ auth()->user()->name }} ({{ auth()->user()->role }})</span>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Confirm before any destructive form (delete buttons carry data-confirm).
        document.addEventListener('submit', function (e) {
            const msg = e.target.getAttribute('data-confirm');
            if (msg && !window.confirm(msg)) e.preventDefault();
        });
    </script>
    @stack('scripts')
</body>
</html>
