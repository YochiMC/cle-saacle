<?php

namespace App\Imports;

use App\Models\LegacyQualification;
use App\Models\Student;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Validators\Failure;

class QualificationsImport implements ToCollection, WithHeadingRow, WithValidation, SkipsOnFailure, SkipsEmptyRows, WithChunkReading
{
    /** @var array<int, Failure> */
    private array $validationFailures = [];

    private int $processedRows = 0;

    private int $importedRows = 0;

    private int $skippedDuplicates = 0;

    /**
     * @param Collection<int, Collection<string, mixed>> $rows
     */
    public function collection(Collection $rows): void
    {
        foreach ($rows as $row) {
            $data = $this->normalizeRow($row);

            if ($this->isEmptyRow($data)) {
                continue;
            }

            $this->processedRows++;

            // Obtener student_id desde num_control
            $student = Student::where('num_control', $data['num_control'])->first();
            if (! $student) {
                $this->validationFailures[] = new Failure(
                    $row->toBase()->keys()->search('num_control') + 1,
                    'num_control',
                    ['No existe alumno con num_control: ' . $data['num_control']]
                );
                continue;
            }

            // Verificar duplicado por (student_id + level_id + period)
            if (LegacyQualification::where('student_id', $student->id)
                ->where('level_id', $data['level_id'])
                ->where('period', $data['period'])
                ->exists()) {
                $this->skippedDuplicates++;
                continue;
            }

            LegacyQualification::create([
                'student_id' => $student->id,
                'level_id' => $data['level_id'],
                'period' => $data['period'],
                'final_grade' => $data['final_grade'],
            ]);

            $this->importedRows++;
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function normalizeRow(Collection $row): array
    {
        return [
            'num_control' => trim((string) $row->get('num_control', '')),
            'level_id' => $this->nullableInt($row->get('level_id')),
            'period' => trim((string) $row->get('period', '')),
            'final_grade' => $this->nullableInt($row->get('qualification')),
        ];
    }

    /**
     * @param mixed $value
     */
    private function nullableInt(mixed $value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }

        return (int) $value;
    }

    /**
     * @param array<string, mixed> $row
     */
    private function isEmptyRow(array $row): bool
    {
        return ! array_filter($row, static fn ($value) => $value !== null && $value !== '');
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            '*.num_control' => ['required', 'max:20'],
            '*.level_id' => ['required', 'integer', 'exists:levels,id'],
            '*.period' => ['required', 'string', 'max:255'],
            '*.qualification' => ['required', 'integer', 'min:0', 'max:100'],
        ];
    }

    public function onFailure(Failure ...$failures): void
    {
        $this->validationFailures = array_merge($this->validationFailures, $failures);
    }

    /**
     * @return array<int, Failure>
     */
    public function failures(): array
    {
        return $this->validationFailures;
    }

    public function getProcessedRows(): int
    {
        return $this->processedRows;
    }

    public function getImportedRows(): int
    {
        return $this->importedRows;
    }

    public function getSkippedDuplicates(): int
    {
        return $this->skippedDuplicates;
    }

    public function chunkSize(): int
    {
        return 500;
    }
}
