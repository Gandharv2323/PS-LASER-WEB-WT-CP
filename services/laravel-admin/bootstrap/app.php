<?php

use App\Http\Middleware\EnsureUserHasRole;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Route middleware alias: ->middleware('role:admin,staff')
        $middleware->alias([
            'role' => EnsureUserHasRole::class,
        ]);

        // Behind the Caddy reverse proxy (deploy/): trust X-Forwarded-* so URLs and secure cookies use https.
        // Safe here because the container is only reachable through Caddy on the private compose network.
        $middleware->trustProxies(at: '*');

        // Where the `auth` / `guest` middleware send people.
        $middleware->redirectGuestsTo(fn () => route('login'));
        $middleware->redirectUsersTo(fn () => route('dashboard'));
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
