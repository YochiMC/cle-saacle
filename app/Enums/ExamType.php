<?php

namespace App\Enums;

/**
 * Tipos de examen disponibles en el sistema.
 * Backed Enum de strings para casteo en el modelo Exam.
 */
enum ExamType: string
{
    case CONVALIDACION      = 'Convalidación';
    case PLANES_ANTERIORES  = 'Planes anteriores';
    case CUATRO_HABILIDADES = '4 habilidades';
    case UBICACION          = 'Ubicación';

    /**
     * Devuelve las opciones formateadas para el frontend.
     * Compatible con la estructura que esperan los componentes SelectForm / select nativos.
     *
     * @return array<int, array{value: string, label: string}>
     */
    public static function getOptions(): array
    {
        return array_map(
            fn($case) => ['value' => $case->value, 'label' => $case->value],
            self::cases()
        );
    }

    /**
     * Devuelve un mapa asociativo [value => label] para uso directo en el frontend.
     *
     * @return array<string, string>
     */
    public static function options(): array
    {
        return array_column(self::getOptions(), 'label', 'value');
    }
}
