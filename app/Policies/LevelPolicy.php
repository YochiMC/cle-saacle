<?php

namespace App\Policies;

use App\Models\Level;
use App\Models\User;

/**
 * Policy para autorización del catálogo de niveles.
 *
 * Reglas generales:
 * - Administrador: acceso total mediante `before`.
 * - Coordinador: puede gestionar catálogo (ver, crear, actualizar y eliminar).
 * - Resto de roles: sin acceso.
 */
class LevelPolicy
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

    /** Permite listar niveles en el catálogo. */
    public function viewAny(User $user): bool
    {
        return $user->hasRole('coordinator');
    }

    /** Permite consultar un nivel específico. */
    public function view(User $user, Level $level): bool
    {
        return $user->hasRole('coordinator');
    }

    /** Permite crear niveles. */
    public function create(User $user): bool
    {
        return $user->hasRole('coordinator');
    }

    /** Permite actualizar niveles. */
    public function update(User $user, Level $level): bool
    {
        return $user->hasRole('coordinator');
    }

    /** Permite eliminar un nivel de forma individual. */
    public function delete(User $user, Level $level): bool
    {
        return $user->hasRole('coordinator');
    }

    /** Permite eliminación masiva de niveles. */
    public function deleteAny(User $user): bool
    {
        return $user->hasRole('coordinator');
    }

    /** Reserva restauración para administrador (vía before). */
    public function restore(User $user, Level $level): bool
    {
        return false;
    }

    /** Reserva eliminación forzada para administrador (vía before). */
    public function forceDelete(User $user, Level $level): bool
    {
        return false;
    }
}
