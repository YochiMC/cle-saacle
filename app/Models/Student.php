<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Student extends Model
{
    use HasFactory;
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

    public function level(): BelongsTo
    {
        return $this->belongsTo(Level::class);
    }

    public function qualifications(): HasMany
    {
        return $this->hasMany(Qualification::class);
    }

    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }

    public function getAgeAttribute(): int
    {
        return now()->diffInYears($this->birthDate);
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->firstName} {$this->lastName}";
    }

    public function scopeSearch($query, $searchTerm): void
    {
        if($searchTerm) {
        $query->where(function ($q) use ($searchTerm) {
            $q->where('firstName', 'like', "%{$searchTerm}%")
                ->orWhere('lastName', 'like', "%{$searchTerm}%")
                ->orWhere('numControl', 'like', "%{$searchTerm}%");
        });
        }
    }

    public function scopeFilterByDegree($query, $degreeId): void
    {
        if ($degreeId) {
            $query->where('degree_id', $degreeId);
        }
    }

    public function scopeFilterByLevel($query, $levelId): void
    {
        if ($levelId) {
            $query->where('level', $levelId);
        }
    }

    public function scopeFilterBySemester($query, $semester): void
    {
        if ($semester) {
            $query->where('semester', $semester);
        }
    }

}
