<?php

namespace App\Policies;

use App\Models\Teacher;
use App\Models\User;

/**
 * Policy para autorización del módulo de docentes.
 *
 * Reglas generales:
 * - Administrador: acceso total mediante `before`.
 * - Coordinador: gestión completa del recurso.
 * - Docente: acceso a su propio registro.
 */
class TeacherPolicy
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

    /** Permite listar docentes. */
    public function viewAny(User $user): bool
    {
        return $user->hasRole('coordinator');
    }

    /** Permite consultar un docente específico. */
    public function view(User $user, Teacher $teacher): bool
    {
        return $user->hasRole('teacher') && $teacher->user_id === $user->id
            || $user->hasRole('coordinator');
    }

    /** Permite crear docentes. */
    public function create(User $user): bool
    {
        return $user->hasRole('coordinator');
    }

    /** Permite actualizar un docente. */
    public function update(User $user, Teacher $teacher): bool
    {
        return $user->hasRole('teacher') && $teacher->user_id === $user->id
            || $user->hasRole('coordinator');
    }

    /** Permite eliminar un docente de forma individual. */
    public function delete(User $user, Teacher $teacher): bool
    {
        return $user->hasRole('coordinator');
    }

    /**
     * Determina si el usuario puede eliminar docentes de forma masiva.
     */
    public function deleteAny(User $user): bool
    {
        return $user->hasRole('coordinator');
    }

    /** Reserva restauración para administrador (vía before). */
    public function restore(User $user, Teacher $teacher): bool
    {
        return false;
    }

    /** Reserva eliminación forzada para administrador (vía before). */
    public function forceDelete(User $user, Teacher $teacher): bool
    {
        return false;
    }
}
