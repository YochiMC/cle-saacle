<?php

namespace App\Services;

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

        // Concatena sin espacios: CENENE26P
        return strtoupper("{$typeStr}{$scheduleLetter}{$periodStr}{$modeStr}");
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
     */
    private function getScheduleLetter(string $time): string
    {
        $time = trim($time);
        if (empty($time)) {
            return 'Z';
        }

        // Normalizamos a formato de 2 dígitos (ej. "8:00" -> "08:00")
        if (strlen($time) == 4) {
            $time = '0' . $time;
        }

        // Extraemos solo los primeros 5 caracteres por si vinieran segundos "08:00:00"
        $startTime = substr($time, 0, 5);

        $scheduleMap = [
            '08:00' => 'A',
            '09:00' => 'B',
            '10:00' => 'C',
            '11:00' => 'D',
            '12:00' => 'E',
            '13:00' => 'F',
            '14:00' => 'G',
            '15:00' => 'H',
            '16:00' => 'I',
            '17:00' => 'J',
            '18:00' => 'K',
            '19:00' => 'L',
            '20:00' => 'M',
        ];

        return $scheduleMap[$startTime] ?? 'Z';
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
