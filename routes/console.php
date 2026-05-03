<?php

use App\Imports\StudentsImport;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('students:import {file : Ruta del archivo .xlsx/.csv} {--disk= : Disco de Storage opcional}', function (): int {
    $file = (string) $this->argument('file');
    $disk = $this->option('disk');
    $import = new StudentsImport();

    try {
        if ($disk) {
            Excel::import($import, $file, (string) $disk);
        } else {
            $path = is_file($file) ? $file : base_path($file);

            if (! is_file($path)) {
                $this->error("No se encontró el archivo: {$file}");

                return self::FAILURE;
            }

            Excel::import($import, $path);
        }
    } catch (\Throwable $e) {
        $this->error('La importación falló con una excepción.');
        $this->error($e->getMessage());

        return self::FAILURE;
    }

    $this->info('Importación de estudiantes finalizada.');
    $this->line('Filas procesadas: '.$import->getProcessedRows());
    $this->line('Filas importadas: '.$import->getImportedRows());
    $this->line('Duplicados omitidos (num_control): '.$import->getSkippedDuplicates());

    if ($import->failures() !== []) {
        $this->warn('Filas con errores de validación: '.count($import->failures()));

        foreach ($import->failures() as $failure) {
            $this->line('Fila '.$failure->row().' | '.$failure->attribute().' | '.implode(', ', $failure->errors()));
        }
    }

    return self::SUCCESS;
})->purpose('Importa estudiantes desde un Excel/CSV con encabezados');
Schedule::command('saacle:update-statuses')->dailyAt('01:00');
