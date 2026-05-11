<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

/**
 * TypeStudentSeeder
 *
 * Este seeder ha sido desactivado porque los tipos de estudiante ahora se gestionan
 * como un enum en lugar de una tabla de base de datos.
 *
 * Los valores disponibles están definidos en App\Enums\TypeStudent:
 * - VIGENTE: Estudiante activo/vigente en el programa
 * - EGRESADO: Estudiante que ya completó el programa
 *
 * Para obtener las opciones de selección en el frontend, usa:
 * TypeStudent::getOptions()
 *
 * Para acceder a los valores del enum en el código:
 * TypeStudent::VIGENTE->value  // 'vigente'
 * TypeStudent::EGRESADO->value // 'egresado'
 */
class TypeStudentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Seeder desactivado: la tabla type_students ha sido eliminada
        // y los datos ahora se gestionan como enum
    }
}
