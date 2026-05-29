<?php

namespace App\Http\Resources;

use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Services\TeacherVisibilityService;

/**
 * Recurso de API para el modelo Group.
 * Serializa los datos del grupo académico para su consumo en el frontend.
 *
 * @property int $id
 * @property string $name
 * @property string $schedule
 * @property string $mode
 * @property string $type
 * @property int $capacity
 * @property string $status
 * @property string|null $classroom
 * @property string|null $meeting_link
 * @property int $teacher_id
 * @property int $period_id
 */
class GroupResource extends JsonResource
{
    /**
     * Transforma el recurso en un array.
     *
     * @param Request $request
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $user = $request->user();
        $currentStudentId = $user?->student?->id;
        $visibilityService = app(TeacherVisibilityService::class);

        return [
            'id'           => $this->id,
            'name'         => $this->name,
            'schedule'     => $this->schedule,
            'mode'         => $this->mode,
            'type'         => $this->type,
            'capacity'     => $this->capacity,
            'status'       => $this->status instanceof \App\Enums\AcademicStatus ? $this->status->value : $this->status,
            'status_label' => $this->status instanceof \App\Enums\AcademicStatus ? $this->status->label() : 'Desconocido',
            'classroom'    => $this->classroom,
            'meeting_link' => $this->meeting_link,

            // Cálculos de inscritos y disponibilidad
            'enrolled_count'  => $this->qualifications_count ?? 0,
            'available_seats' => max(0, $this->capacity - ($this->qualifications_count ?? 0)),
            'is_enrolled'     => $currentStudentId
                ? $this->qualifications->contains('student_id', $currentStudentId)
                : false,

            // Datos del docente filtrados por TeacherVisibilityService
            'teacher_name' => $visibilityService->filterTeacherName($this->teacher ? $this->teacher->full_name : null, $user, $this->status, $this->type),
            'teacher_id'   => $visibilityService->filterTeacherId($this->teacher_id, $user, $this->status, $this->type),

            // Datos del periodo
            'period_name'  => $this->period?->name ?? 'Sin asignar',
            'period_id'    => $this->period_id,

            // Relación con el nivel académmico
            'level'        => $this->level ? [
                'id'          => $this->level->id,
                'level_tecnm' => $this->level->level_tecnm,
                'level_mcer'  => $this->level->level_mcer,
                'hours'       => $this->level->hours,
            ] : null,
            'level_id'     => $this->level_id,

            // Cadena de alumnos para búsqueda frontend
            'students_string' => $this->whenLoaded('qualifications', function () {
                return $this->qualifications->map(fn($q) => $q->student->full_name)->join(' ');
            }, ''),
        ];
    }
}
