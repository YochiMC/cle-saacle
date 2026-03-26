<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Enums\GroupStatus;

class Group extends Model
{
    //
    use HasFactory, SoftDeletes;
    protected $fillable = [
        'name',
        'mode',
        'type',
        'capacity',
        'schedule',
        'classroom',
        'meeting_link',
        'status',
        'period_id',
        'teacher_id',
        'level_id',
    ];

    protected $casts = [
        'status' => GroupStatus::class,
        'mode'   => \App\Enums\GroupMode::class,
        'type'   => \App\Enums\GroupType::class,
    ];


    public function period(): BelongsTo
    {
        return $this->belongsTo(Period::class);
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    public function level(): BelongsTo
    {
        return $this->belongsTo(Level::class);
    }

    public function qualifications()
    {
        return $this->hasMany(Qualification::class);
    }
}
