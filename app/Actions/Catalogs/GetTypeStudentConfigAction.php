<?php

namespace App\Actions\Catalogs;

use App\Models\TypeStudent;
use App\Http\Resources\TypeStudentResource;

class GetTypeStudentConfigAction
{
    public function execute(): array
    {
        return [
            'id' => 'type_students',
            'title' => 'Tipos de Alumnos',
            'endpoint' => '/type-students',
            'columns' => [
                ['accessorKey' => 'name', 'header' => 'Tipo de Alumno'],
            ],
            'formFields' => [
                [
                    'name' => 'name',
                    'label' => 'Tipo de Alumno',
                    'type' => 'text',
                    'required' => true,
                ],
            ],
            'data' => TypeStudentResource::collection(TypeStudent::all())->resolve(),
        ];
    }
}
