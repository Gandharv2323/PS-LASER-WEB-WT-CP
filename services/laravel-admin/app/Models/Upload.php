<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Drawing files (DXF/DWG/PDF/images) uploaded with an enquiry by the PHP/Node services. */
class Upload extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = ['enquiry_id', 'original_name', 'stored_path', 'mime', 'size_bytes'];

    protected function casts(): array
    {
        return ['size_bytes' => 'integer', 'created_at' => 'datetime'];
    }

    public function enquiry(): BelongsTo
    {
        return $this->belongsTo(Enquiry::class);
    }

    /** Accessor: $upload->human_size, e.g. "1.2 MB". */
    protected function humanSize(): Attribute
    {
        return Attribute::get(function () {
            $b = (int) $this->size_bytes;
            if ($b >= 1048576) {
                return round($b / 1048576, 1).' MB';
            }

            return $b >= 1024 ? round($b / 1024, 1).' KB' : $b.' bytes';
        });
    }
}
