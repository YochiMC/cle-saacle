<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

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

        return [
            'id' => $this->id,
            'type' => is_object($type) ? $type->value : $type,
            'type_label' => is_object($type) ? $type->label() : $type,
            'original_name' => $this->original_name,
            'file_path' => $this->file_path,
            'status' => is_object($status) ? $status->value : $status,
            'comments' => $this->comments,
            'uploaded_at' => $this->created_at?->toDateTimeString(),
        ];
    }
}