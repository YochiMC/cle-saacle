<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TeacherProfileResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'user_id' => $this->user_id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'category' => $this->category,
            'level' => $this->level,
            'rfc' => $this->rfc,
            'curp' => $this->curp,
            'clabe' => $this->clabe,
            'ttc_hours' => $this->ttc_hours,
            'bank_name' => $this->bank_name,
            'grade' => $this->grade,
            'is_native' => $this->is_native,
        ];
    }
}
