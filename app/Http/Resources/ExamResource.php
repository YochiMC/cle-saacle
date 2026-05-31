<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Services\TeacherVisibilityService;

class ExamResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  Request  $request
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $user = $request->user();
        $visibilityService = app(TeacherVisibilityService::class);
        $currentStudentId = $user?->student?->id;

        $enrolledCount = $this->whenLoaded('students', fn() => collect($this->students)->count(), $this->students_count ?? 0);
        $availableSeats = max(0, ($this->capacity ?? 0) - $enrolledCount);

        return [
            'id' => $this->id,
            'name' => $this->name,
            'exam_type' => $this->exam_type?->value ?? $this->exam_type,
            'capacity' => $this->capacity,
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
            'mode' => $this->mode instanceof \App\Enums\GroupMode ? $this->mode->value : $this->mode,
            'application_time' => $this->application_time,
            'site' => $this->site,
            'status' => $this->status instanceof \App\Enums\AcademicStatus ? $this->status->value : $this->status,
            'status_label' => $this->status instanceof \App\Enums\AcademicStatus ? $this->status->label() : 'Desconocido',
            'period_id' => $this->period_id,
            
            // Datos del docente filtrados
            'teacher_id' => $visibilityService->filterTeacherId($this->teacher_id, $user, $this->status),
            'teacher_name' => $visibilityService->filterTeacherName($this->teacher ? $this->teacher->full_name : null, $user, $this->status),
            'teacher' => $visibilityService->shouldHideTeacher($user, $this->status) || !$this->teacher ? null : [
                'name' => $this->teacher->first_name,
                'last_name' => $this->teacher->last_name,
            ],
            
            'period_name' => $this->period?->name ?? 'Sin asignar',
            'period' => $this->period ? ['id' => $this->period->id, 'name' => $this->period->name] : null,
            'registered' => $enrolledCount,
            'enrolled_count' => $enrolledCount,
            'available_seats' => $availableSeats,
            'is_enrolled' => $currentStudentId && $this->relationLoaded('students')
                ? $this->students->contains('id', $currentStudentId)
                : false,
            'students_string' => $this->whenLoaded('students', function () {
                return collect($this->students)->map(fn ($s) => $s->full_name)->join(' ');
            }, ''),
        ];
    }
}
