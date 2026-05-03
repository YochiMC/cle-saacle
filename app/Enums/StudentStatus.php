<?php

namespace App\Enums;

enum StudentStatus: string
{
    //
    case WAITING = 'waiting';
    case CURRENT = 'current';

    case SUSPENDED = 'inhabilitado';
    case IN_REVIEW = 'in_review';
    case ACCREDITED = 'accredited';

    public function label(): string
    {
        return match ($this) {
            self::WAITING => 'En Espera',
            self::CURRENT => 'Vigente',
            self::SUSPENDED => 'Inhabilitado',
            self::IN_REVIEW => 'En Revisión',
            self::ACCREDITED => 'Acreditado',
        };
    }
}
