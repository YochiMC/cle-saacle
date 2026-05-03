<?php

namespace App\Enums;

enum GroupType: string
{
    case REGULAR = 'Regular';
    case INTENSIVO = 'Intensivo';
    case SEMI_INTENSIVO = 'Semi intensivo';
    case PROGRAMA_EGRESADOS = 'Programa Egresados';

    public static function getOptions(): array
    {
        return array_map(fn($case) => [
            'value' => $case->value,
            'label' => $case->value
        ], self::cases());
    }

    /**
     * Devuelve la estructura inicial del JSON de calificaciones
     * dependiendo del tipo de grupo y la cantidad de unidades.
     *
     * @param int $unitsCount
     * @return array<string, mixed>
     */
    public function defaultUnitsBreakdown(int $unitsCount = 0): array
    {
        return match($this) {
            self::PROGRAMA_EGRESADOS => [
                'hizo_certificacion' => false,
                'a1'                 => 0,
                'a2'                 => 0,
                'b1'                 => 0,
            ],
            default => array_fill_keys(
                array_map(fn($i) => "unit_{$i}", range(1, max(1, $unitsCount))),
                0
            ),
        };
    }
}
