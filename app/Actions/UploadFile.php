<?php

namespace App\Actions;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use RuntimeException;

class UploadFile
{
    /**
     * Sube un archivo al disco y devuelve su metadata persistible.
     *
     * @return array{path: string, disk: string, original_name: string, extension: string}
     */
    public function execute(UploadedFile $file, string $folder, ?string $disk = null): array
    {
        $diskName = $disk ?? config('filesystems.default');
        // Defensive checks: enforce PDF-only and size limit (5 MB) even if frontend validated.
        if (! $file->isValid()) {
            throw new RuntimeException('Archivo inválido.');
        }

        $extension = strtolower($file->getClientOriginalExtension() ?? '');
        if ($extension !== 'pdf') {
            throw new RuntimeException('Formato no permitido. Solo se aceptan archivos PDF.');
        }

        $maxBytes = 5 * 1024 * 1024;
        if (($file->getSize() ?? 0) > $maxBytes) {
            throw new RuntimeException('El archivo supera el tamaño máximo permitido de 5 MB.');
        }
        $fileName = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs($folder, $fileName, $diskName);

        if (! $path) {
            throw new RuntimeException('Error al guardar el archivo en el disco.');
        }

        return [
            'path' => $path,
            'disk' => $diskName,
            'original_name' => $file->getClientOriginalName(),
            'extension' => $file->getClientOriginalExtension(),
        ];
    }
}
