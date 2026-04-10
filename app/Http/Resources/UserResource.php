<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\DocumentResource;

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
            'documents' => $this->relationLoaded('documents')
                ? DocumentResource::collection($this->documents->sortByDesc('created_at')->values())->resolve()
                : [],
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
