<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentResource extends JsonResource
{
    /**
     * Transforma el recurso en un array.
     *
     * Incluye los IDs de las relaciones (degree_id, level_id, type_student_id)
     * para que los formularios de edición puedan pre-seleccionar el valor actual,
     * así como la fecha de nacimiento requerida por UpdateStudentRequest.
     */
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'user_id'         => $this->user_id,
            'full_name'       => $this->full_name,
            'first_name'      => $this->first_name,
            'last_name'       => $this->last_name,
            'num_control'     => $this->num_control,
            'gender'          => $this->gender,
            'birthdate'       => $this->birthdate,
            'age'             => $this->age,
            'semester'        => $this->semester,
            'status'          => $this->status,
            'degree'          => $this->degree ? $this->degree->name : null,
            'level'           => $this->level ? $this->level->level_mcer : null,
            'type_student'    => $this->typeStudent ? $this->typeStudent->name : null,
            'type'            => 'student',
        ];
    }
}
