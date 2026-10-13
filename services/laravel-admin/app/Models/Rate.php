<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Estimator rate card row (SAMPLE prices while is_sample = 1). */
class Rate extends Model
{
    public const CREATED_AT = null; // table only has updated_at

    protected $fillable = [
        'material_code', 'thickness_from_mm', 'thickness_to_mm',
        'cut_rate_per_m', 'pierce_rate', 'material_rate_per_kg', 'is_sample',
    ];

    protected function casts(): array
    {
        return [
            'thickness_from_mm' => 'decimal:2',
            'thickness_to_mm' => 'decimal:2',
            'cut_rate_per_m' => 'decimal:2',
            'pierce_rate' => 'decimal:2',
            'material_rate_per_kg' => 'decimal:2',
            'is_sample' => 'boolean',
        ];
    }

    public function material(): BelongsTo
    {
        return $this->belongsTo(Material::class, 'material_code', 'code');
    }

    public function scopeSample(Builder $query, bool $sample = true): Builder
    {
        return $query->where('is_sample', $sample);
    }
}
