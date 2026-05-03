<?php

namespace Tests\Feature;

use App\Jobs\RunAcademicStatusAutoUpdater;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class SettingControllerTest extends TestCase
{
    use RefreshDatabase;

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private function adminUser(): User
    {
        $user = User::factory()->create();
        $user->assignRole('admin');
        return $user;
    }

    private function regularUser(): User
    {
        return User::factory()->create(); // sin roles privilegiados
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /settings — index()
    // ─────────────────────────────────────────────────────────────────────────

    public function test_index_renders_inertia_component_with_settings_as_key_value(): void
    {
        Setting::create(['key' => 'courses_enrollment_start', 'value' => '2026-08-01']);
        Setting::create(['key' => 'courses_enrollment_end',   'value' => '2026-08-31']);

        $this->actingAs($this->adminUser())
            ->get(route('settings.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Settings/Index')
                ->has('configuraciones')
                ->where('configuraciones.courses_enrollment_start', '2026-08-01')
                ->where('configuraciones.courses_enrollment_end',   '2026-08-31')
            );
    }

    public function test_index_returns_empty_array_when_settings_table_is_empty(): void
    {
        $this->actingAs($this->adminUser())
            ->get(route('settings.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Settings/Index')
                ->where('configuraciones', [])
            );
    }

    public function test_index_redirects_guests_to_login(): void
    {
        $this->get(route('settings.index'))
            ->assertRedirect(route('login'));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PUT /settings/bulk — updateBulk()
    // ─────────────────────────────────────────────────────────────────────────

    public function test_update_bulk_creates_settings_and_redirects_with_success(): void
    {
        Queue::fake();

        $this->actingAs($this->adminUser())
            ->put(route('settings.update-bulk'), [
                'courses_enrollment_start' => '2026-08-01',
                'courses_enrollment_end'   => '2026-08-31',
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseHas('settings', ['key' => 'courses_enrollment_start', 'value' => '2026-08-01']);
        $this->assertDatabaseHas('settings', ['key' => 'courses_enrollment_end',   'value' => '2026-08-31']);
    }

    public function test_update_bulk_updates_existing_setting_idempotently(): void
    {
        Queue::fake();
        Setting::create(['key' => 'courses_enrollment_start', 'value' => '2026-07-01']);

        $this->actingAs($this->adminUser())
            ->put(route('settings.update-bulk'), [
                'courses_enrollment_start' => '2026-08-01',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('settings', ['key' => 'courses_enrollment_start', 'value' => '2026-08-01']);
        $this->assertDatabaseCount('settings', 1);
    }

    public function test_update_bulk_dispatches_job_when_calendar_date_changes(): void
    {
        Queue::fake();

        $this->actingAs($this->adminUser())
            ->put(route('settings.update-bulk'), [
                'courses_enrollment_start' => '2026-08-01',
            ]);

        Queue::assertPushed(RunAcademicStatusAutoUpdater::class);
    }

    public function test_update_bulk_does_not_dispatch_job_for_teacher_reveal_date_only(): void
    {
        Queue::fake();

        $this->actingAs($this->adminUser())
            ->put(route('settings.update-bulk'), [
                'teacher_reveal_date' => '2026-09-15',
            ]);

        Queue::assertNotPushed(RunAcademicStatusAutoUpdater::class);
    }

    public function test_update_bulk_does_not_dispatch_job_when_value_does_not_change(): void
    {
        Queue::fake();
        Setting::create(['key' => 'courses_enrollment_start', 'value' => '2026-08-01']);

        $this->actingAs($this->adminUser())
            ->put(route('settings.update-bulk'), [
                'courses_enrollment_start' => '2026-08-01',
            ]);

        Queue::assertNotPushed(RunAcademicStatusAutoUpdater::class);
    }

    public function test_update_bulk_dispatches_job_when_setting_is_created_for_first_time(): void
    {
        Queue::fake();

        $this->actingAs($this->adminUser())
            ->put(route('settings.update-bulk'), [
                'exams_enrollment_start' => '2026-09-01',
            ]);

        Queue::assertPushed(RunAcademicStatusAutoUpdater::class);
    }

    public function test_update_bulk_rejects_invalid_date_with_422(): void
    {
        Queue::fake();

        $this->actingAs($this->adminUser())
            ->put(route('settings.update-bulk'), [
                'courses_enrollment_start' => 'no-es-una-fecha',
            ])
            ->assertSessionHasErrors(['courses_enrollment_start']);
    }

    public function test_update_bulk_accepts_null_to_clear_a_setting(): void
    {
        Queue::fake();
        Setting::create(['key' => 'courses_enrollment_start', 'value' => '2026-08-01']);

        $this->actingAs($this->adminUser())
            ->put(route('settings.update-bulk'), [
                'courses_enrollment_start' => null,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('settings', ['key' => 'courses_enrollment_start', 'value' => null]);
    }

    public function test_update_bulk_ignores_arbitrary_keys_not_in_allowlist(): void
    {
        Queue::fake();

        $this->actingAs($this->adminUser())
            ->put(route('settings.update-bulk'), [
                'courses_enrollment_start' => '2026-08-01',
                'clave_maliciosa'          => 'valor_no_permitido',
            ])
            ->assertRedirect();

        $this->assertDatabaseMissing('settings', ['key' => 'clave_maliciosa']);
    }

    public function test_update_bulk_redirects_guests_to_login(): void
    {
        Queue::fake();

        $this->put(route('settings.update-bulk'), [
            'courses_enrollment_start' => '2026-08-01',
        ])->assertRedirect(route('login'));
    }

    public function test_update_bulk_returns_403_for_non_admin_user(): void
    {
        Queue::fake();

        $this->actingAs($this->regularUser())
            ->put(route('settings.update-bulk'), [
                'courses_enrollment_start' => '2026-08-01',
            ])->assertForbidden();
    }
}
