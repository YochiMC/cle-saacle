<?php

namespace App\Http\Resources;

use Carbon\Carbon;
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
        $startDate = $this->start_date ? Carbon::parse($this->start_date) : null;
        $endDate = $this->end_date ? Carbon::parse($this->end_date) : null;
        $hasDateRange = $startDate !== null && $endDate !== null;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'start_date' => $startDate?->toDateString(),
            'end_date' => $endDate?->toDateString(),
            'status' => $hasDateRange && now()->between($startDate, $endDate)
                ? 'Activo'
                : 'Inactivo',
        ];
    }
}
