<?php

namespace App\Actions;

use App\Models\Group;
use Illuminate\Support\Facades\DB;

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
        $uniqueIds = array_values(array_unique($groupIds));

        return DB::transaction(function () use ($uniqueIds, $status) {
            $groups = Group::whereIn('id', $uniqueIds)->get();

            $updatedCount = 0;
            foreach ($groups as $group) {
                if ($group->status->value === $status) {
                    continue;
                }

                $group->status = $status;
                $group->save();
                $updatedCount++;
            }

            return $updatedCount;
        });
    }
}
