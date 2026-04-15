<?php

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
     * @return bool|null
     */
    public function execute(Document $document): ?bool
    {
        // 1. Eliminar archivo físico si existe en el disco configurado
        if (Storage::disk($document->disk)->exists($document->file_path)) {
            Storage::disk($document->disk)->delete($document->file_path);
        }

        // 2. Eliminar registro de la base de datos
        return $document->delete();
    }
}
