<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Enquiry extends Model
{
    public const STATUSES = ['new', 'contacted', 'quoted', 'won', 'lost'];
    public const SOURCES = ['next', 'react', 'php', 'laravel', 'jsp', 'spring', 'node'];

    protected $fillable = ['name', 'phone', 'email', 'service_slug', 'machine_slug', 'message', 'source', 'status'];

    protected $attributes = ['status' => 'new', 'source' => 'laravel'];

    protected function casts(): array
    {
        return ['created_at' => 'datetime', 'updated_at' => 'datetime'];
    }

    public function uploads(): HasMany
    {
        return $this->hasMany(Upload::class);
    }

    public function quotes(): HasMany
    {
        return $this->hasMany(Quote::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class, 'service_slug', 'slug');
    }

    public function machine(): BelongsTo
    {
        return $this->belongsTo(Machine::class, 'machine_slug', 'slug');
    }

    /** Scope: Enquiry::status('new') - ignores empty/unknown values. */
    public function scopeStatus(Builder $query, ?string $status): Builder
    {
        return in_array($status, self::STATUSES, true) ? $query->where('status', $status) : $query;
    }

    /** Scope: free-text search on name / phone / email / message. */
    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        $term = trim((string) $term);
        if ($term === '') {
            return $query;
        }

        return $query->where(function (Builder $q) use ($term) {
            $like = '%'.$term.'%';
            $q->where('name', 'like', $like)
                ->orWhere('phone', 'like', $like)
                ->orWhere('email', 'like', $like)
                ->orWhere('message', 'like', $like);
        });
    }

    public function whatsappUrl(): string
    {
        $phone = preg_replace('/\D/', '', (string) $this->phone);
        if (strlen($phone) === 10) {
            $phone = '91'.$phone;
        }

        return 'https://wa.me/'.$phone.'?text='.rawurlencode("Hello {$this->name}, this is PS Laser regarding your enquiry #{$this->id}.");
    }
}
