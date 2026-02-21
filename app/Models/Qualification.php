<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Qualification extends Model
{
    //
    protected $fillable = [
        'unid1',
        'unid2',
        'finalAverage',
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
