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

    case ELEGIBLE_INSCRIPCION = 'elegible_inscripcion';
    case ESPERA_INSCRIPCION = 'espera_inscripcion';
    case ESPERA = 'espera';
    case RELEASED = 'released';

    /**
     * Estados que habilitan el flujo de autoinscripción.
     *
     * @return array<int, self>
     */
    public static function enrollmentEligibleCases(): array
    {
        return [self::VALIDATED, self::ELEGIBLE_INSCRIPCION];
    }

    /**
     * Indica si el alumno puede iniciar una autoinscripción.
     */
    public function canAccessEnrollmentCatalog(): bool
    {
        return in_array($this, self::enrollmentEligibleCases(), true);
    }

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
            self::ELEGIBLE_INSCRIPCION => 'Elegible para Inscripción',
            self::ESPERA_INSCRIPCION => 'Esperando Inscripción',
            self::ESPERA => 'En Espera',
            self::RELEASED => 'Liberado',
        };
    }
}
