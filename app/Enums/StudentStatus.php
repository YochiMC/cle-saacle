<?php

namespace App\Enums;

enum StudentStatus: string
{
    //
    case WAITING = 'waiting';
    case CURRENT = 'current';

    case SUSPENDED = 'suspended';
    case ACCREDITED = 'accredited';

    public function label(): string
    {
        return match($this) {
            self::WAITING => 'En Espera',
            self::CURRENT => 'Vigente',
            self::SUSPENDED => 'Suspendido',
            self::ACCREDITED => 'Acreditado',
        };
    }
}
