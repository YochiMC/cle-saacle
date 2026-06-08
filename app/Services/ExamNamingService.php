<?php

namespace App\Services;

use App\Models\Exam;
use App\Models\Period;

/**
 * Servicio de Nomenclatura de Exámenes.
 *
 * Encapsula la regla de negocio para generar el nombre de un examen
 * de forma automática a partir de sus atributos, siguiendo el SRP.
 * No comparte dependencias de Nomenclatura de Niveles con Grupos
 * dado que los exámenes son acreditaciones y no cursos cursados.
 *
 * Formato: {TipoCode}-{LetraHorario}-{PeriodoCode}-{ModalidadCode}
 * Ejemplo: C-C-ENE26-P
 */
class ExamNamingService
{
    /**
     * Genera el nombre de un examen a partir de sus atributos.
     *
     * @param array $attributes Los atributos del examen (exam_type, application_time, period_id, mode).
     * @return string El nombre generado en mayúsculas.
     */
    public function generateName(array $attributes): string
    {
        $typeStr = $this->getTypeCode($attributes['exam_type'] ?? '');
        $scheduleLetter = $this->getScheduleLetter($attributes['application_time'] ?? '');
        $periodStr = $this->getPeriodCode($attributes['period_id'] ?? null);
        $modeStr = $this->getModeCode($attributes['mode'] ?? '');

        $prefix = strtoupper($typeStr . $scheduleLetter);
        $suffix = strtoupper('_' . $periodStr . $modeStr);
        $baseName = $prefix . $suffix;

        if (!Exam::where('name', $baseName)->where('id', '!=', $attributes['id'] ?? null)->exists()) {
            return $baseName;
        }

        $i = 2;
        while (true) {
            $newName = $prefix . $i . $suffix;
            if (!Exam::where('name', $newName)->where('id', '!=', $attributes['id'] ?? null)->exists()) {
                return $newName;
            }
            $i++;
        }
    }

    /**
     * Convierte el tipo de examen en su código.
     */
    private function getTypeCode(string $type): string
    {
        // Enums reales: 'Convalidación', 'Planes anteriores', '4 habilidades', 'Ubicación'
        $typeMap = [
            'convalidación' => 'C',
            'planes anteriores' => 'PA',
            '4 habilidades' => '4H',
            'ubicación' => 'U'
        ];
        return $typeMap[mb_strtolower($type)] ?? 'EX';
    }

    /**
     * Mapea la hora de aplicación a una letra de identificación.
     * Trunca los minutos y evalúa solo la hora entera.
     */
    private function getScheduleLetter(string $schedule): string
    {
        $schedule = trim($schedule);
        if (empty($schedule)) {
            return 'Z';
        }

        // Separar por ':' y castear el primer elemento (la hora) a entero
        $parts = explode(':', $schedule);
        $hour = (int) $parts[0];

        // Cláusula de guardia: validar que la hora esté en el rango permitido (8 a 20)
        if ($hour < 8 || $hour > 20) {
            return 'Z';
        }

        // Diccionario basado en llaves enteras (de 8 a 20 mapeado a 'A' hasta 'M')
        $scheduleMap = [
            8  => 'A',
            9  => 'B',
            10 => 'C',
            11 => 'D',
            12 => 'E',
            13 => 'F',
            14 => 'G',
            15 => 'H',
            16 => 'I',
            17 => 'J',
            18 => 'K',
            19 => 'L',
            20 => 'M',
        ];

        return $scheduleMap[$hour] ?? 'Z';
    }

    /**
     * Consulta el periodo y devuelve un código mes-año (ej. ENE26).
     */
    private function getPeriodCode($periodId): string
    {
        if (!$periodId) return 'PER';

        $period = Period::find($periodId);
        if (!$period) return 'PER';

        if (!empty($period->start)) {
            try {
                $date  = \Carbon\Carbon::parse($period->start);
                $month = strtoupper(substr($date->locale('es')->isoFormat('MMM'), 0, 3));
                $year  = $date->format('y');
                return "{$month}{$year}";
            } catch (\Exception $e) {
            }
        }

        $name = strtoupper($period->name ?? '');
        $month = substr($name, 0, 3);
        preg_match('/\d{4}/', $name, $matches);
        $year = isset($matches[0]) ? substr($matches[0], 2, 2) : 'XX';

        return "{$month}{$year}";
    }

    /**
     * Convierte la modalidad en su código de una letra.
     */
    private function getModeCode(string $mode): string
    {
        // Enums de Grupos suelen ser 'Presencial', 'Virtual', 'Híbrida'
        // Extraemos la primera letra.
        return empty($mode) ? 'M' : strtoupper(substr($mode, 0, 1));
    }
}
