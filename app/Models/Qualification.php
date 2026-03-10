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
        'unit_1',
        'unit_2',
        'is_approved',
        'is_left',
        'student_id',
        'group_id'
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
