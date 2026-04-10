<?php

namespace App\Enums;

enum DocumentStatus: string
{
    case PENDING = 'pending';
    case APPROVED = 'approved';
    case REJECTED = 'rejected';

    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Pendiente',
            self::APPROVED => 'Aprobado',
            self::REJECTED => 'Rechazado',
        };
    }

    /**
     * Opciones de estatus destinadas al flujo de revisión.
     *
     * @return array<int, array{value: string, label: string}>
     */
    public static function reviewOptions(): array
    {
        return [
            [
                'value' => self::APPROVED->value,
                'label' => self::APPROVED->label(),
            ],
            [
                'value' => self::REJECTED->value,
                'label' => self::REJECTED->label(),
            ],
        ];
    }

    /**
     * Opciones completas del enum para selects generales.
     *
     * @return array<int, array{value: string, label: string}>
     */
    public static function toSelect(): array
    {
        return array_map(fn (self $case) => [
            'value' => $case->value,
            'label' => $case->label(),
        ], self::cases());
    }
}


