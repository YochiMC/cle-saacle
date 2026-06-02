<?php

namespace App\Actions;

use App\Enums\DocumentStatus;
use App\Enums\DocumentType;
use App\Models\Document;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use App\Actions\UploadFile;

/**
 * Acción para almacenar documentos para cualquier usuario (student/teacher/admin).
 */
class StoreUserDocument
{
    public function execute(UploadedFile $file, string $type, int $userId, ?string $customName = null): Document
    {
        $user = User::findOrFail($userId);

        // Generar nombre normalizado y seguro para storage
        $fileName = $this->generateFileName($type, $user, $customName, $file->getClientOriginalExtension());

        $uploader = new UploadFile();
        $meta = $uploader->execute($file, "documentos/user_{$userId}", null, $fileName);

            return Document::create([
                'user_id'       => $userId,
                'type'          => $type,
                // Guardar el nombre que se almacenó en el bucket (incluye prefijo por tipo)
                // Si por alguna razón no está disponible, caer al nombre original del cliente.
                'original_name' => $meta['stored_name'] ?? $meta['client_original_name'] ?? $file->getClientOriginalName(),
                'file_path'     => $meta['path'],
                'disk'          => $meta['disk'],
                'status'        => DocumentStatus::PENDING,
            ]);
    }

    private function generateFileName(string $type, User $user, ?string $customName, string $extension): string
    {
        $documentEnum = DocumentType::from($type);

        $sanitizer = app(\App\Services\FileNameSanitizer::class);

        $typeLabel = $sanitizer->sanitizeSegment($documentEnum->label());
        $userName = $sanitizer->sanitizeSegment($user->name);

        $parts = [$typeLabel, $userName];
        if ($type === 'evidencia' && !empty($customName)) {
            $parts[] = $customName;
        }

        return $sanitizer->generateStoredName($parts, $extension);
    }
}
