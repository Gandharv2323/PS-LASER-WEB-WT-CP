<?php

namespace App\Http\Controllers;

use App\Http\Requests\WorkOrderRequest;
use App\Models\AuditLog;
use App\Models\Machine;
use App\Models\WorkOrder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\View\View;

class WorkOrderController extends Controller
{
    public function index(Request $request): View
    {
        $orders = WorkOrder::query()
            ->with('machine')
            ->status($request->query('status'))
            ->search($request->query('q'))
            ->latest()
            ->paginate(config('pslaser.per_page'))
            ->withQueryString();

        return view('work-orders.index', compact('orders'));
    }

    public function create(): View
    {
        return view('work-orders.create', [
            'order' => new WorkOrder(['order_no' => WorkOrder::nextOrderNo(), 'due_date' => now()->addDays(7)]),
            'machines' => Machine::ordered()->pluck('short_name', 'slug'),
        ]);
    }

    public function store(WorkOrderRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['order_no'] ??= WorkOrder::nextOrderNo();

        // Create the order and its first timeline event together.
        $order = DB::transaction(function () use ($data) {
            $order = WorkOrder::create($data);
            $order->events()->create(['status' => $order->status, 'note' => 'Order created in admin']);

            return $order;
        });
        AuditLog::record('work_order.create', $order, $order->order_no);

        return redirect()->route('work-orders.show', $order)->with('success', "Work order {$order->order_no} created.");
    }

    public function show(WorkOrder $workOrder): View
    {
        $workOrder->load(['events', 'machine']);

        return view('work-orders.show', ['order' => $workOrder]);
    }

    public function edit(WorkOrder $workOrder): View
    {
        return view('work-orders.edit', [
            'order' => $workOrder,
            'machines' => Machine::ordered()->pluck('short_name', 'slug'),
        ]);
    }

    public function update(WorkOrderRequest $request, WorkOrder $workOrder): RedirectResponse
    {
        $data = $request->validated();
        $data['order_no'] ??= $workOrder->order_no;
        $statusChanged = $data['status'] !== $workOrder->status;

        DB::transaction(function () use ($workOrder, $data, $statusChanged) {
            $workOrder->update($data);
            if ($statusChanged) {
                $workOrder->events()->create(['status' => $workOrder->status, 'note' => 'Status changed via edit form']);
            }
        });
        AuditLog::record('work_order.update', $workOrder, $workOrder->order_no);

        return redirect()->route('work-orders.show', $workOrder)->with('success', 'Work order updated.');
    }

    public function destroy(WorkOrder $workOrder): RedirectResponse
    {
        Gate::authorize('admin');
        AuditLog::record('work_order.delete', $workOrder, $workOrder->order_no);
        $workOrder->delete(); // events cascade (FK ON DELETE CASCADE)

        return redirect()->route('work-orders.index')->with('success', "Work order {$workOrder->order_no} deleted.");
    }
}
