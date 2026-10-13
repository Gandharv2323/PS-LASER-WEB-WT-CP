<?php

namespace App\Console\Commands;

use App\Models\Enquiry;
use App\Models\Quote;
use App\Models\Setting;
use App\Models\WorkOrder;
use Illuminate\Console\Command;

/**
 * Custom Artisan command:  php artisan pslaser:report [--days=30]
 * Prints enquiry, quote and work-order statistics for the last N days.
 */
class PslaserReport extends Command
{
    protected $signature = 'pslaser:report {--days=30 : Look-back window in days}';

    protected $description = 'Print PS Laser enquiry / quote / work-order statistics';

    public function handle(): int
    {
        $days = (int) $this->option('days');
        if ($days < 1) {
            $this->error('--days must be at least 1');

            return self::FAILURE;
        }
        $since = now()->subDays($days);

        $this->info("PS Laser report — last {$days} day(s) (since {$since->format('d M Y')})");
        $this->newLine();

        // Enquiries per status (all time vs window)
        $all = Enquiry::query()->selectRaw('status, COUNT(*) c')->groupBy('status')->pluck('c', 'status');
        $recent = Enquiry::query()->where('created_at', '>=', $since)->selectRaw('status, COUNT(*) c')->groupBy('status')->pluck('c', 'status');
        $this->line('<comment>Enquiries by status</comment>');
        $this->table(['Status', "Last {$days}d", 'All time'], collect(Enquiry::STATUSES)
            ->map(fn ($s) => [$s, $recent[$s] ?? 0, $all[$s] ?? 0])
            ->push(['TOTAL', $recent->sum(), $all->sum()])
            ->all());

        $won = (int) ($all['won'] ?? 0);
        $closed = $won + (int) ($all['lost'] ?? 0);
        $this->line('Win rate (won / (won+lost)): '.($closed ? round($won / $closed * 100, 1).'%' : 'n/a'));

        $bySource = Enquiry::query()->where('created_at', '>=', $since)->selectRaw('source, COUNT(*) c')->groupBy('source')->pluck('c', 'source');
        if ($bySource->isNotEmpty()) {
            $this->line('By source: '.$bySource->map(fn ($c, $s) => "{$s}={$c}")->implode(', '));
        }
        $this->newLine();

        // Quotes
        $quotes = Quote::query()->where('created_at', '>=', $since);
        $this->line('<comment>Quotes</comment>');
        $this->table(['Metric', 'Value'], [
            ["Quotes (last {$days}d)", (clone $quotes)->count()],
            ['Quotes (all time)', Quote::count()],
            ["Value (last {$days}d)", '₹'.number_format((float) (clone $quotes)->sum('amount_inr'), 2)],
            ["Average (last {$days}d)", '₹'.number_format((float) (clone $quotes)->avg('amount_inr'), 2)],
            ['Top material', Quote::query()->selectRaw('material_code, COUNT(*) c')->groupBy('material_code')->orderByDesc('c')->value('material_code') ?? '—'],
        ]);

        // Work orders
        $this->line('<comment>Work orders</comment>');
        $this->line('Open: '.WorkOrder::open()->count()
            .' · Overdue: '.WorkOrder::open()->whereDate('due_date', '<', today())->count()
            .' · Dispatched: '.WorkOrder::status('dispatched')->count());

        if (Setting::ratesAreSample()) {
            $this->newLine();
            $this->warn('Rate card is still flagged as SAMPLE prices (settings.rates_are_sample = 1).');
        }

        return self::SUCCESS;
    }
}
