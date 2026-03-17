<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

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
        return [
            'id'           => $this->id,
            'name'         => $this->name,
            'schedule'     => $this->schedule,
            'mode'         => $this->mode,
            'type'         => $this->type,
            'capacity'     => $this->capacity,
            'status'       => $this->status,
            'classroom'    => $this->classroom,
            'meeting_link' => $this->meeting_link,

            // Cálculos de inscritos y disponibilidad
            'enrolled_count'  => $this->qualifications_count ?? 0,
            'available_seats' => max(0, $this->capacity - ($this->qualifications_count ?? 0)),

            // Datos del docente (respetando la lógica de revelación en el controlador)
            'teacher_name' => $this->teacher ? $this->teacher->full_name : null,
            'teacher_id'   => $this->teacher_id,

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
        ];
    }
}
