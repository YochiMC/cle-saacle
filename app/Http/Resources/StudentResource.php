<?php

namespace App\Http\Resources;

use App\Enums\StudentStatus;
use App\Enums\TypeStudent;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentResource extends JsonResource
{
    /**
     * Transforma el recurso en un array.
     *
     * Incluye los IDs de las relaciones (degree_id, level_id) y valores de enums (status, type_student)
     * para que los formularios de edición puedan pre-seleccionar el valor actual,
     * así como la fecha de nacimiento requerida por UpdateStudentRequest.
     *
     * Expone `status` (valor técnico del enum) y `status_label` (texto para UI),
     * así como `type_student` (valor técnico del enum) y `type_student_label` (etiqueta legible),
     * evitando acoplar el frontend a valores internos del dominio.
     */
    public function toArray(Request $request): array
    {
        $rawStatus = $this->resource->getRawOriginal('status') ?? ($this->resource->getAttributes()['status'] ?? null);
        $statusEnum = is_string($rawStatus) ? StudentStatus::tryFrom($rawStatus) : null;

        $rawTypeStudent = $this->resource->getRawOriginal('type_student') ?? ($this->resource->getAttributes()['type_student'] ?? null);
        $typeStudentEnum = is_string($rawTypeStudent) ? TypeStudent::tryFrom($rawTypeStudent) : null;

        return [
            'id'                   => $this->id,
            'user_id'              => $this->user_id,
            'full_name'            => $this->full_name,
            'num_control'          => $this->num_control,
            'semester'             => $this->semester,
            'status'               => $rawStatus,
            'status_label'         => $statusEnum?->label() ?? 'Sin estado',
            'degree'               => $this->degree ? $this->degree->name : null,
            'level_tecnm'          => $this->level ? $this->level->level_tecnm : null,
            'type_student'         => $rawTypeStudent,
            'type_student_label'   => $typeStudentEnum?->label() ?? 'Sin tipo',
            'type'                 => 'student',
        ];
    }
}

