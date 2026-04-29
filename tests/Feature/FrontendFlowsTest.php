<?php

namespace Tests\Feature;

use App\Models\Exam;
use App\Models\Group;
use App\Models\Setting;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FrontendFlowsTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        $user = User::factory()->create();
        $user->assignRole('admin');

        return $user;
    }

    public function test_dashboard_renders_inertia_view_with_shared_catalogs(): void
    {
        Student::factory()->withRole()->create();
        Teacher::factory()->create();
        Group::factory()->create();
        Exam::factory()->create();

        $this->actingAs($this->admin())
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(
                fn($page) => $page
                    ->component('Dashboard')
                    ->has('students')
                    ->has('teachers')
                    ->has('degrees')
                    ->has('levels')
                    ->has('groups')
                    ->has('typeStudents')
            );
    }

    public function test_groups_index_renders_inertia_view_with_catalogs(): void
    {
        Group::factory()->create();

        $this->actingAs($this->admin())
            ->get(route('groups'))
            ->assertOk()
            ->assertInertia(
                fn($page) => $page
                    ->component('Groups/Index')
                    ->has('grupos')
                    ->has('levels')
                    ->has('teachers')
                    ->has('periods')
                    ->has('statuses')
                    ->has('modes')
                    ->has('types')
            );
    }

    public function test_exams_index_renders_inertia_view_with_catalogs(): void
    {
        Exam::factory()->create();

        $this->actingAs($this->admin())
            ->get(route('exams.index'))
            ->assertOk()
            ->assertInertia(
                fn($page) => $page
                    ->component('Exams/Index')
                    ->has('examenes')
                    ->has('teachers')
                    ->has('periods')
                    ->has('statuses')
                    ->has('typeOptions')
                    ->has('modeOptions')
            );
    }

    public function test_settings_index_renders_inertia_view_with_config_map(): void
    {
        Setting::query()->updateOrCreate(
            ['key' => 'teacher_reveal_date'],
            ['value' => '2026-12-31']
        );

        $this->actingAs($this->admin())
            ->get(route('settings.index'))
            ->assertOk()
            ->assertInertia(
                fn($page) => $page
                    ->component('Settings/Index')
                    ->has('configuraciones')
                    ->where('configuraciones.teacher_reveal_date', '2026-12-31')
            );
    }
}
