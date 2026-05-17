<?php

namespace App\Services;

use App\Enums\AcademicStatus;
use App\Models\Setting;
use App\Models\User;
use Carbon\Carbon;

class TeacherVisibilityService
{
    /**
     * Verifica únicamente si la fecha actual es anterior a la fecha de revelación.
     */
    public function isBeforeRevealDate(?User $user): bool
    {
        if (!$user || !$user->hasRole('student')) {
            return false;
        }

        $revealDateSetting = Setting::where('key', 'teacher_reveal_date')->first();
        $revealDate = $revealDateSetting && $revealDateSetting->value 
            ? Carbon::parse($revealDateSetting->value)->startOfDay() 
            : Carbon::parse('2026-03-20')->startOfDay();

        return now()->startOfDay()->lt($revealDate);
    }

    /**
     * Determina si la información del docente debe ser ocultada para un recurso específico.
     * Solo se oculta si el estado es ENROLLING y estamos antes de la fecha de revelación.
     */
    public function shouldHideTeacher(?User $user, $status, $groupType = null): bool
    {
        $groupTypeValue = $groupType instanceof \App\Enums\GroupType ? $groupType->value : $groupType;
        if ($groupTypeValue === \App\Enums\GroupType::PROGRAMA_EGRESADOS->value) {
            return false;
        }

        $statusValue = $status instanceof AcademicStatus ? $status->value : $status;
        if ($statusValue !== AcademicStatus::ENROLLING->value) {
            return false;
        }

        return $this->isBeforeRevealDate($user);
    }

    /**
     * Retorna null si el ID del docente debe ser ocultado, de lo contrario retorna el ID original.
     */
    public function filterTeacherId(?int $teacherId, ?User $user, $status, $groupType = null): ?int
    {
        return $this->shouldHideTeacher($user, $status, $groupType) ? null : $teacherId;
    }

    /**
     * Retorna 'Por asignar' si el nombre del docente debe ser ocultado, de lo contrario retorna el nombre original.
     */
    public function filterTeacherName(?string $teacherName, ?User $user, $status, $groupType = null): ?string
    {
        return $this->shouldHideTeacher($user, $status, $groupType) ? 'Por asignar' : $teacherName;
    }
}
