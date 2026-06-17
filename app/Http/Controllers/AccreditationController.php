<?php

namespace App\Http\Controllers;

use App\Enums\StudentStatus;
use App\Actions\GetAccreditationCandidates;
use App\Actions\GetAccreditationMetadata;
use App\Actions\UpdateStudentAccreditationStatus;
use App\Actions\BulkSuspendStudents;
use App\Http\Requests\UpdateAccreditationStatusRequest;
use App\Http\Requests\BulkSuspendAccreditationRequest;
use App\Http\Resources\AccreditationCandidateResource;
use App\Models\CertificateRecord;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Barryvdh\DomPDF\Facade\Pdf;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use App\Actions\BuildCertificateDataAction;
use App\Actions\GenerateCertificatePdfAction;

/**
 * Controlador para la Gestión y Flujo de Acreditación de Alumnos.
 *
 * Este controlador actúa como un orquestador ligero (Thin Controller),
 * delegando la validación a FormRequests y la lógica de negocio a Actions.
 */
class AccreditationController extends Controller
{
    /**
     * Muestra la vista de gestión de candidatos a acreditación.
     */
    public function index(
        Request $request,
        GetAccreditationCandidates $candidatesAction,
        GetAccreditationMetadata $metadataAction
    ): Response {
        Gate::authorize('viewAny', CertificateRecord::class);

        $candidates = $candidatesAction->execute(
            $request->query('status'),
            $request->query('period_id')
        );

        return Inertia::render('Accreditations/Index', [
            'candidates'               => AccreditationCandidateResource::collection($candidates)->resolve(),
            'accreditationTypeOptions' => $metadataAction->execute(),
            'periods'                  => \App\Models\Period::orderBy('start_date', 'desc')->get(),
            'filters'                  => $request->only(['status', 'period_id']),
        ]);
    }

    /**
     * Actualiza el estatus de acreditación de un alumno.
     */
    public function updateStatus(
        UpdateAccreditationStatusRequest $request,
        Student $student,
        UpdateStudentAccreditationStatus $action
    ): RedirectResponse {
        Gate::authorize('manage', CertificateRecord::class);

        if ($request->status === \App\Enums\StudentStatus::ACCREDITED->value) {
            if (!\Illuminate\Support\Facades\Hash::check($request->password, auth()->user()->password)) {
                return back()->withErrors(['password' => 'La contraseña de administrador es incorrecta.']);
            }
        }

        $action->execute($student, $request->validated('status'));

        return redirect()->back()->with('success', 'El estado del alumno se actualizó correctamente.');
    }

    /**
     * Suspende masivamente a los alumnos seleccionados en el módulo.
     */
    public function bulkSuspend(
        BulkSuspendAccreditationRequest $request,
        BulkSuspendStudents $action
    ): RedirectResponse {
        Gate::authorize('manage', CertificateRecord::class);

        $action->execute($request->validated('ids'));

        return redirect()->back()->with('success', 'Los alumnos seleccionados han sido actualizados al estado "Inhabilitado".');
    }

    /**
     * Inicia el proceso de generación de constancia (crea o reutiliza registro en draft y redirije a personalización).
     */
    public function generateCertificate(Student $student, BuildCertificateDataAction $buildData): RedirectResponse
    {
        Gate::authorize('create', CertificateRecord::class);

        if ($student->status !== StudentStatus::ACCREDITED) {
            abort(403, 'El alumno no está acreditado.');
        }

        $data = $buildData->execute($student);

        // Buscar si ya existe un borrador para el estudiante
        $certRecord = CertificateRecord::where('student_id', $student->id)
            ->where('status', 'draft')
            ->first();

        if ($certRecord) {
            // Reutilizar el borrador existente y actualizar los datos calculados
            $certRecord->update([
                'certificate_type' => $data['certificate_type'],
                'student_name'     => $student->full_name,
                'num_control'      => $student->num_control,
                'carrera'          => $student->degree->name ?? '',
                'plan_estudios'    => $student->degree->study_plan ?? '',
                'promedio'         => $data['promedio'],
                'periodo'          => $data['periodo'],
                'nivel'            => $data['nivel'],
                'signer_one_name'  => 'FÁTIMA DEL ROCÍO BECERRA LÓPEZ',
                'signer_one_title' => 'COORDINADORA DE LENGUAS EXTRANJERAS',
                'signer_two_name'  => 'ROCÍO SILVIA VARGAS MONTES DE OCA',
                'signer_two_title' => 'SUBDIRECTORA DE PLANEACIÓN Y VINCULACIÓN',
                'issued_at'        => now(),
            ]);
        } else {
            // Crear uno nuevo
            $certRecord = CertificateRecord::create([
                'student_id'       => $student->id,
                'generated_by'     => Auth::id(),
                'validation_code'  => Str::uuid()->toString(),
                'certificate_type' => $data['certificate_type'],
                'student_name'     => $student->full_name,
                'pronombre'        => 'el',
                'student_type'     => 'egresado',
                'num_control'      => $student->num_control,
                'carrera'          => $student->degree->name ?? '',
                'plan_estudios'    => $student->degree->study_plan ?? '',
                'promedio'         => $data['promedio'],
                'periodo'          => $data['periodo'],
                'nivel'            => $data['nivel'],
                'no_oficio'        => $data['no_oficio'],
                'signer_one_name'  => 'FÁTIMA DEL ROCÍO BECERRA LÓPEZ',
                'signer_one_title' => 'COORDINADORA DE LENGUAS EXTRANJERAS',
                'signer_two_name'  => 'ROCÍO SILVIA VARGAS MONTES DE OCA',
                'signer_two_title' => 'SUBDIRECTORA DE PLANEACIÓN Y VINCULACIÓN',
                'status'           => 'draft',
                'issued_at'        => now(),
            ]);
        }

        // Redirigir a la vista de personalización
        return redirect()->route('certificates.customize', $certRecord)->with('success', 'Por favor, personaliza los datos antes de confirmar.');
    }

    /**
     * Devuelve la vista HTML de la constancia para previsualización sin crear registros.
     */
    public function previewCertificate(Student $student, BuildCertificateDataAction $buildData, GenerateCertificatePdfAction $pdfAction)
    {
        Gate::authorize('preview', CertificateRecord::class);

        if ($student->status !== StudentStatus::ACCREDITED) {
            abort(403, 'El alumno no está acreditado.');
        }

        $data = $buildData->execute($student);

        $promedioLetra = $pdfAction->numeroALetras((int) $data['promedio']);
        $anioLetra = $pdfAction->anioALetras((int) date('Y'));

        // Código de validación temporal (no se guarda en BD)
        $validationCode = Str::uuid()->toString();

        $qrImage   = 'data:image/svg+xml;base64,' . base64_encode(
            QrCode::format('svg')->size(120)
                ->margin(1)
                ->generate(route('certificates.verify', $validationCode))
        );

        $isFemale = (Str::lower($student->gender ?? '') === 'f' || Str::lower($student->gender ?? '') === 'femenino');
        $estatus = $isFemale ? 'la egresada' : 'el egresado';

        $viewMap = [
            'cursos'             => 'certificates.cursos',
            'cuatro-habilidades' => 'certificates.cuatro-habilidades',
            'examen-acreditacion' => 'certificates.examen-acreditacion',
            'otra-institucion'   => 'certificates.otra-institucion',
        ];

        $view = $viewMap[$data['certificate_type']] ?? 'certificates.examen-acreditacion';

        $pdfData = [
            'estatus'        => $estatus,
            'nombre'         => mb_strtoupper($student->full_name, 'UTF-8'),
            'numero_control' => $student->num_control,
            'carrera'        => mb_strtoupper($student->degree->name ?? '', 'UTF-8'),
            'plan_estudios'  => mb_strtoupper($student->degree->study_plan ?? $student->degree->name ?? '', 'UTF-8'),
            'promedio'       => $data['promedio'],
            'promedio_letra' => $promedioLetra,
            'periodo'        => $data['periodo'],
            'nivel'          => $data['nivel'],
            'nota'           => '2 años',
            'student_type'   => 'egresado',
            'no_oficio'      => $data['no_oficio'],
            'qr_image'       => $qrImage,
            'is_pdf'         => false,
            'validation_code' => $validationCode,
            'verify_url'     => route('certificates.verify', $validationCode),
            'anio_letra'     => $anioLetra,
        ];

        // Renderizar la vista HTML de la constancia para previsualización (sin crear registro)
        return view($view, $pdfData);
    }

    /**
     * Muestra la vista de personalización de una constancia.
     */
    public function customizeCertificate(CertificateRecord $certificate)
    {
        Gate::authorize('view', $certificate);

        if ($certificate->status === 'issued') {
            return redirect()->back()->with('error', 'Esta constancia ya fue emitida y no puede ser modificada.');
        }

        return Inertia::render('Certificates/Customize', [
            'certificate' => $certificate->toArray(),
            'student'     => $certificate->student->toArray(),
        ]);
    }

    /**
     * Confirma los cambios personalizados y emite la constancia.
     */
    public function confirmCustomization(Request $request, CertificateRecord $certificate)
    {
        Gate::authorize('confirm', $certificate);

        $validated = $request->validate([
            'student_name' => 'required|string|max:255',
            'carrera'      => 'required|string|max:255',
            'promedio'     => 'nullable|numeric',
            'nivel'        => 'nullable|string|max:10',
            'constancy_number' => 'nullable|string|max:10',
            'pronombre'    => 'required|in:el,la,elle',
            'student_type' => 'required|in:egresado,actual',
            'signer_one_name' => 'required|string|max:255',
            'signer_one_title' => 'required|string|max:255',
            'signer_two_name' => 'required|string|max:255',
            'signer_two_title' => 'required|string|max:255',
        ]);

        // Actualizar los datos directamente (ya no existen columnas _edited)
        $certificate->update([
            'student_name'     => $validated['student_name'],
            'carrera'          => $validated['carrera'],
            'promedio'         => $validated['promedio'],
            'nivel'            => $validated['nivel'],
            'constancy_number' => $validated['constancy_number'],
            'pronombre'        => $validated['pronombre'],
            'student_type'     => $validated['student_type'],
            'signer_one_name'  => $validated['signer_one_name'],
            'signer_one_title' => $validated['signer_one_title'],
            'signer_two_name'  => $validated['signer_two_name'],
            'signer_two_title' => $validated['signer_two_title'],
            'status'           => 'confirmed',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Constancia confirmada y emitida correctamente.',
        ]);
    }

    /**
     * Descarga el PDF final con los datos confirmados.
     */
    public function downloadCertificate(CertificateRecord $certificate, GenerateCertificatePdfAction $pdfAction)
    {
        Gate::authorize('download', $certificate);

        $pdf = $pdfAction->execute($certificate);

        $fileName = 'Constancia_' . $certificate->num_control . '_' . now()->timestamp . '.pdf';
        Storage::disk('public')->put('certificates/' . $fileName, $pdf->output());

        // Marcar constancias emitidas previas del mismo estudiante como reemplazadas
        CertificateRecord::where('student_id', $certificate->student_id)
            ->where('id', '!=', $certificate->id)
            ->where('status', 'issued')
            ->update(['status' => 'superseded']);

        $certificate->update(['status' => 'issued']);

        return $pdf->download('Constancia_' . $certificate->num_control . '.pdf');
    }
}
