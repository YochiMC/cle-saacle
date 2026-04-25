<?php

namespace Tests\Unit\Requests;

use App\Enums\AcademicStatus;
use App\Http\Requests\BulkUpdateExamStatusRequest;
use App\Models\Exam;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

/**
 * Suite para BulkUpdateExamStatusRequest.
 *
 * Cubre:
 *  - rules():                 ids (required/array/exists), new_status (required/string)
 *  - prepareForValidation():  normaliza `status` → `new_status` cuando new_status está ausente
 *  - authorize():             admin o coordinator solamente
 */
class BulkUpdateExamStatusRequestTest extends TestCase
{
    use RefreshDatabase;

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private function validate(array $data): \Illuminate\Validation\Validator
    {
        return Validator::make($data, (new BulkUpdateExamStatusRequest())->rules());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // rules() — Happy Path
    // ─────────────────────────────────────────────────────────────────────────

    public function test_passes_with_valid_ids_and_new_status(): void
    {
        $exams = Exam::factory()->count(2)->create();

        $validator = $this->validate([
            'ids'        => $exams->pluck('id')->all(),
            'new_status' => AcademicStatus::ACTIVE->value,
        ]);

        $this->assertFalse($validator->fails());
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

    public function test_fails_when_ids_is_not_an_array(): void
    {
        $validator = $this->validate([
            'ids'        => 'not-an-array',
            'new_status' => AcademicStatus::ACTIVE->value,
        ]);
        $this->assertTrue($validator->fails());
    }

    public function test_fails_when_an_id_does_not_exist_in_exams_table(): void
    {
        $validator = $this->validate([
            'ids'        => [999_999],
            'new_status' => AcademicStatus::ACTIVE->value,
        ]);
        $this->assertTrue($validator->fails());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // rules() — new_status
    // ─────────────────────────────────────────────────────────────────────────

    public function test_fails_when_new_status_is_absent(): void
    {
        $exam      = Exam::factory()->create();
        $validator = $this->validate(['ids' => [$exam->id]]);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('new_status', $validator->errors()->toArray());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // prepareForValidation() — normalización status → new_status
    //
    // Este comportamiento SOLO puede probarse via petición HTTP real porque
    // prepareForValidation() modifica el request antes de que lleguen las rules.
    // Las pruebas de Validator::make() no pasan por ese método.
    // Se valida aquí que el contrato de la ruta lo respeta.
    // ─────────────────────────────────────────────────────────────────────────

    public function test_normalize_status_to_new_status_via_http_request(): void
    {
        $user  = User::factory()->create();
        $user->assignRole('admin');
        $exams = Exam::factory()->count(2)->create();

        // El frontend puede enviar `status` en lugar de `new_status`.
        // prepareForValidation() debe copiarlo a `new_status`.
        $this->actingAs($user)
            ->post(route('exams.bulk-status'), [
                'ids'    => $exams->pluck('id')->all(),
                'status' => AcademicStatus::ACTIVE->value,  // campo legacy
            ])
            ->assertRedirect()
            ->assertSessionHas('success');
    }

    public function test_new_status_takes_precedence_over_status_when_both_present(): void
    {
        $user  = User::factory()->create();
        $user->assignRole('admin');
        $exam  = Exam::factory()->create(['status' => AcademicStatus::PENDING->value]);

        $this->actingAs($user)
            ->post(route('exams.bulk-status'), [
                'ids'        => [$exam->id],
                'new_status' => AcademicStatus::GRADING->value,
                'status'     => AcademicStatus::ACTIVE->value,  // debe ignorarse
            ])
            ->assertRedirect();

        // Verificamos que prevaleció new_status (GRADING)
        $this->assertDatabaseHas('exams', [
            'id'     => $exam->id,
            'status' => AcademicStatus::GRADING->value,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // authorize()
    // ─────────────────────────────────────────────────────────────────────────

    public function test_authorize_returns_true_for_admin(): void
    {
        $user = User::factory()->create();
        $user->assignRole('admin');

        $request = new BulkUpdateExamStatusRequest();
        $request->setUserResolver(fn () => $user);

        $this->assertTrue($request->authorize());
    }

    public function test_authorize_returns_true_for_coordinator(): void
    {
        $user = User::factory()->create();
        $user->assignRole('coordinator');

        $request = new BulkUpdateExamStatusRequest();
        $request->setUserResolver(fn () => $user);

        $this->assertTrue($request->authorize());
    }

    public function test_authorize_returns_false_for_unprivileged_user(): void
    {
        $user    = User::factory()->create();
        $request = new BulkUpdateExamStatusRequest();
        $request->setUserResolver(fn () => $user);

        $this->assertFalse($request->authorize());
    }

    public function test_authorize_returns_false_when_user_is_null(): void
    {
        $request = new BulkUpdateExamStatusRequest();
        $request->setUserResolver(fn () => null);

        $this->assertFalse($request->authorize());
    }
}
