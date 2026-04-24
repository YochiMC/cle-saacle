<?php

namespace App\Policies;

use App\Models\Qualification;
use App\Models\User;

/**
 * Policy para autorización del módulo de calificaciones de grupos.
 *
 * Reglas generales:
 * - Administrador: acceso total mediante `before`.
 * - Coordinador: gestión operativa del recurso.
 * - Docente: acceso a calificaciones de grupos asignados.
 * - Alumno: acceso de consulta sobre sus propias calificaciones.
 */
class QualificationPolicy
{
    /**
     * Otorga acceso total al administrador antes de evaluar habilidades específicas.
     */
    public function before(User $user, string $ability): ?bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        return null;
    }

    /** Permite listar calificaciones. */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'coordinator', 'student', 'teacher']);
    }

    /** Permite consultar una calificación específica. */
    public function view(User $user, Qualification $qualification): bool
    {
        return $user->hasAnyRole(['admin', 'coordinator'])
            || ($user->hasRole('student') && $qualification->student?->user_id === $user->id)
            || ($user->hasRole('teacher') && $qualification->group?->teacher_id === $user->teacher?->id);
    }

    /** Permite crear calificaciones. */
    public function create(User $user): bool
    {
        return $user->hasRole('coordinator');
    }

    /** Permite actualizar una calificación de forma individual. */
    public function update(User $user, Qualification $qualification): bool
    {
        return $user->hasRole('coordinator')
            || ($user->hasRole('teacher') && $qualification->group?->teacher_id === $user->teacher?->id);
    }

    /** Permite actualización masiva de calificaciones. */
    public function updateAny(User $user): bool
    {
        return $user->hasAnyRole(['coordinator', 'teacher']);
    }

    /** Permite eliminar una calificación. */
    public function delete(User $user, Qualification $qualification): bool
    {
        return $user->hasRole('coordinator');
    }

    /** Reserva restauración para administrador (vía before). */
    public function restore(User $user, Qualification $qualification): bool
    {
        return false;
    }

    /** Reserva eliminación forzada para administrador (vía before). */
    public function forceDelete(User $user, Qualification $qualification): bool
    {
        return false;
    }
}
