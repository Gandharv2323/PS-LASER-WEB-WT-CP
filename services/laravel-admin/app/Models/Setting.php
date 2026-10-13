<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** Key/value settings table — string primary key `key`. */
class Setting extends Model
{
    protected $primaryKey = 'key';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = ['key', 'value'];

    public static function get(string $key, ?string $default = null): ?string
    {
        return static::query()->whereKey($key)->value('value') ?? $default;
    }

    public static function put(string $key, string $value): void
    {
        static::query()->updateOrCreate(['key' => $key], ['value' => $value]);
    }

    public static function ratesAreSample(): bool
    {
        return static::get('rates_are_sample', '1') === '1';
    }
}
