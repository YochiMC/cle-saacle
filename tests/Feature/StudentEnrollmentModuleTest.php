<?php

namespace Tests\Feature;

use App\Enums\AcademicStatus;
use App\Enums\ExamType;
use App\Enums\GroupMode;
use App\Enums\GroupType;
use App\Enums\ServiceStatus;
use App\Enums\ServiceType;
use App\Enums\StudentStatus;
use App\Models\Exam;
use App\Models\Group;
use App\Models\Level;
use App\Models\Period;
use App\Models\Service;
use App\Models\Student;
use App\Models\Teacher;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentEnrollmentModuleTest extends TestCase
{
    use RefreshDatabase;

    private function createStudentWithStatus(string $status): Student
    {
        return Student::factory()->withRole()->create([
            'status' => $status,
        ]);
    }

    public function test_view_exposes_enrollment_contract_for_eligible_student(): void
    {
        $level = Level::factory()->create();
        $teacher = Teacher::factory()->create();
        $period = Period::create([
            'name' => 'Periodo de prueba',
            'start_date' => now()->subDay()->toDateString(),
            'end_date' => now()->addDay()->toDateString(),
            'is_active' => true,
        ]);

        $student = $this->createStudentWithStatus(StudentStatus::ELIGIBLE_FOR_ENROLLMENT->value);
        $student->update(['level_id' => $level->id]);

        Service::create([
            'type' => ServiceType::REGULAR->value,
            'amount' => 100,
            'status' => ServiceStatus::APPROVED->value,
            'description' => 'Pago curso regular',
            'student_id' => $student->id,
            'period_id' => $period->id,
        ]);

        Service::create([
            'type' => ServiceType::CONVALIDACION->value,
            'amount' => 100,
            'status' => ServiceStatus::APPROVED->value,
            'description' => 'Pago examen',
            'student_id' => $student->id,
            'period_id' => $period->id,
        ]);

        Group::create([
            'name' => 'GRP-TEST-1',
            'mode' => GroupMode::PRESENCIAL->value,
            'type' => GroupType::REGULAR->value,
            'capacity' => 20,
            'schedule' => 'Lunes 08:00 - 10:00',
            'classroom' => 'Aula 1',
            'status' => AcademicStatus::ENROLLING->value,
            'period_id' => $period->id,
            'teacher_id' => $teacher->id,
            'level_id' => $level->id,
            'evaluable_units' => 3,
        ]);

        Exam::create([
            'name' => 'EXAM-TEST-1',
            'exam_type' => ExamType::CONVALIDACION->value,
            'mode' => GroupMode::PRESENCIAL->value,
            'capacity' => 20,
            'start_date' => now()->addDay()->toDateString(),
            'end_date' => now()->addDay()->toDateString(),
            'application_time' => '09:00',
            'site' => 'Aula 2',
            'status' => AcademicStatus::ENROLLING->value,
            'period_id' => $period->id,
            'teacher_id' => $teacher->id,
        ]);

        $this->actingAs($student->user)
            ->get(route('student.enrollment'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Academic/StudentEnrollment')
                ->where('canEnroll', true)
                ->where('studentStatus', StudentStatus::ELIGIBLE_FOR_ENROLLMENT->label())
                ->where('studentStatusValue', StudentStatus::ELIGIBLE_FOR_ENROLLMENT->value)
                ->has('availableGroups')
                ->has('availableExams')
                ->has('enrolledGroups')
                ->has('enrolledExams')
            );
    }

    public function test_self_enroll_creates_group_qualification_when_type_matches(): void
    {
        $level = Level::factory()->create();
        $teacher = Teacher::factory()->create();
        $period = Period::create([
            'name' => 'Periodo de prueba',
            'start_date' => now()->subDay()->toDateString(),
            'end_date' => now()->addDay()->toDateString(),
            'is_active' => true,
        ]);

        $student = $this->createStudentWithStatus(StudentStatus::ELIGIBLE_FOR_ENROLLMENT->value);
        $student->update(['level_id' => $level->id]);

        Service::create([
            'type' => ServiceType::REGULAR->value,
            'amount' => 100,
            'status' => ServiceStatus::APPROVED->value,
            'description' => 'Pago curso regular',
            'student_id' => $student->id,
            'period_id' => $period->id,
        ]);

        $group = Group::create([
            'name' => 'GRP-TEST-2',
            'mode' => GroupMode::PRESENCIAL->value,
            'type' => GroupType::REGULAR->value,
            'capacity' => 20,
            'schedule' => 'Martes 08:00 - 10:00',
            'classroom' => 'Aula 3',
            'status' => AcademicStatus::ENROLLING->value,
            'period_id' => $period->id,
            'teacher_id' => $teacher->id,
            'level_id' => $level->id,
            'evaluable_units' => 3,
        ]);

        $this->actingAs($student->user)
            ->post(route('self-enroll', $group))
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseHas('qualifications', [
            'group_id' => $group->id,
            'student_id' => $student->id,
        ]);

        $this->assertSame(StudentStatus::ESPERA_INSCRIPCION->value, $student->fresh()->status->value);
    }

    public function test_exam_enroll_rejects_when_concept_does_not_match(): void
    {
        $teacher = Teacher::factory()->create();
        $period = Period::create([
            'name' => 'Periodo de prueba',
            'start_date' => now()->subDay()->toDateString(),
            'end_date' => now()->addDay()->toDateString(),
            'is_active' => true,
        ]);

        $student = $this->createStudentWithStatus(StudentStatus::ELIGIBLE_FOR_ENROLLMENT->value);

        Service::create([
            'type' => ServiceType::REGULAR->value,
            'amount' => 100,
            'status' => ServiceStatus::APPROVED->value,
            'description' => 'Pago curso regular',
            'student_id' => $student->id,
            'period_id' => $period->id,
        ]);

        $exam = Exam::create([
            'name' => 'EXAM-TEST-2',
            'exam_type' => ExamType::CONVALIDACION->value,
            'mode' => GroupMode::PRESENCIAL->value,
            'capacity' => 20,
            'start_date' => now()->addDay()->toDateString(),
            'end_date' => now()->addDay()->toDateString(),
            'application_time' => '10:00',
            'site' => 'Aula 4',
            'status' => AcademicStatus::ENROLLING->value,
            'period_id' => $period->id,
            'teacher_id' => $teacher->id,
        ]);

        $this->actingAs($student->user)
            ->post(route('exams.enroll', $exam), [
                'student_ids' => [$student->id],
            ])
            ->assertRedirect()
            ->assertSessionHas('warning');

        $this->assertDatabaseMissing('exam_student', [
            'exam_id' => $exam->id,
            'student_id' => $student->id,
        ]);
    }

    public function test_unenroll_restores_eligible_for_enrollment_status(): void
    {
        $level = Level::factory()->create();
        $teacher = Teacher::factory()->create();
        $period = Period::create([
            'name' => 'Periodo de prueba',
            'start_date' => now()->subDay()->toDateString(),
            'end_date' => now()->addDay()->toDateString(),
            'is_active' => true,
        ]);

        $student = $this->createStudentWithStatus(StudentStatus::ELIGIBLE_FOR_ENROLLMENT->value);
        $student->update(['level_id' => $level->id]);

        Service::create([
            'type' => ServiceType::REGULAR->value,
            'amount' => 100,
            'status' => ServiceStatus::APPROVED->value,
            'description' => 'Pago curso regular',
            'student_id' => $student->id,
            'period_id' => $period->id,
        ]);

        $group = Group::create([
            'name' => 'GRP-UNENROLL-1',
            'mode' => GroupMode::PRESENCIAL->value,
            'type' => GroupType::REGULAR->value,
            'capacity' => 20,
            'schedule' => 'Miércoles 08:00 - 10:00',
            'classroom' => 'Aula 5',
            'status' => AcademicStatus::ENROLLING->value,
            'period_id' => $period->id,
            'teacher_id' => $teacher->id,
            'level_id' => $level->id,
            'evaluable_units' => 3,
        ]);

        // Inscribir al estudiante
        $this->actingAs($student->user)
            ->post(route('self-enroll', $group))
            ->assertRedirect();

        // Verificar que está inscrito y estado cambió a ESPERA_INSCRIPCION
        $this->assertDatabaseHas('qualifications', [
            'group_id' => $group->id,
            'student_id' => $student->id,
        ]);
        $this->assertSame(StudentStatus::ESPERA_INSCRIPCION->value, $student->fresh()->status->value);

        // Desincribir al estudiante
        $this->actingAs($student->user)
            ->delete(route('groups.unenroll', [$group->id, $student->id]))
            ->assertRedirect();

        // Verificar que se realizó el soft delete
        $this->assertDatabaseMissing('qualifications', [
            'group_id' => $group->id,
            'student_id' => $student->id,
        ]);

        // Verificar que el estado regresa a elegible para reinscripción
        $this->assertSame(StudentStatus::ELIGIBLE_FOR_ENROLLMENT->value, $student->fresh()->status->value);
    }

}
