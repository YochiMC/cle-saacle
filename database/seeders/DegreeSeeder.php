<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Degree;

class DegreeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
         $degrees = [
            ['name' => 'Ingeniería Electrónica', 'curriculum' => 'IELC-2010-211'],
            ['name' => 'Ingeniería Mecatrónica', 'curriculum' => 'IMCT-2010-229'],
            ['name' => 'Ingeniería en Logística', 'curriculum' => 'ILOG-2009-202'],
            ['name' => 'Ingeniería en Gestión Empresarial', 'curriculum' => 'IGEM-2009-201'],
            ['name' => 'Ingeniería Electromecánica', 'curriculum' => 'IEME-2010-210'],
            ['name' => 'Ingeniería en Sistemas Computacionales', 'curriculum' => 'ISIC-2010-224'],
            ['name' => 'Ingeniería Industrial', 'curriculum' => 'IIND-2010-227'],
            ['name' => 'Ingeniería en Tecnologías de la Información y Comunicaciones', 'curriculum' => 'ITIC-2010-225']
        ];
        foreach ($degrees as $degree) {
            Degree::create($degree);
        }
    }
}
