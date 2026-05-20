<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\Document;
use Illuminate\Support\Facades\Storage;
use App\Actions\DeleteStoredFile;

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
        $diskName = $document->disk ?: config('filesystems.default');

        if ($filePath === '') {
            return false;
        }

        $deleter = new DeleteStoredFile();
        if (! $deleter->execute($diskName, $filePath)) {
            return false;
        }

        return (bool) $document->delete();
    }
}
