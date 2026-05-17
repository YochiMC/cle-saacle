<?php

namespace App\Actions;

use App\Enums\ServiceStatus;
use App\Models\Service;
use App\Models\Student;
use App\Models\Period;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

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
    public function execute(UploadedFile $file, array $data, int $studentId, ?int $existingServiceId = null): Service
    {
        // Generar nombre único basado en UUID para evitar colisiones
        $fileName = Str::uuid() . '.' . $file->getClientOriginalExtension();

        // Almacenar en disco 'local' (storage/app).
        $path = $file->storeAs("servicios/student_{$studentId}", $fileName, 'local');

        $activePeriod = Period::where('is_active', true)->first();

        // If an existing rejected service id was provided, update that record instead
        if ($existingServiceId) {
            $existing = Service::where('id', $existingServiceId)->where('student_id', $studentId)->first();
            if ($existing && $existing->status === ServiceStatus::REJECTED->value) {
                // delete old file if exists
                try {
                    if ($existing->file_path && Storage::disk($existing->disk ?? 'local')->exists($existing->file_path)) {
                        Storage::disk($existing->disk ?? 'local')->delete($existing->file_path);
                    }
                } catch (\Exception $e) {
                    // ignore deletion errors, proceed with update
                }

                $existing->update([
                    'type'             => $data['type'],
                    'amount'           => $data['amount'],
                    'reference_number' => $data['reference_number'] ?? null,
                    'description'      => $data['description'] ?? null,
                    'original_name'    => $file->getClientOriginalName(),
                    'file_path'        => $path,
                    'disk'             => 'local',
                    'status'           => ServiceStatus::PENDING->value,
                    'rejection_reason' => null,
                    'comments'         => null,
                ]);

                $student = Student::find($studentId);
                if ($student) {
                    $student->update(['status' => \App\Enums\StudentStatus::PAYMENT_REVIEW]);
                }

                return $existing->refresh();
            }
        }

        $service = Service::create([
            'student_id'       => $studentId,
            'type'             => $data['type'],
            'amount'           => $data['amount'],
            'reference_number' => $data['reference_number'] ?? null,
            'description'      => $data['description'] ?? null,
            'original_name'    => $file->getClientOriginalName(),
            'file_path'        => $path,
            'disk'             => 'local',
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
