<?php

namespace App\Enums;

enum AttemptEnum: string
{
    case FIRST = 'first';
    case SECOND = 'second';

    public function label(): string
    {
        return match ($this) {
            self::FIRST => 'Primera',
            self::SECOND => 'Segunda',
        };
    }
}
