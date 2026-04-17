<?php

namespace App\Enums;

enum DocumentType: string
{
    case INE = 'ine';
    case RFC = 'rfc';
    case CURP = 'curp';

    case DOCUMENTO_DE_IDENTIDAD = 'documento_de_identidad';
    case CEDULA = 'cedula_profesional';
    case CERTIFICADO = 'certificado';
    case EVIDENCIA = 'evidencia';
    case ACTA_NACIMIENTO = 'acta_nacimiento';

    public function label(): string
    {
        return match ($this) {
            self::INE => 'INE',
            self::RFC => 'RFC',
            self::CURP => 'CURP',
            self::DOCUMENTO_DE_IDENTIDAD => 'Documento de Identidad',
            self::CEDULA => 'Cédula Profesional',
            self::CERTIFICADO => 'Certificado',
            self::EVIDENCIA => 'Evidencia',
            self::ACTA_NACIMIENTO => 'Acta de Nacimiento',
        };
    }

    public static function requiredFor(string $role): array
    {
        return match($role) {
            'teacher', 'docente' => [self::INE, self::RFC, self::CEDULA, self::CERTIFICADO, self::EVIDENCIA],
            'student', 'alumno' => [self::INE, self::ACTA_NACIMIENTO, self::CURP, self::EVIDENCIA],
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
