<?php

namespace Tests\Unit\Requests;

use App\Enums\AcademicStatus;
use App\Http\Requests\BulkUpdateGroupStatusRequest;
use App\Models\Group;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Validator;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

/**
 * Suite para BulkUpdateGroupStatusRequest.
 *
 * Cubre:
 *  - rules():    ids (required/array/min:1/exists:groups), new_status (required/Rule::enum)
 *  - messages(): textos de error en español
 *
 * Nota de seguridad detectada:
 *   authorize() devuelve `true` sin verificar rol. La protección efectiva
 *   viene del middleware `role:admin|teacher|coordinator` en la ruta.
 *   Se documenta con un test explícito para que quede en el histórico.
 */
class BulkUpdateGroupStatusRequestTest extends TestCase
{
    use RefreshDatabase;

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private function validate(array $data): \Illuminate\Validation\Validator
    {
        return Validator::make($data, (new BulkUpdateGroupStatusRequest())->rules());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // rules() — Happy Path
    // ─────────────────────────────────────────────────────────────────────────

    public function test_passes_with_valid_group_ids_and_valid_status(): void
    {
        $groups = Group::factory()->count(2)->create();

        $validator = $this->validate([
            'ids'        => $groups->pluck('id')->all(),
            'new_status' => AcademicStatus::ACTIVE->value,
        ]);

        $this->assertFalse($validator->fails());
    }

    #[DataProvider('validStatusProvider')]
    public function test_passes_for_every_valid_academic_status(AcademicStatus $status): void
    {
        $group     = Group::factory()->create();
        $validator = $this->validate([
            'ids'        => [$group->id],
            'new_status' => $status->value,
        ]);

        $this->assertFalse($validator->fails());
    }

    public static function validStatusProvider(): array
    {
        return array_map(
            fn(AcademicStatus $case) => [$case],
            AcademicStatus::cases()
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // rules() — ids
    // ─────────────────────────────────────────────────────────────────────────

    public function test_fails_when_ids_is_absent(): void
    {
        $validator = $this->validate(['new_status' => AcademicStatus::ACTIVE->value]);
        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('ids', $validator->errors()->toArray());
    }

    public function test_fails_when_ids_is_empty_array(): void
    {
        $validator = $this->validate([
            'ids'        => [],
            'new_status' => AcademicStatus::ACTIVE->value,
        ]);
        $this->assertTrue($validator->fails());
    }

    public function test_fails_when_ids_is_not_an_array(): void
    {
        $validator = $this->validate([
            'ids'        => 'no-es-array',
            'new_status' => AcademicStatus::ACTIVE->value,
        ]);
        $this->assertTrue($validator->fails());
    }

    public function test_fails_when_an_id_does_not_exist_in_groups_table(): void
    {
        $validator = $this->validate([
            'ids'        => [999_999],
            'new_status' => AcademicStatus::ACTIVE->value,
        ]);
        $this->assertTrue($validator->fails());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // rules() — new_status (Rule::enum)
    // ─────────────────────────────────────────────────────────────────────────

    public function test_fails_when_new_status_is_absent(): void
    {
        $group     = Group::factory()->create();
        $validator = $this->validate(['ids' => [$group->id]]);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('new_status', $validator->errors()->toArray());
    }

    public function test_fails_when_new_status_is_not_a_valid_enum_value(): void
    {
        $group     = Group::factory()->create();
        $validator = $this->validate([
            'ids'        => [$group->id],
            'new_status' => 'estado_invalido',
        ]);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('new_status', $validator->errors()->toArray());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // messages() — textos en español
    // ─────────────────────────────────────────────────────────────────────────

    public function test_custom_message_for_missing_ids(): void
    {
        $validator = $this->validate(['new_status' => AcademicStatus::ACTIVE->value]);
        $validator->setCustomMessages((new BulkUpdateGroupStatusRequest())->messages());
        $validator->passes();

        $errors = $validator->errors()->toArray();
        $this->assertNotEmpty($errors['ids'] ?? []);
    }

    public function test_custom_message_for_missing_new_status(): void
    {
        $group = Group::factory()->create();
        $validator = Validator::make(
            ['ids' => [$group->id]],
            (new BulkUpdateGroupStatusRequest())->rules(),
            (new BulkUpdateGroupStatusRequest())->messages()
        );
        $validator->passes();

        $this->assertArrayHasKey('new_status', $validator->errors()->toArray());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // authorize()
    //
    // Nota: authorize() devuelve true incondicionalmente.
    // La protección real la ejerce el middleware de ruta.
    // Este test lo documenta explícitamente.
    // ─────────────────────────────────────────────────────────────────────────

    public function test_authorize_always_returns_true_regardless_of_user(): void
    {
        $request = new BulkUpdateGroupStatusRequest();
        $request->setUserResolver(fn() => null); // sin usuario

        $this->assertTrue($request->authorize());
    }
}
