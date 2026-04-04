<?php

namespace App\Models;

use App\Enums\DocumentStatus;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Document extends Model
{
    use HasFactory, SoftDeletes;
    protected $fillable = [
        'user_id',
        'type',
        'file_path',
        'status',
        'comments'
    ];

    protected function casts(): array
    {
        return [
            'status' => DocumentStatus::class,
        ];
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }
}
