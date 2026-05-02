<?php

namespace Tests\Feature;

use App\Enums\AcademicStatus;
use App\Enums\GroupMode;
use App\Enums\GroupType;
use App\Models\Group;
use App\Models\Level;
use App\Models\Period;
use App\Models\Qualification;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Suite Feature para GroupController.
 *
 * Estrategia: pruebas HTTP de contrato (status, redirect, flash, payload Inertia,
 * efectos en DB y autorizaciÃ³n). La lÃ³gica interna de Actions se prueba de forma
 * aislada en sus propias suites Unit.
 *
 * Nota: `StoreGroupRequest` y `UpdateGroupRequest` tienen `authorize() = true`.
 * La protecciÃ³n real viene del middleware de ruta. Los tests de 403 se apoyan
 * en ese middleware, no en el FormRequest.
 *
 * Nota: LevelFactory estÃ¡ disponible desde database/factories/LevelFactory.php.
 * Los catÃ¡logos (Level, Degree, TypeStudent) se siembran automÃ¡ticamente
 * desde Tests\TestCase::setUp() vÃ­a sus respectivos Seeders.
 */
class GroupControllerTest extends TestCase
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

    private function admin(): User       { return $this->userWithRole('admin'); }
    private function teacher(): User     { return $this->userWithRole('teacher'); }
    private function coordinator(): User { return $this->userWithRole('coordinator'); }
    private function student(): User     { return $this->userWithRole('student'); }

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Helpers de datos
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    private function validGroupPayload(?Period $period = null, ?Teacher $teacher = null, ?Level $level = null): array
    {
        return [
            'mode'            => GroupMode::PRESENCIAL->value,
            'type'            => GroupType::REGULAR->value,
            'capacity'        => 20,
            'schedule'        => 'Lunes y MiÃ©rcoles 16:00 - 18:00',
            'classroom'       => 'Aula A-1',
            'meeting_link'    => null,
            'status'          => AcademicStatus::PENDING->value,
            'period_id'       => ($period  ?? Period::factory()->create())->id,
            'teacher_id'      => ($teacher ?? Teacher::factory()->create())->id,
            'level_id'        => ($level   ?? Level::factory()->create())->id,
            'evaluable_units' => 3,
        ];
    }

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // index() â€” GroupController::index() NO tiene ruta HTTP dedicada.
    // GET /groups estÃ¡ mapeado a AdminViewsController::groupsView() (Inertia).
    // Si se registra una ruta para GroupController::index() en el futuro,
    // agregar los tests JSON aquÃ­.
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // store() â€” POST /groups
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    public function test_store_creates_group_and_redirects_with_success(): void
    {
        $this->actingAs($this->admin())
            ->post(route('groups.store'), $this->validGroupPayload())
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseHas('groups', ['status' => AcademicStatus::PENDING->value]);
    }

    public function test_store_persists_name_generated_by_naming_service(): void
    {
        $this->actingAs($this->admin())
            ->post(route('groups.store'), $this->validGroupPayload());

        $group = Group::first();
        $this->assertNotEmpty($group->name);
    }

    public function test_store_accepts_null_for_optional_fields(): void
    {
        $payload = array_merge($this->validGroupPayload(), [
            'classroom'       => null,
            'meeting_link'    => null,
            'teacher_id'      => null,
            'evaluable_units' => null,
        ]);

        $this->actingAs($this->admin())
            ->post(route('groups.store'), $payload)
            ->assertRedirect()
            ->assertSessionHas('success');
    }

    public function test_store_rejects_invalid_url_for_meeting_link(): void
    {
        $payload = array_merge($this->validGroupPayload(), ['meeting_link' => 'no-es-url']);

        $this->actingAs($this->admin())
            ->post(route('groups.store'), $payload)
            ->assertSessionHasErrors(['meeting_link']);
    }

    public function test_store_rejects_nonexistent_period_id(): void
    {
        $payload = array_merge($this->validGroupPayload(), ['period_id' => 999_999]);

        $this->actingAs($this->admin())
            ->post(route('groups.store'), $payload)
            ->assertSessionHasErrors(['period_id']);
    }

    public function test_store_rejects_nonexistent_level_id(): void
    {
        $payload = array_merge($this->validGroupPayload(), ['level_id' => 999_999]);

        $this->actingAs($this->admin())
            ->post(route('groups.store'), $payload)
            ->assertSessionHasErrors(['level_id']);
    }

    public function test_store_rejects_capacity_below_one(): void
    {
        $payload = array_merge($this->validGroupPayload(), ['capacity' => 0]);

        $this->actingAs($this->admin())
            ->post(route('groups.store'), $payload)
            ->assertSessionHasErrors(['capacity']);
    }

    public function test_store_returns_403_for_student_role(): void
    {
        $this->actingAs($this->student())
            ->post(route('groups.store'), $this->validGroupPayload())
            ->assertForbidden();
    }

    public function test_store_redirects_guest_to_login(): void
    {
        $this->post(route('groups.store'), $this->validGroupPayload())
            ->assertRedirect(route('login'));
    }

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // update() â€” PUT /groups/{group}
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    public function test_update_modifies_group_and_redirects_with_success(): void
    {
        $group = Group::factory()->create(['capacity' => 20]);

        $this->actingAs($this->admin())
            ->put(route('groups.update', $group), ['capacity' => 35])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseHas('groups', ['id' => $group->id, 'capacity' => 35]);
    }

    public function test_update_rejects_invalid_url_for_meeting_link(): void
    {
        // UpdateGroupRequest: meeting_link debe ser url vÃ¡lida si se envÃ­a
        $group = Group::factory()->create();

        $this->actingAs($this->admin())
            ->put(route('groups.update', $group), ['meeting_link' => 'no-es-url'])
            ->assertSessionHasErrors(['meeting_link']);
    }

    public function test_update_resets_qualifications_when_type_changes(): void
    {
        // Cuando el tipo de grupo cambia, ResetModelQualifications::execute() se invoca.
        // El controller lo llama antes del save(). Validamos el efecto en DB.
        $level = Level::factory()->create();
        $group = Group::factory()->create([
            'type'     => GroupType::REGULAR->value,
            'level_id' => $level->id,
        ]);
        $student = Student::factory()->withRole()->create();
        Qualification::create([
            'group_id'        => $group->id,
            'student_id'      => $student->id,
            'units_breakdown' => json_encode(['unit_1' => 80]),
            'final_average'   => '80',
            'is_left'         => false,
        ]);

        $this->actingAs($this->admin())
            ->put(route('groups.update', $group), ['type' => GroupType::PROGRAMA_EGRESADOS->value])
            ->assertRedirect();

        // Tras el reset, las calificaciones del pivot son reiniciadas
        $this->assertDatabaseHas('qualifications', [
            'group_id'   => $group->id,
            'student_id' => $student->id,
        ]);
        // El grupo ahora tiene el nuevo tipo
        $this->assertDatabaseHas('groups', [
            'id'   => $group->id,
            'type' => GroupType::PROGRAMA_EGRESADOS->value,
        ]);
    }

    public function test_update_returns_403_for_student_role(): void
    {
        $group = Group::factory()->create();

        $this->actingAs($this->student())
            ->put(route('groups.update', $group), ['capacity' => 5])
            ->assertForbidden();
    }

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // destroy() â€” DELETE /groups/{group}
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    public function test_destroy_soft_deletes_group_and_redirects_with_success(): void
    {
        $group = Group::factory()->create();

        $this->actingAs($this->admin())
            ->delete(route('groups.destroy', $group))
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertSoftDeleted('groups', ['id' => $group->id]);
    }

    public function test_destroy_returns_403_for_student_role(): void
    {
        $group = Group::factory()->create();

        $this->actingAs($this->student())
            ->delete(route('groups.destroy', $group))
            ->assertForbidden();
    }

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // bulkDestroy() â€” DELETE /groups/bulk-delete
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    public function test_bulk_destroy_soft_deletes_groups_and_redirects_with_success(): void
    {
        $groups = Group::factory()->count(3)->create();
        $ids    = $groups->pluck('id')->all();

        $this->actingAs($this->admin())
            ->delete(route('groups.bulk-delete'), ['ids' => $ids])
            ->assertRedirect()
            ->assertSessionHas('success');

        foreach ($ids as $id) {
            $this->assertSoftDeleted('groups', ['id' => $id]);
        }
    }

    public function test_bulk_destroy_rejects_empty_ids_array(): void
    {
        $this->actingAs($this->admin())
            ->delete(route('groups.bulk-delete'), ['ids' => []])
            ->assertSessionHasErrors(['ids']);
    }

    public function test_bulk_destroy_rejects_nonexistent_group_id(): void
    {
        $this->actingAs($this->admin())
            ->delete(route('groups.bulk-delete'), ['ids' => [999_999]])
            ->assertSessionHasErrors(['ids.0']);
    }

    public function test_bulk_destroy_returns_403_for_student_role(): void
    {
        $group = Group::factory()->create();

        $this->actingAs($this->student())
            ->delete(route('groups.bulk-delete'), ['ids' => [$group->id]])
            ->assertForbidden();
    }

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // bulkUpdateStatus() â€” POST /groups/bulk-status
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    public function test_bulk_update_status_changes_statuses_and_redirects_with_success(): void
    {
        $groups = Group::factory()->count(3)->create(['status' => AcademicStatus::PENDING->value]);

        $this->actingAs($this->admin())
            ->put(route('groups.bulk-status'), [
                'ids'        => $groups->pluck('id')->all(),
                'new_status' => AcademicStatus::ACTIVE->value,
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        foreach ($groups as $g) {
            $this->assertDatabaseHas('groups', ['id' => $g->id, 'status' => AcademicStatus::ACTIVE->value]);
        }
    }

    public function test_bulk_update_status_rejects_invalid_status(): void
    {
        $group = Group::factory()->create();

        $this->actingAs($this->admin())
            ->put(route('groups.bulk-status'), [
                'ids'        => [$group->id],
                'new_status' => 'estado_inexistente',
            ])
            ->assertSessionHasErrors(['new_status']);
    }

    public function test_bulk_update_status_returns_403_for_student_role(): void
    {
        $group = Group::factory()->create();

        $this->actingAs($this->student())
            ->put(route('groups.bulk-status'), [
                'ids'        => [$group->id],
                'new_status' => AcademicStatus::ACTIVE->value,
            ])
            ->assertForbidden();
    }

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // show() â€” GET /groups/{group}/detalles
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    public function test_show_renders_inertia_view_with_expected_props(): void
    {
        $group = Group::factory()->create();

        $this->actingAs($this->admin())
            ->get(route('groups.show', $group))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Groups/View')
                ->has('grupo')
                ->has('enrolledStudents')
                ->has('availableStudents')
            );
    }

    public function test_show_excludes_enrolled_students_from_available_list(): void
    {
        $group   = Group::factory()->create();
        $student = Student::factory()->withRole()->create();
        Qualification::create([
            'group_id'        => $group->id,
            'student_id'      => $student->id,
            'units_breakdown' => json_encode([]),
            'final_average'   => null,
            'is_left'         => false,
        ]);

        $this->actingAs($this->admin())
            ->get(route('groups.show', $group))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('availableStudents', fn ($available) =>
                    ! collect($available)->pluck('id')->contains($student->id)
                )
            );
    }

    public function test_show_is_accessible_for_student_role(): void
    {
        // groups.show estÃ¡ bajo role:admin|teacher|student â€” el student SÃ tiene acceso
        $group = Group::factory()->create();

        $this->actingAs($this->student())
            ->get(route('groups.show', $group))
            ->assertOk();
    }

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // enroll() â€” POST /groups/{group}/enroll
    // AutorizaciÃ³n: admin  (EnrollStudentsRequest)
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    public function test_enroll_creates_qualification_records_for_each_student(): void
    {
        $group    = Group::factory()->create();
        $students = Student::factory()->withRole()->count(2)->create();

        $this->actingAs($this->admin())
            ->post(route('groups.enroll', $group), [
                'student_ids' => $students->pluck('id')->all(),
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        foreach ($students as $s) {
            $this->assertDatabaseHas('qualifications', [
                'group_id'   => $group->id,
                'student_id' => $s->id,
            ]);
        }
    }

    public function test_enroll_returns_403_for_coordinator_role(): void
    {
        // EnrollStudentsRequest solo autoriza 'admin'
        $group = Group::factory()->create();

        $this->actingAs($this->coordinator())
            ->post(route('groups.enroll', $group), ['student_ids' => []])
            ->assertForbidden();
    }

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // unenroll() â€” DELETE /groups/{group}/unenroll/{student}
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    public function test_unenroll_removes_qualification_and_redirects_with_success(): void
    {
        $group   = Group::factory()->create();
        $student = Student::factory()->withRole()->create();
        Qualification::create([
            'group_id'        => $group->id,
            'student_id'      => $student->id,
            'units_breakdown' => json_encode([]),
            'final_average'   => null,
            'is_left'         => false,
        ]);

        $this->actingAs($this->admin())
            ->delete(route('groups.unenroll', [$group, $student]))
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertSoftDeleted('qualifications', [
            'group_id'   => $group->id,
            'student_id' => $student->id,
        ]);
    }

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // bulkUnenroll() â€” POST /groups/{group}/unenroll-bulk
    // AutorizaciÃ³n: admin | coordinator  (BulkUnenrollRequest)
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    public function test_bulk_unenroll_removes_multiple_qualifications_and_redirects(): void
    {
        $group    = Group::factory()->create();
        $students = Student::factory()->withRole()->count(3)->create();

        foreach ($students as $s) {
            Qualification::create([
                'group_id'        => $group->id,
                'student_id'      => $s->id,
                'units_breakdown' => json_encode([]),
                'final_average'   => null,
                'is_left'         => false,
            ]);
        }

        $this->actingAs($this->admin())
            ->post(route('groups.unenroll-bulk', $group), [
                'ids' => $students->pluck('id')->all(),
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        foreach ($students as $s) {
            $this->assertSoftDeleted('qualifications', [
                'group_id'   => $group->id,
                'student_id' => $s->id,
            ]);
        }
    }

    public function test_bulk_unenroll_returns_403_for_student_role(): void
    {
        $group   = Group::factory()->create();
        $student = Student::factory()->withRole()->create();

        $this->actingAs($this->student())
            ->post(route('groups.unenroll-bulk', $group), [
                'ids' => [$student->id],
            ])
            ->assertForbidden();
    }

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // updateUnits() â€” PATCH /groups/{group}/units
    // AutorizaciÃ³n: admin | teacher  (UpdateUnitsGroupRequest)
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    public function test_update_units_changes_evaluable_units_and_redirects(): void
    {
        $group = Group::factory()->create(['evaluable_units' => 3]);

        $this->actingAs($this->teacher())
            ->patch(route('groups.update-units', $group), ['evaluable_units' => 5])
            ->assertRedirect()
            ->assertSessionHas('success');
    }

    public function test_update_units_rejects_value_above_eight(): void
    {
        $group = Group::factory()->create();

        $this->actingAs($this->admin())
            ->patch(route('groups.update-units', $group), ['evaluable_units' => 9])
            ->assertSessionHasErrors(['evaluable_units']);
    }

    public function test_update_units_rejects_value_below_one(): void
    {
        $group = Group::factory()->create();

        $this->actingAs($this->admin())
            ->patch(route('groups.update-units', $group), ['evaluable_units' => 0])
            ->assertSessionHasErrors(['evaluable_units']);
    }

    public function test_update_units_returns_403_for_coordinator_role(): void
    {
        // UpdateUnitsGroupRequest solo autoriza admin|teacher
        $group = Group::factory()->create();

        $this->actingAs($this->coordinator())
            ->patch(route('groups.update-units', $group), ['evaluable_units' => 4])
            ->assertForbidden();
    }

    public function test_update_units_returns_403_for_student_role(): void
    {
        $group = Group::factory()->create();

        $this->actingAs($this->student())
            ->patch(route('groups.update-units', $group), ['evaluable_units' => 4])
            ->assertForbidden();
    }

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // complete() â€” PATCH /groups/{group}/complete
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    public function test_complete_sets_status_to_completed_and_redirects(): void
    {
        $group = Group::factory()->create(['status' => AcademicStatus::GRADING->value]);

        $this->actingAs($this->admin())
            ->patch(route('groups.complete', $group))
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseHas('groups', [
            'id'     => $group->id,
            'status' => AcademicStatus::COMPLETED->value,
        ]);
    }

    public function test_complete_returns_403_for_student_role(): void
    {
        $group = Group::factory()->create();

        $this->actingAs($this->student())
            ->patch(route('groups.complete', $group))
            ->assertForbidden();
    }
}

