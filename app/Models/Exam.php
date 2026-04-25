<?php

namespace App\Models;

use App\Enums\AcademicStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Modelo de dominio para exámenes académicos.
 *
 * Incluye:
 * - relaciones académicas (periodo, docente, alumnos inscritos);
 * - scope de visibilidad por rol para el catálogo principal.
 */
class Exam extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'exam_type',
        'capacity',
        'mode',
        'start_date',
        'end_date',
        'application_time',
        'classroom',
        'status',
        'period_id',
        'teacher_id',
    ];

    protected $casts = [
        'status'    => \App\Enums\AcademicStatus::class,
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

    /** Alumnos inscritos al examen (many-to-many con pivot de calificación dinámica). */
    public function students(): BelongsToMany
    {
        return $this->belongsToMany(Student::class, 'exam_student')
            ->using(ExamStudent::class)
            ->withPivot('calificacion', 'units_breakdown', 'final_average')
            ->withTimestamps();
    }

    /**
     * Scope de lectura para catálogo de exámenes según rol del usuario.
     *
     * Reglas:
     * - admin/coordinator: sin restricción.
     * - teacher: solo exámenes asignados.
     * - student: exámenes disponibles por estado + exámenes históricos propios.
     * - otros: sin visibilidad (fallback de seguridad).
     */
    public function scopeVisibleToUser(Builder $query, User $user): Builder
    {
        // 1. Admins y Coordinadores: Sin restricciones
        if ($user->hasRole(['admin', 'coordinator'])) {
            return $query;
        }

        // 2. Docentes: Solo sus exámenes asignados
        if ($user->hasRole('teacher')) {
            return $query->where('teacher_id', $user->teacher?->id);
        }

        // 3. Estudiantes: Exámenes disponibles + historial propio
        if ($user->hasRole('student')) {
            $student = $user->student;

            return $query->where(function ($q) use ($student) {
                $q->whereIn('status', [
                    AcademicStatus::ENROLLING->value,
                    AcademicStatus::ACTIVE->value,
                    AcademicStatus::PENDING->value,
                ])->orWhereHas('students', function ($enrolledQuery) use ($student) {
                    $enrolledQuery->where('student_id', $student?->id);
                });
            });
        }

        // Fallback de seguridad: Si no es ninguno de los roles anteriores, no ve nada.
        return $query->whereRaw('1 = 0');
    }
}
