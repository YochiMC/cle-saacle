<?php

namespace App\Console\Commands;

use App\Models\Student;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class VerifyImport extends Command
{
    protected $signature = 'verify:import';

    protected $description = 'Verifica la importación de estudiantes';

    public function handle()
    {
        $this->info("=== VERIFICACIÓN DE IMPORTACIÓN ===\n");

        $userCount = User::count();
        $studentCount = Student::count();
        $studentsWithRole = User::role('student')->count();

        $this->line("Total de Usuarios: {$userCount}");
        $this->line("Total de Estudiantes: {$studentCount}");
        $this->line("Usuarios con rol 'student': {$studentsWithRole}\n");

        $this->info("--- Últimos 3 estudiantes importados ---");
        $students = Student::latest()->take(3)->with('user')->get();
        foreach ($students as $i => $student) {
            $this->line("  {$i}. {$student->user->name} ({$student->num_control}) - {$student->user->email}");
        }

        $this->newLine();
        $this->info("--- Distribución por estado ---");
        $statuses = DB::table('students')
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        foreach ($statuses as $status) {
            $this->line("  - {$status->status}: {$status->count}");
        }

        $this->newLine();
        $this->info("--- Distribución por grado ---");
        $degrees = DB::table('students')
            ->join('degrees', 'students.degree_id', '=', 'degrees.id')
            ->select('degrees.name', DB::raw('count(*) as count'))
            ->groupBy('degrees.id', 'degrees.name')
            ->get();

        foreach ($degrees as $degree) {
            $this->line("  - {$degree->name}: {$degree->count}");
        }

        return 0;
    }
}
