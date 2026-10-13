<?php

namespace App\Http\Controllers;

use App\Models\Quote;
use Illuminate\Http\Request;
use Illuminate\View\View;

/** Read-only list of saved estimates (created by the PHP estimator / Spring API). */
class QuoteController extends Controller
{
    public function index(Request $request): View
    {
        $quotes = Quote::query()
            ->with(['material', 'enquiry'])
            ->search($request->query('q'))
            ->when($request->query('material'), fn ($q, $code) => $q->where('material_code', $code))
            ->latest('created_at')
            ->paginate(config('pslaser.per_page'))
            ->withQueryString();

        $totalValue = Quote::sum('amount_inr');

        return view('quotes.index', compact('quotes', 'totalValue'));
    }
}
