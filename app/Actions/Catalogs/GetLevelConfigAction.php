<?php

namespace App\Actions\Catalogs;

use App\Models\Level;
use App\Http\Resources\LevelResource;

/**
 * Action: GetLevelConfigAction
 * 
 * Implementa el Patrón Estrategia para inyectar en el Frontend la estructura
 * y los datos necesarios para renderizar el catálogo de "Niveles de Idioma".
 */
class GetLevelConfigAction
{
    /**
     * Ejecuta y retorna la configuración del catálogo.
     *
     * @return array
     */
    public function execute(): array
    {
        return [
            'id' => 'levels',
            'title' => 'Niveles de Idioma',
            'endpoint' => '/levels',
            // Definición de columnas para el DataTable genérico
            'columns' => [
                ['accessorKey' => 'level_tecnm', 'header' => 'Nivel TecNM'],
                ['accessorKey' => 'level_mcer', 'header' => 'Nivel MCER'],
                ['accessorKey' => 'hours', 'header' => 'Horas'],
                ['accessorKey' => 'program_type', 'header' => 'Tipo de Programa'],
            ],
            // Definición de campos para el DataFormModal dinámico
            'formFields' => [
                [
                    'name' => 'level_tecnm',
                    'label' => 'Nivel TecNM',
                    'type' => 'text',
                    'required' => true,
                ],
                [
                    'name' => 'level_mcer',
                    'label' => 'Nivel MCER (Ej. B1)',
                    'type' => 'text',
                    'required' => true,
                ],
                [
                    'name' => 'hours',
                    'label' => 'Horas Registradas',
                    'type' => 'number',
                    'required' => true,
                ],
                [
                    'name' => 'program_type',
                    'label' => 'Tipo de Programa',
                    'type' => 'text',
                    'required' => true,
                ],
            ],
            // Los datos se inyectan a través del Resource para respetar las convenciones de la API.
            'data' => LevelResource::collection(Level::all())->resolve(),
        ];
    }
}
