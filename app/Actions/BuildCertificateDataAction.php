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

        if (Str::contains($achievedByLower, ['cursos regulares', 'programa de egresados', 'programa especial'])) {
            $certType = 'cursos';
        } elseif (Str::contains($achievedByLower, ['4 habilidades', 'cuatro habilidades'])) {
            $certType = 'cuatro-habilidades';
        } elseif (Str::contains($achievedByLower, ['convalidacion', 'otra institucion'])) {
            $certType = 'otra-institucion';
        } else {
            $certType = 'examen-acreditacion';
        }

        // --- Calcular promedio y nivel ---
        $promedio = 0;
        $nivel = '';

        $latestExam = $resource->latestEligibleExam();
        $latestGroupQualification = $resource->latestEligibleGroupQualification();

        $examPeriodEnd = null;
        if ($latestExam && $latestExam->period && $latestExam->period->end) {
            $examPeriodEnd = \Illuminate\Support\Carbon::parse($latestExam->period->end);
        }

        $groupPeriodEnd = null;
        if ($latestGroupQualification && $latestGroupQualification->group && $latestGroupQualification->group->period && $latestGroupQualification->group->period->end) {
            $groupPeriodEnd = \Illuminate\Support\Carbon::parse($latestGroupQualification->group->period->end);
        }

        $winningRecord = null;
        $winningType = null;

        if ($examPeriodEnd && $groupPeriodEnd) {
            if ($examPeriodEnd->greaterThanOrEqualTo($groupPeriodEnd)) {
                $winningRecord = $latestExam;
                $winningType = 'exam';
            } else {
                $winningRecord = $latestGroupQualification;
                $winningType = 'group';
            }
        } elseif ($examPeriodEnd) {
            $winningRecord = $latestExam;
            $winningType = 'exam';
        } elseif ($groupPeriodEnd) {
            $winningRecord = $latestGroupQualification;
            $winningType = 'group';
        }

        if ($winningType === 'exam' && $winningRecord) {
            $promedio = $winningRecord->pivot->final_average ?? $winningRecord->pivot->calificacion ?? 0;
            $units = $winningRecord->pivot->units_breakdown;
            if (is_string($units)) {
                $units = json_decode($units, true) ?? [];
            }
            if (is_array($units)) {
                if (!$promedio) {
                    $promedio = $units['promedio'] ?? $units['calificacion_final'] ?? 0;
                }
                $nivel = $units['speaking'] ?? $units['certified_level'] ?? $units['nivel_certificado'] ?? $units['promedio_habilidades'] ?? '';
            }
        } elseif ($winningType === 'group' && $winningRecord) {
            $promedio = $winningRecord->final_average ?? 0;
        }

        // Fallback si no hay promedio numérico
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
