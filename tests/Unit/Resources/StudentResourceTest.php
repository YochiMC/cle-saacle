<?php

namespace Tests\Unit\Resources;

use App\Enums\StudentStatus;
use App\Http\Resources\StudentResource;
use App\Models\Degree;
use App\Models\Level;
use App\Models\Student;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class StudentResourceTest extends TestCase
{
    use RefreshDatabase;

    private function serialize(Student $student): array
    {
        $student->load(['degree', 'level', 'typeStudent']);
        return (new StudentResource($student))->toArray(new Request());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Estructura completa
    // ─────────────────────────────────────────────────────────────────────────

    public function test_exposes_all_expected_keys(): void
    {
        $resource = $this->serialize(Student::factory()->withRole()->create());

        $expectedKeys = [
            'id',
            'user_id',
            'full_name',
            'first_name',
            'last_name',
            'num_control',
            'gender',
            'birthdate',
            'age',
            'semester',
            'status',
            'status_label',
            'degree_id',
            'degree',
            'level_id',
            'level',
            'level_tecnm',
            'type_student_id',
            'type_student',
            'type',
        ];

        foreach ($expectedKeys as $key) {
            $this->assertArrayHasKey($key, $resource, "Missing key: {$key}");
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // status y status_label
    // ─────────────────────────────────────────────────────────────────────────

    public function test_status_is_the_enum_string_value(): void
    {
        $student  = Student::factory()->withRole()->create(['status' => StudentStatus::CURRENT->value]);
        $resource = $this->serialize($student);

        $this->assertSame('current', $resource['status']);
        $this->assertSame('Vigente', $resource['status_label']);
    }

    #[DataProvider('studentStatusProvider')]
    public function test_status_label_matches_enum_label_for_every_case(StudentStatus $case): void
    {
        $student  = Student::factory()->withRole()->create(['status' => $case->value]);
        $resource = $this->serialize($student);

        $this->assertSame($case->value, $resource['status']);
        $this->assertSame($case->label(), $resource['status_label']);
    }

    public static function studentStatusProvider(): array
    {
        return array_map(
            fn(StudentStatus $case) => [$case],
            StudentStatus::cases()
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Campos de nivel
    // ─────────────────────────────────────────────────────────────────────────

    public function test_exposes_level_tecnm_and_level_mcer_and_level_id(): void
    {
        $level = Level::create([
            'level_tecnm'  => 'Básico I',
            'level_mcer'   => 'A1',
            'hours'        => 80,
            'program_type' => 'regular',
        ]);
        $student  = Student::factory()->withRole()->create(['level_id' => $level->id]);
        $resource = $this->serialize($student);

        $this->assertSame('Básico I', $resource['level_tecnm']);
        $this->assertSame('A1',       $resource['level']);
        $this->assertSame($level->id, $resource['level_id']);
    }

    public function test_level_fields_match_related_level_when_present(): void
    {
        $level = Level::create([
            'level_tecnm'  => 'Intermedio I',
            'level_mcer'   => 'B1',
            'hours'        => 80,
            'program_type' => 'regular',
        ]);
        $student  = Student::factory()->withRole()->create(['level_id' => $level->id]);
        $resource = $this->serialize($student);

        $this->assertSame('B1', $resource['level']);
        $this->assertSame('Intermedio I', $resource['level_tecnm']);
        $this->assertSame($level->id, $resource['level_id']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // IDs de relaciones para formularios
    // ─────────────────────────────────────────────────────────────────────────

    public function test_exposes_relation_ids_for_form_preselection(): void
    {
        $student  = Student::factory()->withRole()->create();
        $resource = $this->serialize($student);

        $this->assertSame($student->degree_id,       $resource['degree_id']);
        $this->assertSame($student->level_id,        $resource['level_id']);
        $this->assertSame($student->type_student_id, $resource['type_student_id']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // full_name
    // ─────────────────────────────────────────────────────────────────────────

    public function test_full_name_concatenates_first_and_last_name(): void
    {
        $student  = Student::factory()->withRole()->create([
            'first_name' => 'Juan',
            'last_name'  => 'Pérez López',
        ]);
        $resource = $this->serialize($student);

        $this->assertSame('Juan Pérez López', $resource['full_name']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // type discriminator
    // ─────────────────────────────────────────────────────────────────────────

    public function test_type_is_always_student(): void
    {
        $resource = $this->serialize(Student::factory()->withRole()->create());

        $this->assertSame('student', $resource['type']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // degree null safety
    // ─────────────────────────────────────────────────────────────────────────

    public function test_degree_fields_match_related_degree_when_present(): void
    {
        $degree = Degree::firstOrCreate(
            ['name' => 'Ingeniería en Sistemas Computacionales'],
            ['curriculum' => '2020']
        );
        $student  = Student::factory()->withRole()->create(['degree_id' => $degree->id]);
        $resource = $this->serialize($student);

        $this->assertSame($degree->name, $resource['degree']);
        $this->assertSame($degree->id, $resource['degree_id']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // age accessor
    // ─────────────────────────────────────────────────────────────────────────

    public function test_age_is_calculated_from_birthdate(): void
    {
        $student  = Student::factory()->withRole()->create([
            'birthdate' => now()->subYears(20)->format('Y-m-d'),
        ]);
        $resource = $this->serialize($student);

        $this->assertGreaterThanOrEqual(19, $resource['age']);
        $this->assertLessThanOrEqual(20,   $resource['age']);
    }
}
