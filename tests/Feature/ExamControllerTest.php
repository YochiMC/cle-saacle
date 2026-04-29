<?php

namespace Tests\Feature;

use App\Actions\BulkDeleteExams;
use App\Actions\BulkDetachStudentsFromExam;
use App\Actions\BulkUpdateExamStatus;
use App\Actions\EnrollStudentsInExam;
use App\Enums\AcademicStatus;
use App\Enums\ExamType;
use App\Models\Exam;
use App\Models\Level;
use App\Models\Period;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

/**
 * Suite Feature para ExamController.
 *
 * Estrategia: se prueban los contratos HTTP (status, redirect, flash, payload
 * Inertia, efectos en DB y autorizacion). La logica interna de cada Action
 * se prueba de forma aislada en sus propias suites Unit.
 *
 * Se mockean unicamente las Actions cuando necesitamos verificar dispatch sin
 * efectos colaterales. En el resto de casos usamos la implementacion real.
 */
class ExamControllerTest extends TestCase
{
    use RefreshDatabase;

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Helpers de usuario
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    private function userWithRole(string $role): User
    {
        $user = User::factory()->create();
        $user->assignRole($role);
        return $user;
    }

    private function admin(): User
    {
        return $this->userWithRole('admin');
    }
    private function coordinator(): User
    {
        return $this->userWithRole('coordinator');
    }
    private function teacher(): User
    {
        return $this->userWithRole('teacher');
    }
    private function student(): User
    {
        return $this->userWithRole('student');
    }
    private function regularUser(): User
    {
        return User::factory()->create();
    }

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Helpers de datos
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    private function validExamPayload(?Period $period = null, ?Teacher $teacher = null): array
    {
        return [
            'exam_type'        => ExamType::UBICACION->value,
            'status'           => AcademicStatus::PENDING->value,
            'capacity'         => 20,
            'start_date'       => '2026-08-01',
            'end_date'         => '2026-08-15',
            'mode'             => 'Presencial',
            'application_time' => '09:00',
            'classroom'        => 'Aula A-1',
            'period_id'        => ($period ?? Period::factory()->create())->id,
            'teacher_id'       => ($teacher ?? Teacher::factory()->create())->id,
        ];
    }

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // store()
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    public function test_store_creates_exam_and_redirects_with_success(): void
    {
        $this->actingAs($this->admin())
            ->post(route('exams.store'), $this->validExamPayload())
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseHas('exams', ['status' => AcademicStatus::PENDING->value]);
    }

    public function test_store_persists_exam_name_generated_by_naming_service(): void
    {
        $period = Period::factory()->create(['start' => '2026-08-01']);

        $this->actingAs($this->admin())
            ->post(route('exams.store'), $this->validExamPayload($period));

        // ExamNamingService genera algo tipo "UBAGOSTO26P" - verificamos que no es null ni vacio
        $exam = Exam::first();
        $this->assertNotEmpty($exam->name);
        $this->assertSame(strtoupper($exam->name), $exam->name, 'Name should be uppercase');
    }

    public function test_store_returns_403_for_student_role(): void
    {
        $this->actingAs($this->student())
            ->post(route('exams.store'), $this->validExamPayload())
            ->assertForbidden();
    }

    public function test_store_rejects_invalid_payload_with_422(): void
    {
        $this->actingAs($this->admin())
            ->post(route('exams.store'), ['capacity' => -1])
            ->assertSessionHasErrors();
    }

    public function test_store_redirects_guest_to_login(): void
    {
        $this->post(route('exams.store'), $this->validExamPayload())
            ->assertRedirect(route('login'));
    }

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // update()
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    public function test_update_modifies_exam_and_redirects_with_success(): void
    {
        $exam = Exam::factory()->create();

        $this->actingAs($this->admin())
            ->put(route('exams.update', $exam), ['capacity' => 99])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseHas('exams', ['id' => $exam->id, 'capacity' => 99]);
    }

    public function test_update_rejects_end_date_before_start_date(): void
    {
        // Regla de negocio real: end_date >= start_date
        $exam = Exam::factory()->create();

        $this->actingAs($this->admin())
            ->put(route('exams.update', $exam), [
                'start_date' => '2026-06-01',
                'end_date'   => '2026-05-01',  // anterior al start
            ])
            ->assertSessionHasErrors(['end_date']);
    }

    public function test_update_returns_403_for_student_role(): void
    {
        $exam = Exam::factory()->create();

        $this->actingAs($this->student())
            ->put(route('exams.update', $exam), ['capacity' => 5])
            ->assertForbidden();
    }

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // destroy()
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    public function test_destroy_soft_deletes_exam_and_redirects_with_success(): void
    {
        $exam = Exam::factory()->create();

        $this->actingAs($this->admin())
            ->delete(route('exams.destroy', $exam))
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertSoftDeleted('exams', ['id' => $exam->id]);
    }

    public function test_destroy_returns_403_for_student_role(): void
    {
        $exam = Exam::factory()->create();

        $this->actingAs($this->student())
            ->delete(route('exams.destroy', $exam))
            ->assertForbidden();
    }

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // show()
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    public function test_show_renders_inertia_view_with_expected_props(): void
    {
        $exam = Exam::factory()->create();

        $this->actingAs($this->admin())
            ->get(route('exams.show', $exam))
            ->assertOk()
            ->assertInertia(
                fn($page) => $page
                    ->component('Exams/View')
                    ->has('examen')
                    ->has('enrolledStudents')
                    ->has('availableStudents')
                    ->has('levelsTecnm')
            );
    }

    public function test_show_excludes_enrolled_students_from_available_list(): void
    {
        $exam    = Exam::factory()->create();
        $student = Student::factory()->withRole()->create();
        $exam->students()->attach($student->id, [
            'calificacion'    => null,
            'units_breakdown' => null,
            'final_average' => 0,
        ]);

        $this->actingAs($this->admin())
            ->get(route('exams.show', $exam))
            ->assertOk()
            ->assertInertia(
                fn($page) => $page
                    ->component('Exams/View')
                    ->where(
                        'availableStudents',
                        fn($available) =>
                        ! collect($available)->pluck('id')->contains($student->id)
                    )
            );
    }

    public function test_show_excludes_programa_egresados_from_levelsTecnm(): void
    {
        Level::firstOrCreate(
            ['level_tecnm' => 'Programa Egresados'],
            [
                'level_mcer'   => 'PE',
                'hours'        => 0,
                'program_type' => 'egresados',
            ]
        );
        $exam = Exam::factory()->create();

        $this->actingAs($this->admin())
            ->get(route('exams.show', $exam))
            ->assertOk()
            ->assertInertia(
                fn($page) => $page
                    ->where(
                        'levelsTecnm',
                        fn($levels) =>
                        ! collect($levels)->contains('Programa Egresados')
                    )
            );
    }

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // enroll()
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    public function test_enroll_delegates_to_action_and_redirects_with_success(): void
    {
        $exam     = Exam::factory()->create();
        $students = Student::factory()->withRole()->count(2)->create();

        $this->actingAs($this->admin())
            ->post(route('exams.enroll', $exam), [
                'student_ids' => $students->pluck('id')->all(),
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        foreach ($students as $student) {
            $this->assertDatabaseHas('exam_student', [
                'exam_id'    => $exam->id,
                'student_id' => $student->id,
            ]);
        }
    }

    public function test_enroll_returns_403_for_coordinator_role(): void
    {
        // EnrollStudentsRequest solo autoriza 'admin'
        $exam = Exam::factory()->create();

        $this->actingAs($this->coordinator())
            ->post(route('exams.enroll', $exam), ['student_ids' => []])
            ->assertForbidden();
    }

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // unenroll()
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    public function test_unenroll_detaches_student_and_redirects_with_success(): void
    {
        $exam    = Exam::factory()->create();
        $student = Student::factory()->withRole()->create();
        $exam->students()->attach($student->id, [
            'calificacion' => null,
            'units_breakdown' => null,
            'final_average' => 0,
        ]);

        $this->actingAs($this->admin())
            ->delete(route('exams.unenroll', [$exam, $student]))
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseMissing('exam_student', [
            'exam_id'    => $exam->id,
            'student_id' => $student->id,
        ]);
    }

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // bulkUnenroll()
    // POST /exams/{exam}/unenroll-bulk
    // Autorizacion: admin | coordinator  (BulkUnenrollRequest)
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    public function test_bulk_unenroll_detaches_multiple_students_and_redirects_with_success(): void
    {
        $exam     = Exam::factory()->create();
        $students = Student::factory()->withRole()->count(3)->create();

        foreach ($students as $s) {
            $exam->students()->attach($s->id, [
                'calificacion' => null,
                'units_breakdown' => null,
                'final_average' => 0,
            ]);
        }

        $this->actingAs($this->admin())
            ->post(route('exams.unenroll-bulk', $exam), [
                'ids' => $students->pluck('id')->all(),
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        foreach ($students as $s) {
            $this->assertDatabaseMissing('exam_student', [
                'exam_id'    => $exam->id,
                'student_id' => $s->id,
            ]);
        }
    }

    public function test_bulk_unenroll_returns_403_for_student_role(): void
    {
        // BulkUnenrollRequest autoriza solo admin|coordinator
        $exam    = Exam::factory()->create();
        $student = Student::factory()->withRole()->create();

        $this->actingAs($this->student())
            ->post(route('exams.unenroll-bulk', $exam), [
                'ids' => [$student->id],
            ])
            ->assertForbidden();
    }


    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // bulkStatus()
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    public function test_bulk_status_updates_exam_statuses_and_redirects_with_success(): void
    {
        $exams = Exam::factory()->count(3)->create(['status' => AcademicStatus::PENDING->value]);

        $this->actingAs($this->admin())
            ->post(route('exams.bulk-status'), [
                'ids'        => $exams->pluck('id')->all(),
                'new_status' => AcademicStatus::ACTIVE->value,
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        foreach ($exams as $exam) {
            $this->assertDatabaseHas('exams', ['id' => $exam->id, 'status' => AcademicStatus::ACTIVE->value]);
        }
    }

    public function test_bulk_status_returns_403_for_student_role(): void
    {
        $exam = Exam::factory()->create();

        $this->actingAs($this->student())
            ->post(route('exams.bulk-status'), [
                'ids'        => [$exam->id],
                'new_status' => AcademicStatus::ACTIVE->value,
            ])
            ->assertForbidden();
    }

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // bulkDelete()
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    public function test_bulk_delete_soft_deletes_exams_and_redirects_with_success(): void
    {
        $exams = Exam::factory()->count(2)->create();
        $ids   = $exams->pluck('id')->all();

        $this->actingAs($this->admin())
            ->delete(route('exams.bulk-delete'), ['ids' => $ids])
            ->assertRedirect()
            ->assertSessionHas('success');

        foreach ($ids as $id) {
            $this->assertSoftDeleted('exams', ['id' => $id]);
        }
    }

    public function test_bulk_delete_returns_403_for_student_role(): void
    {
        $exam = Exam::factory()->create();

        $this->actingAs($this->student())
            ->delete(route('exams.bulk-delete'), ['ids' => [$exam->id]])
            ->assertForbidden();
    }

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // complete()
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    public function test_complete_sets_exam_status_to_completed_and_redirects(): void
    {
        $exam = Exam::factory()->create(['status' => AcademicStatus::GRADING->value]);

        $this->actingAs($this->admin())
            ->patch(route('exams.complete', $exam))
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseHas('exams', [
            'id'     => $exam->id,
            'status' => AcademicStatus::COMPLETED->value,
        ]);
    }

    public function test_complete_returns_403_for_student_role(): void
    {
        $exam = Exam::factory()->create();

        $this->actingAs($this->student())
            ->patch(route('exams.complete', $exam))
            ->assertForbidden();
    }

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // updatePivot()
    // PATCH /exams/{exam}/qualifications/{student}
    // Autorizacion: admin | teacher | coordinator  (UpdateExamPivotRequest)
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    public function test_update_pivot_persists_units_breakdown_and_final_average(): void
    {
        $exam    = Exam::factory()->create();
        $student = Student::factory()->withRole()->create();
        $exam->students()->attach($student->id, [
            'calificacion'    => null,
            'units_breakdown' => json_encode(['is_left' => false]),
            'final_average' => 0,
        ]);

        $newBreakdown = ['is_left' => false, 'nivel_asignado' => 'Basico I'];

        $this->actingAs($this->teacher())
            ->patch(route('exams.qualifications.update', [$exam, $student]), [
                'units_breakdown' => $newBreakdown,
                'final_average'   => 85.5,
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseHas('exam_student', [
            'exam_id'      => $exam->id,
            'student_id'   => $student->id,
            'final_average' => 85.5,
        ]);
    }

    public function test_update_pivot_stores_zero_when_final_average_is_null(): void
    {
        // El controller hace: 'final_average' => $request->validated('final_average') ?? 0
        $exam    = Exam::factory()->create();
        $student = Student::factory()->withRole()->create();
        $exam->students()->attach($student->id, [
            'calificacion'    => null,
            'units_breakdown' => json_encode([]),
            'final_average'   => 99,
        ]);

        $this->actingAs($this->admin())
            ->patch(route('exams.qualifications.update', [$exam, $student]), [
                'units_breakdown' => ['is_left' => false],
                'final_average' => 0,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('exam_student', [
            'exam_id'       => $exam->id,
            'student_id'    => $student->id,
            'final_average' => 0,
        ]);
    }

    public function test_update_pivot_returns_403_for_student_role(): void
    {
        $exam    = Exam::factory()->create();
        $student = Student::factory()->withRole()->create();

        $this->actingAs($this->student())
            ->patch(route('exams.qualifications.update', [$exam, $student]), [
                'units_breakdown' => ['is_left' => false],
                'final_average'   => 70,
            ])
            ->assertForbidden();
    }

    public function test_update_pivot_rejects_missing_units_breakdown_with_422(): void
    {
        $exam    = Exam::factory()->create();
        $student = Student::factory()->withRole()->create();
        $exam->students()->attach($student->id, [
            'calificacion' => null,
            'units_breakdown' => json_encode([]),
            'final_average' => 0,
        ]);

        $this->actingAs($this->admin())
            ->patch(route('exams.qualifications.update', [$exam, $student]), [
                'final_average' => 80,
                // units_breakdown ausente
            ])
            ->assertSessionHasErrors(['units_breakdown']);
    }

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // bulkUpdatePivot()
    // PATCH /exams/{exam}/qualifications/bulk
    // Autorizacion: admin | teacher | coordinator  (BulkUpdateExamQualificationsRequest)
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    public function test_bulk_update_pivot_persists_all_qualifications_atomically(): void
    {
        $exam     = Exam::factory()->create();
        $students = Student::factory()->withRole()->count(2)->create();

        foreach ($students as $s) {
            $exam->students()->attach($s->id, [
                'calificacion'    => null,
                'units_breakdown' => json_encode(['is_left' => false]),
                'final_average' => 0,
            ]);
        }

        $qualifications = $students->map(fn($s) => [
            'student_id'      => $s->id,
            'units_breakdown' => ['is_left' => false, 'nivel_asignado' => 'Basico I'],
            'final_average'   => 90,
        ])->all();

        $this->actingAs($this->teacher())
            ->patch(route('exams.qualifications.bulk-update', $exam), [
                'qualifications' => $qualifications,
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        foreach ($students as $s) {
            $this->assertDatabaseHas('exam_student', [
                'exam_id'       => $exam->id,
                'student_id'    => $s->id,
                'final_average' => 90,
            ]);
        }
    }

    public function test_bulk_update_pivot_defaults_final_average_to_zero_when_null(): void
    {
        // BulkUpdateExamQualifications::execute() hace ?? 0 en cada item
        $exam    = Exam::factory()->create();
        $student = Student::factory()->withRole()->create();
        $exam->students()->attach($student->id, [
            'calificacion' => null,
            'units_breakdown' => json_encode([]),
            'final_average' => 50,
        ]);

        $this->actingAs($this->admin())
            ->patch(route('exams.qualifications.bulk-update', $exam), [
                'qualifications' => [[
                    'student_id'      => $student->id,
                    'units_breakdown' => ['is_left' => false],
                    'final_average' => 0,
                ]],
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('exam_student', [
            'exam_id'       => $exam->id,
            'student_id'    => $student->id,
            'final_average' => 0,
        ]);
    }

    public function test_bulk_update_pivot_returns_403_for_student_role(): void
    {
        $exam = Exam::factory()->create();

        $this->actingAs($this->student())
            ->patch(route('exams.qualifications.bulk-update', $exam), [
                'qualifications' => [],
            ])
            ->assertForbidden();
    }

    public function test_bulk_update_pivot_rejects_missing_qualifications_array_with_422(): void
    {
        $exam = Exam::factory()->create();

        $this->actingAs($this->admin())
            ->patch(route('exams.qualifications.bulk-update', $exam), [
                // qualifications ausente
            ])
            ->assertSessionHasErrors(['qualifications']);
    }

    public function test_bulk_update_pivot_rejects_item_with_nonexistent_student_id(): void
    {
        $exam = Exam::factory()->create();

        $this->actingAs($this->admin())
            ->patch(route('exams.qualifications.bulk-update', $exam), [
                'qualifications' => [[
                    'student_id'      => 999_999,
                    'units_breakdown' => ['is_left' => false],
                    'final_average'   => 70,
                ]],
            ])
            ->assertSessionHasErrors(['qualifications.0.student_id']);
    }
}
