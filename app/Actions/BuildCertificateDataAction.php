<?php

namespace App\Actions;

use App\Models\Student;
use App\Models\CertificateRecord;
use App\Http\Resources\AccreditationCandidateResource;
use Illuminate\Support\Str;

/**
 * Acción para calcular y estructurar los datos base requeridos para generar una constancia.
 * 
 * Centraliza la lógica que antes estaba duplicada en AccreditationController.
 */
class BuildCertificateDataAction
{
    /**
     * Ejecuta el cálculo de los datos de la constancia para un estudiante dado.
     *
     * @param Student $student
     * @return array
     */
    public function execute(Student $student): array
    {
        $student->loadMissing([
            'degree',
            'level',
            'exams.period',
            'qualifications.group.period',
            'qualifications.group.level'
        ]);

        // --- Determinar tipo de constancia ---
        $resource = new AccreditationCandidateResource($student);
        $resourceData = $resource->toArray(request());
        $achievedBy = $resourceData['achieved_by'] ?? 'No determinado';
        $obtainedAt = $resourceData['obtained_at'] ?? '';
        $achievedByLower = Str::lower(Str::ascii($achievedBy));

        if (Str::contains($achievedByLower, ['cursos regulares', 'programa de egresados'])) {
            $certType = 'cursos';
        } elseif (Str::contains($achievedByLower, ['4 habilidades', 'cuatro habilidades'])) {
            $certType = 'cuatro-habilidades';
        } else {
            $certType = 'examen-acreditacion';
        }

        // --- Calcular promedio y nivel ---
        $promedio = 0;
        $nivel = '';

        $latestExam = $student->exams->filter(function ($e) {
            $avg = $e->pivot->final_average;
            $breakdown = $e->pivot->units_breakdown;
            if (is_string($breakdown)) {
                $breakdown = json_decode($breakdown, true) ?? [];
            }
            return ($avg >= 70) ||
                in_array(Str::upper(trim((string) ($breakdown['nivel_certificado'] ?? ''))), ['B1', 'B2', 'C1', 'C2'], true) ||
                in_array(Str::upper(trim((string) ($breakdown['promedio_habilidades'] ?? ''))), ['B1', 'B2', 'C1', 'C2'], true);
        })->sortByDesc(fn($e) => $e->pivot->created_at)->first();

        $latestGroup = $student->qualifications->filter(fn($q) => $q->final_average >= 70 && !$q->is_left)
            ->sortByDesc('created_at')
            ->first();

        if ($latestExam) {
            $promedio = $latestExam->pivot->final_average ?? 0;
            if (!$promedio) {
                $units = $latestExam->pivot->units_breakdown;
                if (is_string($units)) {
                    $units = json_decode($units, true) ?? [];
                }
                $nivel = $units['nivel_certificado'] ?? ($units['promedio_habilidades'] ?? 'B1');
            }
        }

        if (!$promedio && $latestGroup) {
            $promedio = $latestGroup->final_average;
        }

        if (!$promedio) {
            $promedio = 100;
        }

        // --- Número de oficio correlativo ---
        $year = date('Y');
        $consecutive = CertificateRecord::whereYear('issued_at', $year)->count() + 1;
        $noOficio = str_pad($consecutive, 4, '0', STR_PAD_LEFT);

        return [
            'certificate_type' => $certType,
            'promedio' => $promedio,
            'nivel' => $nivel ?: 'B1',
            'periodo' => $obtainedAt,
            'no_oficio' => $noOficio,
        ];
    }
}
