<?php

namespace App\Policies;

use App\Models\Setting;
use App\Models\User;

/**
 * Policy para autorización del módulo de configuraciones del sistema.
 *
 * Reglas generales:
 * - Administrador: acceso total mediante `before`.
 * - Coordinador: acceso operativo a consulta y actualización.
 */
class SettingPolicy
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

    /** Permite listar configuraciones. */
    public function viewAny(User $user): bool
    {
        return $user->hasRole('coordinator');
    }

    /** Permite consultar una configuración específica. */
    public function view(User $user, Setting $setting): bool
    {
        return $user->hasRole('coordinator');
    }

    /** Reserva creación para administrador (vía before). */
    public function create(User $user): bool
    {
        return false;
    }

    /** Permite actualizar una configuración específica. */
    public function update(User $user, Setting $setting): bool
    {
        return $user->hasRole('coordinator');
    }

    /** Permite actualización masiva de configuraciones. */
    public function updateAny(User $user): bool
    {
        return $user->hasRole('coordinator');
    }

    /** Reserva eliminación para administrador (vía before). */
    public function delete(User $user, Setting $setting): bool
    {
        return false;
    }

    /** Reserva eliminación masiva para administrador (vía before). */
    public function deleteAny(User $user): bool
    {
        return false;
    }

    /** Reserva restauración para administrador (vía before). */
    public function restore(User $user, Setting $setting): bool
    {
        return false;
    }

    /** Reserva eliminación forzada para administrador (vía before). */
    public function forceDelete(User $user, Setting $setting): bool
    {
        return false;
    }
}
