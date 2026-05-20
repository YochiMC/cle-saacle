<?php

declare(strict_types=1);

namespace App\Actions;

use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ServeStoredFile
{
    /**
     * Serves a stored file from the configured disk using a streamed response.
     */
    public function execute(
        string $disk,
        string $path,
        string $name,
        string $disposition = 'attachment'
    ): StreamedResponse {
        $filesystem = $this->resolveDisk($disk);

        if (! $filesystem->exists($path)) {
            abort(404, 'Archivo no encontrado.');
        }

        return $disposition === 'inline'
            ? $filesystem->response($path, $name)
            : $filesystem->download($path, $name);
    }

    private function resolveDisk(string $disk): FilesystemAdapter
    {
        /** @var FilesystemAdapter $filesystem */
        $filesystem = Storage::disk($disk !== '' ? $disk : config('filesystems.default'));

        return $filesystem;
    }
}