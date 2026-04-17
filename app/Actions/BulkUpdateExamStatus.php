<?php

namespace App\Actions;

use App\Models\Exam;

/**
 * Clase de acción para actualizar masivamente el estatus de múltiples exámenes académicos.
 */
class BulkUpdateExamStatus
{
    /**
     * Ejecuta la actualización masiva de estados.
     *
     * @param array<int> $examIds Lista de IDs de los exámenes a actualizar.
     * @param string $status El nuevo estatus a aplicar.
     * @return int Número de registros afectados.
     */
    public function execute(array $examIds, string $status): int
    {
        return Exam::whereIn('id', $examIds)
            ->update(['status' => $status]);
    }
}
