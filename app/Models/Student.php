<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Enums\StudentStatus;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Student extends Model
{
    use HasFactory, SoftDeletes;

    protected $appends = ['full_name'];

    protected $fillable = [
        'user_id',
        'first_name',
        'last_name',
        'num_control',
        'gender',
        'birthdate',
        'semester',
        'status',
        'degree_id',
        'type_student_id',
        'level_id',
        'accreditation_source',
        'accreditation_date',
    ];

    protected function casts(): array
    {
        return [
            'status' => StudentStatus::class,
            'accreditation_date' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

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
        return abs((int) (now()->diffInYears($this->birthdate)));
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function scopeSearch($query, $searchTerm): void
    {
        if ($searchTerm) {
            $query->where(function ($q) use ($searchTerm) {
                $q->where('first_name', 'like', "%{$searchTerm}%")
                    ->orWhere('last_name', 'like', "%{$searchTerm}%")
                    ->orWhere('num_control', 'like', "%{$searchTerm}%");
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
            $query->where('level_id', $levelId);
        }
    }

    public function scopeFilterBySemester($query, $semester): void
    {
        if ($semester) {
            $query->where('semester', $semester);
        }
    }

    /** Exámenes en los que está inscrito el alumno (many-to-many con pivot de calificación). */
    public function exams(): BelongsToMany
    {
        return $this->belongsToMany(Exam::class, 'exam_student')
            ->withPivot('calificacion', 'units_breakdown', 'final_average')
            ->withTimestamps();
    }
}
