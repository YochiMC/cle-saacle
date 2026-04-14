<?php

namespace App\Http\Controllers;

use App\Actions\GetAccreditationCandidates;
use App\Http\Resources\AccreditationCandidateResource;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\Student;
use App\Enums\StudentStatus;
use Illuminate\Validation\Rules\Enum as EnumRule;
use App\Enums\ExamType;
use Illuminate\Support\Str;

class AccreditationController extends Controller
{
    /**
     * Muestra la vista de candidatos a acreditación.
     */
    public function index(Request $request, GetAccreditationCandidates $action)
    {
        $candidates = $action->execute($request->query('status'));
        $resolvedCandidates = AccreditationCandidateResource::collection($candidates)->resolve();

        $examTypes = collect(ExamType::cases())
            ->map(fn($case) => $case->value)
            ->filter(function ($type) {
                $normalized = Str::lower(Str::ascii($type));
                return !Str::contains($normalized, ['ubicacion', 'placement']);
            })
            ->map(fn($type) => Str::title($type))
            ->toArray();

        $accreditationTypeOptions = array_values(array_unique(array_merge(
            $examTypes,
            ['Cursos regulares', 'Programa de egresados']
        )));
        sort($accreditationTypeOptions);

        // Ya no filtramos en el backend si el usuario quiere que todo pase en el Frontend
        $resolvedCandidates = AccreditationCandidateResource::collection($candidates)->resolve();

        // Eliminamos el filtrado PHP porque todo pasará al frontend

        return Inertia::render('Accreditations/Index', [
            'candidates' => $resolvedCandidates,
            'accreditationTypeOptions' => $accreditationTypeOptions,
        ]);
    }

    /**
     * Actualiza el estatus de acreditación de un alumno de forma manual (React Inline Edit).
     */
    public function updateStatus(Request $request, Student $student)
    {
        $allowedStatuses = [
            StudentStatus::IN_REVIEW->value,
            StudentStatus::ACCREDITED->value,
            StudentStatus::RELEASED->value,
            StudentStatus::SUSPENDED->value,
        ];

        $validated = $request->validate([
            'status' => [
                'required',
                'string',
                new EnumRule(StudentStatus::class),
                \Illuminate\Validation\Rule::in($allowedStatuses),
            ],
        ]);

        $student->update(['status' => $validated['status']]);

        return redirect()->back()->with('success', 'Estatus actualizado correctamente.');
    }

    /**
     * Suspende masivamente alumnos seleccionados desde el módulo de acreditaciones.
     */
    public function bulkSuspend(Request $request)
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['required', 'integer', 'exists:students,id'],
        ]);

        Student::whereIn('id', $validated['ids'])
            ->update(['status' => StudentStatus::SUSPENDED]);

        return redirect()->back()->with('success', 'Alumnos seleccionados actualizados a estatus Suspendido.');
    }
}
