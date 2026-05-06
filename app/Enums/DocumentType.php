<?php

namespace App\Enums;

enum DocumentType: string
{
    case RFC = 'rfc';
    case CURP = 'curp';
    case IDENTIFICACION_OFICIAL = 'identificacion_oficial';
    case CEDULA = 'cedula_profesional';
    case CERTIFICADO = 'certificado';
    case EVIDENCIA = 'evidencia';

    public function label(): string
    {
        return match ($this) {
            self::RFC => 'RFC',
            self::CURP => 'CURP',
            self::IDENTIFICACION_OFICIAL => 'Identificación Oficial',
            self::CEDULA => 'Cédula Profesional',
            self::CERTIFICADO => 'Certificado',
            self::EVIDENCIA => 'Evidencia',
        };
    }

    public static function requiredFor(string $role): array
    {
        return match($role) {
            'teacher', 'docente' => [self::IDENTIFICACION_OFICIAL, self::RFC, self::CEDULA, self::CERTIFICADO, self::EVIDENCIA],
            'student', 'alumno' => [self::IDENTIFICACION_OFICIAL, self::CURP, self::EVIDENCIA],
            default   => [],
        };
    }

    /**
     * Devuelve todos los valores válidos del enum para reglas de validación.
     *
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(fn (self $case) => $case->value, self::cases());
    }

    /**
     * Devuelve opciones listas para Selects en frontend.
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

    /**
     * Devuelve opciones de tipos requeridos según rol.
     *
     * @return array<int, array{value: string, label: string}>
     */
    public static function requiredSelectFor(string $role): array
    {
        return array_map(fn (self $case) => [
            'value' => $case->value,
            'label' => $case->label(),
        ], self::requiredFor($role));
    }
}
