<?php

namespace App\Actions;

use App\Models\Group;

/**
 * Clase de acción para la eliminación masiva de grupos académicos.
 */
class BulkDeleteGroups
{
    /**
     * Ejecuta la eliminación masiva.
     *
     * @param array<int> $groupIds Lista de IDs de los grupos a eliminar.
     * @return int Número de registros eliminados.
     */
    public function execute(array $groupIds): int
    {
        return Group::whereIn('id', $groupIds)->delete();
    }
}
