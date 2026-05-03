<?php

namespace App\Actions\Catalogs;

use App\Models\Degree;
use App\Http\Resources\DegreeResource;

class GetDegreeConfigAction
{
    public function execute(): array
    {
        return [
            'id' => 'degrees',
            'title' => 'Carreras y Programas',
            'endpoint' => '/degrees',
            'columns' => [
                ['accessorKey' => 'name', 'header' => 'Nombre del Programa'],
                ['accessorKey' => 'curriculum', 'header' => 'Plan de Estudios (Clave)'],
            ],
            'formFields' => [
                [
                    'name' => 'name',
                    'label' => 'Nombre del Programa',
                    'type' => 'text',
                    'required' => true,
                ],
                [
                    'name' => 'curriculum',
                    'label' => 'Plan de Estudios (Curriculum)',
                    'type' => 'text',
                    'required' => true,
                ],
            ],
            'data' => DegreeResource::collection(Degree::all())->resolve(),
        ];
    }
}
