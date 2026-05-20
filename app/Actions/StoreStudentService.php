<?php

namespace App\Actions;

use App\Enums\ServiceStatus;
use App\Models\Service;
use App\Models\Student;
use App\Models\Period;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use App\Actions\UploadFile;

/**
 * Acción encargada de procesar el almacenamiento físico y lógico de un pago/servicio.
 */
class StoreStudentService
{
    /**
     * Almacena el archivo en el disco configurado y crea el registro en BD.
     *
     * @param UploadedFile $file El archivo binario recibido del request.
     * @param array $data Los datos validados del servicio.
     * @param int $studentId ID del alumno.
     * @return Service
     */
    public function execute(UploadedFile $file, array $data, int $studentId): Service
    {
        // Generar nombre único basado en UUID para evitar colisiones
        $fileName = Str::uuid() . '.' . $file->getClientOriginalExtension();

        $uploader = new UploadFile();
        $meta = $uploader->execute($file, "servicios/student_{$studentId}", null, $fileName);

        $activePeriod = Period::where('is_active', true)->first();

        $service = Service::create([
            'student_id'       => $studentId,
            'type'             => $data['type'],
            'amount'           => $data['amount'],
            'reference_number' => $data['reference_number'] ?? null,
            'description'      => $data['description'] ?? null,
            'original_name'    => $file->getClientOriginalName(),
            'file_path'        => $meta['path'],
            'disk'             => $meta['disk'],
            'status'           => ServiceStatus::PENDING->value,
            'period_id'        => $activePeriod?->id,
        ]);

        $student = Student::find($studentId);
        if ($student) {
            $student->update(['status' => \App\Enums\StudentStatus::PAYMENT_REVIEW]);
        }

        return $service;
    }
}
