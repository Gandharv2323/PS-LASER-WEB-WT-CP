<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Material extends Model
{
    public $timestamps = false; // shared table has no timestamp columns

    protected $fillable = ['code', 'name', 'max_thickness_mm', 'density_g_cm3'];

    protected function casts(): array
    {
        return ['max_thickness_mm' => 'decimal:2', 'density_g_cm3' => 'decimal:2'];
    }

    public function rates(): HasMany
    {
        return $this->hasMany(Rate::class, 'material_code', 'code')->orderBy('thickness_from_mm');
    }
}
