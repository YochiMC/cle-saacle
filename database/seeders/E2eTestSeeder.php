<?php

namespace Database\Seeders;

use App\Enums\AcademicStatus;
use App\Models\Exam;
use App\Models\Group;
use App\Models\Level;
use App\Models\Period;
use App\Models\Student;
use Illuminate\Database\Seeder;
use App\Models\Teacher;
use App\Models\User;

class E2eTestSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RoleSeeder::class);

        $admin = User::updateOrCreate(
            ['email' => 'e2e-admin@correo.com'],
            [
                'name' => 'E2E Admin',
                'email_recovery' => 'e2e-admin-recovery@correo.com',
                'phone' => '5555555555',
                'password' => bcrypt('password'),
            ]
        );
        $admin->assignRole('admin');

        $teacher = Teacher::factory()->withRole()->create();
        $period = Period::factory()->create();
        $level = Level::factory()->create();

        // Deterministic student for enrollment simulations
        $studentUser = User::factory()->create([
            'name' => 'E2E Student',
            'email' => 'e2e-student@correo.com',
            'email_recovery' => 'e2e-student-recovery@correo.com',
            'phone' => '5555555556',
        ]);
        $studentUser->assignRole('student');

        $student = Student::factory()->create([
            'user_id' => $studentUser->id,
            'level_id' => $level->id,
        ]);

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

        // Deterministic Student for Lifecycle tests
        $studentUser = User::updateOrCreate(
            ['email' => 'e2e-student@correo.com'],
            [
                'name' => 'E2E Student',
                'password' => bcrypt('password'),
            ]
        );
        $studentUser->assignRole('student');
        
        \App\Models\Student::updateOrCreate(
            ['user_id' => $studentUser->id],
            [
                'first_name' => 'E2E',
                'last_name' => 'Student',
                'num_control' => 'E2E12345',
            ]
        );
    }
}
