<?php

namespace App\Actions;

use App\Enums\ExamType;
use Illuminate\Support\Str;

/**
 * Encapsula la lógica de preparación de los metadatos para el módulo de acreditación.
 * Filtra, transforma y ordena las opciones disponibles de tipos de acreditación.
 */
class GetAccreditationMetadata
{
    /**
     * Obtiene las opciones de tipo de acreditación formateadas para el frontend.
     *
     * @return array<int, string>
     */
    public function execute(): array
    {
        // 1. Obtener casos del Enum y filtrar tipos irrelevantes para acreditación oficial
        $examTypes = collect(ExamType::cases())
            ->map(fn($case) => $case->value)
            ->filter(function ($type) {
                // Excluir Placement/Ubicación mediante normalización de strings
                $normalized = Str::lower(Str::ascii($type));
                return !Str::contains($normalized, ['ubicacion', 'placement']);
            })
            ->map(fn($type) => Str::title($type))
            ->toArray();

        // 2. Mezclar con opciones manuales de flujos internos
        $options = array_values(array_unique(array_merge(
            $examTypes,
            ['Cursos regulares', 'Programa de egresados']
        )));

        // 3. Ordenar alfabéticamente para mejorar la experiencia de usuario
        sort($options);

        return $options;
    }
}
