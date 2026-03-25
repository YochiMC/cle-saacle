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
        $typeStr     = $this->getTypeCode($attributes['type'] ?? '');
        $levelStr    = $this->getLevelCode($attributes['level_id'] ?? null);
        $scheduleLetter = $this->getScheduleLetter($attributes['schedule'] ?? '');
        $periodStr   = $this->getPeriodCode($attributes['period_id'] ?? null);
        $modeStr     = $this->getModeCode($attributes['mode'] ?? '');

        return strtoupper("{$typeStr}{$levelStr}{$scheduleLetter}{$periodStr}{$modeStr}");
    }

    /**
     * Convierte el tipo de grupo en su código abreviado.
     */
    private function getTypeCode(string $type): string
    {
        if (empty($type)) return 'X';
        // Capitaliza cada palabra y extrae solo las letras mayúsculas
        preg_match_all('/[A-Z]/', ucwords(strtolower($type)), $matches);
        return implode('', $matches[0]);
    }

    /**
     * Consulta el nivel y devuelve su código compuesto (ej. B100, A200).
     */
    private function getLevelCode($levelId): string
    {
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
            return "A{$number}00";
        }

        return "L{$number}00";
    }

    /**
     * Mapea el horario a una letra de identificación.
     *
     * Agrega más reglas `elseif` según la tabla de horarios institucional.
     */
    private function getScheduleLetter(string $schedule): string
    {
        $schedule = mb_strtolower($schedule, 'UTF-8');

        // Diccionario de búsqueda de mayor especificidad a menor (Sábados primero y horas dobles antes que simples)
        $scheduleMap = [
            // Sábados (Semi Intensivo)
            'sábado 10:00' => 'S-C', 'sabado 10:00' => 'S-C',
            'sábado 11:00' => 'S-D', 'sabado 11:00' => 'S-D',
            'sábado 12:00' => 'S-E', 'sabado 12:00' => 'S-E',
            'sábado 13:00' => 'S-F', 'sabado 13:00' => 'S-F',
            'sábado 14:00' => 'S-G', 'sabado 14:00' => 'S-G',
            'sábado 15:00' => 'S-H', 'sabado 15:00' => 'S-H',
            'sábado 16:00' => 'S-I', 'sabado 16:00' => 'S-I',
            'sábado 17:00' => 'S-J', 'sabado 17:00' => 'S-J',
            'sábado 18:00' => 'S-K', 'sabado 18:00' => 'S-K',
            'sábado 19:00' => 'S-L', 'sabado 19:00' => 'S-L',
            'sábado 20:00' => 'S-M', 'sabado 20:00' => 'S-M',
            'sábado 08:00' => 'S-A', 'sabado 08:00' => 'S-A',
            'sábado 8:00'  => 'S-A', 'sabado 8:00'  => 'S-A',
            'sábado 09:00' => 'S-B', 'sabado 09:00' => 'S-B',
            'sábado 9:00'  => 'S-B', 'sabado 9:00'  => 'S-B',

            // Entre semana (Regular)
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
            '08:00' => 'A',
            '8:00'  => 'A',
            '09:00' => 'B',
            '9:00'  => 'B',
        ];

        foreach ($scheduleMap as $time => $letter) {
            if (str_contains($schedule, $time)) {
                return $letter;
            }
        }

        return 'Z';
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
