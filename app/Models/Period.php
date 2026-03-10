<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Period extends Model
{
    //
    public $timestamps = false;

    protected $fillable = [
        'name',
        'start',
        'end',
        'is_active',
    ];

    public function groups(): HasMany
    {
        return $this->hasMany(Group::class);
    }
}
