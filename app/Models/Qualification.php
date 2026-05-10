<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Qualification extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'units_breakdown',
        'final_average',
        'is_left',
        'attempt',
        'student_id',
        'group_id'
    ];

    protected $casts = [
        'units_breakdown' => 'array',
        'attempt' => \App\Enums\AttemptEnum::class,
    ];

    /**
     * Atributos calculados agregados a la serialización JSON.
     */
    protected $appends = ['is_approved'];

    /**
     * Determina dinámicamente si la calificación es aprobatoria.
     * Basado en la normativa institucional: promedio >= 70.
     */
    protected function isApproved(): Attribute
    {
        return Attribute::make(
            get: fn () => is_numeric($this->final_average) && (float) $this->final_average >= 70 && !$this->is_left
        );
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function group()
    {
        return $this->belongsTo(Group::class);
    }
}
