<?php

namespace App\Policies;

use App\Models\CertificateRecord;
use App\Models\User;

/**
 * Policy para autorización del módulo de constancias.
 *
 * Reglas generales:
 * - Administrador: acceso total mediante `before`.
 * - Coordinador: gestiona el flujo de constancias.
 * - Verificación pública del QR: no pasa por policy porque no requiere autenticación.
 */
class CertificateRecordPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        return null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'coordinator']);
    }

    public function manage(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'coordinator']);
    }

    public function preview(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'coordinator']);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'coordinator']);
    }

    public function view(User $user, CertificateRecord $certificateRecord): bool
    {
        return $user->hasAnyRole(['admin', 'coordinator']);
    }

    public function confirm(User $user, CertificateRecord $certificateRecord): bool
    {
        return $user->hasAnyRole(['admin', 'coordinator'])
            && $certificateRecord->status !== 'issued';
    }

    public function download(User $user, CertificateRecord $certificateRecord): bool
    {
        return $user->hasAnyRole(['admin', 'coordinator'])
            && in_array($certificateRecord->status, ['confirmed', 'issued'], true);
    }
}
