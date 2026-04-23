<?php

namespace App\Models;

use App\Enums\AcademicStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;

/**
 * Modelo de dominio para grupos académicos.
 *
 * Incluye:
 * - relaciones académicas (periodo, docente, nivel, calificaciones);
 * - scope de visibilidad por rol para el catálogo principal.
 */
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
        'mode' => \App\Enums\GroupMode::class,
        'type' => \App\Enums\GroupType::class,
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

    /**
     * Calificaciones asociadas al grupo.
     */
    public function qualifications(): \Illuminate\Database\Eloquent\Relations\HasMany
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

    /**
     * Scope de lectura para catálogo de grupos según rol del usuario.
     *
     * Reglas:
     * - admin/coordinator: sin restricción.
     * - teacher: solo grupos asignados.
     * - student: grupos disponibles por nivel + grupos históricos propios.
     * - otros: sin visibilidad (fallback de seguridad).
     */
    public function scopeVisibleToUser(Builder $query, User $user): Builder
    {
        // 1. Admins y Coordinadores: Sin restricciones
        if ($user->hasRole(['admin', 'coordinator'])) {
            return $query;
        }

        // 2. Docentes: Solo sus grupos asignados
        if ($user->hasRole('teacher')) {
            return $query->where('teacher_id', $user->teacher?->id);
        }

        // 3. Estudiantes: Lógica compleja encapsulada
        if ($user->hasRole('student')) {
            $student = $user->student;

            return $query->where(function ($q) use ($student) {

                // A) Grupos DISPONIBLES: Que sean de su nivel actual Y estén activos/en espera
                $q->where(function ($availableQuery) use ($student) {
                    $availableQuery->whereIn('status', [
                        AcademicStatus::ENROLLING->value,
                        AcademicStatus::ACTIVE->value,
                        AcademicStatus::PENDING->value,
                    ])
                        ->where('level_id', $student?->level_id);
                })

                // B) Grupos HISTÓRICOS: Donde ya está inscrito (sin importar el nivel o estado actual)
                    ->orWhereHas('qualifications', function ($enrolledQuery) use ($student) {
                        $enrolledQuery->where('student_id', $student?->id);
                    });
            });
        }

        // Fallback de seguridad: Si no es ninguno de los roles anteriores, no ve nada.
        return $query->whereRaw('1 = 0');
    }
}
