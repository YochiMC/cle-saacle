<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LegacyQualification extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'level_id',
        'period',
        'final_grade',
    ];

    protected function casts(): array
    {
        return [
            'final_grade' => 'integer',
        ];
    }

    /** Alumno al que pertenece esta calificación histórica. */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /** Nivel académico al que corresponde esta calificación histórica. */
    public function level(): BelongsTo
    {
        return $this->belongsTo(Level::class);
    }
}
