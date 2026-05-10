<?php

namespace App\Http\Resources;

use App\Enums\StudentStatus;
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
     *
     * Expone `status` (valor técnico del enum) y `status_label` (texto para UI),
     * evitando acoplar el frontend a valores internos del dominio.
     */
    public function toArray(Request $request): array
    {
        $rawStatus = $this->resource->getRawOriginal('status') ?? ($this->resource->getAttributes()['status'] ?? null);
        $statusEnum = is_string($rawStatus) ? StudentStatus::tryFrom($rawStatus) : null;

        return [
            'id'              => $this->id,
            'user_id'         => $this->user_id,
            'full_name'       => $this->full_name,
            'num_control'     => $this->num_control,
            'semester'        => $this->semester,
            'status_label'    => $statusEnum?->label() ?? 'Sin estado',
            'degree'          => $this->degree ? $this->degree->name : null,
            'level_tecnm'     => $this->level ? $this->level->level_tecnm : null,
            'type_student'    => $this->typeStudent ? $this->typeStudent->name : null,
            'type'            => 'student',
        ];
    }
}
