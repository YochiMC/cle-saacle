<?php

namespace Database\Seeders;

use App\Models\Group;
use App\Models\Period;
use App\Models\Qualification;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Limpiar tablas relevantes para dejar la base de datos desde cero.
        Schema::disableForeignKeyConstraints();

        $tables = [
            'exam_student',
            'qualifications',
            'legacy_qualifications',
            'exams',
            'students',
            'teachers',
            'groups',
            'periods',
            'degrees',
            'levels',
            'type_students',
            'settings',
            'users',
        ];

        foreach ($tables as $table) {
            DB::table($table)->truncate();
        }

        Schema::enableForeignKeyConstraints();

        // Ejecutar seeders en orden
        $this->call([
            DegreeSeeder::class,
            LevelSeeder::class,
            TypeStudentSeeder::class,
            RoleSeeder::class,
            TestDataBaseSeeder::class,
            SettingSeeder::class,
        ]);
    }
}
