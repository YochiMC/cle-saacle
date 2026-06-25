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
use Inertia\Inertia;
use Inertia\Response;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Actions\BuildCertificateDataAction;
use App\Actions\GenerateCertificatePdfAction;
use App\Actions\GenerateCertificateWordAction;
use PhpOffice\PhpWord\IOFactory;
use Illuminate\Support\Str;

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

            // Si existe la configuración 'certificate_next_oficio' en el menú de ajustes,
            // incrementarla para que el siguiente oficio continue desde aquí.
            $nextSetting = \App\Models\Setting::where('key', 'certificate_next_oficio')->first();
            if ($nextSetting && is_numeric($nextSetting->value)) {
                $nextSetting->value = (string) (intval($nextSetting->value) + 1);
                $nextSetting->save();
            }

        }

        // Redirigir a la vista de personalización
        return redirect()->route('certificates.customize', $certRecord)->with('success', 'Por favor, personaliza los datos antes de confirmar.');
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
     * Devuelve la vista HTML de la constancia para previsualización en vivo.
     * Reutiliza buildViewData() del Action para garantizar consistencia con el PDF final.
     */
    public function previewLive(Request $request, CertificateRecord $certificate, GenerateCertificatePdfAction $pdfAction)
    {
        Gate::authorize('preview', CertificateRecord::class);

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

        // Obtener datos base desde el Action (misma fuente que el PDF)
        $data = $pdfAction->buildViewData($certificate);

        // Sobreescribir con los valores editados por el usuario
        $data['nombre']         = mb_strtoupper($validated['student_name'], 'UTF-8');
        $data['carrera']        = mb_strtoupper($validated['carrera'], 'UTF-8');
        $data['plan_estudios']  = mb_strtoupper($certificate->plan_estudios ?? $validated['carrera'], 'UTF-8');
        $data['promedio']       = $validated['promedio'];
        $data['promedio_letra'] = $pdfAction->numeroALetras((int) $validated['promedio']);
        $data['nivel']          = $validated['nivel'];
        $data['student_type']   = $validated['student_type'];
        $data['pronombre']      = $validated['pronombre'];
        $data['signer_one_name']  = $validated['signer_one_name'];
        $data['signer_one_title'] = $validated['signer_one_title'];
        $data['signer_two_name']  = $validated['signer_two_name'];
        $data['signer_two_title'] = $validated['signer_two_title'];

        // Configuración específica del preview
        $data['qr_image']        = null;
        $data['is_pdf']          = false;
        $data['validation_code'] = null;

        // Recalcular estatus con los valores del formulario
        $estatusMap = $validated['student_type'] === 'egresado'
            ? ['la' => 'la egresada', 'elle' => 'al C.', 'el' => 'el egresado']
            : ['la' => 'la estudiante', 'elle' => 'al C.', 'el' => 'el estudiante'];
        $data['estatus'] = $estatusMap[$validated['pronombre']] ?? 'el C.';

        $view = GenerateCertificatePdfAction::VIEW_MAP[$certificate->certificate_type] ?? 'certificates.examen-acreditacion';

        return view($view, $data);
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

        $this->markPreviousCertificatesAsSuperseded($certificate);

        $certificate->update(['status' => 'issued']);

        $path = Storage::disk('public')->path('certificates/' . $fileName);
        return response()->download($path, 'Constancia_' . $certificate->num_control . '.pdf');
    }

    /**
     * Descarga el Word final con los datos confirmados.
     */
    public function downloadWordCertificate(CertificateRecord $certificate, GenerateCertificateWordAction $wordAction)
    {
        Gate::authorize('download', $certificate);

        $phpWord = $wordAction->execute($certificate);

        $fileName = 'Constancia_' . $certificate->num_control . '_' . now()->timestamp . '.docx';
        $tempFile = tempnam(sys_get_temp_dir(), 'PHPWord');
        $objWriter = IOFactory::createWriter($phpWord, 'Word2007');
        $objWriter->save($tempFile);

        Storage::disk('public')->put('certificates/' . $fileName, file_get_contents($tempFile));

        $this->markPreviousCertificatesAsSuperseded($certificate);

        $certificate->update(['status' => 'issued']);

        return response()->download($tempFile, 'Constancia_' . $certificate->num_control . '.docx')->deleteFileAfterSend(true);
    }

    /**
     * Descarga un archivo ZIP con los 4 tipos de constancias en formato Word para prueba.
     */
    public function downloadWordAllTypes(CertificateRecord $certificate, GenerateCertificateWordAction $wordAction)
    {
        Gate::authorize('download', $certificate);

        $types = ['cursos', 'cuatro-habilidades', 'examen-acreditacion', 'otra-institucion'];
        $zip = new \ZipArchive();
        $zipFileName = 'Constancias_Muestra_' . $certificate->num_control . '_' . now()->timestamp . '.zip';
        $zipPath = sys_get_temp_dir() . '/' . $zipFileName;

        if ($zip->open($zipPath, \ZipArchive::CREATE) === TRUE) {
            $tempFiles = [];
            foreach ($types as $type) {
                $certificate->certificate_type = $type;
                $phpWord = $wordAction->execute($certificate);
                
                $tempFile = tempnam(sys_get_temp_dir(), 'PHPWord_' . $type);
                $objWriter = \PhpOffice\PhpWord\IOFactory::createWriter($phpWord, 'Word2007');
                $objWriter->save($tempFile);
                
                $zip->addFile($tempFile, "Constancia_{$type}.docx");
                $tempFiles[] = $tempFile;
            }
            $zip->close();
            
            // Clean up temp files
            foreach ($tempFiles as $tf) {
                @unlink($tf);
            }
        }

        return response()->download($zipPath, $zipFileName)->deleteFileAfterSend(true);
    }

    /**
     * Marca las constancias emitidas previas del mismo estudiante como reemplazadas.
     */
    private function markPreviousCertificatesAsSuperseded(CertificateRecord $certificate): void
    {
        CertificateRecord::where('student_id', $certificate->student_id)
            ->where('id', '!=', $certificate->id)
            ->where('status', 'issued')
            ->update(['status' => 'superseded']);
    }
}
