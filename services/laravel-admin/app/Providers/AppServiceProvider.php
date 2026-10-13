<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Pagination links rendered with Bootstrap 5 markup ({{ $items->links() }}).
        Paginator::useBootstrapFive();

        // Named rate limiter used by the `throttle:login` middleware on POST /login:
        // max 5 attempts per minute per email + IP.
        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(5)->by(strtolower((string) $request->input('email')).'|'.$request->ip());
        });

        // Authorization gate: only admins may delete catalogue items / work orders
        // or change the rate card "sample" flag. Used with @can('admin') in Blade.
        Gate::define('admin', fn (User $user) => $user->isAdmin());
    }
}
