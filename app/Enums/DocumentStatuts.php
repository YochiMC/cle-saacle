<?php

namespace App\Enums;

enum DocumentStatus: string
{
    case PENDING = 'pending';
    case APPROVED = 'approved';
    case REJECTED = 'rejected';

    public static function toSelect(): array {
        return array_map(fn($case) => [
            'value' => $case->value,
            'label' => $case->name, // O una traducción personalizada
        ], self::cases());
    }
}

