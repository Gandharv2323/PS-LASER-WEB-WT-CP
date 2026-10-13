<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Saved price estimates (created by the PHP estimator / Spring API). Read-only here. */
class Quote extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = [
        'quote_no', 'enquiry_id', 'customer_name', 'customer_phone', 'material_code', 'thickness_mm',
        'length_mm', 'width_mm', 'cut_length_mm', 'pierces', 'bends', 'powder_coat', 'quantity',
        'amount_inr', 'is_estimate', 'source',
    ];

    protected function casts(): array
    {
        return [
            'thickness_mm' => 'decimal:2',
            'length_mm' => 'decimal:2',
            'width_mm' => 'decimal:2',
            'cut_length_mm' => 'decimal:2',
            'amount_inr' => 'decimal:2',
            'powder_coat' => 'boolean',
            'is_estimate' => 'boolean',
            'pierces' => 'integer',
            'bends' => 'integer',
            'quantity' => 'integer',
            'created_at' => 'datetime',
        ];
    }

    public function enquiry(): BelongsTo
    {
        return $this->belongsTo(Enquiry::class);
    }

    public function material(): BelongsTo
    {
        return $this->belongsTo(Material::class, 'material_code', 'code');
    }

    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        $term = trim((string) $term);
        if ($term === '') {
            return $query;
        }

        return $query->where(fn (Builder $q) => $q
            ->where('quote_no', 'like', "%{$term}%")
            ->orWhere('customer_name', 'like', "%{$term}%")
            ->orWhere('customer_phone', 'like', "%{$term}%"));
    }
}
