<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Period extends Model
{
    use HasFactory;
    public $timestamps = false;

    protected $fillable = [
        'name',
        'start_date',
        'end_date',
        'start',
        'end',
        'is_active',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
    ];

    public function getStartAttribute(): ?string
    {
        return $this->start_date?->toDateString();
    }

    public function setStartAttribute($value): void
    {
        $this->attributes['start_date'] = $value;
    }

    public function getEndAttribute(): ?string
    {
        return $this->end_date?->toDateString();
    }

    public function setEndAttribute($value): void
    {
        $this->attributes['end_date'] = $value;
    }

    public function groups(): HasMany
    {
        return $this->hasMany(Group::class);
    }
}
