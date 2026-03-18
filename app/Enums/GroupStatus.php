<?php

namespace App\Enums;

enum GroupStatus: string
{
    case ENROLLING = 'enrolling';
    case PENDING = 'pending';
    case ACTIVE = 'active';
    case GRADING = 'grading';
    case COMPLETED = 'completed';

    public function label(): string
    {
        return match($this) {
            self::ENROLLING => 'Inscripciones Abiertas',
            self::PENDING => 'En Espera',
            self::ACTIVE => 'Activo',
            self::GRADING => 'En Evaluación',
            self::COMPLETED => 'Completado',
        };
    }
}
