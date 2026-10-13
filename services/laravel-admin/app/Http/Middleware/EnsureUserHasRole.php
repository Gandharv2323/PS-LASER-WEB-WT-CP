<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Route middleware `role:admin,staff` (alias registered in bootstrap/app.php).
 * Lets the request through only if the logged-in user has one of the given roles.
 */
class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->guest(route('login'));
        }

        if (! $user->hasRole(...$roles)) {
            // A customer account somehow got a session here: end it.
            if (! $user->hasRole('admin', 'staff')) {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return redirect()->route('login')->withErrors(['email' => 'This area is for PS Laser staff only.']);
            }

            abort(403, 'Your role ('.$user->role.') cannot access this page.');
        }

        return $next($request);
    }
}
