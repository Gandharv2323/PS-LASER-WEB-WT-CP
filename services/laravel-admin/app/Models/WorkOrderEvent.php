<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkOrderEvent extends Model
{
    public const UPDATED_AT = null; // table only has created_at

    protected $fillable = ['work_order_id', 'status', 'note'];

    protected function casts(): array
    {
        return ['created_at' => 'datetime'];
    }

    public function workOrder(): BelongsTo
    {
        return $this->belongsTo(WorkOrder::class);
    }
}
