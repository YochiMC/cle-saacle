<?php

namespace Database\Seeders;

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
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'phone' => '1234567890',
        ]);

        $this->call([
            TestDataBase::class,
            DegreeSeeder::class,
            LevelSeeder::class,
            TypeStudentSeeder::class,
        ]);
        Student::factory(200)->create();
    }
}
