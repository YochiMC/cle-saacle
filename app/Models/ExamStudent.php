<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
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
        'units_breakdown',
        'final_average',
        'is_left',
        'attempt',
    ];

    /**
     * Convierte units_breakdown de JSON a arreglo PHP automáticamente.
     */
    protected $casts = [
        'units_breakdown' => 'array',
        'attempt' => \App\Enums\AttemptEnum::class,
        'is_left' => 'boolean',
    ];

    /**
     * Atributos calculados agregados a la serialización JSON.
     */
    protected $appends = ['is_approved'];

    /**
     * Determina dinámicamente si la calificación es aprobatoria.
     */
    protected function isApproved(): Attribute
    {
        return Attribute::make(
            get: fn () => is_numeric($this->final_average) && (float) $this->final_average >= 70 && !$this->is_left
        );
    }
}
