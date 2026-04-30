<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

use App\Enums\ServiceStatus;
use App\Enums\ServiceType;

class Service extends Model
{
    //
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'type',
        'amount',
        'status',
        'description',
        'reference_number',
        'original_name',
        'file_path',
        'disk',
        'comments',
        'student_id',
        'period_id',
    ];

    protected $casts = [
        'type' => ServiceType::class,
        'status' => ServiceStatus::class,
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function period(): BelongsTo
    {
        return $this->belongsTo(Period::class);
    }
}
