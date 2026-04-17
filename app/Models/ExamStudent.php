<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

/**
 * Modelo Pivot explícito para la tabla exam_student.
 *
 * Se usa un modelo Pivot dedicado (en lugar del genérico de Eloquent) para
 * poder aplicar $casts a las columnas pivot — algo que no es posible sin él.
 */
class ExamStudent extends Pivot
{
    /**
     * Indica que esta tabla pivot SÍ tiene una PK autoincremental.
     * Requerido para poder hacer ExamStudent::where('id', ...) en el controlador.
     */
    public $incrementing = true;

    /**
     * Indica que esta tabla pivot sí usa timestamps.
     */
    public $timestamps = true;

    /**
     * Campos que pueden asignarse masivamente desde la tabla pivot.
     */
    protected $fillable = [
        'exam_id',
        'student_id',
        'calificacion',
        'units_breakdown',
        'final_average',
    ];

    /**
     * Convierte units_breakdown de JSON a arreglo PHP automáticamente.
     */
    protected $casts = [
        'units_breakdown' => 'array',
    ];
}
