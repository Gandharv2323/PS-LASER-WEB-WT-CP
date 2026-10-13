<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateEnquiryStatusRequest;
use App\Models\AuditLog;
use App\Models\Enquiry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

/** Route::resource('enquiries')->only(['index', 'show', 'update']) */
class EnquiryController extends Controller
{
    public function index(Request $request): View
    {
        $enquiries = Enquiry::query()
            ->withCount('uploads')
            ->status($request->query('status'))       // local scopes on the model
            ->search($request->query('q'))
            ->when($request->query('source'), fn ($q, $source) => $q->where('source', $source))
            ->latest()
            ->paginate(config('pslaser.per_page'))
            ->withQueryString();                        // keep filters in pagination links

        $statusCounts = Enquiry::query()->selectRaw('status, COUNT(*) AS total')->groupBy('status')->pluck('total', 'status');

        return view('enquiries.index', compact('enquiries', 'statusCounts'));
    }

    /** Route model binding: {enquiry} -> Enquiry::findOrFail($id) */
    public function show(Enquiry $enquiry): View
    {
        $enquiry->load(['uploads', 'quotes', 'service', 'machine']); // eager loading

        return view('enquiries.show', compact('enquiry'));
    }

    public function update(UpdateEnquiryStatusRequest $request, Enquiry $enquiry): RedirectResponse
    {
        $old = $enquiry->status;
        $enquiry->update($request->validated());
        AuditLog::record('enquiry.status', $enquiry, "{$old} -> {$enquiry->status}");

        return back()->with('success', "Enquiry #{$enquiry->id} marked as {$enquiry->status}.");
    }
}
