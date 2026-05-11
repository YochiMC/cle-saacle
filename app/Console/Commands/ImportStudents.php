<?php

namespace App\Console\Commands;

use App\Models\Student;
use App\Models\User;
use App\Enums\StudentStatus;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Spatie\Permission\Models\Role;
use App\Console\Commands\ConsoleProgress;

class ImportStudents extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:students {--file= : Ruta del archivo Excel (opcional)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Importa estudiantes desde un archivo Excel';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $file = $this->option('file') ?? 'C:\Users\Felipao\Downloads\para_migrar_hyperclean.xlsx';

        if (!file_exists($file)) {
            $this->error("Archivo no encontrado: $file");
            return 1;
        }

        try {
            $spreadsheet = IOFactory::load($file);
            $sheet = $spreadsheet->getActiveSheet();
            $rows = $sheet->toArray();

            // Obtener el rol 'student'
            $studentRole = Role::where('name', 'student')->first();
            if (!$studentRole) {
                $this->error("No existe el rol 'student' en la base de datos");
                return 1;
            }

            $this->info("=== INICIANDO IMPORTACIÓN DE ESTUDIANTES ===\n");
            $this->info("Total de registros en Excel: " . (count($rows) - 1));

            $imported = 0;
            $errors = 0;

            // Usar ConsoleProgress (wrapper local) para progreso y evitar advertencias del analizador
            $io = new ConsoleProgress($this->input, $this->output);
            $io->progressStart(count($rows) - 1);

            // Iterar desde la fila 1 (la 0 son headers)
            for ($i = 1; $i < count($rows); $i++) {
                try {
                    $row = $rows[$i];

                    // Mapear los datos del Excel
                    $data = [
                        'first_name' => $row[0] ?? null,
                        'last_name' => $row[1] ?? null,
                        'num_control' => $row[2] ?? null,
                        'gender' => $row[3] ?? null,
                        'birthdate' => $row[4] ?? null,
                        'semester' => $row[5] ?? null,
                        'degree_id' => $row[6] ?? null,
                        'type_student' => $row[7] ?? null,
                        'level_id' => $row[8] ?? null,
                        'email' => $row[9] ?? null,
                        'password' => $row[10] ?? null,
                        'phone' => $row[11] ?? null,
                        'email_recovery' => $row[12] ?? null,
                    ];

                    // Validaciones básicas
                    if (empty($data['email']) || empty($data['first_name']) || empty($data['last_name'])) {
                        $errors++;
                        $io->progressAdvance();
                        continue;
                    }

                    // Verificar si el usuario ya existe
                    $existingUser = User::where('email', $data['email'])->first();
                    if ($existingUser) {
                        // Solo crear el Student si no existe ya
                        $existingStudent = Student::where('user_id', $existingUser->id)->first();
                        if (!$existingStudent) {
                            Student::create([
                                'user_id' => $existingUser->id,
                                'first_name' => $data['first_name'],
                                'last_name' => $data['last_name'],
                                'num_control' => $data['num_control'],
                                'gender' => $data['gender'],
                                'birthdate' => $this->parseDate($data['birthdate']),
                                'semester' => $data['semester'],
                                'degree_id' => $data['degree_id'],
                                'type_student' => $data['type_student'],
                                'level_id' => $data['level_id'],
                                'status' => StudentStatus::CURRENT,
                            ]);
                        }
                        $imported++;
                        $io->progressAdvance();
                        continue;
                    }

                    // Crear nuevo usuario
                    $password = $data['password'] ?? \Illuminate\Support\Str::random(16);
                    $user = User::create([
                        'name' => $data['first_name'] . ' ' . $data['last_name'],
                        'email' => $data['email'],
                        'password' => Hash::make($password),
                        'phone' => $data['phone'],
                    ]);

                    // Asignar rol 'student'
                    $user->assignRole($studentRole);

                    // Crear registro de Student
                    Student::create([
                        'user_id' => $user->id,
                        'first_name' => $data['first_name'],
                        'last_name' => $data['last_name'],
                        'num_control' => $data['num_control'],
                        'gender' => $data['gender'],
                        'birthdate' => $this->parseDate($data['birthdate']),
                        'semester' => $data['semester'],
                        'degree_id' => $data['degree_id'],
                        'type_student' => $data['type_student'],
                        'level_id' => $data['level_id'],
                        'status' => StudentStatus::CURRENT,
                    ]);

                    $imported++;
                    $io->progressAdvance();
                } catch (\Exception $e) {
                    $errors++;
                    $io->progressAdvance();
                    // Continuar con el siguiente registro
                }
            }

            $io->progressFinish();

            $this->newLine();
            $this->info("=== IMPORTACIÓN COMPLETADA ===");
            $this->line("✓ Importados: {$imported}");
            $this->line("✗ Errores: {$errors}");

            return 0;
        } catch (\Exception $e) {
            $this->error("Error durante la importación: " . $e->getMessage());
            return 1;
        }
    }

    /**
     * Parsear fechas en diferentes formatos.
     */
    private function parseDate(string|null|\DateTime $dateString)
    {
        if (empty($dateString)) {
            return null;
        }

        // Si ya es un objeto DateTime/Carbon, devolverlo
        if ($dateString instanceof \DateTime) {
            return $dateString;
        }

        try {
            // Intentar parsear como ISO (YYYY-MM-DD)
            if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $dateString)) {
                return $dateString;
            }

            // Intentar parsear como DD/MM/YYYY
            if (preg_match('/^\d{2}\/\d{2}\/\d{4}$/', $dateString)) {
                $parts = explode('/', $dateString);
                return "{$parts[2]}-{$parts[1]}-{$parts[0]}";
            }

            return null;
        } catch (\Exception $e) {
            return null;
        }
    }
}
