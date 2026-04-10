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
        return [
            'id' => $this->id,
            'type' => $this->type,
            'original_name' => $this->original_name,
            'file_path' => $this->file_path,
            'status' => $this->status,
            'comments' => $this->comments,
            'uploaded_at' => $this->created_at?->toDateTimeString(),
        ];
    }
}