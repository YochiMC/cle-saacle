<?php

namespace Database\Seeders;

use App\Models\Group;
use App\Models\Period;
use App\Models\Qualification;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            DegreeSeeder::class,
            LevelSeeder::class,
            TypeStudentSeeder::class,
            RoleSeeder::class,
            TestDataBaseSeeder::class,
            SettingSeeder::class,
        ]);
        Student::factory(200)->withRole()->create();
        Period::factory(10)->create();
        // Creamos 5 grupos ficticios
        Group::factory(5)->create()->each(function ($group) {

            // Magia: Para cada grupo, creamos entre 15 y 25 alumnos
            $students = Student::factory(rand(15, 25))->create();

            // Inscribimos a cada alumno en el grupo creando su registro de calificaciones
            foreach ($students as $student) {
                Qualification::factory()->create([
                    'group_id'   => $group->id,
                    'student_id' => $student->id,
                ]);
            }
        });
    }
}
