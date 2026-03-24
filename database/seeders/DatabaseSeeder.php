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
    }
}
