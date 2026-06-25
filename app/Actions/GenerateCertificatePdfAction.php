<?php

namespace App\Actions;

use App\Models\CertificateRecord;
use Barryvdh\DomPDF\Facade\Pdf;
use Barryvdh\DomPDF\PDF as DomPdfInstance;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Str;

/**
 * Acción para generar el archivo PDF de una constancia de acreditación.
 * 
 * Centraliza la lógica de DomPDF, códigos QR y conversión de números a letras.
 */
class GenerateCertificatePdfAction
{
    public const VIEW_MAP = [
        'cursos'             => 'certificates.cursos',
        'cuatro-habilidades' => 'certificates.cuatro-habilidades',
        'examen-acreditacion' => 'certificates.examen-acreditacion',
        'otra-institucion'   => 'certificates.otra-institucion',
    ];

    /**
     * Genera la instancia de PDF a partir de un registro de constancia.
     */
    public function execute(CertificateRecord $certificate): DomPdfInstance
    {
        $data = $this->buildViewData($certificate);
        $view = self::VIEW_MAP[$certificate->certificate_type] ?? 'certificates.examen-acreditacion';

        return Pdf::loadView($view, $data)->setPaper('letter', 'portrait');
    }

    /**
     * Construye el array de datos para la vista de la constancia.
     * Reutilizable por previewLive() y generateCertificateWordAction.
     */
    public function buildViewData(CertificateRecord $certificate): array
    {
        $student = $certificate->student;
        $student->loadMissing(['degree', 'level']);

        $studentName = $certificate->student_name;
        $carrera = $certificate->carrera;
        $promedio = $certificate->promedio;
        $nivel = $certificate->nivel;
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

        return [
            'estatus'          => $estatus,
            'nombre'           => mb_strtoupper($studentName, 'UTF-8'),
            'numero_control'   => $certificate->num_control,
            'carrera'          => mb_strtoupper($carrera, 'UTF-8'),
            'plan_estudios'    => mb_strtoupper($certificate->plan_estudios ?? $carrera, 'UTF-8'),
            'promedio'         => $promedio,
            'promedio_letra'   => $this->numeroALetras((int) $promedio),
            'periodo'          => $certificate->periodo,
            'nivel'            => $nivel,
            'student_type'     => $studentType,
            'no_oficio'        => str_pad($certificate->no_oficio, 3, '0', STR_PAD_LEFT),
            'qr_image'         => 'data:image/svg+xml;base64,' . base64_encode(
                QrCode::format('svg')->size(120)
                    ->margin(1)
                    ->generate($verifyUrl)
            ),
            'is_pdf'           => true,
            'validation_code'  => $certificate->validation_code,
            'constancy_number' => $certificate->constancy_number,
            'verify_url'       => $verifyUrl,
            'anio_letra'       => $this->anioALetras((int) date('Y')),
            'pronombre'        => $pronombre,
            'signer_one_name'  => $certificate->signer_one_name,
            'signer_one_title' => $certificate->signer_one_title,
            'signer_two_name'  => $certificate->signer_two_name,
            'signer_two_title' => $certificate->signer_two_title,
        ];
    }

    /**
     * Convierte un número entero a su representación en letras en español (mayúsculas).
     *
     * @param int $numero
     * @return string
     */
    public function numeroALetras(int $numero): string
    {
        if (extension_loaded('intl')) {
            $formatter = new \NumberFormatter('es', \NumberFormatter::SPELLOUT);
            return $formatter->format($numero);
        }

        return $this->numeroALetrasFallback($numero);
    }

    /**
     * Convierte un entero del 0 al 100 a letras en español (fallback sin extensión intl).
     */
    private function numeroALetrasFallback(int $numero): string
    {
        if ($numero === 0) return 'cero';
        if ($numero === 100) return 'cien';

        $unidades = [
            1 => 'uno', 2 => 'dos', 3 => 'tres', 4 => 'cuatro',
            5 => 'cinco', 6 => 'seis', 7 => 'siete', 8 => 'ocho', 9 => 'nueve',
        ];

        $especiales = [
            10 => 'diez', 11 => 'once', 12 => 'doce', 13 => 'trece',
            14 => 'catorce', 15 => 'quince', 16 => 'dieciséis',
            17 => 'diecisiete', 18 => 'dieciocho', 19 => 'diecinueve',
        ];

        $decenasMap = [
            2 => 'veinte', 3 => 'treinta', 4 => 'cuarenta', 5 => 'cincuenta',
            6 => 'sesenta', 7 => 'setenta', 8 => 'ochenta', 9 => 'noventa',
        ];

        if (isset($especiales[$numero])) {
            return $especiales[$numero];
        }

        if ($numero < 10) {
            return $unidades[$numero];
        }

        $dec = intdiv($numero, 10);
        $uni = $numero % 10;

        if ($uni === 0) {
            return $decenasMap[$dec];
        }

        return $decenasMap[$dec] . ' y ' . $unidades[$uni];
    }

    /**
     * Convierte el año a letras en español con fallback manual.
     *
     * @param int $year
     * @return string
     */
    public function anioALetras(int $year): string
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
}
