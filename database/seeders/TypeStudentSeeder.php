<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\TypeStudent;

class TypeStudentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        $typeStudents = [
            ['name' => 'Vigente'],
            ['name' => 'Egresado'],
        ];

        foreach ($typeStudents as $typeStudent) {
            TypeStudent::create($typeStudent);
        }
    }
}
