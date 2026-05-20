<?php

declare(strict_types=1);

namespace App\Actions;

use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\Facades\Storage;

class DeleteStoredFile
{
    /**
     * Delete a file from a given disk and path. Returns true when deleted or false otherwise.
     */
    public function execute(string $disk, string $path): bool
    {
        /** @var FilesystemAdapter $filesystem */
        $filesystem = Storage::disk($disk !== '' ? $disk : config('filesystems.default'));

        if (! $filesystem->exists($path)) {
            return false;
        }

        return (bool) $filesystem->delete($path);
    }
}
