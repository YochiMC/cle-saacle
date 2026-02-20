<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Student extends Model
{

    protected $fillable = [
        'firstName',
        'lastName',
        'numControl',
        'gender',
        'birthDate',
        'semester',
        'degree_id',
        'type_student_id',
        'level',
    ];

    public function degree(): BelongsTo
    {
        return $this->belongsTo(Degree::class);
    }

    public function typeStudent(): BelongsTo
    {
        return $this->belongsTo(TypeStudent::class);
    }
}
