<?php

namespace App\Actions;

use App\Models\Group;

/**
 * Clase de acción para actualizar masivamente el estatus de múltiples grupos.
 */
class BulkUpdateGroupStatus
{
    /**
     * Ejecuta la actualización masiva de estados.
     *
     * @param array<int> $groupIds Lista de IDs de los grupos a actualizar.
     * @param string $status El nuevo estatus a aplicar (ej. 'active', 'completed', 'waiting').
     * @return int Número de registros afectados.
     */
    public function execute(array $groupIds, string $status): int
    {
        return Group::whereIn('id', $groupIds)
            ->update(['status' => $status]);
    }
}
