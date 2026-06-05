<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\CertificateRecord;
use Inertia\Inertia;
use Inertia\Response;

class CertificateVerificationController extends Controller
{
    /**
     * Página pública de verificación de constancias via QR.
     * No requiere autenticación.
     */
    public function verify(string $code): Response
    {
        $record = CertificateRecord::where('validation_code', $code)
            ->with(['student.degree', 'generatedBy'])
            ->first();

        if (! $record) {
            return Inertia::render('Certificates/Verify', [
                'valid'  => false,
                'record' => null,
            ]);
        }

        // Obtener datos adicionales del estudiante para la constancia
        $student = $record->student;
        $student->load([
            'qualifications.group.period',
            'exams.period',
            'degree',
            'level'
        ]);

        // Calcular el avance del estudiante
        $totalQualifications = $student->qualifications()->count() ?? 0;
        $approvedQualifications = $student->qualifications()
            ->where('final_average', '>=', 70)
            ->where('is_left', false)
            ->count() ?? 0;
        $progressPercentage = $totalQualifications > 0
            ? round(($approvedQualifications / $totalQualifications) * 100)
            : 0;

        // Obtener información de inscripción
        $enrollmentDate = $student->created_at;

        return Inertia::render('Certificates/Verify', [
            'valid'  => true,
            'record' => [
                'student_name'      => $record->student_name,
                'num_control'       => $record->num_control,
                'carrera'           => $record->carrera,
                'certificate_type'  => $record->certificate_type,
                'promedio'          => $record->promedio,
                'periodo'           => $record->periodo,
                'nivel'             => $record->nivel,
                'issued_at'         => $record->issued_at?->format('d/m/Y'),
                'no_oficio'         => $record->no_oficio,
                'validation_code'   => $record->validation_code,
                'progress'          => $progressPercentage,
                'enrollment_date'   => $enrollmentDate?->format('d M. Y - h:i A'),
                'qualification_count' => $approvedQualifications,
            ],
        ]);
    }
}
