<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentProfileResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'num_control' => $this->num_control,
            'gender' => $this->gender,
            'birthdate' => $this->birthdate,
            'semester' => $this->semester,
            'status' => $this->status,
            'degree_id' => $this->degree_id,
            'type_student_id' => $this->type_student_id,
            'level_id' => $this->level_id,
            'type' => 'student',
        ];
    }
}
