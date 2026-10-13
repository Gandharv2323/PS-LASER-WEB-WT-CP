<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;

/** Laravel-owned table admin_audit_logs (see its migration): who changed what. */
class AuditLog extends Model
{
    protected $table = 'admin_audit_logs';

    protected $fillable = ['user_id', 'action', 'subject_type', 'subject_id', 'details'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @param Model|string $subject a model, or a plain label for non-model changes */
    public static function record(string $action, Model|string $subject, ?string $details = null): self
    {
        return static::create([
            'user_id' => Auth::id(),
            'action' => $action,
            'subject_type' => is_string($subject) ? $subject : class_basename($subject),
            'subject_id' => is_string($subject) ? null : $subject->getKey(),
            'details' => $details !== null ? mb_substr($details, 0, 255) : null,
        ]);
    }
}
