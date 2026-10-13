<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Machine extends Model
{
    protected $fillable = ['slug', 'name', 'short_name', 'category', 'specs', 'image', 'sort_order'];

    protected function casts(): array
    {
        return ['sort_order' => 'integer'];
    }

    /** Work orders reference machines by slug (shared schema), not by id. */
    public function workOrders(): HasMany
    {
        return $this->hasMany(WorkOrder::class, 'machine_slug', 'slug');
    }

    public function enquiries(): HasMany
    {
        return $this->hasMany(Enquiry::class, 'machine_slug', 'slug');
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    /** Accessor: $machine->spec_list — the "one spec per line" TEXT column as an array. */
    protected function specList(): Attribute
    {
        return Attribute::get(fn () => array_values(array_filter(array_map('trim', preg_split('/\R/', (string) $this->specs)))));
    }

    /** Accessor: $machine->image_url — absolute URL served by the Next.js site. */
    protected function imageUrl(): Attribute
    {
        return Attribute::get(fn () => str_starts_with((string) $this->image, 'http')
            ? $this->image
            : rtrim(config('pslaser.asset_base'), '/').'/'.ltrim((string) $this->image, '/'));
    }
}
