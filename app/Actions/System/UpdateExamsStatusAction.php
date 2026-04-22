<?php

declare(strict_types=1);

namespace App\Actions\System;

use App\Enums\AcademicStatus;
use App\Models\Exam;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UpdateExamsStatusAction
{
    /**
     * Ejecuta la actualización de estatus de los exámenes procesándolos por bloques.
     * Implementa regla de precedencia estricta en 2 fases.
     *
     * @param AcademicStatus|null $globalTargetStatus El estado global calculado (puede ser null si no hay settings).
     * @return array<string, mixed>                   Métricas estandarizadas de la ejecución.
     */
    public function execute(?AcademicStatus $globalTargetStatus): array
    {
        $metrics = [
            'targetStatus'      => $globalTargetStatus ? $globalTargetStatus->value : 'sin_configurar',
            'processed'         => 0,
            'mutated'           => 0,
            'skipped'           => 0,
            'mutated_to_active' => 0,
            'mutated_to_global' => 0,
        ];

        $hoyStr = now()->toDateString();
        $hoy = now()->startOfDay();

        // Verificación segura de esquema para evitar excepciones SQL si las columnas legacy fueron removidas
        $hasStartDate = \Illuminate\Support\Facades\Schema::hasColumn('periods', 'start_date');
        $startCol = $hasStartDate ? 'start_date' : 'start';
        $endCol   = $hasStartDate ? 'end_date' : 'end';

        $query = Exam::query()
            ->where('status', '!=', AcademicStatus::COMPLETED->value)
            ->whereHas('period', function ($q) use ($hoyStr, $startCol, $endCol) {
                $q->where('is_active', true)
                  ->whereNotNull($startCol)
                  ->whereNotNull($endCol)
                  ->whereDate($startCol, '<=', $hoyStr)
                  ->whereDate($endCol, '>=', $hoyStr);
            })
            ->where(function ($q) use ($globalTargetStatus, $hoyStr) {
                if ($globalTargetStatus) {
                    $q->where('status', '!=', $globalTargetStatus->value);
                }
                $q->orWhere(function ($sub) use ($hoyStr) {
                    $sub->whereDate('start_date', '<=', $hoyStr)
                        ->whereDate('end_date', '>=', $hoyStr)
                        ->where('status', '!=', AcademicStatus::ACTIVE->value);
                });
            });

        $query->chunkById(100, function ($exams) use (&$metrics, $globalTargetStatus, $hoy) {
            try {
                $chunkMetrics = DB::transaction(function () use ($exams, $globalTargetStatus, $hoy) {
                    $localMetrics = [
                        'processed'         => 0,
                        'mutated'           => 0,
                        'skipped'           => 0,
                        'mutated_to_active' => 0,
                        'mutated_to_global' => 0,
                    ];

                    foreach ($exams as $exam) {
                        $localMetrics['processed']++;

                        if ($exam->status === AcademicStatus::COMPLETED) {
                            $localMetrics['skipped']++;
                            continue;
                        }

                        $nuevoEstado = null;
                        $esFase2 = false;

                        // Fase 2: Evaluar ventana temporal individual (Mayor Precedencia)
                        if ($exam->start_date && $exam->end_date) {
                            // Convertimos a startOfDay() para comparación segura si son strings o DateTime
                            $start = \Carbon\Carbon::parse($exam->start_date)->startOfDay();
                            $end = \Carbon\Carbon::parse($exam->end_date)->startOfDay();

                            if ($hoy->betweenIncluded($start, $end)) {
                                $nuevoEstado = AcademicStatus::ACTIVE;
                                $esFase2 = true;
                            }
                        }

                        // Fase 1: Si no aplicó la Fase 2, se usa el estado global (si existe)
                        if (! $nuevoEstado && $globalTargetStatus) {
                            $nuevoEstado = $globalTargetStatus;
                        }

                        // Patrón No-Op en memoria: Si el estado calculado es igual al actual o no hay estado a aplicar
                        if (! $nuevoEstado || $exam->status === $nuevoEstado) {
                            $localMetrics['skipped']++;
                            continue;
                        }

                        $exam->status = $nuevoEstado;

                        if ($exam->save()) {
                            $localMetrics['mutated']++;
                            if ($esFase2 && $nuevoEstado === AcademicStatus::ACTIVE) {
                                $localMetrics['mutated_to_active']++;
                            } else {
                                $localMetrics['mutated_to_global']++;
                            }
                        } else {
                            $localMetrics['skipped']++;
                        }
                    }

                    return $localMetrics;
                });

                $metrics['processed']         += $chunkMetrics['processed'];
                $metrics['mutated']           += $chunkMetrics['mutated'];
                $metrics['skipped']           += $chunkMetrics['skipped'];
                $metrics['mutated_to_active'] += $chunkMetrics['mutated_to_active'];
                $metrics['mutated_to_global'] += $chunkMetrics['mutated_to_global'];

            } catch (\Exception $e) {
                Log::error('Error procesando chunk en UpdateExamsStatusAction', [
                    'globalTargetStatus' => $globalTargetStatus?->value,
                    'error'              => $e->getMessage(),
                    'chunk_ids'          => $exams->pluck('id')->toArray(),
                ]);
                $metrics['skipped'] += $exams->count();
            }
        });

        return $metrics;
    }
}
