<?php

namespace App\Actions\Catalogs;

use App\Models\Period;
use App\Http\Resources\PeriodResource;
use App\Services\PeriodActivationService;

/**
 * Action: GetPeriodConfigAction
 *
 * Inyecta en el Frontend la estructura y los datos necesarios para
 * renderizar el catálogo de "Periodos".
 */
class GetPeriodConfigAction
{
    /**
     * Ejecuta y retorna la configuración del catálogo.
     *
     * @return array
     */
    public function execute(): array
    {
        app(PeriodActivationService::class)->syncForDate(now());

        return [
            'id' => 'periods',
            'title' => 'Periodos',
            'endpoint' => '/periods',
            'columns' => [
                ['accessorKey' => 'name', 'header' => 'Nombre'],
                ['accessorKey' => 'start_date', 'header' => 'Fecha de Inicio'],
                ['accessorKey' => 'end_date', 'header' => 'Fecha de Fin'],
                ['accessorKey' => 'is_active', 'header' => 'Activo por Fecha'],
            ],
            'formFields' => [
                [
                    'name' => 'start_date',
                    'label' => 'Fecha de Inicio',
                    'type' => 'date',
                    'required' => true,
                ],
                [
                    'name' => 'end_date',
                    'label' => 'Fecha de Fin',
                    'type' => 'date',
                    'required' => true,
                ],
            ],
            'data' => PeriodResource::collection(Period::all())->resolve(),
        ];
    }
}
