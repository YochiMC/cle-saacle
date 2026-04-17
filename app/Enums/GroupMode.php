<?php

namespace App\Enums;

enum GroupMode: string
{
    case PRESENCIAL = 'Presencial';
    case VIRTUAL = 'Virtual';
    case HIBRIDO = 'Híbrido';

    public static function getOptions(): array
    {
        return array_map(fn($case) => [
            'value' => $case->value,
            'label' => $case->value
        ], self::cases());
    }
}
