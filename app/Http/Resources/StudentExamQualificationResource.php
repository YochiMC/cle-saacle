<?php

namespace App\Http\Resources;

use App\Models\Exam;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource API para transformar los datos de un Estudiante inscrito a un Examen,
 * aplanando su calificación dinámica desde la relación pivot (exam_student).
 *
 * Análogo a StudentQualificationResource (Grupos), adaptado al pivot de Exámenes.
 * Sigue el Principio de Responsabilidad Única (SRP): toda la lógica de
 * transformación — incluyendo la resiliencia ante datos legacy — queda aquí,
 * fuera del controlador y la vista.
 */
class StudentExamQualificationResource extends JsonResource
{
    public static $wrap = null;

    /**
     * Transforma el recurso en un arreglo.
     *
     * Resiliencia ante datos legacy: alumnos inscritos antes del refactor
     * pueden tener units_breakdown nulo o con esquema antiguo (ej: {"calificacion": 0}).
     * En ese caso, se obtiene la estructura correcta desde el ExamType del examen
     * y se fusiona para garantizar que el frontend siempre reciba todas las columnas.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // El pivot viene cargado automáticamente por la relación BelongsToMany.
        $pivot = $this->pivot ?? null;

        // ── Resiliencia de Datos Legacy ──────────────────────────────────────────
        $storedBreakdown = $pivot?->units_breakdown;  // ya decodificado por el Cast del modelo

        // Determinamos si el breakdown almacenado es válido para este ExamType.
        // Es inválido si: (a) es nulo, (b) es vacío, (c) le faltan las claves del tipo.
        $unitsBreakdown = $this->resolveUnitsBreakdown($pivot, $storedBreakdown);

        $baseData = [
            // ── Datos básicos del alumno ─────────────────────────────────────
            'id'        => $this->id,
            'full_name' => $this->full_name,
            'matricula' => $this->num_control,
            'gender'    => $this->gender,
            'semester'  => $this->semester,

            // ── Datos del pivot (exam_student) ───────────────────────────────
            // ID del registro pivot necesario para bulkUpdate por PK.
            'exam_student_id' => $pivot?->id ?? null,

            // Estructura garantizada: nunca faltarán columnas en el frontend.
            'units_breakdown' => $unitsBreakdown,

            'final_average'   => $pivot?->final_average ?? 0,
        ];

        return array_merge($baseData, $unitsBreakdown);
    }

    /**
     * Determina el units_breakdown correcto para este alumno.
     *
     * Si el dato almacenado es válido (no nulo, no vacío, y contiene al menos
     * una clave que pertenece al esquema del ExamType), se usa directamente.
     * De lo contrario, se genera el esquema por defecto del ExamType y se
     * fusionan los datos reales encima, preservando valores ya capturados.
     *
     * @param  mixed       $pivot           Modelo pivot ExamStudent (puede ser null).
     * @param  mixed       $storedBreakdown JSON ya decodificado del pivot (o string crudo en datos legacy).
     * @return array       Breakdown garantizado con todas las claves del ExamType.
     */
    private function resolveUnitsBreakdown($pivot, mixed $storedBreakdown): array
    {
        // Sin pivot no hay nada que resolver — el alumno aún no tiene calificación.
        if ($pivot === null) {
            return [];
        }

        // Si viene como string crudo (dato legacy o fallo temporal de cast), lo decodificamos
        if (is_string($storedBreakdown)) {
            $storedBreakdown = json_decode($storedBreakdown, true);
        }

        // Aseguramos que sea un array por si decodificó a null o algo inesperado
        if (!is_array($storedBreakdown)) {
            $storedBreakdown = [];
        }

        // Obtenemos el examen para acceder a su ExamType y estructura esperada.
        $exam = Exam::find($pivot->exam_id);

        // Si no encontramos el examen o el tipo no puede resolverse, devolvemos
        // lo que tenemos (puede ser vacío, pero no crashea).
        if ($exam === null || $exam->exam_type === null) {
            return $storedBreakdown ?? [];
        }

        $defaultBreakdown = $exam->exam_type->defaultUnitsBreakdown();
        $expectedKeys     = array_keys($defaultBreakdown);

        // Validamos si el breakdown almacenado ya tiene el esquema correcto:
        // debe ser un array con al menos 1 clave que coincida con el esquema esperado.
        $isValidBreakdown = !empty($storedBreakdown)
            && count(array_intersect(array_keys($storedBreakdown), $expectedKeys)) > 0;

        if ($isValidBreakdown) {
            // Fusionamos: los valores reales sobreescriben los defaults.
            // Esto garantiza que si el ExamType agrega claves nuevas en el futuro
            // (ej: se añade "writing" a Convalidación), aparecerán con valor vacío
            // incluso en los registros viejos.
            return array_merge($defaultBreakdown, $storedBreakdown);
        }

        // Dato legacy o nulo → devolvemos solo la estructura por defecto.
        return $defaultBreakdown;
    }
}

