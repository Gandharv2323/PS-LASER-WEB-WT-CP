<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreWorkOrderEventRequest;
use App\Models\AuditLog;
use App\Models\WorkOrder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;

/** Nested resource: POST /work-orders/{work_order}/events */
class WorkOrderEventController extends Controller
{
    public function store(StoreWorkOrderEventRequest $request, WorkOrder $workOrder): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($workOrder, $data) {
            $workOrder->events()->create($data);       // timeline entry
            $workOrder->update(['status' => $data['status']]); // current status
        });
        AuditLog::record('work_order.event', $workOrder, $data['status'].($data['note'] ? ': '.$data['note'] : ''));

        return redirect()->route('work-orders.show', $workOrder)
            ->with('success', "Status set to {$data['status']}. Customers see it on the tracking page.");
    }
}
