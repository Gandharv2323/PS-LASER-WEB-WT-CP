<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Service extends Model
{
    protected $fillable = ['slug', 'title', 'description', 'image', 'sort_order'];

    protected function casts(): array
    {
        return ['sort_order' => 'integer'];
    }

    public function enquiries(): HasMany
    {
        return $this->hasMany(Enquiry::class, 'service_slug', 'slug');
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order')->orderBy('title');
    }

    protected function imageUrl(): Attribute
    {
        return Attribute::get(fn () => rtrim(config('pslaser.asset_base'), '/').'/'.ltrim((string) $this->image, '/'));
    }
}
