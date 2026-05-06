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

    case PAYMENT_REVIEW = 'payment_review';
    case VALIDATED = 'validated';

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
