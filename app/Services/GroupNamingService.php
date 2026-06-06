<?php

namespace App\Services;

use App\Models\Level;
use App\Models\Period;

/**
 * Servicio de Nomenclatura de Grupos.
 *
 * Encapsula la regla de negocio para generar el nombre de un grupo
 * de forma automática a partir de sus atributos, siguiendo el SRP.
 *
 * Formato: {TipoCode}-{NivelCode}-{LetraHorario}-{PeriodoCode}-{ModalidadCode}
 * Ejemplo: R-B100-A-ENE26-P
 */
class GroupNamingService
{
    /**
     * Genera el nombre de un grupo a partir de un arreglo de atributos.
     *
     * @param array $attributes Los atributos del grupo (type, level_id, schedule, period_id, mode).
     * @return string El nombre generado en mayúsculas.
     */
    public function generateName(array $attributes): string
    {
        $type = $attributes['type'] ?? '';
        $typeStr = $this->getTypeCode($type);

        // Pasamos el tipo para omitir el nivel si es Egresados
        $levelStr = $this->getLevelCode($attributes['level_id'] ?? null, $type);

        $scheduleLetter = $this->getScheduleLetter($attributes['schedule'] ?? '');
        $periodStr = $this->getPeriodCode($attributes['period_id'] ?? null);
        $modeStr = $this->getModeCode($attributes['mode'] ?? '');

        // Genera el código concatenado (Ej: RB100AENE26P o PECMAY25P)
        return strtoupper("{$typeStr}{$levelStr}{$scheduleLetter}_{$periodStr}{$modeStr}");
    }

    /**
     * Convierte el tipo de grupo en su código abreviado.
     */
    private function getTypeCode(string $type): string
    {
        $typeMap = [
            'regular' => 'R',
            'intensivo' => 'I',
            'semi intensivo' => 'S',
            'programa egresados' => 'PE'
        ];
        return $typeMap[strtolower($type)] ?? 'X';
    }

    /**
     * Consulta el nivel y devuelve su código compuesto (ej. B100, A200).
     */
    private function getLevelCode($levelId, string $type): string
    {
        // Excepción: Programa Egresados no lleva nivel
        if (strtolower($type) === 'programa egresados') {
            return '400';
        }

        if (!$levelId) return 'XXX';

        $level = Level::find($levelId);
        if (!$level) return 'XXX';

        $name = mb_strtolower($level->level_tecnm ?? '');

        // Extraemos el número del nivel (ej. "Básico 1" -> "1")
        preg_match('/\d+/', $name, $matches);
        $number = $matches[0] ?? '1';

        if (str_contains($name, 'básico') || str_contains($name, 'basico')) {
            return "B{$number}00";
        }

        if (str_contains($name, 'intermedio')) {
            return "I{$number}00"; // Cambiado de A a I
        }

        return "L{$number}00";
    }

    /**
     * Mapea el horario a una letra de identificación.
     * Trunca los minutos y evalúa solo la hora entera de inicio.
     */
    private function getScheduleLetter(string $schedule): string
    {
        // 1. Extraer la primera hora encontrada en formato HH:MM (ej. 08:30 o 8:00)
        preg_match('/\b\d{1,2}:\d{2}\b/', $schedule, $matches);

        if (empty($matches)) {
            return 'Z';
        }

        $startTime = $matches[0];

        // Separar por ':' y castear el primer elemento (la hora) a entero
        $parts = explode(':', $startTime);
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
     * Usa el campo `start` del modelo Period.
     */
    private function getPeriodCode($periodId): string
    {
        if (!$periodId) return 'PER';

        $period = Period::find($periodId);
        if (!$period) return 'PER';

        // Si el periodo tiene fecha de inicio, la usamos para extraer mes y año.
        if (!empty($period->start)) {
            try {
                $date  = \Carbon\Carbon::parse($period->start);
                $month = strtoupper(substr($date->locale('es')->isoFormat('MMM'), 0, 3));
                $year  = $date->format('y');
                return "{$month}{$year}";
            } catch (\Exception $e) {
                // Fall-through al parseo de nombre
            }
        }

        // Fallback: intentar parsear desde el nombre (ej. "Enero - Junio 2026")
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
        return empty($mode) ? 'M' : strtoupper(substr($mode, 0, 1));
    }
}
