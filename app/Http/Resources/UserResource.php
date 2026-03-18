<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'name' => $this->name,
            'email' => $this->email,
            'email_recovery' => $this->email_recovery,
            'phone' => $this->phone,
            'roles' => $this->getRoleNames(),
            'profile' => match (true) {
                $this->hasRole('student') => new StudentProfileResource($this->profile),
                $this->hasRole('teacher') => new TeacherProfileResource($this->profile),
                default => null,
            },
        ];
    }
}
