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
        $achievedBy = 'No determinado';
        $obtainedAt = null;

        $latestExam = $this->latestEligibleExam();
        $latestGroupQualification = $this->latestEligibleGroupQualification();

        $examPeriodEnd = $this->toCarbon($latestExam?->period?->end);
        $groupPeriodEnd = $this->toCarbon($latestGroupQualification?->group?->period?->end);
        $examPeriodLabel = $this->resolveExamPeriodLabel($latestExam);
        $groupPeriodLabel = $this->resolveGroupPeriodLabel($latestGroupQualification);

        $normalizedStoredSource = $this->normalizeStoredSource(
            $this->accreditation_source,
            $latestExam,
            $latestGroupQualification,
        );

        if ($normalizedStoredSource !== null) {
            $achievedBy = $normalizedStoredSource;

            if ($normalizedStoredSource === 'Cursos regulares' || $normalizedStoredSource === 'Programa de egresados') {
                $obtainedAt = $groupPeriodLabel;
            } else {
                $obtainedAt = $examPeriodLabel;
            }

            if (!$obtainedAt) {
                $obtainedAt = $this->accreditation_date?->format('d/m/Y');
            }
        }

        if (!$this->accreditation_source || !$this->accreditation_date) {
            if ($examPeriodEnd && $groupPeriodEnd) {
                if ($examPeriodEnd->greaterThan($groupPeriodEnd)) {
                    $achievedBy = $this->formatExamSource($latestExam);
                    $obtainedAt = $examPeriodLabel;
                } else {
                    $achievedBy = $this->formatGroupSource($latestGroupQualification);
                    $obtainedAt = $groupPeriodLabel;
                }
            } elseif ($examPeriodEnd) {
                $achievedBy = $this->formatExamSource($latestExam);
                $obtainedAt = $examPeriodLabel;
            } elseif ($groupPeriodEnd) {
                $achievedBy = $this->formatGroupSource($latestGroupQualification);
                $obtainedAt = $groupPeriodLabel;
            }
        }

        return [
            'id'             => $this->id,
            'user_id'        => $this->user_id,
            'full_name'      => $this->full_name,
            'num_control'    => $this->num_control,
            'status'         => $this->status,
            'status_label'   => $this->status->label(),
            'achieved_by'    => $achievedBy,
            'obtained_at'    => $obtainedAt ?? 'N/A',
        ];
    }

    private function latestEligibleExam(): mixed
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

    private function latestEligibleGroupQualification(): mixed
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

    private function normalizeStoredSource(?string $storedSource, $latestExam, $latestGroupQualification): ?string
    {
        if (!$storedSource) {
            return null;
        }

        $normalized = Str::of($storedSource)->lower()->ascii()->squish()->toString();

        if ($normalized === 'cursos regulares' || $normalized === 'programa de egresados') {
            return Str::of($storedSource)->trim()->toString();
        }

        if (str_starts_with($normalized, 'grupo:')) {
            return $this->formatGroupSource($latestGroupQualification);
        }

        if (str_starts_with($normalized, 'examen:') || str_starts_with($normalized, 'examen ')) {
            return $this->formatExamSource($latestExam);
        }

        if ($latestExam && Str::of($this->formatExamSource($latestExam))->lower()->ascii()->toString() === $normalized) {
            return $this->formatExamSource($latestExam);
        }

        return $storedSource;
    }

    private function resolveGroupSourceByLevel(?string $levelName): ?string
    {
        if (!$levelName) {
            return null;
        }

        $normalized = Str::of($levelName)->lower()->ascii()->squish()->toString();

        if ($normalized === 'intermedio 5') {
            return 'Cursos regulares';
        }

        if ($normalized === 'programa de egresados' || $normalized === 'programa egresados') {
            return 'Programa de egresados';
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

        $numericCandidates = [
            $pivot->final_average ?? null,
            $pivot->calificacion ?? null,
            data_get($units, 'calificacion_final'),
            data_get($units, 'promedio'),
        ];

        foreach ($numericCandidates as $candidate) {
            if (is_numeric($candidate) && (float) $candidate >= 70) {
                return true;
            }
        }

        $cefrCandidates = [
            data_get($units, 'promedio_habilidades'),
            data_get($units, 'nivel_certificado'),
            data_get($units, 'speaking'),
            data_get($units, 'listening'),
            data_get($units, 'reading'),
            data_get($units, 'writing'),
        ];

        foreach ($cefrCandidates as $candidate) {
            $value = Str::upper(trim((string) $candidate));
            if (in_array($value, ['B1', 'B2', 'C1', 'C2'], true)) {
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
