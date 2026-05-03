<?php

namespace App\Enums;

enum ServiceType: string
{
    case TRANSFERENCIA = 'transferencia';
    case DEPOSITO = 'deposito';

    public function label(): string
    {
        return match($this) {
            self::TRANSFERENCIA => 'Transferencia',
            self::DEPOSITO => 'Depósito',
        };
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
