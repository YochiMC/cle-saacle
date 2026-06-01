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
 * Acción encargada de procesar el almacenamiento físico y lógico de un documento.
 */
class StoreStudentDocument
{
    /**
     * Almacena el archivo en el disco configurado y crea el registro en BD.
     *
     * @param UploadedFile $file El archivo binario recibido del request.
     * @param string $type El tipo de documento (ine, curp, etc).
     * @param int $userId ID del usuario propietario del documento.
     * @param string|null $customName Nombre personalizado para evidencias.
     * @return Document
     */
    public function execute(UploadedFile $file, string $type, int $userId, ?string $customName = null): Document
    {
        $user = User::findOrFail($userId);

        // Generar nombre descriptivo del archivo basado en enum, usuario y nombre personalizado
        // y asegurarnos que esté normalizado para storage (sin acentos, sin chars problema)
        $fileName = $this->generateFileName($type, $user, $customName, $file->getClientOriginalExtension());

        $uploader = new UploadFile();
        $meta = $uploader->execute($file, "documentos/user_{$userId}", null, $fileName);

        return Document::create([
            'user_id'       => $userId,
            'type'          => $type,
            'original_name' => $fileName,
            'file_path'     => $meta['path'],
            'disk'          => $meta['disk'],
            'status'        => DocumentStatus::PENDING,
        ]);
    }

    /**
     * Genera el nombre del archivo basado en el tipo de documento, usuario y nombre personalizado.
     * Formato: TIPO_DOCUMENTO_NOMBRE_USUARIO_NOMBRE_PERSONALIZADO.extension
     *
     * @param string $type El tipo de documento (enum value).
     * @param User $user El usuario propietario del documento.
     * @param string|null $customName Nombre personalizado (solo para evidencias).
     * @param string $extension La extensión original del archivo.
     * @return string El nombre generado del archivo.
     */
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
