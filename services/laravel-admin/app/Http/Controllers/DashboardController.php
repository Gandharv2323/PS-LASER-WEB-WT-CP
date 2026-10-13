<?php

namespace App\Http\Controllers;

use App\Models\Enquiry;
use App\Models\Machine;
use App\Models\Quote;
use App\Models\Setting;
use App\Models\WorkOrder;
use Illuminate\View\View;

/** Single-action (invokable) controller for the dashboard. */
class DashboardController extends Controller
{
    public function __invoke(): View
    {
        $counts = [
            'enquiries' => Enquiry::count(),
            'new_enquiries' => Enquiry::status('new')->count(),
            'open_orders' => WorkOrder::open()->count(),
            'quotes' => Quote::count(),
            'machines' => Machine::count(),
        ];

        // GROUP BY status -> ['received' => 3, 'cutting' => 1, ...] in pipeline order.
        $byStatus = WorkOrder::query()->selectRaw('status, COUNT(*) AS total')
            ->groupBy('status')->pluck('total', 'status');
        $ordersByStatus = collect(WorkOrder::STATUSES)->mapWithKeys(fn ($s) => [$s => (int) ($byStatus[$s] ?? 0)]);

        $latestEnquiries = Enquiry::query()->withCount('uploads')->latest()->take(6)->get();
        $dueSoon = WorkOrder::open()->whereNotNull('due_date')->orderBy('due_date')->take(5)->get();

        return view('dashboard', [
            'counts' => $counts,
            'ordersByStatus' => $ordersByStatus,
            'latestEnquiries' => $latestEnquiries,
            'dueSoon' => $dueSoon,
            'ratesAreSample' => Setting::ratesAreSample(),
        ]);
    }
}
