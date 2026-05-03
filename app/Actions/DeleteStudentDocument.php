<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\Document;
use Illuminate\Support\Facades\Storage;

/**
 * Acción encargada de la eliminación segura de un documento (física y lógica).
 */
class DeleteStudentDocument
{
    /**
     * Elimina el archivo del disco y remueve el registro de la base de datos.
     *
     * @param Document $document El modelo del documento a eliminar.
     * @return bool True si se eliminó archivo y registro; false en caso contrario.
     */
    public function execute(Document $document): bool
    {
        $filePath = (string) $document->file_path;
        $disk = Storage::disk('local');

        // 1. Validar ruta y verificar existencia en disco privado fijo.
        if ($filePath === '' || !$disk->exists($filePath)) {
            return false;
        }

        // 2. Eliminar archivo físico. Si falla, no se elimina el registro.
        if (!$disk->delete($filePath)) {
            return false;
        }

        // 3. Eliminar registro de la base de datos (atomicidad lógica).
        return (bool) $document->delete();
    }
}
