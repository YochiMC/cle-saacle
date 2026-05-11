<?php

namespace App\Http\Resources;

use App\Enums\StudentStatus;
use App\Enums\TypeStudent;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentProfileResource extends JsonResource
{
    /**
     * Transforma el perfil del estudiante al contrato consumido por Inertia.
     *
     * Se envía el estado técnico (`status`) junto con su etiqueta humana
     * (`status_label`) para mantener la presentación desacoplada del dominio.
     * Igualmente, se envía el tipo de estudiante (`type_student`) con su etiqueta.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $rawStatus = $this->resource->getRawOriginal('status') ?? ($this->resource->getAttributes()['status'] ?? null);
        $statusEnum = is_string($rawStatus) ? StudentStatus::tryFrom($rawStatus) : null;

        $rawTypeStudent = $this->resource->getRawOriginal('type_student') ?? ($this->resource->getAttributes()['type_student'] ?? null);
        $typeStudentEnum = is_string($rawTypeStudent) ? TypeStudent::tryFrom($rawTypeStudent) : null;

        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'num_control' => $this->num_control,
            'gender' => $this->gender,
            'birthdate' => $this->birthdate,
            'semester' => $this->semester,
            'status' => $statusEnum?->value ?? $rawStatus,
            'status_label' => $statusEnum?->label() ?? 'Sin estado',
            'degree_id' => $this->degree_id,
            'type_student' => $rawTypeStudent,
            'type_student_label' => $typeStudentEnum?->label() ?? 'Sin tipo',
            'level_id' => $this->level_id,
            'type' => 'student',
        ];
    }
}
