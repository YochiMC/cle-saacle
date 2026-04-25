<?php

namespace Tests\Unit\Requests;

use App\Enums\AcademicStatus;
use App\Enums\ExamType;
use App\Http\Requests\StoreExamRequest;
use App\Models\Period;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Validator;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class StoreExamRequestTest extends TestCase
{
    use RefreshDatabase;

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private function validPayload(): array
    {
        $period  = Period::factory()->create();
        $teacher = Teacher::factory()->create();

        return [
            'exam_type'        => ExamType::UBICACION->value,
            'status'           => AcademicStatus::PENDING->value,
            'capacity'         => 25,
            'start_date'       => '2026-08-01',
            'end_date'         => '2026-08-15',
            'mode'             => 'Presencial',
            'application_time' => '09:00',
            'classroom'        => 'Aula A-101',
            'period_id'        => $period->id,
            'teacher_id'       => $teacher->id,
        ];
    }

    private function validate(array $payload): \Illuminate\Validation\Validator
    {
        return Validator::make($payload, (new StoreExamRequest())->rules());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Rules — Happy Path
    // ─────────────────────────────────────────────────────────────────────────

    public function test_passes_with_a_complete_valid_payload(): void
    {
        $this->assertFalse($this->validate($this->validPayload())->fails());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Rules — Required fields
    // ─────────────────────────────────────────────────────────────────────────

    #[DataProvider('requiredFieldsProvider')]
    public function test_fails_when_required_field_is_absent(string $field): void
    {
        $payload = $this->validPayload();
        unset($payload[$field]);

        $this->assertTrue($this->validate($payload)->fails());
    }

    public static function requiredFieldsProvider(): array
    {
        return [
            'exam_type is required'  => ['exam_type'],
            'status is required'     => ['status'],
            'capacity is required'   => ['capacity'],
            'start_date is required' => ['start_date'],
            'end_date is required'   => ['end_date'],
            'mode is required'       => ['mode'],
            'period_id is required'  => ['period_id'],
        ];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Rules — capacity
    // ─────────────────────────────────────────────────────────────────────────

    public function test_fails_when_capacity_is_zero(): void
    {
        $payload = array_merge($this->validPayload(), ['capacity' => 0]);
        $this->assertTrue($this->validate($payload)->fails());
    }

    public function test_fails_when_capacity_is_not_an_integer(): void
    {
        $payload = array_merge($this->validPayload(), ['capacity' => 'mucho']);
        $this->assertTrue($this->validate($payload)->fails());
    }

    public function test_passes_when_capacity_is_one(): void
    {
        $payload = array_merge($this->validPayload(), ['capacity' => 1]);
        $this->assertFalse($this->validate($payload)->fails());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Rules — dates
    // ─────────────────────────────────────────────────────────────────────────

    public function test_fails_when_start_date_is_not_a_valid_date(): void
    {
        $payload = array_merge($this->validPayload(), ['start_date' => 'no-es-fecha']);
        $this->assertTrue($this->validate($payload)->fails());
    }

    public function test_fails_when_end_date_is_before_start_date(): void
    {
        $payload = array_merge($this->validPayload(), [
            'start_date' => '2026-08-15',
            'end_date'   => '2026-08-01',
        ]);
        $this->assertTrue($this->validate($payload)->fails());
    }

    public function test_passes_when_end_date_equals_start_date(): void
    {
        $payload = array_merge($this->validPayload(), [
            'start_date' => '2026-08-01',
            'end_date'   => '2026-08-01',
        ]);
        $this->assertFalse($this->validate($payload)->fails());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Rules — period_id
    // ─────────────────────────────────────────────────────────────────────────

    public function test_fails_when_period_id_does_not_exist_in_database(): void
    {
        $payload = array_merge($this->validPayload(), ['period_id' => 999_999]);
        $this->assertTrue($this->validate($payload)->fails());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Rules — teacher_id (nullable)
    // ─────────────────────────────────────────────────────────────────────────

    public function test_passes_when_teacher_id_is_null(): void
    {
        $payload = array_merge($this->validPayload(), ['teacher_id' => null]);
        $this->assertFalse($this->validate($payload)->fails());
    }

    public function test_fails_when_teacher_id_points_to_nonexistent_teacher(): void
    {
        $payload = array_merge($this->validPayload(), ['teacher_id' => 999_999]);
        $this->assertTrue($this->validate($payload)->fails());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Rules — optional fields
    // ─────────────────────────────────────────────────────────────────────────

    public function test_passes_when_optional_fields_are_null(): void
    {
        $payload = array_merge($this->validPayload(), [
            'application_time' => null,
            'classroom'        => null,
        ]);
        $this->assertFalse($this->validate($payload)->fails());
    }

    public function test_fails_when_classroom_exceeds_255_characters(): void
    {
        $payload = array_merge($this->validPayload(), ['classroom' => str_repeat('A', 256)]);
        $this->assertTrue($this->validate($payload)->fails());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // authorize()
    // ─────────────────────────────────────────────────────────────────────────

    public function test_authorize_returns_true_for_admin_role(): void
    {
        $user = User::factory()->create();
        $user->assignRole('admin');

        $request = new StoreExamRequest();
        $request->setUserResolver(fn() => $user);

        $this->assertTrue($request->authorize());
    }

    public function test_authorize_returns_true_for_coordinator_role(): void
    {
        $user = User::factory()->create();
        $user->assignRole('coordinator');

        $request = new StoreExamRequest();
        $request->setUserResolver(fn() => $user);

        $this->assertTrue($request->authorize());
    }

    public function test_authorize_returns_false_for_user_without_privileged_role(): void
    {
        $user = User::factory()->create();

        $request = new StoreExamRequest();
        $request->setUserResolver(fn() => $user);

        $this->assertFalse($request->authorize());
    }

    public function test_authorize_returns_false_when_user_is_null(): void
    {
        $request = new StoreExamRequest();
        $request->setUserResolver(fn() => null);

        $this->assertFalse($request->authorize());
    }
}
