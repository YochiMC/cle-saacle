<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Service extends Model
{
    //
    protected $fillable = [
        'type',
        'amount',
        'status',
        'description',
        'referenceNumber',
        'receiptURL',
        'student_id'
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
}
