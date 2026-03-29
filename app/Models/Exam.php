<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Exam extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'exam_type',
        'capacity',
        'application_date',
        'application_time',
        'classroom',
        'status',
        'period_id',
        'teacher_id',
    ];

    protected $casts = [
        'status'    => \App\Enums\GroupStatus::class,
        'exam_type' => \App\Enums\ExamType::class,
    ];

    /** Periodo al que pertenece el examen. */
    public function period(): BelongsTo
    {
        return $this->belongsTo(Period::class);
    }

    /** Docente evaluador asignado al examen (nullable). */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    /** Alumnos inscritos al examen (many-to-many con pivot de calificación). */
    public function students(): BelongsToMany
    {
        return $this->belongsToMany(Student::class, 'exam_student')
            ->withPivot('calificacion')
            ->withTimestamps();
    }
}
