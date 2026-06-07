<?php

namespace App\Services;

use App\Models\Group;
use App\Enums\GroupType;

class GraduateGroupCounterService
{
    /**
     * Caché del último contador generado para cada periodo.
     * Formato: [period_id => ultimo_entero_contador]
     *
     * @var array<int, int>
     */
    private array $cachedCounters = [];

    /**
     * Obtiene el siguiente contador para un periodo dado.
     *
     * @param int $periodId
     * @return string
     */
    public function getNextCounter(int $periodId): string
    {
        if (!isset($this->cachedCounters[$periodId])) {
            $this->cachedCounters[$periodId] = $this->getMaxExistingCounter($periodId);
        }

        $this->cachedCounters[$periodId]++;

        return str_pad((string) $this->cachedCounters[$periodId], 3, '0', STR_PAD_LEFT);
    }

    /**
     * Busca el contador máximo que se encuentra en uso actualmente para el periodo dado.
     *
     * @param int $periodId
     * @return int
     */
    private function getMaxExistingCounter(int $periodId): int
    {
        $names = Group::withTrashed()
            ->where('type', GroupType::PROGRAMA_ESPECIAL)
            ->where('period_id', $periodId)
            ->pluck('name');

        $maxCounter = 0;

        foreach ($names as $name) {
            if (preg_match('/^PE(\d{3})/i', $name, $matches)) {
                $counterVal = (int) $matches[1];
                if ($counterVal > $maxCounter) {
                    $maxCounter = $counterVal;
                }
            }
        }

        return $maxCounter;
    }
}
