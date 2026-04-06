<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Teacher extends Model
{
    use HasFactory, SoftDeletes;

    protected $appends = ['full_name'];
    protected $fillable = [
        'user_id',
        'first_name',
        'last_name',
        'category',
        'level',
        'rfc',
        'curp',
        'clabe',
        'ttc_hours',
        'bank_name',
        'grade',
        'is_native',
    ];

    /**
     * Accessor moderno para el nombre completo.
     * Uso: $teacher->full_name
     */
    protected function fullName(): Attribute
    {
        return Attribute::make(
            get: fn() => "{$this->first_name} {$this->last_name}",
        );
    }

    // Relaciones
    public function groups(): HasMany
    {
        return $this->hasMany(Group::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
