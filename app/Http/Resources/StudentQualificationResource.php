<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\MissingValue;

/**
 * Recurso API para transformar los datos de un Estudiante y aplanar su Calificación.
 *
 * Cumple con el Principio de Responsabilidad Única (SRP) aislando la lógica
 * de transformación de datos (flattening) del controlador y de la vista (frontend).
 */
class StudentQualificationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */

    public static $wrap = null;
    public function toArray(Request $request): array
    {
        // whenLoaded devuelve MissingValue cuando la relación no está cargada.
        $qualification = $this->whenLoaded('qualification');

        // Soportamos tanto relación cargada como propiedad dinámica asignada en el controlador.
        if ($qualification instanceof MissingValue) {
            $qualification = $this->qualification ?? null;
        }

        return [
            // Datos básicos del alumno
            'id'             => $this->id,
            'full_name' => $this->full_name,
            'matricula'      => $this->num_control,
            'gender' => $this->gender,
            'semester' => $this->semester,

            // Flatten de la calificación con manejo seguro de valores nulos o vacíos
            'qualification_id' => $qualification ? $qualification->id : null,
            // Se entrega JSON crudo para permitir columnas dinámicas en frontend.
            'units_breakdown' => $qualification?->units_breakdown ?? [],
            'final_average'  => $qualification?->final_average ?? 0,
            'is_left'        => (bool) ($qualification?->is_left ?? false),
        ];
    }
}
