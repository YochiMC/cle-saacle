<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Level;

class LevelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
         $levels = [
            [
                'level_tecnm' => 'Básico 1',
                'level_mcer' => 'A1',
                'hours' => 45,
                'program_type' => 'Regular'
            ],
            [
                'level_tecnm' => 'Básico 2',
                'level_mcer' => 'A1',
                'hours' => 45,
                'program_type' => 'Regular'
            ],
            [
                'level_tecnm' => 'Básico 3',
                'level_mcer' => 'A1',
                'hours' => 45,
                'program_type' => 'Regular'
            ],
            [
                'level_tecnm' => 'Básico 4',
                'level_mcer' => 'A2',
                'hours' => 45,
                'program_type' => 'Regular'
            ],
            [
                'level_tecnm' => 'Básico 5',
                'level_mcer' => 'A2',
                'hours' => 45,
                'program_type' => 'Regular'
            ],
            [
                'level_tecnm' => 'Intermedio 1',
                'level_mcer' => 'B1',
                'hours' => 45,
                'program_type' => 'Regular'
            ],
            [
                'level_tecnm' => 'Intermedio 2',
                'level_mcer' => 'B1',
                'hours' => 45,
                'program_type' => 'Regular'
            ],
            [
                'level_tecnm' => 'Intermedio 3',
                'level_mcer' => 'B1',
                'hours' => 45,
                'program_type' => 'Regular'
            ],
            [
                'level_tecnm' => 'Intermedio 4',
                'level_mcer' => 'B1',
                'hours' => 45,
                'program_type' => 'Regular'
            ],
            [
                'level_tecnm' => 'Intermedio 5',
                'level_mcer' => 'B1',
                'hours' => 45,
                'program_type' => 'Regular'
            ],
            [
                'level_tecnm' => 'Programa Egresados',
                'level_mcer' => 'A1-B1',
                'hours' => 450,
                'program_type' => 'Egresados'
            ]
        ];

        foreach ($levels as $level) {
            Level::create($level);
        }
    }
}    
