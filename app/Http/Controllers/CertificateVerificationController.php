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
            ->where('status', 'issued')
            ->first();

        if (! $record) {
            return Inertia::render('Certificates/Verify', [
                'valid'  => false,
                'record' => null,
            ]);
        }

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
            ],
        ]);
    }
}
