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
    public function execute(UploadedFile $file, string $folder, string $disk = 'local'): array
    {
        $fileName = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs($folder, $fileName, $disk);

        if (! $path) {
            throw new RuntimeException('Error al guardar el archivo en el disco.');
        }

        return [
            'path' => $path,
            'disk' => $disk,
            'original_name' => $file->getClientOriginalName(),
            'extension' => $file->getClientOriginalExtension(),
        ];
    }
}
