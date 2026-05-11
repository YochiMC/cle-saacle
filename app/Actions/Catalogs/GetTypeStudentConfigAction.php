<?php

namespace App\Actions\Catalogs;

use App\Enums\TypeStudent;

/**
 * GetTypeStudentConfigAction
 *
 * Genera la configuración del catálogo de tipos de estudiante.
 *
 * Nota: Los tipos de estudiante ahora se gestionan como un enum (App\Enums\TypeStudent)
 * en lugar de una tabla de base de datos. Esta acción proporciona los datos
 * formateados para la UI en el panel de catálogos.
 *
 * Los valores disponibles son:
 * - VIGENTE: Estudiante activo/vigente en el programa
 * - EGRESADO: Estudiante que ya completó el programa
 */
class GetTypeStudentConfigAction
{
    /**
     * Retorna la configuración del catálogo de tipos de estudiante.
     *
     * @return array<string, mixed>
     */
    public function execute(): array
    {
        return [
            'id' => 'type_students',
            'title' => 'Tipos de Alumnos',
            'endpoint' => null,  // No hay endpoint API, es un enum estático
            'columns' => [
                ['accessorKey' => 'label', 'header' => 'Tipo de Alumno'],
            ],
            'formFields' => [],  // No hay formulario de creación/edición
            'data' => array_map(
                fn ($case) => ['value' => $case->value, 'label' => $case->label()],
                TypeStudent::cases()
            ),
            'isEditable' => false,  // Los valores no pueden editarse (son un enum fijo)
        ];
    }
}

