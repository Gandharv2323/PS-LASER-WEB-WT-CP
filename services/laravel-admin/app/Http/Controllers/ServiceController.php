<?php

namespace App\Http\Controllers;

use App\Http\Requests\ServiceRequest;
use App\Models\AuditLog;
use App\Models\Service;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\View\View;

/** Route::resource('services')->except('show') */
class ServiceController extends Controller
{
    public function index(): View
    {
        $services = Service::query()->withCount('enquiries')->ordered()->paginate(config('pslaser.per_page'));

        return view('services.index', compact('services'));
    }

    public function create(): View
    {
        return view('services.create', ['service' => new Service(['sort_order' => Service::max('sort_order') + 1])]);
    }

    public function store(ServiceRequest $request): RedirectResponse
    {
        $service = Service::create($request->validated());
        AuditLog::record('service.create', $service, $service->title);

        return redirect()->route('services.index')->with('success', "Service \"{$service->title}\" added.");
    }

    public function edit(Service $service): View
    {
        return view('services.edit', compact('service'));
    }

    public function update(ServiceRequest $request, Service $service): RedirectResponse
    {
        $service->update($request->validated());
        AuditLog::record('service.update', $service, $service->title);

        return redirect()->route('services.index')->with('success', 'Service updated.');
    }

    public function destroy(Service $service): RedirectResponse
    {
        Gate::authorize('admin');
        AuditLog::record('service.delete', $service, $service->title);
        $service->delete();

        return redirect()->route('services.index')->with('success', 'Service deleted.');
    }
}
