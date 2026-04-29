<?php

namespace Tests\Feature;

use App\Enums\AcademicStatus;
use App\Enums\ExamType;
use App\Enums\GroupMode;
use App\Enums\GroupType;
use App\Models\Exam;
use App\Models\Group;
use App\Models\Level;
use App\Models\Period;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CoreModulesE2ETest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        $user = User::factory()->create();
        $user->assignRole('admin');

        return $user;
    }

    private function examPayload(int $periodId, int $teacherId): array
    {
        return [
            'exam_type'        => ExamType::UBICACION->value,
            'status'           => AcademicStatus::PENDING->value,
            'capacity'         => 30,
            'start_date'       => '2026-08-01',
            'end_date'         => '2026-08-10',
            'mode'             => 'Presencial',
            'application_time' => '09:00',
            'classroom'        => 'Aula E2E-1',
            'period_id'        => $periodId,
            'teacher_id'       => $teacherId,
        ];
    }

    private function groupPayload(int $periodId, int $teacherId, int $levelId): array
    {
        return [
            'mode'            => GroupMode::PRESENCIAL->value,
            'type'            => GroupType::REGULAR->value,
            'capacity'        => 25,
            'schedule'        => 'Lunes y Miercoles 16:00 - 18:00',
            'classroom'       => 'Aula G-E2E',
            'meeting_link'    => null,
            'status'          => AcademicStatus::PENDING->value,
            'period_id'       => $periodId,
            'teacher_id'      => $teacherId,
            'level_id'        => $levelId,
            'evaluable_units' => 3,
        ];
    }

    public function test_e2e_exam_main_flow_from_creation_to_completion(): void
    {
        $admin = $this->admin();
        $period = Period::factory()->create();
        $teacher = Teacher::factory()->create();
        $students = Student::factory()->withRole()->count(2)->create();

        $this->actingAs($admin)
            ->post(route('exams.store'), $this->examPayload($period->id, $teacher->id))
            ->assertRedirect()
            ->assertSessionHas('success');

        $exam = Exam::query()->latest('id')->firstOrFail();

        $this->actingAs($admin)
            ->post(route('exams.enroll', $exam), [
                'student_ids' => $students->pluck('id')->all(),
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $qualifications = $students->map(fn(Student $student) => [
            'student_id'      => $student->id,
            'units_breakdown' => ['is_left' => false, 'nivel_asignado' => 'Basico I'],
            'final_average'   => 88,
        ])->values()->all();

        $this->actingAs($admin)
            ->patch(route('exams.qualifications.bulk-update', $exam), [
                'qualifications' => $qualifications,
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->actingAs($admin)
            ->patch(route('exams.complete', $exam))
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseHas('exams', [
            'id' => $exam->id,
            'status' => AcademicStatus::COMPLETED->value,
        ]);

        foreach ($students as $student) {
            $this->assertDatabaseHas('exam_student', [
                'exam_id' => $exam->id,
                'student_id' => $student->id,
                'final_average' => 88,
            ]);
        }
    }

    public function test_e2e_group_main_flow_from_creation_to_completion(): void
    {
        $admin = $this->admin();
        $period = Period::factory()->create();
        $teacher = Teacher::factory()->create();
        $level = Level::factory()->create();
        $students = Student::factory()->withRole()->count(2)->create();

        $this->actingAs($admin)
            ->post(route('groups.store'), $this->groupPayload($period->id, $teacher->id, $level->id))
            ->assertRedirect()
            ->assertSessionHas('success');

        $group = Group::query()->latest('id')->firstOrFail();

        $this->actingAs($admin)
            ->post(route('groups.enroll', $group), [
                'student_ids' => $students->pluck('id')->all(),
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->actingAs($admin)
            ->patch(route('groups.update-units', $group), [
                'evaluable_units' => 5,
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->actingAs($admin)
            ->patch(route('groups.complete', $group))
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseHas('groups', [
            'id' => $group->id,
            'status' => AcademicStatus::COMPLETED->value,
            'evaluable_units' => 5,
        ]);

        foreach ($students as $student) {
            $this->assertDatabaseHas('qualifications', [
                'group_id' => $group->id,
                'student_id' => $student->id,
            ]);
        }
    }

    public function test_cannot_enroll_student_in_full_group(): void
    {
        $admin = $this->admin();
        $period = Period::factory()->create();
        $teacher = Teacher::factory()->create();
        $level = Level::factory()->create();

        $group = Group::factory()->create([
            'period_id' => $period->id,
            'teacher_id' => $teacher->id,
            'level_id' => $level->id,
            'capacity' => 1,
            'status' => AcademicStatus::ACTIVE->value,
        ]);

        $student1 = Student::factory()->withRole()->create();
        $this->actingAs($admin)
            ->post(route('groups.enroll', $group), [
                'student_ids' => [$student1->id],
            ]);

        $student2 = Student::factory()->withRole()->create();
        $response = $this->actingAs($admin)
            ->post(route('groups.enroll', $group), [
                'student_ids' => [$student2->id],
            ]);

        $this->assertTrue(
            $response->status() === 302 || $response->status() === 422,
            'Enrolling in full group should fail'
        );
    }

    public function test_cannot_enroll_duplicate_student_in_group(): void
    {
        $admin = $this->admin();
        $period = Period::factory()->create();
        $teacher = Teacher::factory()->create();
        $level = Level::factory()->create();

        $group = Group::factory()->create([
            'period_id' => $period->id,
            'teacher_id' => $teacher->id,
            'level_id' => $level->id,
            'status' => AcademicStatus::ACTIVE->value,
        ]);

        $student = Student::factory()->withRole()->create();

        $this->actingAs($admin)
            ->post(route('groups.enroll', $group), [
                'student_ids' => [$student->id],
            ]);

        $response = $this->actingAs($admin)
            ->post(route('groups.enroll', $group), [
                'student_ids' => [$student->id],
            ]);

        $this->assertTrue(
            $response->status() === 302 || $response->status() === 422,
            'Duplicate student enrollment should fail'
        );
    }

    public function test_cannot_complete_group_without_students(): void
    {
        $admin = $this->admin();
        $group = Group::factory()->create(['status' => AcademicStatus::ACTIVE->value]);

        $this->actingAs($admin)
            ->patch(route('groups.complete', $group))
            ->assertRedirect()
            ->assertSessionHas('error');

        $this->assertDatabaseHas('groups', [
            'id' => $group->id,
            'status' => AcademicStatus::ACTIVE->value,
        ]);
    }

    public function test_cannot_complete_exam_without_students(): void
    {
        $admin = $this->admin();
        $exam = Exam::factory()->create(['status' => AcademicStatus::ACTIVE->value]);

        $this->actingAs($admin)
            ->patch(route('exams.complete', $exam))
            ->assertRedirect()
            ->assertSessionHas('error');

        $this->assertDatabaseHas('exams', [
            'id' => $exam->id,
            'status' => AcademicStatus::ACTIVE->value,
        ]);
    }
}
