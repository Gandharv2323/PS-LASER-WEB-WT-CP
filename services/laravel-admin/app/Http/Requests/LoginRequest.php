<?php

namespace App\Http\Requests;

use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Validates the login form and performs the authentication attempt.
 * Second layer of brute-force protection: 5 failed attempts per email+IP
 * lock the form for 60 s (the route also has throttle:login).
 */
class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ];
    }

    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        // Auth::attempt hashes nothing itself: it loads the user and calls
        // Hash::check() (bcrypt) against users.password. The closure limits
        // logins to back-office roles, so customers cannot sign in here.
        $ok = Auth::attempt([
            'email' => $this->string('email')->lower()->toString(),
            'password' => $this->string('password')->toString(),
            fn ($query) => $query->whereIn('role', ['admin', 'staff']),
        ], $this->boolean('remember'));

        if (! $ok) {
            RateLimiter::hit($this->throttleKey(), 60);

            throw ValidationException::withMessages([
                'email' => 'These credentials do not match a PS Laser staff account.',
            ]);
        }

        RateLimiter::clear($this->throttleKey());
    }

    protected function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));
        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => "Too many login attempts. Try again in {$seconds} seconds.",
        ]);
    }

    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->string('email')).'|'.$this->ip());
    }
}
