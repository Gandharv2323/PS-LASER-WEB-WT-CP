<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EnquiryController;
use App\Http\Controllers\MachineController;
use App\Http\Controllers\QuoteController;
use App\Http\Controllers\RateController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\WorkOrderController;
use App\Http\Controllers\WorkOrderEventController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| PS Laser Admin routes
|--------------------------------------------------------------------------
| Every route here runs in the `web` middleware group (sessions, cookies,
| CSRF verification). Named routes are used everywhere via route('name').
*/

Route::redirect('/', '/dashboard');

// Guests only: login form + attempt (rate limited by the named 'login' limiter).
Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store'])->middleware('throttle:login')->name('login.store');
});

// Back office: must be logged in AND have role admin or staff.
Route::middleware(['auth', 'role:admin,staff'])->group(function () {
    Route::post('/logout', [LoginController::class, 'destroy'])->name('logout');

    Route::get('/dashboard', DashboardController::class)->name('dashboard');

    Route::resource('enquiries', EnquiryController::class)->only(['index', 'show', 'update']);

    Route::resource('machines', MachineController::class);
    Route::resource('services', ServiceController::class)->except('show');

    Route::get('/rates', [RateController::class, 'index'])->name('rates.index');
    Route::put('/rates', [RateController::class, 'update'])->name('rates.update');
    Route::put('/settings/estimator', [RateController::class, 'updateSettings'])
        ->middleware('can:admin')->name('settings.update');

    Route::resource('work-orders', WorkOrderController::class);
    Route::post('/work-orders/{work_order}/events', [WorkOrderEventController::class, 'store'])
        ->name('work-orders.events.store');

    Route::get('/quotes', [QuoteController::class, 'index'])->name('quotes.index');
});
