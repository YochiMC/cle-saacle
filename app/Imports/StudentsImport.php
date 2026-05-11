<?php

namespace App\Imports;

use App\Actions\CreateStudentWithUser;
use App\Enums\TypeStudent;
use App\Models\Student;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Validation\Rules\Enum;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Validators\Failure;
use PhpOffice\PhpSpreadsheet\Shared\Date as ExcelDate;

class StudentsImport implements ToCollection, WithHeadingRow, WithValidation, SkipsOnFailure, SkipsEmptyRows, WithChunkReading
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

            if (Student::withTrashed()->where('num_control', $data['num_control'])->exists()) {
                $this->skippedDuplicates++;

                continue;
            }

            app(CreateStudentWithUser::class)->execute($data);
            $this->importedRows++;
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function normalizeRow(Collection $row): array
    {
        return [
            'first_name' => trim((string) $row->get('first_name', '')),
            'last_name' => trim((string) $row->get('last_name', '')),
            'num_control' => trim((string) $row->get('num_control', '')),
            'gender' => strtoupper(trim((string) $row->get('gender', ''))),
            'birthdate' => $this->normalizeDate($row->get('birthdate')),
            'semester' => $this->nullableInt($row->get('semester')),
            'degree_id' => $this->nullableInt($row->get('degree_id')),
            'type_student' => $this->nullableString($row->get('type_student')),
            'level_id' => $this->nullableInt($row->get('level_id')),
            'email' => $this->nullableString($row->get('email')),
            'password' => $this->nullableString($row->get('password')),
            'phone' => $this->nullableString($row->get('phone')),
            'email_recovery' => $this->nullableString($row->get('email_recovery')),
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
     * @param mixed $value
     */
    private function nullableString(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $cleanValue = trim((string) $value);

        return $cleanValue === '' ? null : $cleanValue;
    }

    /**
     * @param mixed $value
     */
    private function normalizeDate(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        if (is_numeric($value)) {
            return ExcelDate::excelToDateTimeObject((float) $value)->format('Y-m-d');
        }

        try {
            return Carbon::parse((string) $value)->format('Y-m-d');
        } catch (\Throwable) {
            return null;
        }
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
            '*.first_name' => ['required', 'string', 'max:255'],
            '*.last_name' => ['required', 'string', 'max:255'],
            '*.num_control' => ['required', 'string', 'max:20'],
            '*.gender' => ['required', 'string', 'in:M,F'],
            '*.birthdate' => ['required', 'date'],
            '*.semester' => ['nullable', 'integer', 'min:0', 'max:13'],
            '*.degree_id' => ['required', 'exists:degrees,id'],
            '*.type_student' => ['required', new Enum(TypeStudent::class)],
            '*.level_id' => ['required', 'exists:levels,id'],
            '*.email' => ['nullable', 'string', 'email', 'max:255', 'unique:users,email'],
            '*.email_recovery' => ['nullable', 'string', 'email', 'max:255', 'unique:users,email_recovery'],
            '*.password' => ['nullable', 'string', 'min:8'],
            '*.phone' => ['nullable', 'string', 'max:20'],
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
