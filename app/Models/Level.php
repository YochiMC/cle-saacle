<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Level extends Model
{
    //
    public $timestamps = false;

    protected $fillable = [
        'levelTecnm',
        'levelMCER',
        'hours',
    ];

    public function students(): HasMany
    {
        return $this->hasMany(Student::class);
    }

    public function groups(): HasMany
    {
        return $this->hasMany(Group::class);
    }
}
