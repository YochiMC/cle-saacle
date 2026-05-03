<?php

namespace App\Actions;

use App\Enums\ServiceStatus;
use App\Models\Service;
use App\Models\Student;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

/**
 * Acción encargada de procesar el almacenamiento físico y lógico de un pago/servicio.
 */
class StoreStudentService
{
    /**
     * Almacena el archivo en el disco local restringido y crea el registro en BD.
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

        // Almacenar en disco 'local' (storage/app). 
        $path = $file->storeAs("servicios/student_{$studentId}", $fileName, 'local');

        $service = Service::create([
            'student_id'       => $studentId,
            'type'             => $data['type'],
            'amount'           => $data['amount'],
            'reference_number' => $data['reference_number'] ?? null,
            'description'      => $data['description'] ?? null,
            'original_name'    => $file->getClientOriginalName(),
            'file_path'        => $path,
            'disk'             => 'local',
            'status'           => ServiceStatus::PENDING,
        ]);

        $student = Student::find($studentId);
        if ($student) {
            $student->update(['status' => \App\Enums\StudentStatus::PAYMENT_REVIEW]);
        }

        return $service;
    }
}
