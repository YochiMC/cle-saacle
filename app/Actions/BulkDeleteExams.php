<?php

namespace App\Actions;

use App\Models\Exam;

/**
 * Clase de acción para la eliminación masiva de exámenes académicos.
 */
class BulkDeleteExams
{
    /**
     * Ejecuta la eliminación masiva de exámenes.
     *
     * @param array<int> $examIds Lista de IDs de los exámenes a eliminar.
     * @return int Número de registros eliminados.
     */
    public function execute(array $examIds): int
    {
        return Exam::whereIn('id', $examIds)->delete();
    }
}
