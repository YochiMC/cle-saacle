<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Qualification extends Model
{
    //
    use HasFactory, SoftDeletes;
    protected $fillable = [
        'units_breakdown',
        'final_average',
        'is_approved',
        'is_left',
        'student_id',
        'group_id'
    ];

    protected $casts = [
        'units_breakdown' => 'array',
        'final_average' => 'decimal:2',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function group()
    {
        return $this->belongsTo(Group::class);
    }
}
