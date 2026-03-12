<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TeacherResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'full_name' => $this->full_name, // Usando el Accessor moderno de Laravel
            'category' => $this->category,
            'level' => $this->level,
            'rfc' => $this->rfc,
            'curp' => $this->curp,
            'grade' => $this->grade,
        ];
    }
}