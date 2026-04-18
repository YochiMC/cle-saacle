<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PeriodResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $startDate = $this->start_date ?? $this->start;
        $endDate = $this->end_date ?? $this->end;
        $hasDateRange = ! empty($startDate) && ! empty($endDate);

        return [
            'id' => $this->id,
            'name' => $this->name,
            'start_date' => $startDate ? date('Y-m-d', strtotime((string) $startDate)) : null,
            'end_date' => $endDate ? date('Y-m-d', strtotime((string) $endDate)) : null,
            'status' => $hasDateRange && now()->between((string) $startDate, (string) $endDate)
                ? 'Activo'
                : 'Inactivo',
        ];
    }
}
