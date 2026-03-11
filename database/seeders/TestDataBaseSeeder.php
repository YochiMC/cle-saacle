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
        User::create([
            'name' => 'Yochi',
            'email' => 'yochi@correo.com',
            'email_recovery' => 'yochi2@correo.com',
            'phone' => '1234567891',
            'password' => bcrypt('password'),
        ]);

        Teacher::factory(10)->withRole()->create();
    }
}
