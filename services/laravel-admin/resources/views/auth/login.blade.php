@extends('layouts.guest')

@section('title', 'Sign in')

@section('content')
<div class="login-card">
    <div class="text-center mb-4">
        <img src="{{ asset('images/ps-laser-logo.png') }}" alt="PS Laser" style="height:64px" class="mb-3">
        <h1 class="h4 fw-bold mb-1">PS Laser Admin</h1>
        <p class="text-muted small mb-0">Back office for enquiries, work orders and the rate card</p>
    </div>

    <div class="card">
        <div class="card-body p-4">
            @if (session('success'))
                <div class="alert alert-success py-2 small">{{ session('success') }}</div>
            @endif

            <form method="POST" action="{{ route('login.store') }}" novalidate>
                @csrf {{-- hidden _token field; VerifyCsrfToken rejects the POST without it (419) --}}

                <div class="mb-3">
                    <label for="email" class="form-label fw-medium">Email</label>
                    <input id="email" type="email" name="email" value="{{ old('email') }}" required autofocus
                           autocomplete="username" @class(['form-control', 'is-invalid' => $errors->has('email')])>
                    @error('email')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>

                <div class="mb-3">
                    <label for="password" class="form-label fw-medium">Password</label>
                    <input id="password" type="password" name="password" required autocomplete="current-password"
                           @class(['form-control', 'is-invalid' => $errors->has('password')])>
                    @error('password')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>

                <div class="form-check mb-3">
                    <input class="form-check-input" type="checkbox" name="remember" id="remember" value="1">
                    <label class="form-check-label small" for="remember">Keep me signed in</label>
                </div>

                <button type="submit" class="btn btn-primary w-100 fw-semibold">Sign in</button>
            </form>
        </div>
    </div>
    <p class="text-center small text-muted mt-3 mb-0">Staff and admin accounts only.</p>
</div>
@endsection
