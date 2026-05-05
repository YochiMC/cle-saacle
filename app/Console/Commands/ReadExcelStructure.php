<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ReadExcelStructure extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:read-excel-structure';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Lee la estructura del archivo Excel de estudiantes';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $file = 'C:\Users\Felipao\Downloads\para_migrar_hyperclean.xlsx';

        if (!file_exists($file)) {
            $this->error("Archivo no encontrado: $file");
            return 1;
        }

        try {
            $spreadsheet = IOFactory::load($file);
            $sheet = $spreadsheet->getActiveSheet();
            $rows = $sheet->toArray();

            $this->info("=== ESTRUCTURA DEL ARCHIVO EXCEL ===\n");

            // Headers
            $this->line("Columnas encontradas:");
            foreach ($rows[0] as $index => $header) {
                $this->line("  [{$index}] {$header}");
            }

            // Primeros registros
            $this->line("\n\nPrimeros 3 registros de datos:");
            for ($i = 1; $i <= min(3, count($rows) - 1); $i++) {
                $this->line("\n--- Registro {$i} ---");
                foreach ($rows[0] as $index => $header) {
                    $value = $rows[$i][$index] ?? 'NULL';
                    $this->line("  {$header}: {$value}");
                }
            }

            $this->info("\n\nTotal de registros: " . (count($rows) - 1));
        } catch (\Exception $e) {
            $this->error("Error al leer el archivo: " . $e->getMessage());
            return 1;
        }

        return 0;
    }
}
