<?php

namespace App\Console\Commands;

use App\Models\Student;
use App\Enums\StudentStatus;
use Illuminate\Console\Command;

class UpdateStudentStatus extends Command
{
    protected $signature = 'update:student-status {--from= : Estado origen} {--to= : Estado destino} {--dry-run : Solo mostrar cambios}';

    protected $description = 'Actualiza el estado de estudiantes';

    public function handle(): int
    {
        $from = $this->option('from') ?? 'waiting';
        $to = $this->option('to') ?? 'current';
        $dryRun = (bool) $this->option('dry-run');

        try {
            $fromEnum = StudentStatus::tryFrom($from);
            $toEnum = StudentStatus::tryFrom($to);

            if (!$fromEnum || !$toEnum) {
                $this->error("Estados no válidos. Opciones válidas:");
                foreach (StudentStatus::cases() as $case) {
                    $this->line("  - {$case->value}");
                }
                return 1;
            }

            $count = Student::where('status', $fromEnum)->count();

            if ($count === 0) {
                $this->info("No hay estudiantes con estado '{$from}'");
                return 0;
            }

            $this->info("Se encontraron {$count} estudiante(s) con estado '{$from}'");

            if ($dryRun) {
                $this->info("[DRY-RUN] Se cambiarían {$count} estudiante(s) a '{$to}'");
                return 0;
            }

            $updated = Student::where('status', $fromEnum)->update(['status' => $toEnum]);

            $this->info("✓ {$updated} estudiante(s) actualizados a '{$to}'");

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error("Error: " . $e->getMessage());
            return 1;
        }
    }
}
