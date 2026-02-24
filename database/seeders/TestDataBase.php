<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Teacher;

class TestDataBase extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'name' => 'Yochi',
            'email' => 'yochi@correo.com',
            'phone' => '1234567891',
            'password' => bcrypt('password'),
        ]);

        Teacher::create([
            'user_id' => 2,
            'firstName' => 'Joseph Alexander',
            'lastName' => 'Martinez Cortes',
            'rfc' => 'MACJ900101HDFRRT09',
            'curp' => 'MACJ900101HDFRRT09',
            'bankName' => 'Bancomer',
            'clabe' => '012345678901234567',
            'ttc_hours' => 20,
            'grade' => 'Licenciatura',
            'is_native' => false,
        ]);

        Teacher::factory(10)->create();
    }
}
