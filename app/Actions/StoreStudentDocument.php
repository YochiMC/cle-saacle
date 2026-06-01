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

        // Normalizar y sanear cada parte antes de formar el nombre final
        $typeLabel = $this->sanitizeBasename($documentEnum->label());
        $userName = $this->sanitizeBasename($user->name);

        $baseName = "{$typeLabel}_{$userName}";

        if ($type === 'evidencia' && !empty($customName)) {
            $customNameSanitized = $this->sanitizeBasename($customName);
            $baseName .= "_{$customNameSanitized}";
        }

        // Añadir sufijo corto único para evitar colisiones en el bucket
        $suffix = now()->format('YmdHis') . '_' . Str::upper(Str::random(6));

        $extension = Str::lower($extension);

        $final = "{$baseName}_{$suffix}.{$extension}";

        // Limitar longitud total del nombre para evitar problemas con DB y storage
        $maxLength = 200;
        if (mb_strlen($final) > $maxLength) {
            $keep = $maxLength - (mb_strlen("_{$suffix}.{$extension}"));
            $baseNameTrimmed = mb_substr($baseName, 0, max(1, $keep));
            $final = "{$baseNameTrimmed}_{$suffix}.{$extension}";
        }

        return $final;
    }

    /**
     * Sanea una porción de texto para usarla en el basename de un archivo.
     * - Quita acentos/transliteración
     * - Elimina caracteres no deseados
     * - Reemplaza espacios por guiones bajos y pasa a mayúsculas
     */
    private function sanitizeBasename(string $input): string
    {
        $ascii = Str::ascii($input);

        // Permitir solo letras, números, espacios, guion y guion bajo
        $clean = preg_replace('/[^A-Za-z0-9\\s\\-_]/u', '', $ascii);

        // Reemplazar espacios por guion bajo y colapsar guiones/guiones bajos repetidos
        $clean = preg_replace('/\\s+/', '_', $clean);
        $clean = preg_replace('/_+/', '_', $clean);
        $clean = preg_replace('/-+/', '-', $clean);

        $clean = trim($clean, "_- ");
        $clean = Str::upper($clean);

        // Limitar longitud de cada segmento
        $maxSegment = 120;
        if (mb_strlen($clean) > $maxSegment) {
            $clean = mb_substr($clean, 0, $maxSegment);
        }

        // Si quedó vacío, usar un identificador corto
        if ($clean === '') {
            $clean = 'FILE' . Str::upper(Str::random(4));
        }

        return $clean;
    }
}
