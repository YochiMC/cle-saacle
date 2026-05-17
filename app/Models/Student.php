<?php

namespace App\Models;

use App\Enums\ServiceStatus;
use App\Enums\ServiceType;
use App\Enums\TypeStudent;
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
        'type_student',
        'level_id',
        'accreditation_source',
        'accreditation_date',
    ];

    /**
     * Atributos que deben ser casteados.
     * Se usa la propiedad `$casts` para mantener compatibilidad con Eloquent.
     * El tipo `StudentStatus::class` y `TypeStudent::class` permiten cast a enum.
     *
     * @var array<string,string>
     */
    protected $casts = [
        'status' => StudentStatus::class,
        'type_student' => TypeStudent::class,
        'accreditation_date' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function degree(): BelongsTo
    {
        return $this->belongsTo(Degree::class);
    }

    public function level(): BelongsTo
    {
        return $this->belongsTo(Level::class);
    }

    public function qualifications(): HasMany
    {
        return $this->hasMany(Qualification::class);
    }

    public function legacyQualifications(): HasMany
    {
        return $this->hasMany(LegacyQualification::class);
    }

    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }

    public function approvedServices(): HasMany
    {
        return $this->services()->where('status', ServiceStatus::APPROVED->value);
    }

    /**
     * @return array<int, string>
     */
    public function approvedServiceTypeValues(): array
    {
        return $this->approvedServices()
            ->get()
            ->map(function (Service $service) {
                return $service->type instanceof ServiceType
                    ? $service->type->value
                    : (string) $service->type;
            })
            ->filter()
            ->unique()
            ->values()
            ->all();
    }

    /**
     * @return array<int, string>
     */
    public function approvedCourseTypeValues(): array
    {
        $approvedTypeValues = $this->approvedServiceTypeValues();

        return array_values(array_filter(
            $approvedTypeValues,
            fn (string $serviceTypeValue) => ServiceType::tryFrom($serviceTypeValue)?->isCourse() ?? false
        ));
    }

    /**
     * @return array<int, string>
     */
    public function approvedExamTypeValues(): array
    {
        $approvedTypeValues = $this->approvedServiceTypeValues();

        return array_values(array_filter(
            $approvedTypeValues,
            fn (string $serviceTypeValue) => ServiceType::tryFrom($serviceTypeValue)?->isExam() ?? false
        ));
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
            ->withPivot('units_breakdown', 'final_average', 'is_left', 'attempt')
            ->withTimestamps();
    }

    /**
     * Determina si el estudiante puede transicionar a un nuevo estatus.
     *
     * Reglas aplicadas:
     * - Si el alumno está `ACCREDITED` o `DISABLED`, no puede volver a
     *   `ELIGIBLE_FOR_ENROLLMENT` por procesos automáticos (p.ej. aprobación de pago).
     *
     * @param StudentStatus|string $newStatus
     * @return bool
     */
    public function canTransitionTo(StudentStatus|string $newStatus): bool
    {
        $current = $this->status;
        $target = $newStatus instanceof StudentStatus ? $newStatus : StudentStatus::tryFrom($newStatus);

        if (! $target) {
            return false;
        }

        if (in_array($current, [StudentStatus::ACCREDITED, StudentStatus::DISABLED], true)
            && $target === StudentStatus::ELIGIBLE_FOR_ENROLLMENT) {
            return false;
        }

        return true;
    }
}
