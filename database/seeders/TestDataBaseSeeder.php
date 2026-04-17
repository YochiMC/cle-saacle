<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Teacher;

class TestDataBaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $yochi = User::create([
            'name' => 'Yochi',
            'email' => 'yochi@correo.com',
            'email_recovery' => 'yochi2@correo.com',
            'phone' => '1234567891',
            'password' => bcrypt('password'),
        ]);

        $yochi->assignRole('admin');

        $yskm = User::create([
            'name' => 'YSKM',
            'email' => 'yskm@correo.com',
            'email_recovery' => 'email@temp.com',
            'phone' => '1234567895',
            'password' => bcrypt('password'),
        ]);
        $yskm->assignRole('admin');

        $viux = User::create([
            'name' => 'viux',
            'email' => 'viux@correo.com',
            'email_recovery' => 'email@temp_t.com',
            'phone' => '1234567898',
            'password' => bcrypt('password'),
        ]);
        $viux->assignRole('teacher');
        Teacher::factory(10)->withRole()->create();

        // Crear exámenes de prueba
        \App\Models\Exam::factory(5)->withStudents()->create();
    }
}
