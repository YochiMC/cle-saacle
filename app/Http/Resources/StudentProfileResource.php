<?php

namespace App\Http\Resources;

use App\Enums\StudentStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentProfileResource extends JsonResource
{
    /**
    * Transforma el perfil del estudiante al contrato consumido por Inertia.
    *
    * Se envía el estado técnico (`status`) junto con su etiqueta humana
    * (`status_label`) para mantener la presentación desacoplada del dominio.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'num_control' => $this->num_control,
            'gender' => $this->gender,
            'birthdate' => $this->birthdate,
            'semester' => $this->semester,
            'status' => $this->status instanceof StudentStatus ? $this->status->value : $this->status,
            'status_label' => $this->status instanceof StudentStatus ? $this->status->label() : 'Desconocido',
            'degree_id' => $this->degree_id,
            'type_student_id' => $this->type_student_id,
            'level_id' => $this->level_id,
            'type' => 'student',
        ];
    }
}
