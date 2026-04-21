<?php

namespace App\Policies;

use App\Models\Group;
use App\Models\User;

/**
 * Policy para autorización del módulo de grupos académicos.
 *
 * Reglas generales:
 * - Administrador: acceso total mediante `before`.
 * - Coordinador: gestión completa del recurso.
 * - Docente: acceso a sus grupos y a acciones operativas específicas.
 * - Alumno: acceso de consulta general y a su flujo de inscripción/baja.
 */
class GroupPolicy
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

    /** Permite listar grupos. */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['coordinator', 'teacher', 'student']);
    }

    /** Permite consultar un grupo específico. */
    public function view(User $user, Group $group): bool
    {
        return $user->hasRole('coordinator')
            || ($user->hasRole('teacher') && $group->teacher_id === $user->teacher?->id);
    }

    /** Permite crear grupos. */
    public function create(User $user): bool
    {
        return $user->hasRole('coordinator');
    }

    /** Permite actualizar grupos. */
    public function update(User $user, Group $group): bool
    {
        return $user->hasRole('coordinator');
    }

    /** Permite actualización masiva de estado de grupos. */
    public function updateAny(User $user): bool
    {
        return $user->hasRole('coordinator');
    }

    /** Permite eliminar un grupo de forma individual. */
    public function delete(User $user, Group $group): bool
    {
        return $user->hasRole('coordinator');
    }

    /** Permite eliminación masiva de grupos. */
    public function deleteAny(User $user): bool
    {
        return $user->hasRole('coordinator');
    }

    /** Reserva restauración para administrador (vía before). */
    public function restore(User $user, Group $group): bool
    {
        return false;
    }

    /** Reserva eliminación forzada para administrador (vía before). */
    public function forceDelete(User $user, Group $group): bool
    {
        return false;
    }

    /** Permite inscribir alumnos al grupo. */
    public function enroll(User $user, Group $group): bool
    {
        return $user->hasAnyRole(['coordinator', 'student']);
    }

    /** Permite dar de baja alumnos del grupo. */
    public function unenroll(User $user, Group $group): bool
    {
        return $user->hasAnyRole(['coordinator', 'student']);
    }

    /** Permite dar de baja alumnos de forma masiva. */
    public function bulkUnenroll(User $user, Group $group): bool
    {
        return $user->hasRole('coordinator');
    }

    /** Permite actualizar unidades evaluables y calificaciones. */
    public function updateUnits(User $user, Group $group): bool
    {
        return $user->hasAnyRole(['coordinator', 'teacher']);
    }

    /** Permite concluir un grupo. */
    public function complete(User $user, Group $group): bool
    {
        return $user->hasAnyRole(['coordinator', 'teacher']);
    }
}
