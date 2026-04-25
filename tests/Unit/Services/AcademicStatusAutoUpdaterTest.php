<?php

namespace Tests\Unit\Services;

use App\Enums\AcademicStatus;
use App\Enums\ExamType;
use App\Enums\GroupMode;
use App\Enums\GroupType;
use App\Models\Exam;
use App\Models\Group;
use App\Models\Period;
use App\Models\Setting;
use App\Models\Teacher;
use App\Services\AcademicStatusAutoUpdater;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class AcademicStatusAutoUpdaterTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    public function test_run_updates_groups_status_based_on_courses_settings(): void
    {
        Carbon::setTestNow('2026-08-05 10:00:00');

        $period = Period::factory()->create([
            'start' => '2026-01-01',
            'end' => '2026-12-31',
            'is_active' => true,
        ]);

        $groupRegular = Group::factory()->create([
            'period_id' => $period->id,
            'type' => GroupType::REGULAR->value,
            'status' => AcademicStatus::PENDING->value,
        ]);

        $groupSemi = Group::factory()->create([
            'period_id' => $period->id,
            'type' => GroupType::SEMI_INTENSIVO->value,
            'status' => AcademicStatus::PENDING->value,
        ]);

        $groupIntensivo = Group::factory()->create([
            'period_id' => $period->id,
            'type' => GroupType::INTENSIVO->value,
            'status' => AcademicStatus::PENDING->value,
        ]);

        $this->upsertSetting('courses_enrollment_start', '2026-08-01');
        $this->upsertSetting('courses_enrollment_end', '2026-08-31');
        $this->upsertSetting('courses_active_start', '2026-09-01');
        $this->upsertSetting('courses_active_end', '2026-11-30');
        $this->upsertSetting('courses_evaluation_start', '2026-12-01');
        $this->upsertSetting('courses_evaluation_end', '2026-12-10');

        app(AcademicStatusAutoUpdater::class)->run('test');

        $this->assertDatabaseHas('groups', [
            'id' => $groupRegular->id,
            'status' => AcademicStatus::ENROLLING->value,
        ]);

        $this->assertDatabaseHas('groups', [
            'id' => $groupSemi->id,
            'status' => AcademicStatus::ENROLLING->value,
        ]);

        // INTENSIVO no sigue el calendario global, debe conservar su estado.
        $this->assertDatabaseHas('groups', [
            'id' => $groupIntensivo->id,
            'status' => AcademicStatus::PENDING->value,
        ]);
    }

    public function test_run_updates_exams_with_active_precedence_over_global_status(): void
    {
        Carbon::setTestNow('2026-08-05 10:00:00');

        $period = Period::factory()->create([
            'start' => '2026-01-01',
            'end' => '2026-12-31',
            'is_active' => true,
        ]);

        $teacher = Teacher::factory()->create();

        $examInWindow = Exam::factory()->create([
            'period_id' => $period->id,
            'teacher_id' => $teacher->id,
            'exam_type' => ExamType::UBICACION->value,
            'mode' => GroupMode::PRESENCIAL->value,
            'status' => AcademicStatus::PENDING->value,
            'start_date' => '2026-08-05',
            'end_date' => '2026-08-06',
        ]);

        $examOutWindow = Exam::factory()->create([
            'period_id' => $period->id,
            'teacher_id' => $teacher->id,
            'exam_type' => ExamType::UBICACION->value,
            'mode' => GroupMode::PRESENCIAL->value,
            'status' => AcademicStatus::PENDING->value,
            'start_date' => '2026-09-10',
            'end_date' => '2026-09-11',
        ]);

        // Requisito base para que el servicio no aborte.
        $this->upsertSetting('courses_enrollment_start', '2026-08-01');

        // Calendario de examenes: hoy cae en inscripciones => estado global ENROLLING.
        $this->upsertSetting('exams_enrollment_start', '2026-08-01');
        $this->upsertSetting('exams_enrollment_end', '2026-08-31');
        $this->upsertSetting('exams_evaluation_start', '2026-09-01');
        $this->upsertSetting('exams_evaluation_end', '2026-09-10');

        app(AcademicStatusAutoUpdater::class)->run('test');

        // Debe prevalecer fase 2 (ventana individual) => ACTIVE.
        $this->assertDatabaseHas('exams', [
            'id' => $examInWindow->id,
            'status' => AcademicStatus::ACTIVE->value,
        ]);

        // Fuera de ventana individual => aplica estado global ENROLLING.
        $this->assertDatabaseHas('exams', [
            'id' => $examOutWindow->id,
            'status' => AcademicStatus::ENROLLING->value,
        ]);
    }

    private function upsertSetting(string $key, string $value): void
    {
        Setting::updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        );
    }
}
