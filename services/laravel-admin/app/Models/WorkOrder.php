<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** Customer job ("where is my order"). Named work_orders to avoid Laravel's own `jobs` queue table. */
class WorkOrder extends Model
{
    public const STATUSES = ['received', 'cutting', 'bending', 'welding', 'coating', 'inspection', 'dispatched'];

    protected $fillable = ['order_no', 'customer_name', 'customer_phone', 'description', 'machine_slug', 'quantity', 'status', 'due_date'];

    protected $attributes = ['status' => 'received', 'quantity' => 1];

    protected function casts(): array
    {
        return ['due_date' => 'date', 'quantity' => 'integer'];
    }

    /** One-to-many: the status timeline, oldest first. */
    public function events(): HasMany
    {
        return $this->hasMany(WorkOrderEvent::class)->orderBy('created_at')->orderBy('id');
    }

    public function machine(): BelongsTo
    {
        return $this->belongsTo(Machine::class, 'machine_slug', 'slug');
    }

    public function scopeStatus(Builder $query, ?string $status): Builder
    {
        return in_array($status, self::STATUSES, true) ? $query->where('status', $status) : $query;
    }

    public function scopeOpen(Builder $query): Builder
    {
        return $query->where('status', '!=', 'dispatched');
    }

    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        $term = trim((string) $term);
        if ($term === '') {
            return $query;
        }

        return $query->where(fn (Builder $q) => $q
            ->where('order_no', 'like', "%{$term}%")
            ->orWhere('customer_name', 'like', "%{$term}%")
            ->orWhere('customer_phone', 'like', "%{$term}%"));
    }

    public function isOverdue(): bool
    {
        return $this->due_date !== null && $this->status !== 'dispatched'
            && $this->due_date->isPast() && ! $this->due_date->isToday();
    }

    /** Next order number like PSL-2610-0007 (yymm + running id). */
    public static function nextOrderNo(): string
    {
        return sprintf('PSL-%s-%04d', now()->format('ym'), ((int) static::max('id')) + 1);
    }

    /** Percent through the production pipeline (for the progress bar). */
    public function progress(): int
    {
        $i = array_search($this->status, self::STATUSES, true);

        return (int) round((($i === false ? 0 : $i) / (count(self::STATUSES) - 1)) * 100);
    }
}
