<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\MissingValue;

class StudentExamResource extends JsonResource
{
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        $pivot = $this->whenLoaded('pivot');

        if ($pivot instanceof MissingValue) {
            $pivot = $this->pivot ?? null;
        }

        return [
            'id'             => $this->id,
            'full_name'      => $this->full_name,
            'matricula'      => $this->num_control,
            'gender'         => $this->gender,
            'semester'       => $this->semester,

            // Pivot data for exams
            'calificacion'   => $pivot?->calificacion ?? '',
        ];
    }
}
