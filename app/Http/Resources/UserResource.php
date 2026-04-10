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
            'documents' => $this->whenLoaded('documents', function () {
                return $this->documents
                    ->sortByDesc('created_at')
                    ->values()
                    ->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'type' => $doc->type,
                    'original_name' => $doc->original_name,
                    'file_path' => $doc->file_path,
                    'status' => $doc->status,
                    'comments' => $doc->comments,
                    'uploaded_at' => $doc->created_at->toDateTimeString(),
                ];
                    });
            }, []),
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
