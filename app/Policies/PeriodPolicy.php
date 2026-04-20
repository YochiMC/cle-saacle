<?php

namespace App\Policies;

use App\Models\Period;
use App\Models\User;

/**
 * Policy para autorización del catálogo de periodos.
 *
 * Reglas generales:
 * - Administrador: acceso total mediante `before`.
 * - Coordinador: puede gestionar el catálogo (ver, crear, actualizar y eliminar).
 * - Resto de roles: sin acceso.
 */
class PeriodPolicy
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

    /** Permite listar periodos. */
    public function viewAny(User $user): bool
    {
        return $user->hasRole('coordinator');
    }

    /** Permite consultar un periodo específico. */
    public function view(User $user, Period $period): bool
    {
        return $user->hasRole('coordinator');
    }

    /** Permite crear periodos. */
    public function create(User $user): bool
    {
        return $user->hasRole('coordinator');
    }

    /** Permite actualizar periodos. */
    public function update(User $user, Period $period): bool
    {
        return $user->hasRole('coordinator');
    }

    /** Permite eliminar un periodo de forma individual. */
    public function delete(User $user, Period $period): bool
    {
        return $user->hasRole('coordinator');
    }

    /** Permite eliminación masiva de periodos. */
    public function deleteAny(User $user): bool
    {
        return $user->hasRole('coordinator');
    }

    /** Reserva restauración para administrador (vía before). */
    public function restore(User $user, Period $period): bool
    {
        return false;
    }

    /** Reserva eliminación forzada para administrador (vía before). */
    public function forceDelete(User $user, Period $period): bool
    {
        return false;
    }
}
