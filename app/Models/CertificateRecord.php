<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CertificateRecord extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'student_id',
        'generated_by',
        'validation_code',
        'certificate_type',
        'student_name',
        'pronombre',
        'num_control',
        'carrera',
        'plan_estudios',
        'promedio',
        'periodo',
        'nivel',
        'no_oficio',
        'issued_at',
        'student_name_edited',
        'carrera_edited',
        'promedio_edited',
        'nivel_edited',
        'signer_one_name',
        'signer_one_title',
        'signer_two_name',
        'signer_two_title',
        'status',

    ];

    protected $casts = [
        'issued_at' => 'datetime',
        'promedio'  => 'float',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function generatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'generated_by');
    }
}
