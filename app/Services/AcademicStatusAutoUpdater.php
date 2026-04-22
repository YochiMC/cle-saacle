<?php

namespace App\Services;

use App\Enums\AcademicStatus;
use App\Enums\GroupType;
use App\Models\Exam;
use App\Models\Group;
use App\Models\Setting;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

/**
 * Servicio de Automatización de Estados Académicos — CLE SAACLE.
 *
 * Resuelve el "problema del estado del día" aplicando una línea de tiempo
 * cronológica continua: evalúa UNA SOLA VEZ la fecha actual contra el calendario
 * configurado y determina un único estado objetivo para ejecutar UN SOLO bulk update.
 *
 * Esto elimina los "días en el limbo" (Gap Days) donde los grupos no tenían
 * un estado definido entre el cierre de un periodo y el inicio del siguiente.
 *
 * Principio SRP: Este servicio tiene una única responsabilidad — orquestar la
 * transición masiva de estados según las reglas del calendario académico del CLE.
 *
 * Regla de Aislamiento por Tipo de Grupo:
 * - REGULAR y SEMI_INTENSIVO → Siguen el calendario global de Settings.
 * - INTENSIVO y PROGRAMA_EGRESADOS → Excluidos. Tienen calendarios desfasados
 *   y NO son afectados por este servicio.
 *
 * Regla Híbrida para Exámenes:
 * - Estado global (PENDING, ENROLLING, GRADING, COMPLETED) → Determinado por Settings.
 * - Estado ACTIVE → Determinado individualmente por `start_date`/`end_date` del
 *   registro del examen, con mayor precedencia que el estado global.
 */
class AcademicStatusAutoUpdater
{
    /**
     * Tipos de grupo que siguen el calendario global de Settings.
     * Actúa como scope de protección para los tipos especiales.
     */
    private const TIPOS_CON_CALENDARIO_GLOBAL = [
        GroupType::REGULAR->value,
        GroupType::SEMI_INTENSIVO->value,
    ];

    // ──────────────────────────────────────────────────────────────────────────
    // Punto de entrada público
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Ejecuta el proceso completo de actualización de estados académicos.
     *
     * Flujo:
     * 1. Extrae todos los settings de la BD en una sola consulta.
     * 2. Parsea las fechas de forma null-safe a objetos Carbon.
     * 3. Verifica que haya al menos las fechas base de grupos; si no, aborta con log.
     * 4. Delega a los métodos especializados y registra el log de auditoría final.
     */
    public function run(string $triggerSource = 'scheduler'): void
    {
        $settings = Setting::pluck('value', 'key')->toArray();
        $hoy      = now()->startOfDay();

        // ── Parseo seguro: fechas de Grupos ───────────────────────────────────
        $cursosInscripcionInicio = $this->parsearFecha($settings['courses_enrollment_start'] ?? null);
        $cursosInscripcionFin    = $this->parsearFecha($settings['courses_enrollment_end']   ?? null);
        $cursosActivoInicio      = $this->parsearFecha($settings['courses_active_start']     ?? null);
        $cursosActivoFin         = $this->parsearFecha($settings['courses_active_end']       ?? null);
        $cursosEvaluacionInicio  = $this->parsearFecha($settings['courses_evaluation_start'] ?? null);
        $cursosEvaluacionFin     = $this->parsearFecha($settings['courses_evaluation_end']   ?? null);

        // ── Parseo seguro: fechas Programa Egresados (PE) ─────────────────────
        $peInscripcionInicio     = $this->parsearFecha($settings['pe_enrollment_start']      ?? null);
        $peInscripcionFin        = $this->parsearFecha($settings['pe_enrollment_end']        ?? null);
        $peActivoInicio          = $this->parsearFecha($settings['pe_active_start']          ?? null);
        $peActivoFin             = $this->parsearFecha($settings['pe_active_end']            ?? null);
        $peEvaluacionInicio      = $this->parsearFecha($settings['pe_evaluation_start']      ?? null);
        $peEvaluacionFin         = $this->parsearFecha($settings['pe_evaluation_end']        ?? null);

        // ── Parseo seguro: fechas de Exámenes ─────────────────────────────────
        $examenInscripcionInicio = $this->parsearFecha($settings['exams_enrollment_start']   ?? null);
        $examenInscripcionFin    = $this->parsearFecha($settings['exams_enrollment_end']     ?? null);
        $examenEvaluacionInicio  = $this->parsearFecha($settings['exams_evaluation_start']   ?? null);
        $examenEvaluacionFin     = $this->parsearFecha($settings['exams_evaluation_end']     ?? null);

        // ── Guardia: Aborta si no hay fechas base configuradas ─────────────────
        // Sin la fecha de inicio de inscripciones de cursos no se puede establecer
        // correctamente la línea de tiempo. Registra el problema y sale limpiamente.
        if (! $cursosInscripcionInicio) {
            Log::warning('Automatización CLE abortada: no hay fechas de calendario configuradas en Settings.', [
                'fecha_de_ejecucion' => $hoy->toDateString(),
                'trigger_source'     => $triggerSource,
            ]);
            return;
        }

        Log::info('Automatización CLE: Iniciando actualización de estados académicos.', [
            'fecha_de_ejecucion' => $hoy->toDateString(),
            'trigger_source'     => $triggerSource,
        ]);

        $contadoresGrupos = $this->actualizarGrupos(
            $hoy,
            $cursosInscripcionInicio,
            $cursosInscripcionFin,
            $cursosActivoInicio,
            $cursosActivoFin,
            $cursosEvaluacionInicio,
            $cursosEvaluacionFin,
        );

        $contadoresPE = $this->actualizarProgramaEgresados(
            $hoy,
            $peInscripcionInicio,
            $peInscripcionFin,
            $peActivoInicio,
            $peActivoFin,
            $peEvaluacionInicio,
            $peEvaluacionFin,
        );

        $contadoresExamenes = $this->actualizarExamenes(
            $hoy,
            $examenInscripcionInicio,
            $examenInscripcionFin,
            $examenEvaluacionInicio,
            $examenEvaluacionFin,
        );

        // Log único de auditoría con todos los contadores del día y el origen del disparo
        Log::info('Automatización CLE ejecutada.', array_merge(
            [
                'fecha_de_ejecucion' => $hoy->toDateString(),
                'trigger_source'     => $triggerSource,
            ],
            $contadoresGrupos,
            $contadoresPE,
            $contadoresExamenes,
        ));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Grupos — Línea de Tiempo Cronológica Continua (UN estado por día)
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Determina el estado objetivo del día mediante una cascada cronológica
     * y ejecuta UN ÚNICO bulk update sobre los grupos REGULAR y SEMI_INTENSIVO.
     *
     * La cascada cubre todos los escenarios, incluyendo los "días en el limbo"
     * (gap days) que existen entre periodos consecutivos:
     *
     * ─────────────────────────────────────────────────────────────────────────
     * Línea de tiempo:
     *
     *  [PENDING] → [ENROLLING] → [PENDING*] → [ACTIVE] → [ACTIVE*] → [GRADING] → [COMPLETED]
     *
     *  * PENDING entre inscripción y clases: "Inscripciones cerradas, en espera."
     *  * ACTIVE entre clases y evaluación:   "Clases terminadas, esperando evaluación."
     * ─────────────────────────────────────────────────────────────────────────
     *
     * @param Carbon      $hoy                Fecha actual (startOfDay).
     * @param Carbon      $inscripcionInicio   Fecha requerida: inicio de inscripciones.
     * @param Carbon|null $inscripcionFin      Fin de inscripciones.
     * @param Carbon|null $activoInicio        Inicio de clases.
     * @param Carbon|null $activoFin           Fin de clases.
     * @param Carbon|null $evaluacionInicio    Inicio de evaluación.
     * @param Carbon|null $evaluacionFin       Fin de evaluación.
     *
     * @return array<string, mixed> Contadores de auditoría.
     */
    private function actualizarGrupos(
        Carbon  $hoy,
        Carbon  $inscripcionInicio,
        ?Carbon $inscripcionFin,
        ?Carbon $activoInicio,
        ?Carbon $activoFin,
        ?Carbon $evaluacionInicio,
        ?Carbon $evaluacionFin,
    ): array {

        // ── Determinar el estado objetivo del día (única evaluación) ──────────
        // La cascada se evalúa de forma exclusiva: sólo un bloque se ejecuta.
        $estadoObjetivo = $this->determinarEstadoObjetivo(
            $hoy,
            $inscripcionInicio,
            $inscripcionFin,
            $activoInicio,
            $activoFin,
            $evaluacionInicio,
            $evaluacionFin
        );

        // ── Un único bulk update, scoped por tipo de grupo ────────────────────
        // Delegamos a la Action dedicada para manejar DB transactions y Observers.
        $action = app(\App\Actions\System\UpdateGroupsStatusAction::class);
        $metrics = $action->execute($estadoObjetivo, self::TIPOS_CON_CALENDARIO_GLOBAL);

        return [
            'grupos_reg_estado_objetivo' => $metrics['targetStatus'],
            'grupos_reg_mutated'         => $metrics['mutated'],
            'grupos_reg_skipped'         => $metrics['skipped'],
        ];
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Grupos Especiales — Programa Egresados (Aislamiento por Tipo)
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Aplica la misma cascada cronológica continua pero de forma estrictamente
     * aislada a los cursos de Programa de Egresados (PE).
     *
     * @return array<string, mixed> Contadores de auditoría.
     */
    private function actualizarProgramaEgresados(
        Carbon  $hoy,
        ?Carbon $inscripcionInicio,
        ?Carbon $inscripcionFin,
        ?Carbon $activoInicio,
        ?Carbon $activoFin,
        ?Carbon $evaluacionInicio,
        ?Carbon $evaluacionFin,
    ): array {
        if (! $inscripcionInicio) {
            return [
                'grupos_pe_estado_objetivo' => 'sin_fechas_base',
                'grupos_pe_mutated'         => 0,
                'grupos_pe_skipped'         => 0,
            ];
        }

        $estadoObjetivo = $this->determinarEstadoObjetivo(
            $hoy,
            $inscripcionInicio,
            $inscripcionFin,
            $activoInicio,
            $activoFin,
            $evaluacionInicio,
            $evaluacionFin
        );

        // Delegamos a la Action dedicada
        $action = app(\App\Actions\System\UpdateGroupsStatusAction::class);
        $metrics = $action->execute($estadoObjetivo, [GroupType::PROGRAMA_EGRESADOS->value]);

        return [
            'grupos_pe_estado_objetivo' => $metrics['targetStatus'],
            'grupos_pe_mutated'         => $metrics['mutated'],
            'grupos_pe_skipped'         => $metrics['skipped'],
        ];
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Exámenes — Evaluación Híbrida (Global + Unitaria por Instancia)
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Actualiza el estado de los exámenes con estrategia en dos fases:
     *
     * FASE 1 — Estado Global (Settings):
     *   Determina un `$targetExamGlobalStatus` usando la misma lógica cronológica
     *   continua que los grupos, pero evaluando las fechas de exámenes.
     *   Aplica el bulk update EXCLUYENDO los exámenes que se aplican HOY
     *   (para no pisar su estado ACTIVE en la Fase 2).
     *
     * FASE 2 — Estado Unitario por Instancia (mayor precedencia):
     *   Los exámenes cuyo `start_date <= hoy <= end_date` pasan a ACTIVE,
     *   independientemente del estado global. Esto respeta el calendario
     *   específico de cada examen individual.
     *
     * @return array<string, mixed> Contadores de auditoría.
     */
    private function actualizarExamenes(
        Carbon  $hoy,
        ?Carbon $inscripcionInicio,
        ?Carbon $inscripcionFin,
        ?Carbon $evaluacionInicio,
        ?Carbon $evaluacionFin,
    ): array {
        $contadores = [
            'examenes_estado_global_objetivo' => 'sin_configurar',
            'examenes_mutated_to_active'      => 0,
            'examenes_mutated_to_global'      => 0,
            'examenes_skipped'                => 0,
        ];

        // ── Fase 1: Determine el estado global de exámenes ────────────────────
        // Solo se ejecuta si al menos la fecha de inicio de inscripción existe.
        $estadoGlobal = null;
        if ($inscripcionInicio) {
            $estadoGlobal = match (true) {
                $evaluacionFin && $hoy->gt($evaluacionFin) => AcademicStatus::COMPLETED,
                $evaluacionInicio && $evaluacionFin && $hoy->between($evaluacionInicio, $evaluacionFin) => AcademicStatus::GRADING,
                $inscripcionFin && $hoy->gt($inscripcionFin) && $evaluacionInicio && $hoy->lt($evaluacionInicio) => AcademicStatus::PENDING,
                $inscripcionInicio && $inscripcionFin && $hoy->between($inscripcionInicio, $inscripcionFin) => AcademicStatus::ENROLLING,
                default => AcademicStatus::PENDING,
            };
        }

        // Delegamos la validación de Fases y actualización a la Action dedicada
        $action = app(\App\Actions\System\UpdateExamsStatusAction::class);
        $metrics = $action->execute($estadoGlobal);

        return [
            'examenes_estado_global_objetivo' => $metrics['targetStatus'],
            'examenes_mutated_to_active'      => $metrics['mutated_to_active'],
            'examenes_mutated_to_global'      => $metrics['mutated_to_global'],
            'examenes_skipped'                => $metrics['skipped'],
        ];
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Utilidades Internas
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Determina el estado objetivo resolviendo jerárquicamente las fechas.
     */
    private function determinarEstadoObjetivo(
        Carbon $hoy,
        ?Carbon $inscripcionInicio,
        ?Carbon $inscripcionFin,
        ?Carbon $activoInicio,
        ?Carbon $activoFin,
        ?Carbon $evaluacionInicio,
        ?Carbon $evaluacionFin
    ): AcademicStatus {
        return match (true) {
            $evaluacionFin && $hoy->gt($evaluacionFin) => AcademicStatus::COMPLETED,
            $evaluacionInicio && $evaluacionFin && $hoy->between($evaluacionInicio, $evaluacionFin) => AcademicStatus::GRADING,
            $activoFin && $hoy->gt($activoFin) && $evaluacionInicio && $hoy->lt($evaluacionInicio) => AcademicStatus::ACTIVE,
            $activoInicio && $activoFin && $hoy->between($activoInicio, $activoFin) => AcademicStatus::ACTIVE,
            $inscripcionFin && $hoy->gt($inscripcionFin) && $activoInicio && $hoy->lt($activoInicio) => AcademicStatus::PENDING,
            $inscripcionInicio && $inscripcionFin && $hoy->between($inscripcionInicio, $inscripcionFin) => AcademicStatus::ENROLLING,
            default => AcademicStatus::PENDING,
        };
    }

    /**
     * Parsea un string de fecha a Carbon de forma null-safe (startOfDay).
     *
     * Siempre ajusta la hora a 00:00:00 para que las comparaciones de rangos
     * sean consistentes. Las fechas de fin se comparan con `lte()` (<=),
     * que incluye todo el día sin necesidad de `endOfDay()`.
     *
     * @param  string|null $valor  Valor raw del setting (ej. '2026-08-01') o null.
     * @return Carbon|null         Instancia Carbon o null si el valor está vacío.
     */
    private function parsearFecha(?string $valor): ?Carbon
    {
        if (empty($valor)) {
            return null;
        }

        return Carbon::parse($valor)->startOfDay();
    }
}
