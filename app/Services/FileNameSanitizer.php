<?php

namespace App\Services;

use Illuminate\Support\Str;

class FileNameSanitizer
{
    /**
     * Sanea un segmento de texto para usar en el basename de un archivo.
     */
    public function sanitizeSegment(string $input): string
    {
        $ascii = Str::ascii($input);

        // Permitir solo letras, números, espacios, guion y guion bajo
        $clean = preg_replace('/[^A-Za-z0-9\s\-_]/u', '', $ascii);

        // Reemplazar espacios por guion bajo y colapsar repetidos
        $clean = preg_replace('/\s+/', '_', $clean);
        $clean = preg_replace('/_+/', '_', $clean);
        $clean = preg_replace('/-+/', '-', $clean);

        $clean = trim($clean, "_- ");
        $clean = Str::upper($clean);

        if ($clean === '') {
            return 'FILE' . Str::upper(Str::random(4));
        }

        return mb_substr($clean, 0, 120);
    }

    /**
     * Genera el nombre final a almacenar, adicionando un sufijo único y limitando longitud.
     * @param string[] $segments Partes que forman el basename (serán saneadas internamente)
     */
    public function generateStoredName(array $segments, string $extension, int $maxLength = 200): string
    {
        $sanitized = [];
        foreach ($segments as $s) {
            if ($s === null || $s === '') {
                continue;
            }
            $sanitized[] = $this->sanitizeSegment($s);
        }

        $baseName = implode('_', $sanitized);
        $suffix = now()->format('YmdHis') . '_' . Str::upper(Str::random(6));
        $extension = Str::lower($extension);

        $final = "{$baseName}_{$suffix}.{$extension}";

        if (mb_strlen($final) > $maxLength) {
            $keep = $maxLength - (mb_strlen("_{$suffix}.{$extension}"));
            $baseTrim = mb_substr($baseName, 0, max(1, $keep));
            $final = "{$baseTrim}_{$suffix}.{$extension}";
        }

        return $final;
    }
}
