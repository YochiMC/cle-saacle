<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Enums\AcademicStatus;

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
        'evaluable_units',
    ];

    protected $casts = [
        'status' => AcademicStatus::class,
        'mode'   => \App\Enums\GroupMode::class,
        'type'   => \App\Enums\GroupType::class,
        'evaluable_units' => 'integer',
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

    /**
     * Alumnos inscritos en el grupo.
     * Accede a través de la tabla de calificaciones (pivot).
     */
    public function students(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Student::class, 'qualifications')
            ->withPivot('units_breakdown', 'final_average', 'is_approved', 'is_left')
            ->withTimestamps();
    }
}
