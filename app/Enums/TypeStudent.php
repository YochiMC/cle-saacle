<?php

namespace App\Enums;

enum TypeStudent: string
{
    /**
     * Estudiante activo/vigente en el programa.
     */
    case VIGENTE = 'vigente';

    /**
     * Estudiante que ya completó el programa.
     */
    case EGRESADO = 'egresado';

    /**
     * Obtiene la etiqueta legible en español del tipo de estudiante.
     */
    public function label(): string
    {
        return match ($this) {
            self::VIGENTE => 'Vigente',
            self::EGRESADO => 'Egresado',
        };
    }

    /**
     * Obtiene las opciones formateadas para selects en el frontend.
     *
     * @return array<int, array<string, string>>
     */
    public static function getOptions(): array
    {
        return array_map(
            fn ($case) => ['value' => $case->value, 'label' => $case->label()],
            self::cases()
        );
    }
}
