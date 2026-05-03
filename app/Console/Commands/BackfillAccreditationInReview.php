<?php

namespace App\Console\Commands;

use App\Enums\StudentStatus;
use App\Models\Student;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class BackfillAccreditationInReview extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'saacle:backfill-accreditations-in-review {--dry-run : Solo mostrar cambios sin persistir}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Backfill de alumnos aprobados para moverlos a En Revisión con origen y periodo de acreditación';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');

        $this->info($dryRun
            ? 'Iniciando backfill en modo simulacion (--dry-run)...'
            : 'Iniciando backfill real de acreditaciones...');

        $processed = 0;
        $updated = 0;
        $skipped = 0;

        Student::query()
            ->with([
                'exams.period',
                'qualifications.group.level',
                'qualifications.group.period',
            ])
            ->whereNotIn('status', [StudentStatus::ACCREDITED, StudentStatus::RELEASED])
            ->chunkById(200, function ($students) use ($dryRun, &$processed, &$updated, &$skipped) {
                foreach ($students as $student) {
                    $processed++;

                    $candidate = $this->resolveLatestAccreditationCandidate($student);
                    if ($candidate === null) {
                        $skipped++;
                        continue;
                    }

                    $needsUpdate = $student->status !== StudentStatus::IN_REVIEW
                        || $student->accreditation_source !== $candidate['source']
                        || (string) optional($student->accreditation_date)->format('Y-m-d H:i:s') !== $candidate['date']->format('Y-m-d H:i:s');

                    if (!$needsUpdate) {
                        $skipped++;
                        continue;
                    }

                    if (!$dryRun) {
                        $student->update([
                            'status' => StudentStatus::IN_REVIEW,
                            'accreditation_source' => $candidate['source'],
                            'accreditation_date' => $candidate['date'],
                        ]);
                    }

                    $updated++;
                }
            });

        $this->line('');
        $this->info('Backfill finalizado.');
        $this->line("Procesados: {$processed}");
        $this->line("Actualizados: {$updated}");
        $this->line("Sin cambios: {$skipped}");

        return self::SUCCESS;
    }

    private function resolveLatestAccreditationCandidate(Student $student): ?array
    {
        $candidates = [];

        foreach ($student->qualifications as $qualification) {
            if (!is_numeric($qualification->final_average) || $qualification->final_average < 70 || $qualification->is_left) {
                continue;
            }

            $source = $this->resolveGroupSource((string) ($qualification->group?->level?->level_tecnm ?? ''));
            if ($source === null) {
                continue;
            }

            $date = $this->resolvePeriodEndDate($qualification->group?->period?->end);
            $candidates[] = [
                'source' => $source,
                'date' => $date,
            ];
        }

        foreach ($student->exams as $exam) {
            if (!$this->isApprovedExamResult($exam->pivot)) {
                continue;
            }

            $examType = trim((string) ($exam->exam_type->value ?? $exam->exam_type));
            if ($this->isPlacementOrUbication($examType)) {
                continue;
            }

            $candidates[] = [
                'source' => Str::of($examType)->title()->toString(),
                'date' => $this->resolvePeriodEndDate($exam->period?->end),
            ];
        }

        if (empty($candidates)) {
            return null;
        }

        usort($candidates, fn($a, $b) => $b['date']->timestamp <=> $a['date']->timestamp);

        return $candidates[0];
    }

    private function resolveGroupSource(string $levelName): ?string
    {
        $normalized = Str::of($levelName)->lower()->ascii()->squish()->toString();

        if ($normalized === 'intermedio 5') {
            return 'Cursos regulares';
        }

        if ($normalized === 'programa de egresados' || $normalized === 'programa egresados') {
            return 'Programa de egresados';
        }

        return null;
    }

    private function isPlacementOrUbication(string $examType): bool
    {
        $normalized = Str::of($examType)->lower()->ascii()->toString();

        return str_contains($normalized, 'ubicacion') || str_contains($normalized, 'placement');
    }

    private function resolvePeriodEndDate(null|string|Carbon $periodEnd): Carbon
    {
        if ($periodEnd instanceof Carbon) {
            return $periodEnd;
        }

        if (is_string($periodEnd) && trim($periodEnd) !== '') {
            return Carbon::parse($periodEnd);
        }

        return now();
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
}
