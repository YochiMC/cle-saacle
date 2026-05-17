<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
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
        'rejection_reason',
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

    /**
     * Alcance de visibilidad según el rol del usuario.
     *
     * Reglas:
     * - Admin/Coordinator: Todos los servicios sin restricción.
     * - Student: Solo servicios propios (student_id = user.student.id).
     * - Otros roles: No visible.
     */
    public function scopeVisibleToUser(Builder $query, User $user): Builder
    {
        // Admin y Coordinador: sin restricciones
        if ($user->hasRole(['admin', 'coordinator'])) {
            return $query;
        }

        // Estudiante: solo sus propios servicios
        if ($user->hasRole('student')) {
            return $query->where('student_id', $user->student?->id);
        }

        // Otros roles: no visible
        return $query->whereRaw('1 = 0');
    }
}
