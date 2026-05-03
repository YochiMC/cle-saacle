<?php

namespace App\Policies;

use App\Models\Student;
use App\Models\User;

/**
 * Policy para autorización del módulo de alumnos.
 *
 * Reglas generales:
 * - Administrador: acceso total mediante `before`.
 * - Coordinador: gestión completa del recurso.
 * - Alumno: acceso a su propio registro.
 * - Docente: acceso de consulta al listado (vía viewAny).
 */
class StudentPolicy
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

    /** Permite listar alumnos. */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['teacher', 'coordinator']);
    }

    /** Permite consultar un alumno específico. */
    public function view(User $user, Student $student): bool
    {
        return ($user->hasRole('student') && $student->user_id === $user->id)
            || $user->hasRole('coordinator');
    }

    /** Permite crear alumnos. */
    public function create(User $user): bool
    {
        return $user->hasRole('coordinator');
    }

    /** Permite actualizar un alumno. */
    public function update(User $user, Student $student): bool
    {
        return ($user->hasRole('student') && $student->user_id === $user->id)
            || $user->hasRole('coordinator');
    }

    /** Permite eliminar un alumno de forma individual. */
    public function delete(User $user, Student $student): bool
    {
        return $user->hasRole('coordinator');
    }

    /**
     * Determina si el usuario puede eliminar alumnos de forma masiva.
     */
    public function deleteAny(User $user): bool
    {
        return $user->hasRole('coordinator');
    }

    /** Reserva restauración para administrador (vía before). */
    public function restore(User $user, Student $student): bool
    {
        return false;
    }

    /** Reserva eliminación forzada para administrador (vía before). */
    public function forceDelete(User $user, Student $student): bool
    {
        return false;
    }

    /** Permite consultar el Kardex del propio alumno o por coordinación. */
    public function viewKardex(User $user, Student $student): bool
    {
        return ($user->id === $student->user_id && $user->hasRole('student'))
            || $user->hasRole('coordinator');
    }
}
