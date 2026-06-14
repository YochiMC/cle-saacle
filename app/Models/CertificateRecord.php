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
        'signer_one_name',
        'signer_one_title',
        'signer_two_name',
        'signer_two_title',
        'status',
        'student_type',  // egresado | actual
    ];

    protected $casts = [
        'issued_at' => 'datetime',
        'promedio'  => 'float',
    ];

    /**
     * Scope para obtener el borrador o registro emitido más reciente.
     */
    public function scopeLatestActive($query)
    {
        return $query->whereIn('status', ['draft', 'issued'])
            ->orderBy('created_at', 'desc');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function generatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'generated_by');
    }
}
