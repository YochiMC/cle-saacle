<?php

namespace Tests\Unit\Actions;

use App\Actions\Students\AssignPlacementLevelAction;
use App\Enums\AcademicStatus;
use App\Enums\ExamType;
use App\Models\Exam;
use App\Models\Level;
use App\Models\Student;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

class AssignPlacementLevelActionTest extends TestCase
{
    use RefreshDatabase;

    private AssignPlacementLevelAction $action;

    protected function setUp(): void
    {
        parent::setUp();
        $this->action = new AssignPlacementLevelAction();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private function createLevel(string $tecnm): Level
    {
        return Level::create([
            'level_tecnm'  => $tecnm,
            'level_mcer'   => 'A1',
            'hours'        => 80,
            'program_type' => 'regular',
        ]);
    }

    /**
     * Crea un examen de Ubicación con alumnos en el pivot.
     *
     * @param array<int, array{student: Student, units_breakdown: array<string, mixed>}> $pivots
     */
    private function createPlacementExamWith(array $pivots): Exam
    {
        $exam = Exam::factory()->create([
            'exam_type' => ExamType::UBICACION->value,
            'status'    => AcademicStatus::COMPLETED->value,
        ]);

        foreach ($pivots as $pivot) {
            $exam->students()->attach($pivot['student']->id, [
                'calificacion'    => null,
                'units_breakdown' => json_encode($pivot['units_breakdown'] ?? []),
                'final_average'   => 0,
            ]);
        }

        return $exam;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Guard: tipo de examen
    // ─────────────────────────────────────────────────────────────────────────

    public function test_does_not_assign_level_for_non_placement_exam_type(): void
    {
        $initialLevel = $this->createLevel('Inicial');
        $this->createLevel('Básico I');
        $student = Student::factory()->withRole()->create(['level_id' => $initialLevel->id]);

        $exam = Exam::factory()->create(['exam_type' => ExamType::CUATRO_HABILIDADES->value]);
        $exam->students()->attach($student->id, [
            'calificacion'    => null,
            'units_breakdown' => json_encode(['nivel_asignado' => 'Básico I']),
            'final_average'   => 0,
        ]);

        $this->action->execute($exam);

        $this->assertSame($initialLevel->id, Student::find($student->id)->level_id);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Happy Path: coincidencia exacta
    // ─────────────────────────────────────────────────────────────────────────

    public function test_assigns_level_by_exact_match_on_nivel_asignado(): void
    {
        $initialLevel = $this->createLevel('Inicial');
        $level   = $this->createLevel('Básico I');
        $student = Student::factory()->withRole()->create(['level_id' => $initialLevel->id]);

        $exam = $this->createPlacementExamWith([
            ['student' => $student, 'units_breakdown' => ['nivel_asignado' => 'Básico I']],
        ]);

        $this->action->execute($exam);

        $this->assertSame($level->id, Student::find($student->id)->level_id);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Fallbacks
    // ─────────────────────────────────────────────────────────────────────────

    public function test_falls_back_to_nivel_certificado_when_nivel_asignado_is_absent(): void
    {
        $initialLevel = $this->createLevel('Inicial');
        $level   = $this->createLevel('Intermedio I');
        $student = Student::factory()->withRole()->create(['level_id' => $initialLevel->id]);

        $exam = $this->createPlacementExamWith([
            ['student' => $student, 'units_breakdown' => ['nivel_certificado' => 'Intermedio I']],
        ]);

        $this->action->execute($exam);

        $this->assertSame($level->id, Student::find($student->id)->level_id);
    }

    public function test_falls_back_to_level_key_as_last_resort(): void
    {
        $initialLevel = $this->createLevel('Inicial');
        $level   = $this->createLevel('Avanzado I');
        $student = Student::factory()->withRole()->create(['level_id' => $initialLevel->id]);

        $exam = $this->createPlacementExamWith([
            ['student' => $student, 'units_breakdown' => ['level' => 'Avanzado I']],
        ]);

        $this->action->execute($exam);

        $this->assertSame($level->id, Student::find($student->id)->level_id);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Normalización
    // ─────────────────────────────────────────────────────────────────────────

    public function test_assigns_level_despite_different_casing_and_accents(): void
    {
        $initialLevel = $this->createLevel('Inicial');
        $level   = $this->createLevel('Básico I');
        $student = Student::factory()->withRole()->create(['level_id' => $initialLevel->id]);

        $exam = $this->createPlacementExamWith([
            ['student' => $student, 'units_breakdown' => ['nivel_asignado' => 'BASICO I']],
        ]);

        $this->action->execute($exam);

        $this->assertSame($level->id, Student::find($student->id)->level_id);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Coincidencia parcial
    // ─────────────────────────────────────────────────────────────────────────

    public function test_uses_partial_match_when_it_is_unique_and_unambiguous(): void
    {
        $initialLevel = $this->createLevel('Inicial');
        $level   = $this->createLevel('Nivel Unico XYZ');
        $student = Student::factory()->withRole()->create(['level_id' => $initialLevel->id]);

        $exam = $this->createPlacementExamWith([
            ['student' => $student, 'units_breakdown' => ['nivel_asignado' => 'unico xyz']],
        ]);

        $this->action->execute($exam);

        $this->assertSame($level->id, Student::find($student->id)->level_id);
    }

    public function test_logs_warning_and_does_not_assign_level_on_ambiguous_partial_match(): void
    {
        Log::shouldReceive('warning')
            ->once()
            ->withArgs(fn($msg) => str_contains($msg, 'Ambiguous'));

        $this->createLevel('Básico I');
        $this->createLevel('Básico II');

        $initialLevel = $this->createLevel('Inicial');
        $student = Student::factory()->withRole()->create(['level_id' => $initialLevel->id]);

        $exam = $this->createPlacementExamWith([
            ['student' => $student, 'units_breakdown' => ['nivel_asignado' => 'basico']],
        ]);

        $this->action->execute($exam);

        $this->assertSame($initialLevel->id, Student::find($student->id)->level_id);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Casos límite
    // ─────────────────────────────────────────────────────────────────────────

    public function test_does_not_fail_when_pivot_has_no_level_key(): void
    {
        $initialLevel = $this->createLevel('Inicial');
        $student = Student::factory()->withRole()->create(['level_id' => $initialLevel->id]);

        $exam = $this->createPlacementExamWith([
            ['student' => $student, 'units_breakdown' => ['is_left' => false]],
        ]);

        $this->action->execute($exam);

        $this->assertSame($initialLevel->id, Student::find($student->id)->level_id);
    }

    public function test_logs_warning_and_continues_when_units_breakdown_is_invalid_json(): void
    {
        Log::shouldReceive('warning')
            ->once()
            ->withArgs(fn($msg) => str_contains($msg, 'Invalid JSON'));

        $initialLevel = $this->createLevel('Inicial');
        $student = Student::factory()->withRole()->create(['level_id' => $initialLevel->id]);

        $exam = Exam::factory()->create([
            'exam_type' => ExamType::UBICACION->value,
            'status'    => AcademicStatus::COMPLETED->value,
        ]);
        $exam->students()->attach($student->id, [
            'calificacion'    => null,
            'units_breakdown' => '{json-invalido',
            'final_average'   => 0,
        ]);

        $this->action->execute($exam);

        $this->assertSame($initialLevel->id, Student::find($student->id)->level_id);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Lote
    // ─────────────────────────────────────────────────────────────────────────

    public function test_assigns_different_levels_to_multiple_students_in_one_execution(): void
    {
        $initialLevel = $this->createLevel('Inicial');
        $levelA  = $this->createLevel('Básico I');
        $levelB  = $this->createLevel('Básico II');
        $studentA = Student::factory()->withRole()->create(['level_id' => $initialLevel->id]);
        $studentB = Student::factory()->withRole()->create(['level_id' => $initialLevel->id]);

        $exam = $this->createPlacementExamWith([
            ['student' => $studentA, 'units_breakdown' => ['nivel_asignado' => 'Básico I']],
            ['student' => $studentB, 'units_breakdown' => ['nivel_asignado' => 'Básico II']],
        ]);

        $this->action->execute($exam);

        $this->assertSame($levelA->id, Student::find($studentA->id)->level_id);
        $this->assertSame($levelB->id, Student::find($studentB->id)->level_id);
    }
}
