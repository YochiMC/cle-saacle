<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\Document;

/**
 * Acción genérica para eliminar un documento de forma física y lógica.
 */
class DeleteStoredDocument
{
    /**
     * Elimina el archivo del disco y remueve el registro de la base de datos.
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

        return (bool) $document->newQuery()->whereKey($document->getKey())->delete();
    }
}
