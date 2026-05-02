<?php

namespace App\Policies;

use App\Models\Document;
use App\Models\User;

/**
 * Policy para autorización del módulo de documentos.
 *
 * Reglas generales:
 * - Administrador: acceso total mediante `before`.
 * - Coordinador: revisión administrativa de documentos.
 * - Propietario del documento: puede consultar y eliminar sus documentos.
 */
class DocumentPolicy
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

    /** Permite listar documentos para revisión. */
    public function viewAny(User $user): bool
    {
        return $user->hasRole('coordinator');
    }

    /** Permite consultar un documento propio o por coordinación. */
    public function view(User $user, Document $document): bool
    {
        return $user->id === $document->user_id || $user->hasRole('coordinator');
    }

    /** Permite subir documentos al usuario autenticado. */
    public function create(User $user): bool
    {
        return true;
    }

    /** Permite revisar/actualizar estatus de documentos. */
    public function update(User $user, Document $document): bool
    {
        return $user->hasRole('coordinator');
    }

    /** Permite eliminar únicamente documentos propios. */
    public function delete(User $user, Document $document): bool
    {
        return $user->id === $document->user_id;
    }

    /** Reserva restauración para administrador (vía before). */
    public function restore(User $user, Document $document): bool
    {
        return false;
    }

    /** Reserva eliminación forzada para administrador (vía before). */
    public function forceDelete(User $user, Document $document): bool
    {
        return false;
    }
}
