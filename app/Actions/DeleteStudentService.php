<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\Service;
use Illuminate\Support\Facades\Storage;
use App\Actions\DeleteStoredFile;

/**
 * Acción encargada de la eliminación segura de un servicio (física y lógica).
 */
class DeleteStudentService
{
    /**
     * Elimina el archivo del disco y remueve el registro de la base de datos.
     *
     * @param Service $service El modelo del servicio a eliminar.
     * @return bool True si se eliminó archivo y registro; false en caso contrario.
     */
    public function execute(Service $service): bool
    {
        $filePath = (string) $service->file_path;
        $diskName = $service->disk ?: config('filesystems.default');

        if ($filePath === '') {
            return false;
        }

        $deleter = new DeleteStoredFile();
        if (! $deleter->execute($diskName, $filePath)) {
            return false;
        }

        return (bool) $service->delete();
    }
}
