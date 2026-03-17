<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentResource extends JsonResource
{
    /**
     * Transforma el recurso en un array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'full_name' => $this->full_name,
            'num_control' => $this->num_control,
            'gender' => $this->gender,
            'age' => $this->age,
            'semester' => $this->semester,
            'status' => $this->status,
            'degree' => $this->degree ? $this->degree->name : null,
            'level' => $this->level ? $this->level->level_mcer : null,
            'type_student' => $this->typeStudent ? $this->typeStudent->name : null,
        ];
    }
}
