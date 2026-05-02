<?php

namespace App\Console\Commands;

use App\Enums\AttemptEnum;
use App\Models\ExamStudent;
use App\Models\Qualification;
use Illuminate\Console\Command;

class MigrateAttemptDataCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:migrate-attempt-data';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migrate attempt data from units_breakdown JSON to the native attempt column and clean the JSON.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting migration of attempt data...');

        $this->migrateQualifications();
        $this->migrateExamStudents();

        $this->info('Migration completed successfully.');
    }

    /**
     * Migrate data for Group Qualifications.
     */
    private function migrateQualifications()
    {
        $qualifications = Qualification::all();
        $count = 0;

        foreach ($qualifications as $qualification) {
            $breakdown = $qualification->units_breakdown;
            if (!is_array($breakdown)) continue;

            $found = false;
            $value = null;

            // Check for legacy keys
            if (isset($breakdown['oportunidad'])) {
                $value = $breakdown['oportunidad'];
                unset($breakdown['oportunidad']);
                $found = true;
            } elseif (isset($breakdown['attempt'])) {
                $value = $breakdown['attempt'];
                unset($breakdown['attempt']);
                $found = true;
            }

            if ($found) {
                $qualification->attempt = $this->mapToEnum($value);
                $qualification->units_breakdown = $breakdown;
                $qualification->save();
                $count++;
            }
        }

        $this->info("Migrated {$count} Group Qualifications.");
    }

    /**
     * Migrate data for Exam Students.
     */
    private function migrateExamStudents()
    {
        $pivotRecords = ExamStudent::all();
        $count = 0;

        foreach ($pivotRecords as $record) {
            $breakdown = $record->units_breakdown;
            if (!is_array($breakdown)) continue;

            $found = false;
            $value = null;

            // Check for legacy keys
            if (isset($breakdown['oportunidad'])) {
                $value = $breakdown['oportunidad'];
                unset($breakdown['oportunidad']);
                $found = true;
            } elseif (isset($breakdown['attempt'])) {
                $value = $breakdown['attempt'];
                unset($breakdown['attempt']);
                $found = true;
            }

            if ($found) {
                $record->attempt = $this->mapToEnum($value);
                $record->units_breakdown = $breakdown;
                $record->save();
                $count++;
            }
        }

        $this->info("Migrated {$count} Exam Student pivot records.");
    }

    /**
     * Map string values to AttemptEnum cases.
     */
    private function mapToEnum($value): AttemptEnum
    {
        if (is_null($value)) return AttemptEnum::FIRST;

        $normalized = strtolower(trim($value));

        if ($normalized === 'segunda' || $normalized === 'second' || $normalized === '2') {
            return AttemptEnum::SECOND;
        }

        return AttemptEnum::FIRST;
    }
}
