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
                'levelTecnm' => 'Básico 1',
                'levelMCER' => 'A1',
                'hours' => 45
            ],
            [
                'levelTecnm' => 'Básico 2',
                'levelMCER' => 'A1',
                'hours' => 45
            ],
            [
                'levelTecnm' => 'Básico 3',
                'levelMCER' => 'A1',
                'hours' => 45
            ],
            [
                'levelTecnm' => 'Básico 4',
                'levelMCER' => 'A2',
                'hours' => 45
            ],
            [
                'levelTecnm' => 'Básico 5',
                'levelMCER' => 'A2',
                'hours' => 45
            ],
            [
                'levelTecnm' => 'Intermedio 1',
                'levelMCER' => 'B1',
                'hours' => 45
            ],
            [
                'levelTecnm' => 'Intermedio 2',
                'levelMCER' => 'B1',
                'hours' => 45
            ],
            [
                'levelTecnm' => 'Intermedio 3',
                'levelMCER' => 'B1',
                'hours' => 45
            ],
            [
                'levelTecnm' => 'Intermedio 4',
                'levelMCER' => 'B1',
                'hours' => 45
            ],
            [
                'levelTecnm' => 'Intermedio 5',
                'levelMCER' => 'B1',
                'hours' => 45
            ]
        ];

        foreach ($levels as $level) {
            Level::create($level);
        }
    }
}    
