<?php

namespace App\Enums;

enum StudentStatus: string
{
    //
    case WAITING = 'waiting';
    case CURRENT = 'current';

    case SUSPENDED = 'suspended';
    case IN_REVIEW = 'in_review';
    case ACCREDITED = 'accredited';
    case RELEASED = 'released';

    public function label(): string
    {
        return match($this) {
            self::WAITING => 'En Espera',
            self::CURRENT => 'Vigente',
            self::SUSPENDED => 'Suspendido',
            self::IN_REVIEW => 'En Revisión',
            self::ACCREDITED => 'Acreditado',
            self::RELEASED => 'Liberado',
        };
    }
}
