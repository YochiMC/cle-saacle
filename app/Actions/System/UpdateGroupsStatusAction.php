<?php

declare(strict_types=1);

namespace App\Actions\System;

use App\Enums\AcademicStatus;
use App\Models\Group;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UpdateGroupsStatusAction
{
    /**
     * Ejecuta la actualización de estatus de los grupos procesándolos por bloques.
     *
     * @param AcademicStatus $targetStatus  El estado al que se deben mover los grupos.
     * @param array          $groupTypes    Tipos de grupo a incluir en esta actualización.
     * @return array<string, mixed>         Métricas estandarizadas de la ejecución.
     */
    public function execute(AcademicStatus $targetStatus, array $groupTypes): array
    {
        $metrics = [
            'targetStatus' => $targetStatus->value,
            'processed'    => 0,
            'mutated'      => 0,
            'skipped'      => 0,
        ];

        // Consulta base:
        // 1. Filtro por tipos de grupo.
        // 2. Exclusión de estados terminales (COMPLETED).
        // 3. Patrón No-Op en BD: Excluir los que ya tienen el estado objetivo.
        // 4. Periodo vigente: Solo grupos cuyo periodo esté activo. Se relaja la restricción de
        //    fechas exactas para no excluir grupos en fases pre/post calendario pero con periodo vivo.
        $hoyStr = now()->toDateString();

        // Verificación segura de esquema para evitar excepciones SQL si las columnas legacy fueron removidas
        $hasStartDate = \Illuminate\Support\Facades\Schema::hasColumn('periods', 'start_date');
        $startCol = $hasStartDate ? 'start_date' : 'start';
        $endCol   = $hasStartDate ? 'end_date' : 'end';

        $query = Group::query()
            ->whereIn('type', $groupTypes)
            ->where('status', '!=', AcademicStatus::COMPLETED->value)
            ->where('status', '!=', $targetStatus->value)
            ->whereHas('period', function ($q) use ($hoyStr, $startCol, $endCol) {
                $q->where('is_active', true)
                  ->whereNotNull($startCol)
                  ->whereNotNull($endCol)
                  ->whereDate($startCol, '<=', $hoyStr)
                  ->whereDate($endCol, '>=', $hoyStr);
            });

        // Iterar en chunks para no saturar memoria ni bloquear la tabla mucho tiempo
        $query->chunkById(100, function ($groups) use (&$metrics, $targetStatus) {
            try {
                // Transacción aislada POR CHUNK para prevenir deadlocks globales
                $chunkMetrics = DB::transaction(function () use ($groups, $targetStatus) {
                    $localMetrics = ['processed' => 0, 'mutated' => 0, 'skipped' => 0];

                    foreach ($groups as $group) {
                        $localMetrics['processed']++;

                        // Doble chequeo dentro del bloque por seguridad concurrente
                        if ($group->status !== $targetStatus && $group->status !== AcademicStatus::COMPLETED) {
                            $group->status = $targetStatus;
                            
                            if ($group->save()) {
                                $localMetrics['mutated']++;
                            } else {
                                $localMetrics['skipped']++;
                            }
                        } else {
                            $localMetrics['skipped']++;
                        }
                    }

                    return $localMetrics;
                });

                // Solo si la transacción es exitosa se suman los contadores al global
                $metrics['processed'] += $chunkMetrics['processed'];
                $metrics['mutated']   += $chunkMetrics['mutated'];
                $metrics['skipped']   += $chunkMetrics['skipped'];

            } catch (\Exception $e) {
                // Política de errores por chunk: se hace rollback de ESTE chunk
                // pero se permite que los siguientes se intenten ejecutar.
                Log::error('Error procesando chunk en UpdateGroupsStatusAction', [
                    'targetStatus' => $targetStatus->value,
                    'error'        => $e->getMessage(),
                    'chunk_ids'    => $groups->pluck('id')->toArray(),
                ]);
                // Marcamos los del chunk como skipeados ya que la DB abortó el bloque
                $metrics['skipped'] += $groups->count();
            }
        });

        return $metrics;
    }
}
