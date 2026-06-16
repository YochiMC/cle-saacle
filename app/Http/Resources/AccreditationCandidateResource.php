<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class AccreditationCandidateResource extends JsonResource
{
    /**
     * Transforma el recurso a un arreglo para la vista de tabla dinámica.
     */
    public function toArray(Request $request): array
    {
        $latestExam = $this->latestEligibleExam();
        $latestGroupQualification = $this->latestEligibleGroupQualification();

        $examPeriodEnd = $this->toCarbon($latestExam?->period?->end);
        $groupPeriodEnd = $this->toCarbon($latestGroupQualification?->group?->period?->end);

        $achievedBy = 'No determinado';
        $obtainedAt = 'N/A';

        // Determinamos cuál es el logro más reciente
        if ($examPeriodEnd && $groupPeriodEnd) {
            if ($examPeriodEnd->greaterThanOrEqualTo($groupPeriodEnd)) {
                $achievedBy = $this->formatExamSource($latestExam);
                $obtainedAt = $this->resolveExamPeriodLabel($latestExam);
            } else {
                $achievedBy = $this->formatGroupSource($latestGroupQualification);
                $obtainedAt = $this->resolveGroupPeriodLabel($latestGroupQualification);
            }
        } elseif ($examPeriodEnd) {
            $achievedBy = $this->formatExamSource($latestExam);
            $obtainedAt = $this->resolveExamPeriodLabel($latestExam);
        } elseif ($groupPeriodEnd) {
            $achievedBy = $this->formatGroupSource($latestGroupQualification);
            $obtainedAt = $this->resolveGroupPeriodLabel($latestGroupQualification);
        }

        return [
            'id'             => $this->id,
            'user_id'        => $this->user_id,
            'full_name'      => $this->full_name,
            'num_control'    => $this->num_control,
            'status'         => $this->status,
            'status_label'   => $this->status->label(),
            'achieved_by'    => $achievedBy,
            'obtained_at'    => $obtainedAt,
            'period_ids'     => array_values(array_unique(array_merge(
                $this->exams->pluck('period_id')->filter()->toArray(),
                $this->qualifications->pluck('group.period_id')->filter()->toArray()
            ))),
        ];
    }

    public function latestEligibleExam(): mixed
    {
        return $this->exams
            ->filter(function ($exam) {
                if (!$this->isApprovedExamResult($exam->pivot)) {
                    return false;
                }

                $normalizedType = Str::of((string) ($exam->exam_type->value ?? $exam->exam_type))
                    ->lower()
                    ->ascii()
                    ->toString();

                return !str_contains($normalizedType, 'ubicacion')
                    && !str_contains($normalizedType, 'placement');
            })
            ->sortByDesc(function ($exam) {
                return $this->toCarbon($exam->period?->end)?->timestamp ?? 0;
            })
            ->first();
    }

    public function latestEligibleGroupQualification(): mixed
    {
        return $this->qualifications
            ->filter(function ($qualification) {
                if (!is_numeric($qualification->final_average) || $qualification->final_average < 70 || $qualification->is_left) {
                    return false;
                }

                return $this->resolveGroupSourceByLevel($qualification->group?->level?->level_tecnm) !== null;
            })
            ->sortByDesc(function ($qualification) {
                return $this->toCarbon($qualification->group?->period?->end)?->timestamp ?? 0;
            })
            ->first();
    }

    private function formatGroupSource($qualification): string
    {
        $source = $this->resolveGroupSourceByLevel($qualification?->group?->level?->level_tecnm);
        return $source ?? 'No determinado';
    }

    private function formatExamSource($exam): string
    {
        if (!$exam) {
            return 'No determinado';
        }

        $type = trim((string) ($exam->exam_type->value ?? $exam->exam_type));
        return Str::of($type)->title()->toString();
    }


    private function resolveGroupSourceByLevel(?string $levelName): ?string
    {
        if (!$levelName) {
            return null;
        }

        $normalized = Str::of($levelName)->lower()->ascii()->squish()->toString();

        if (in_array($normalized, ['intermedio 5', 'curso remedial']) || str_contains($normalized, 'remedial')) {
            return 'Cursos regulares';
        }

        if (in_array($normalized, ['programa especial', 'programa de egresados', 'programa egresados'])) {
            return 'Programa especial';
        }

        return null;
    }

    private function toCarbon(null|string|Carbon $value): ?Carbon
    {
        if ($value instanceof Carbon) {
            return $value;
        }

        if (is_string($value) && trim($value) !== '') {
            return Carbon::parse($value);
        }

        return null;
    }

    private function isApprovedExamResult($pivot): bool
    {
        $units = $this->extractUnitsBreakdown($pivot);

        // 1. Caso: Convalidación (verifica nivel MCER priorizando la llave speaking)
        $level = data_get($units, 'speaking') ?? data_get($units, 'certified_level') ?? data_get($units, 'nivel_certificado');
        if ($level) {
            $normalizedLevel = Str::upper(trim((string) $level));
            if (in_array($normalizedLevel, ['B1', 'B2', 'C1', 'C2'], true)) {
                return true;
            }
        }

        // 2. Caso: Examen de 4 habilidades (verifica que las 4 áreas sean >= 70)
        $hasFourSkills = array_key_exists('listening', $units)
            && array_key_exists('reading', $units)
            && array_key_exists('writing', $units)
            && array_key_exists('speaking', $units);

        if ($hasFourSkills) {
            $skills = ['listening', 'reading', 'writing', 'speaking'];
            foreach ($skills as $skill) {
                $val = data_get($units, $skill);
                if (!is_numeric($val) || (float) $val < 70) {
                    return false;
                }
            }
            return true;
        }

        // 3. Fallback: Promedios o calificaciones numéricas generales >= 70 (Planes anteriores, etc.)
        $numericCandidates = [
            $pivot->final_average ?? null,
            $pivot->calificacion ?? null,
            data_get($units, 'calificacion_final'),
            data_get($units, 'promedio'),
            data_get($units, 'promedio_habilidades'),
        ];

        foreach ($numericCandidates as $candidate) {
            if (is_numeric($candidate) && (float) $candidate >= 70) {
                return true;
            }
        }

        return false;
    }

    private function extractUnitsBreakdown($pivot): array
    {
        $units = $pivot->units_breakdown ?? [];

        if (is_array($units)) {
            return $units;
        }

        if (is_string($units) && trim($units) !== '') {
            $decoded = json_decode($units, true);
            return is_array($decoded) ? $decoded : [];
        }

        return [];
    }

    private function resolveExamPeriodLabel($exam): ?string
    {
        $periodName = trim((string) ($exam?->period?->name ?? ''));
        if ($periodName !== '') {
            return $periodName;
        }

        return $this->toCarbon($exam?->period?->end)?->format('d/m/Y');
    }

    private function resolveGroupPeriodLabel($qualification): ?string
    {
        $periodName = trim((string) ($qualification?->group?->period?->name ?? ''));
        if ($periodName !== '') {
            return $periodName;
        }

        return $this->toCarbon($qualification?->group?->period?->end)?->format('d/m/Y');
    }
}
