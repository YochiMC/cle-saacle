<?php

namespace App\Policies;

use App\Models\User;

/**
 * Policy para autorización del módulo de usuarios.
 *
 * Reglas generales:
 * - Administrador: acceso total mediante `before`.
 * - Coordinador: gestión operativa de usuarios.
 * - Usuario autenticado: puede gestionar su propio perfil.
 */
class UserPolicy
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

    /** Permite listar usuarios. */
    public function viewAny(User $user): bool
    {
        return $user->hasRole('coordinator');
    }

    /** Permite consultar un usuario propio o por coordinación. */
    public function view(User $user, User $model): bool
    {
        return $user->id === $model->id || $user->hasRole('coordinator');
    }

    /** Permite crear usuarios. */
    public function create(User $user): bool
    {
        return $user->hasRole('coordinator');
    }

    /** Permite actualizar un usuario propio o por coordinación. */
    public function update(User $user, User $model): bool
    {
        return $user->id === $model->id || $user->hasRole('coordinator');
    }

    /** Permite eliminar un usuario propio o por coordinación. */
    public function delete(User $user, User $model): bool
    {
        return $user->id === $model->id || $user->hasRole('coordinator');
    }

    /** Reserva restauración para administrador (vía before). */
    public function restore(User $user, User $model): bool
    {
        return false;
    }

    /** Reserva eliminación forzada para administrador (vía before). */
    public function forceDelete(User $user, User $model): bool
    {
        return false;
    }
}
