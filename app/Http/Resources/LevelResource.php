<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @resource LevelResource
 *
 * Serializador de nivel académico.
 * Contrato estricto con React: solo expone los campos necesarios para
 * el catálogo de grupos (dropdown de filtros y badge en tarjeta).
 *
 * Campos incluidos:
 *  - id          : clave de filtrado en el frontend (filterLevel)
 *  - level_tecnm : texto visible en el dropdown y badge de la tarjeta
 *  - level_mcer  : visible en GroupDetailsModal (ej. "B1", "C2")
 *  - hours       : visible en GroupDetailsModal
 */
class LevelResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'level_tecnm'  => $this->level_tecnm,
            'level_mcer'   => $this->level_mcer,
            'hours'        => $this->hours,
            'program_type' => $this->program_type,
        ];
    }
}
