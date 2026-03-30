<?php

namespace App\Enums;

enum StudentStatus: string
{
    //
    case WAITING = 'WAITING';
    case ACTIVE = 'active';
    
    case SUSPENDED = 'suspended';
    case ACCREDITED = 'accredited';

    public function label(): string
    {
        return match($this) {
            self::WAITING => 'En Espera',
            self::ACTIVE => 'Activo',
            self::SUSPENDED => 'Suspendido',
            self::ACCREDITED => 'Acreditado',
        };
    }
}
