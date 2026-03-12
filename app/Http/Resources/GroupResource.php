<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @resource GroupResource
 *
 * Serializador de grupo académico.
 *
 * Contrato estricto con React: expone solo los campos que el frontend
 * consume, evitando filtrar datos sensibles por accidente.
 *
 * Decisiones de diseño:
 *  - teacher_name : aplanado desde teacher->full_name para evitar
 *    navegación anidada en React (grupo.teacher?.full_name).
 *    Es null si el backend ocultó al docente (regla de negocio de fecha).
 *  - level        : delegado a LevelResource (whenLoaded garantiza que
 *    no se dispara una query adicional si no fue eager-loaded).
 *
 * Campos planos: id, name, schedule, mode, type, capacity, status,
 *               classroom, meeting_link, teacher_name, period_name,
 *               enrolled_count, available_seats.
 * Relaciones:   level (LevelResource).
 */
class GroupResource extends JsonResource
{
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

            'enrolled_count'  => $this->qualifications_count ?? 0,
            'available_seats' => $this->capacity - ($this->qualifications_count ?? 0),

            'teacher_name' => $this->teacher ? $this->teacher->full_name : null,

            'period_name'  => $this->period ? $this->period->name : null,

            'level'        => $this->level ? [
                'id'          => $this->level->id,
                'level_tecnm' => $this->level->level_tecnm,
                'level_mcer'  => $this->level->level_mcer,
                'hours'       => $this->level->hours,
            ] : null,
        ];
    }
}
