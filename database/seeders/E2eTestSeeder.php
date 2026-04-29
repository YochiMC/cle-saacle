<?php

namespace Database\Seeders;

use App\Enums\AcademicStatus;
use App\Models\Exam;
use App\Models\Group;
use App\Models\Level;
use App\Models\Period;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Database\Seeder;

class E2eTestSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RoleSeeder::class);

        $admin = User::factory()->create([
            'name' => 'E2E Admin',
            'email' => 'e2e-admin@correo.com',
            'email_recovery' => 'e2e-admin-recovery@correo.com',
            'phone' => '5555555555',
        ]);
        $admin->assignRole('admin');

        $teacher = Teacher::factory()->withRole()->create();
        $period = Period::factory()->create();
        $level = Level::factory()->create();

        Group::factory()->create([
            'teacher_id' => $teacher->id,
            'period_id' => $period->id,
            'level_id' => $level->id,
            'status' => AcademicStatus::ACTIVE->value,
        ]);

        Exam::factory()->create([
            'teacher_id' => $teacher->id,
            'period_id' => $period->id,
            'status' => AcademicStatus::ACTIVE->value,
        ]);
    }
}
