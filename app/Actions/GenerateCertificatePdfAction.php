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
    /**
     * Genera la instancia de PDF a partir de un registro de constancia.
     *
     * @param CertificateRecord $certificate
     * @return DomPdfInstance
     */
    public function execute(CertificateRecord $certificate): DomPdfInstance
    {
        $student = $certificate->student;
        $student->loadMissing(['degree', 'level']);

        $viewMap = [
            'cursos'             => 'certificates.cursos',
            'cuatro-habilidades' => 'certificates.cuatro-habilidades',
            'examen-acreditacion' => 'certificates.examen-acreditacion',
            'otra-institucion'   => 'certificates.otra-institucion',
        ];

        $view = $viewMap[$certificate->certificate_type] ?? 'certificates.examen-acreditacion';

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
            'nota'             => '2 años',
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
        ])->setPaper('letter', 'portrait');
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
