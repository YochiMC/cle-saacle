<?php

namespace App\Actions;

use App\Enums\DocumentStatus;
use App\Models\Document;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

/**
 * Acción encargada de procesar el almacenamiento físico y lógico de un documento.
 */
class StoreStudentDocument
{
    /**
     * Almacena el archivo en el disco local restringido y crea el registro en BD.
     *
     * @param UploadedFile $file El archivo binario recibido del request.
     * @param string $type El tipo de documento (INE, CURP, etc).
     * @param int $userId ID del usuario propietario del documento.
     * @return Document
     */
    public function execute(UploadedFile $file, string $type, int $userId): Document
    {
        // Generar nombre único basado en UUID para evitar colisiones y proteger el nombre original
        $fileName = Str::uuid() . '.' . $file->getClientOriginalExtension();

        // Almacenar en disco 'local' (storage/app). 
        // No es accesible públicamente, protegiendo la privacidad del alumno.
        $path = $file->storeAs("documentos/user_{$userId}", $fileName, 'local');

        return Document::create([
            'user_id'       => $userId,
            'type'          => $type,
            'original_name' => $file->getClientOriginalName(),
            'file_path'     => $path,
            'disk'          => 'local',
            'status'        => DocumentStatus::PENDING,
        ]);
    }
}
