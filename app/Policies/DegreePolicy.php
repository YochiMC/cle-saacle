<?php

namespace App\Policies;

use App\Models\Degree;
use App\Models\User;

/**
 * Policy para autorización del catálogo de carreras.
 *
 * Reglas generales:
 * - Administrador: acceso total mediante `before`.
 * - Coordinador: puede gestionar catálogo (ver, crear, actualizar y eliminar).
 * - Resto de roles: sin acceso.
 */
class DegreePolicy
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

    /** Permite listar carreras. */
    public function viewAny(User $user): bool
    {
        return $user->hasRole('coordinator');
    }

    /** Permite consultar una carrera específica. */
    public function view(User $user, Degree $degree): bool
    {
        return $user->hasRole('coordinator');
    }

    /** Permite crear carreras. */
    public function create(User $user): bool
    {
        return $user->hasRole('coordinator');
    }

    /** Permite actualizar carreras. */
    public function update(User $user, Degree $degree): bool
    {
        return $user->hasRole('coordinator');
    }

    /** Permite eliminar una carrera de forma individual. */
    public function delete(User $user, Degree $degree): bool
    {
        return $user->hasRole('coordinator');
    }

    /** Permite eliminación masiva de carreras. */
    public function deleteAny(User $user): bool
    {
        return $user->hasRole('coordinator');
    }

    /** Reserva restauración para administrador (vía before). */
    public function restore(User $user, Degree $degree): bool
    {
        return false;
    }

    /** Reserva eliminación forzada para administrador (vía before). */
    public function forceDelete(User $user, Degree $degree): bool
    {
        return false;
    }
}
