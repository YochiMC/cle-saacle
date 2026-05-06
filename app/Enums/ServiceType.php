<?php

namespace App\Enums;

enum ServiceType: string
{
    case REGULAR = 'Regular';
    case INTENSIVO = 'Intensivo';
    case SEMI_INTENSIVO = 'Semi intensivo';
    case PROGRAMA_EGRESADOS = 'Programa Egresados';
    case CONVALIDACION = 'Convalidación';
    case PLANES_ANTERIORES = 'Planes anteriores';
    case CUATRO_HABILIDADES = '4 habilidades';
    case UBICACION = 'Ubicación';

    public function label(): string
    {
        return match($this) {
            self::REGULAR => 'Regular',
            self::INTENSIVO => 'Intensivo',
            self::SEMI_INTENSIVO => 'Semi intensivo',
            self::PROGRAMA_EGRESADOS => 'Programa Egresados',
            self::CONVALIDACION => 'Convalidación',
            self::PLANES_ANTERIORES => 'Planes anteriores',
            self::CUATRO_HABILIDADES => '4 habilidades',
            self::UBICACION => 'Ubicación',
        };
    }

    public function category(): string
    {
        return match ($this) {
            self::REGULAR,
            self::INTENSIVO,
            self::SEMI_INTENSIVO,
            self::PROGRAMA_EGRESADOS => 'course',
            self::CONVALIDACION,
            self::PLANES_ANTERIORES,
            self::CUATRO_HABILIDADES,
            self::UBICACION => 'exam',
        };
    }

    public function isCourse(): bool
    {
        return $this->category() === 'course';
    }

    public function isExam(): bool
    {
        return $this->category() === 'exam';
    }

    /**
     * @return array<int, self>
     */
    public static function courseCases(): array
    {
        return array_values(array_filter(self::cases(), fn (self $case) => $case->isCourse()));
    }

    /**
     * @return array<int, self>
     */
    public static function examCases(): array
    {
        return array_values(array_filter(self::cases(), fn (self $case) => $case->isExam()));
    }

    /**
     * @return array<int, string>
     */
    public static function courseValues(): array
    {
        return array_map(fn (self $case) => $case->value, self::courseCases());
    }

    /**
     * @return array<int, string>
     */
    public static function examValues(): array
    {
        return array_map(fn (self $case) => $case->value, self::examCases());
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
