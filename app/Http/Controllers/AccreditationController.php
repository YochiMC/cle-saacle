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
     * Inicia el proceso de generación de constancia (crea registro en draft y redirije a personalización).
     */
    public function generateCertificate(Student $student): RedirectResponse
    {
        Gate::authorize('create', CertificateRecord::class);

        if ($student->status !== StudentStatus::ACCREDITED) {
            abort(403, 'El alumno no está acreditado.');
        }

        $student->load(['degree', 'level', 'exams.period', 'qualifications.group.period', 'qualifications.group.level']);

        // --- Determinar tipo de constancia ---
        $resource    = new AccreditationCandidateResource($student);
        $data        = $resource->toArray(request());
        $achievedBy  = $data['achieved_by'] ?? 'No determinado';
        $obtainedAt  = $data['obtained_at'] ?? '';
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
        $nivel    = '';

        $latestExam = $student->exams->filter(function ($e) {
            $avg = $e->pivot->final_average;
            $breakdown = $e->pivot->units_breakdown;
            if (is_string($breakdown)) $breakdown = json_decode($breakdown, true) ?? [];
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
                if (is_string($units)) $units = json_decode($units, true) ?? [];
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
        $year        = date('Y');
        $consecutive = CertificateRecord::whereYear('issued_at', $year)->count() + 1;
        $noOficio    = str_pad($consecutive, 4, '0', STR_PAD_LEFT);

        // --- Código de validación único (UUID) ---
        $validationCode = Str::uuid()->toString();

        // --- Guardar registro de constancia en estado DRAFT ---
        $certRecord = CertificateRecord::create([
            'student_id'       => $student->id,
            'generated_by'     => Auth::id(),
            'validation_code'  => $validationCode,
            'certificate_type' => $certType,
            'student_name'     => $student->full_name,
            'pronombre'        => 'el',
            'student_type'     => 'egresado',  // default; se puede cambiar en personalización
            'num_control'      => $student->num_control,
            'carrera'          => $student->degree->name ?? '',
            'plan_estudios'    => $student->degree->study_plan ?? '',
            'promedio'         => $promedio,
            'periodo'          => $obtainedAt,
            'nivel'            => $nivel ?: 'B1',
            'no_oficio'        => $noOficio,
            'signer_one_name'  => 'FÁTIMA DEL ROCÍO BECERRA LÓPEZ',
            'signer_one_title'  => 'COORDINADORA DE LENGUAS EXTRANJERAS',
            'signer_two_name'  => 'ROCÍO SILVIA VARGAS MONTES DE OCA',
            'signer_two_title' => 'SUBDIRECTORA DE PLANEACIÓN Y VINCULACIÓN',
            'status'           => 'draft',
            'issued_at'        => now(),
        ]);

        // Redirigir a la vista de personalización
        return redirect()->route('certificates.customize', $certRecord)->with('success', 'Por favor, personaliza los datos antes de confirmar.');
    }

    /**
     * Devuelve la vista HTML de la constancia para previsualización sin crear registros.
     */
    public function previewCertificate(Student $student)
    {
        Gate::authorize('preview', CertificateRecord::class);

        if ($student->status !== StudentStatus::ACCREDITED) {
            abort(403, 'El alumno no está acreditado.');
        }

        $student->load(['degree', 'level', 'exams.period', 'qualifications.group.period', 'qualifications.group.level']);

        // Reutilizar la lógica de determinación de tipo y datos (copia reducida de generateCertificate)
        $resource    = new AccreditationCandidateResource($student);
        $data        = $resource->toArray(request());
        $achievedBy  = $data['achieved_by'] ?? 'No determinado';
        $obtainedAt  = $data['obtained_at'] ?? '';
        $achievedByLower = Str::lower(Str::ascii($achievedBy));

        if (Str::contains($achievedByLower, ['cursos regulares', 'programa de egresados'])) {
            $certType = 'cursos';
            $view     = 'certificates.cursos';
        } elseif (Str::contains($achievedByLower, ['4 habilidades', 'cuatro habilidades'])) {
            $certType = 'cuatro-habilidades';
            $view     = 'certificates.cuatro-habilidades';
        } else {
            $certType = 'examen-acreditacion';
            $view     = 'certificates.examen-acreditacion';
        }

        // Calcular promedio y nivel (misma lógica simplificada)
        $promedio = 0;
        $nivel    = '';

        $latestExam = $student->exams->filter(function ($e) {
            $avg = $e->pivot->final_average;
            $breakdown = $e->pivot->units_breakdown;
            if (is_string($breakdown)) $breakdown = json_decode($breakdown, true) ?? [];
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
                if (is_string($units)) $units = json_decode($units, true) ?? [];
                $nivel = $units['nivel_certificado'] ?? ($units['promedio_habilidades'] ?? 'B1');
            }
        }

        if (!$promedio && $latestGroup) {
            $promedio = $latestGroup->final_average;
        }

        if (!$promedio) {
            $promedio = 100;
        }

        $promedioLetra = $this->numeroALetras((int) $promedio);

        // Número de oficio (no se crea registro, solo mostrar el siguiente correlativo)
        $year         = date('Y');
        $consecutive  = CertificateRecord::whereYear('issued_at', $year)->count() + 1;
        $noOficio     = str_pad($consecutive, 4, '0', STR_PAD_LEFT);

        // Código de validación temporal (no se guarda en BD)
        $validationCode = Str::uuid()->toString();

        $qrImage   = 'data:image/svg+xml;base64,' . base64_encode(
            QrCode::format('svg')->size(120)
                ->margin(1)
                ->generate(route('certificates.verify', $validationCode))
        );

        $isFemale = (Str::lower($student->gender ?? '') === 'f' || Str::lower($student->gender ?? '') === 'femenino');
        $estatus = $isFemale ? 'la egresada' : 'el egresado';

        $anioLetra = $this->anioALetras((int) date('Y'));

        $pdfData = [
            'estatus'        => $estatus,
            'nombre'         => mb_strtoupper($student->full_name, 'UTF-8'),
            'numero_control' => $student->num_control,
            'carrera'        => mb_strtoupper($student->degree->name ?? '', 'UTF-8'),
            'plan_estudios'  => mb_strtoupper($student->degree->study_plan ?? $student->degree->name ?? '', 'UTF-8'),
            'promedio'       => $promedio,
            'promedio_letra' => $promedioLetra,
            'periodo'        => $obtainedAt,
            'nivel'          => $nivel ?: 'B1',
            'nota'           => '2 años',
            'student_type'   => 'egresado',  // preview siempre muestra 'egresado' por defecto
            'no_oficio'      => $noOficio,
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
     * Convierte un número entero a su representación en letras en español (mayúsculas).
     */
    private function numeroALetras(int $numero): string
    {
        if (extension_loaded('intl')) {
            $formatter = new \NumberFormatter('es', \NumberFormatter::SPELLOUT);
            return mb_strtoupper($formatter->format($numero), 'UTF-8');
        }

        $numeros = [
            70 => 'SETENTA',
            71 => 'SETENTA Y UNO',
            72 => 'SETENTA Y DOS',
            73 => 'SETENTA Y TRES',
            74 => 'SETENTA Y CUATRO',
            75 => 'SETENTA Y CINCO',
            76 => 'SETENTA Y SEIS',
            77 => 'SETENTA Y SIETE',
            78 => 'SETENTA Y OCHO',
            79 => 'SETENTA Y NUEVE',
            80 => 'OCHENTA',
            81 => 'OCHENTA Y UNO',
            82 => 'OCHENTA Y DOS',
            83 => 'OCHENTA Y TRES',
            84 => 'OCHENTA Y CUATRO',
            85 => 'OCHENTA Y CINCO',
            86 => 'OCHENTA Y SEIS',
            87 => 'OCHENTA Y SIETE',
            88 => 'OCHENTA Y OCHO',
            89 => 'OCHENTA Y NUEVE',
            90 => 'NOVENTA',
            91 => 'NOVENTA Y UNO',
            92 => 'NOVENTA Y DOS',
            93 => 'NOVENTA Y TRES',
            94 => 'NOVENTA Y CUATRO',
            95 => 'NOVENTA Y CINCO',
            96 => 'NOVENTA Y SEIS',
            97 => 'NOVENTA Y SIETE',
            98 => 'NOVENTA Y OCHO',
            99 => 'NOVENTA Y NUEVE',
            100 => 'CIEN',
        ];

        return $numeros[$numero] ?? 'CIEN';
    }

    /**
     * Convierte el año a letras en español con fallback manual.
     */
    private function anioALetras(int $year): string
    {
        if (extension_loaded('intl')) {
            $formatter = new \NumberFormatter('es', \NumberFormatter::SPELLOUT);
            return $formatter->format($year);
        }

        $lastTwo = $year % 100;

        $decenas = [
            20 => 'veinte',
            21 => 'veintiuno',
            22 => 'veintidós',
            23 => 'veintitrés',
            24 => 'veinticuatro',
            25 => 'veinticinco',
            26 => 'veintiséis',
            27 => 'veintisiete',
            28 => 'veintiocho',
            29 => 'veintinueve',
            30 => 'treinta',
            31 => 'treinta y uno',
            32 => 'treinta y dos',
            33 => 'treinta y tres',
            34 => 'treinta y cuatro',
            35 => 'treinta y cinco',
            36 => 'treinta y seis',
            37 => 'treinta y siete',
            38 => 'treinta y ocho',
            39 => 'treinta y nueve',
            40 => 'cuarenta',
            41 => 'cuarenta y uno',
            42 => 'cuarenta y dos',
            43 => 'cuarenta y tres',
            44 => 'cuarenta y cuatro',
            45 => 'cuarenta y cinco',
            46 => 'cuarenta y seis',
            47 => 'cuarenta y siete',
            48 => 'cuarenta y ocho',
            49 => 'cuarenta y nueve',
            50 => 'cincuenta'
        ];

        if (isset($decenas[$lastTwo])) {
            return 'dos mil ' . $decenas[$lastTwo];
        }

        return 'dos mil ' . $lastTwo;
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
            'pronombre'    => 'required|in:el,la,elle',
            'student_type' => 'required|in:egresado,actual',
            'signer_one_name' => 'required|string|max:255',
            'signer_one_title' => 'required|string|max:255',
            'signer_two_name' => 'required|string|max:255',
            'signer_two_title' => 'required|string|max:255',
        ]);

        // Actualizar los datos editados
        $certificate->update([
            'student_name_edited' => $validated['student_name'],
            'carrera_edited'      => $validated['carrera'],
            'promedio_edited'     => $validated['promedio'],
            'nivel_edited'        => $validated['nivel'],
            'pronombre'           => $validated['pronombre'],
            'student_type'        => $validated['student_type'],
            'signer_one_name'     => $validated['signer_one_name'],
            'signer_one_title'    => $validated['signer_one_title'],
            'signer_two_name'     => $validated['signer_two_name'],
            'signer_two_title'    => $validated['signer_two_title'],
            'status'              => 'confirmed',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Constancia confirmada y emitida correctamente.',
        ]);
    }

    /**
     * Descarga el PDF final con los datos confirmados.
     */
    public function downloadCertificate(CertificateRecord $certificate)
    {
        Gate::authorize('download', $certificate);

        $pdf = $this->buildCertificatePdf($certificate);

        $fileName = 'Constancia_' . $certificate->num_control . '_' . now()->timestamp . '.pdf';
        Storage::disk('public')->put('certificates/' . $fileName, $pdf->output());

        $certificate->update(['status' => 'issued']);

        return $pdf->download('Constancia_' . $certificate->num_control . '.pdf');
    }

    /**
     * Construye el PDF final de la constancia.
     */
    private function buildCertificatePdf(CertificateRecord $certificate)
    {
        $student = $certificate->student;
        $student->load(['degree', 'level']);

        $viewMap = [
            'cursos'             => 'certificates.cursos',
            'cuatro-habilidades' => 'certificates.cuatro-habilidades',
            'examen-acreditacion' => 'certificates.examen-acreditacion',
            'otra-institucion'   => 'certificates.otra-institucion',
        ];

        $view = $viewMap[$certificate->certificate_type] ?? 'certificates.examen-acreditacion';

        $studentName = $certificate->student_name_edited ?: $certificate->student_name;
        $carrera = $certificate->carrera_edited ?: $certificate->carrera;
        $promedio = $certificate->promedio_edited ?? $certificate->promedio;
        $nivel = $certificate->nivel_edited ?: $certificate->nivel;
        $pronombre = $certificate->pronombre ?? 'el';

        $studentType = $certificate->student_type ?? 'egresado';
        
        if ($studentType === 'egresado') {
            $estatusMap = [
                'la'   => 'la egresada',
                'elle' => 'al C.',
                'el'   => 'el egresado',
            ];
        } else {
            $estatusMap = [
                'la'   => 'la estudiante',
                'elle' => 'al C.',
                'el'   => 'el estudiante',
            ];
        }
        $estatus = $estatusMap[$pronombre] ?? 'el C.';

        $verifyUrl = route('certificates.verify', $certificate->validation_code);

        return Pdf::loadView($view, [
            'estatus'          => $estatus,
            'nombre'           => mb_strtoupper($studentName, 'UTF-8'),
            'numero_control'   => $certificate->num_control,
            'carrera'          => mb_strtoupper($carrera, 'UTF-8'),
            'plan_estudios'    => mb_strtoupper($certificate->plan_estudios ?? $carrera, 'UTF-8'),
            'promedio'         => $promedio,
            'promedio_letra'   => $this->numeroALetras((int) $promedio),
            'periodo'          => $certificate->periodo,
            'nivel'            => $nivel,
            'nota'             => '2 años',  // legacy, no se usa en blade (se usa student_type)
            'student_type'     => $certificate->student_type ?? 'egresado',
            'no_oficio'        => $certificate->no_oficio,
            'qr_image'         => 'data:image/svg+xml;base64,' . base64_encode(
                QrCode::format('svg')->size(120)
                    ->margin(1)
                    ->generate($verifyUrl)
            ),
            'is_pdf'           => true,
            'validation_code'  => $certificate->validation_code,
            'verify_url'       => $verifyUrl,
            'anio_letra'       => $this->anioALetras((int) date('Y')),
            'pronombre'        => $pronombre,
            'signer_one_name'  => $certificate->signer_one_name,
            'signer_one_title' => $certificate->signer_one_title,
            'signer_two_name'  => $certificate->signer_two_name,
            'signer_two_title' => $certificate->signer_two_title,
        ])->setPaper('letter', 'portrait');
    }
}
