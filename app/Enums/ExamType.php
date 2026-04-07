<?php

namespace App\Enums;

/**
 * Tipos de examen disponibles en el sistema.
 * Backed Enum de strings para casteo en el modelo Exam.
 */
enum ExamType: string
{
    case CONVALIDACION      = 'Convalidación';
    case PLANES_ANTERIORES  = 'Planes anteriores';
    case CUATRO_HABILIDADES = '4 habilidades';
    case UBICACION          = 'Ubicación';

    /**
     * Devuelve la estructura inicial exacta del JSON de calificaciones
     * para este tipo de examen.
     *
     * Los tipos de valor determinan cómo el frontend renderiza cada columna:
     *   - bool  (false)  → Checkbox
     *   - string ('')    → Input de texto libre / Selector
     *   - int   (0)      → Input numérico
     *
     * @return array<string, mixed>
     */
    public function defaultUnitsBreakdown(): array
    {
        return match($this) {
            self::PLANES_ANTERIORES => [
                'is_curso_nivelacion' => false,
                'calificacion_final'  => 0,
            ],

            self::CUATRO_HABILIDADES => [
                'oportunidad'         => 'Primera',
                'listening'           => '',
                'reading'             => '',
                'writing'             => '',
                'speaking'            => '',
                'promedio_habilidades'=> '',
            ],

            self::CONVALIDACION => [
                'oportunidad'       => 'Primera',
                'nivel_certificado' => '',
                'speaking'          => '',
            ],

            self::UBICACION => [
                'nivel_asignado' => '', // Renderizado como <select> en el frontend
            ],
        };
    }

    /**
     * Devuelve las opciones formateadas para el frontend.
     * Compatible con la estructura que esperan los componentes SelectForm / select nativos.
     *
     * @return array<int, array{value: string, label: string}>
     */
    public static function getOptions(): array
    {
        return array_map(
            fn($case) => ['value' => $case->value, 'label' => $case->value],
            self::cases()
        );
    }

    /**
     * Devuelve un mapa asociativo [value => label] para uso directo en el frontend.
     *
     * @return array<string, string>
     */
    public static function options(): array
    {
        return array_column(self::getOptions(), 'label', 'value');
    }
}
