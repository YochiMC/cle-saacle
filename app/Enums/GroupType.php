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
}
