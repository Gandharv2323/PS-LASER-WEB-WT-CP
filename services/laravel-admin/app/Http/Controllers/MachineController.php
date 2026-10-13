<?php

namespace App\Http\Controllers;

use App\Http\Requests\MachineRequest;
use App\Models\AuditLog;
use App\Models\Machine;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\View\View;

/** Full resource controller: index, create, store, show, edit, update, destroy. */
class MachineController extends Controller
{
    public function index(Request $request): View
    {
        $machines = Machine::query()
            ->when($request->query('q'), fn ($q, $term) => $q->where(fn ($w) => $w
                ->where('name', 'like', "%{$term}%")->orWhere('category', 'like', "%{$term}%")))
            ->ordered()
            ->paginate(config('pslaser.per_page'))
            ->withQueryString();

        return view('machines.index', compact('machines'));
    }

    public function create(): View
    {
        return view('machines.create', ['machine' => new Machine(['sort_order' => Machine::max('sort_order') + 1])]);
    }

    public function store(MachineRequest $request): RedirectResponse
    {
        $machine = Machine::create($request->validated());
        AuditLog::record('machine.create', $machine, $machine->name);

        return redirect()->route('machines.show', $machine)->with('success', "Machine \"{$machine->short_name}\" added.");
    }

    public function show(Machine $machine): View
    {
        $machine->loadCount(['workOrders', 'enquiries']);

        return view('machines.show', compact('machine'));
    }

    public function edit(Machine $machine): View
    {
        return view('machines.edit', compact('machine'));
    }

    public function update(MachineRequest $request, Machine $machine): RedirectResponse
    {
        $machine->update($request->validated());
        AuditLog::record('machine.update', $machine, $machine->name);

        return redirect()->route('machines.show', $machine)->with('success', 'Machine updated.');
    }

    public function destroy(Machine $machine): RedirectResponse
    {
        Gate::authorize('admin'); // 403 for staff

        $name = $machine->short_name;
        AuditLog::record('machine.delete', $machine, $name);
        $machine->delete();

        return redirect()->route('machines.index')->with('success', "Machine \"{$name}\" deleted.");
    }
}
