<?php

namespace App\Services;

use App\Models\Group;
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
    private GraduateGroupCounterService $counterService;

    public function __construct(?GraduateGroupCounterService $counterService = null)
    {
        $this->counterService = $counterService ?? app(GraduateGroupCounterService::class);
    }
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

        // Pasamos el tipo para omitir el nivel si es Egresados (pasamos $attributes completo)
        $levelStr = $this->getLevelCode($attributes['level_id'] ?? null, $type, $attributes);

        $scheduleLetter = $this->getScheduleLetter($attributes['schedule'] ?? '');
        $periodStr = $this->getPeriodCode($attributes['period_id'] ?? null);
        $modeStr = $this->getModeCode($attributes['mode'] ?? '');

        $prefix = strtoupper($typeStr . $levelStr . $scheduleLetter);
        $suffix = strtoupper('_' . $periodStr . $modeStr);
        $baseName = $prefix . $suffix;

        if (!Group::where('name', $baseName)->where('id', '!=', $attributes['id'] ?? null)->exists()) {
            return $baseName;
        }

        $i = 2;
        while (true) {
            $newName = $prefix . $i . $suffix;
            if (!Group::where('name', $newName)->where('id', '!=', $attributes['id'] ?? null)->exists()) {
                return $newName;
            }
            $i++;
        }
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
            'programa especial' => 'PE'
        ];
        return $typeMap[strtolower($type)] ?? 'X';
    }

    /**
     * Consulta el nivel y devuelve su código compuesto (ej. B100, A200).
     */
    private function getLevelCode($levelId, string $type, array $attributes = []): string
    {
        // Excepción: Programa Egresados no lleva nivel, lleva contador
        if (strtolower($type) === 'programa especial') {
            return $this->getGraduateCounter($attributes);
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
        $startTimes = $this->extractScheduleStartTimes($schedule);

        if (empty($startTimes)) {
            return 'Z';
        }

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

        $letters = [];

        foreach ($startTimes as $startTime) {
            $parts = explode(':', $startTime);
            $hour = (int) $parts[0];

            if ($hour < 8 || $hour > 20) {
                continue;
            }

            $letter = $scheduleMap[$hour] ?? null;

            if ($letter) {
                $letters[$letter] = true;
            }
        }

        if (empty($letters)) {
            return 'Z';
        }

        $letters = array_keys($letters);
        sort($letters, SORT_STRING);

        return implode('', $letters);
    }

    /**
     * Extrae las horas de inicio válidas de un horario en texto libre.
     * Ignora las horas que actúan como fin de bloque, como las precedidas por
     * un guion o por la preposición "a".
     */
    private function extractScheduleStartTimes(string $schedule): array
    {
        if (trim($schedule) === '') {
            return [];
        }

        preg_match_all('/\b\d{1,2}:\d{2}\b/u', $schedule, $matches, PREG_OFFSET_CAPTURE);

        if (empty($matches[0])) {
            return [];
        }

        $startTimes = [];

        foreach ($matches[0] as [$time, $offset]) {
            if ($this->isEndTimeOfBlock($schedule, $offset)) {
                continue;
            }

            $startTimes[] = $time;
        }

        return $startTimes;
    }

    /**
     * Determina si una hora pertenece al cierre de un bloque y no debe usarse
     * para la nomenclatura.
     */
    private function isEndTimeOfBlock(string $schedule, int $offset): bool
    {
        $leftContext = rtrim(substr($schedule, 0, $offset));

        if ($leftContext === '') {
            return false;
        }

        $lastChar = mb_substr($leftContext, -1, 1);

        if (in_array($lastChar, ['-', '–', '—'], true)) {
            return true;
        }

        return (bool) preg_match('/(?:^|[\s,;\/\(\[])a$/iu', $leftContext);
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

    /**
     * Resuelve el contador secuencial para Programa Egresados (001 a 999).
     */
    private function getGraduateCounter(array $attributes): string
    {
        $periodId = $attributes['period_id'] ?? null;
        $groupId = $attributes['id'] ?? null;

        // Si es una actualización, verificar si el periodo no cambió para conservar el contador
        if ($groupId) {
            $existingGroup = \App\Models\Group::find($groupId);
            if ($existingGroup && strtolower($existingGroup->type->value ?? '') === 'programa especial') {
                if ($periodId && (int)$existingGroup->period_id === (int)$periodId) {
                    $counter = $this->extractCounterFromName($existingGroup->name);
                    if ($counter !== null) {
                        return $counter;
                    }
                }
            }
        }

        // Si no hay periodo asignado (ej: pruebas unitarias sin persistencia), usar '001'
        if (!$periodId) {
            return '001';
        }

        return $this->counterService->getNextCounter((int) $periodId);
    }

    /**
     * Extrae el contador de 3 dígitos del nombre del grupo.
     */
    private function extractCounterFromName(?string $name): ?string
    {
        if ($name && preg_match('/^PE(\d{3})/i', $name, $matches)) {
            return $matches[1];
        }
        return null;
    }
}
