<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class DocumentResource extends JsonResource
{
    /**
     * Transforma el documento en un arreglo listo para Inertia/API.
     *
     * @param  Request  $request
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $type = $this->type;
        $status = $this->status;
        $originalName = (string) $this->original_name;
        $extension = Str::lower(pathinfo($originalName, PATHINFO_EXTENSION));

        return [
            'id' => $this->id,
            'type' => is_object($type) ? $type->value : $type,
            'type_label' => is_object($type) ? $type->label() : $type,
            'original_name' => $originalName,
            'file_path' => $this->file_path,
            'status' => is_object($status) ? $status->value : $status,
            'comments' => $this->comments,
            'uploaded_at' => $this->created_at?->toDateTimeString(),
            'extension' => $extension,
            'previewable' => in_array($extension, ['pdf', 'jpg', 'jpeg', 'png'], true),
            'preview_url' => route('documents.preview', $this->id),
        ];
    }
}
