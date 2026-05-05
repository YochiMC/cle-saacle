<?php

namespace App\Enums;

enum StudentStatus: string
{
    //
    case WAITING = 'waiting';
    case CURRENT = 'current';

    case DISABLED = 'disabled';
    case IN_REVIEW = 'in_review';
    case ACCREDITED = 'accredited';

    case PAYMENT_REVIEW = 'payment_review';
    case VALIDATED = 'validated';

    public function label(): string
    {
        return match ($this) {
            self::WAITING => 'En Espera',
            self::CURRENT => 'Vigente',
            self::DISABLED => 'Disabled',
            self::IN_REVIEW => 'En Revisión',
            self::ACCREDITED => 'Acreditado',
            self::PAYMENT_REVIEW => 'Revisión de Pago',
            self::VALIDATED => 'Validado para Inscripción',
        };
    }
}
