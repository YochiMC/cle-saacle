<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Group extends Model
{
    //
    protected $fillable = [
        'name',
        'mode',
        'type',
        'capacity',
        'schedule',
        'classroom',
        'link',
        'period_id',
        'teacher_id',
        'level_id'
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
