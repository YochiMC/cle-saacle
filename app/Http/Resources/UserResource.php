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
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'email_recovery' => $this->email_recovery,
            'phone' => $this->phone,
            'roles' => $this->roles->pluck('id')->toArray(),
            'profile' => match (true) {
                $this->hasRole('teacher') => $this->whenLoaded(
                    'teacher',
                    fn () => new TeacherProfileResource($this->teacher)
                ),
                $this->hasRole('student') => $this->whenLoaded(
                    'student',
                    fn () => new StudentProfileResource($this->student)
                ),
                default => null,
            },
        ];
    }
}
