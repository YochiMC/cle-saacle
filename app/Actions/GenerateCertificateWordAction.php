<?php

namespace App\Actions;

use App\Models\CertificateRecord;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\SimpleType\Jc;
use PhpOffice\PhpWord\Style\Language;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class GenerateCertificateWordAction
{
    protected GenerateCertificatePdfAction $pdfAction;

    public function __construct(GenerateCertificatePdfAction $pdfAction)
    {
        $this->pdfAction = $pdfAction;
    }

    public function execute(CertificateRecord $certificate): PhpWord
    {
        $phpWord = new PhpWord();
        $phpWord->getSettings()->setThemeFontLang(new Language('es-ES'));
        $phpWord->setDefaultFontName('Noto Sans');
        $phpWord->setDefaultFontSize(12);

        // Ajustes de márgenes exactos según especificaciones
        $section = $phpWord->addSection([
            'marginTop' => \PhpOffice\PhpWord\Shared\Converter::cmToTwip(5.5),
            'marginRight' => \PhpOffice\PhpWord\Shared\Converter::cmToTwip(1.4),
            'marginBottom' => \PhpOffice\PhpWord\Shared\Converter::cmToTwip(4.9),
            'marginLeft' => \PhpOffice\PhpWord\Shared\Converter::cmToTwip(2.5),
            'footerHeight' => \PhpOffice\PhpWord\Shared\Converter::cmToTwip(0.8),
        ]);

        $tableStyle = ['borderSize' => 0, 'borderColor' => 'FFFFFF', 'cellMargin' => 0];
        $phpWord->addTableStyle('HeaderTable', $tableStyle);

        // ── META OFICIO ────────────────────────────────────
        $meses = ['01'=>'ENERO','02'=>'FEBRERO','03'=>'MARZO','04'=>'ABRIL','05'=>'MAYO','06'=>'JUNIO','07'=>'JULIO','08'=>'AGOSTO','09'=>'SEPTIEMBRE','10'=>'OCTUBRE','11'=>'NOVIEMBRE','12'=>'DICIEMBRE'];
        $mesActual = $meses[date('m')];
        $diaActual = date('d');
        $anioActual = date('Y');

        $metaStyle = ['alignment' => Jc::RIGHT, 'spaceAfter' => 0, 'size' => 10];
        $section->addText("León, Guanajuato, $diaActual/$mesActual/$anioActual", ['size' => 10], $metaStyle);
        
        $type = $certificate->certificate_type ?? 'examen-acreditacion';
        $nivel = $certificate->nivel;

        $oficioPrefixMap = [
            'cursos' => 'CLE-CR-',
            'cuatro-habilidades' => 'CLE-4H-',
            'examen-acreditacion' => 'CLE-PA-',
            'otra-institucion' => 'CLE-CNV-',
        ];
        $prefix = $oficioPrefixMap[$type] ?? 'CLE-PA-';

        $paddedOficio = str_pad($certificate->no_oficio, 3, '0', STR_PAD_LEFT);
        $section->addText("Oficio No. {$prefix}{$paddedOficio}/$anioActual", ['size' => 10], $metaStyle);
        $section->addText("Asunto: Constancia de Inglés", ['size' => 10], $metaStyle);

        // ── SALUDO ─────────────────────────────────────────────
        $section->addTextBreak(1);
        $section->addText('A QUIEN CORRESPONDA:', ['bold' => true, 'size' => 10]);
        $section->addTextBreak(1);

        // ── DATOS ──────────────────────────────────────────────
        $pronombre = $certificate->pronombre ?? 'el';
        $studentType = $certificate->student_type ?? 'egresado';
        
        $estatusMap = $studentType === 'egresado' 
            ? ['la' => 'la egresada', 'elle' => 'al C.', 'el' => 'el egresado']
            : ['la' => 'la estudiante', 'elle' => 'al C.', 'el' => 'el estudiante'];
        $estatus = $estatusMap[$pronombre] ?? 'el C.';

        $promedioLetra = $this->pdfAction->numeroALetras((int)$certificate->promedio);
        $anioLetra = $this->pdfAction->anioALetras((int)$anioActual);

        $bodyFontStyle = ['size' => 9];
        $bodyParStyle = ['alignment' => Jc::BOTH, 'spaceAfter' => 120, 'indentation' => ['firstLine' => 360]];

        // Párrafo 1
        $textRun1 = $section->addTextRun($bodyParStyle);
        $textRun1->addText('Por este conducto, la Coordinación de Lenguas Extranjeras de este Instituto, hace constar que ', $bodyFontStyle);
        $textRun1->addText(strtolower($estatus) . ' ', ['size' => 9]);
        $textRun1->addText(mb_strtoupper($certificate->student_name, 'UTF-8'), ['bold' => true, 'size' => 9]);
        $textRun1->addText(' con Número de Control ', $bodyFontStyle);
        $textRun1->addText($certificate->num_control, ['bold' => true, 'size' => 9]);
        $textRun1->addText(', de la carrera de ', $bodyFontStyle);
        $textRun1->addText(mb_strtoupper($certificate->carrera, 'UTF-8'), ['bold' => true, 'size' => 9]);
        $textRun1->addText(' con clave del Plan de Estudio ', $bodyFontStyle);
        $textRun1->addText(mb_strtoupper($certificate->plan_estudios ?? $certificate->carrera, 'UTF-8'), ['bold' => true, 'size' => 9]);

        if ($type === 'cursos') {
            $textRun1->addText(', acreditó los cursos correspondientes al Programa Institucional de Inglés, obteniendo una calificación promedio de ', $bodyFontStyle);
            $textRun1->addText($certificate->promedio, ['bold' => true, 'size' => 9]);
            $textRun1->addText(" ($promedioLetra) ", ['bold' => true, 'size' => 9]);
            $textRun1->addText('en el periodo ', $bodyFontStyle);
            $textRun1->addText($certificate->periodo, ['bold' => true, 'size' => 9]);
            $textRun1->addText(', acorde a la documentación existente en los archivos de este departamento.', $bodyFontStyle);
        } elseif ($type === 'cuatro-habilidades') {
            $textRun1->addText(', acreditó el examen de 4 habilidades, obteniendo un nivel ', $bodyFontStyle);
            $textRun1->addText($nivel, ['bold' => true, 'size' => 9]);
            $textRun1->addText(' con base al Marco Común Europeo de Referencia (MCER), acorde a la documentación existente en los archivos de este departamento.', $bodyFontStyle);
        } elseif ($type === 'otra-institucion') {
            $textRun1->addText(', presentó la documentación de acreditación emitida por otra institución, acreditando el equivalente al nivel ', $bodyFontStyle);
            $textRun1->addText($nivel, ['bold' => true, 'size' => 9]);
            $textRun1->addText(' con base al Marco Común Europeo de Referencia (MCER), acorde a la documentación existente en los archivos de este departamento.', $bodyFontStyle);
        } else {
            // examen-acreditacion
            $textRun1->addText(', presentó examen de acreditación obteniendo una calificación promedio de ', $bodyFontStyle);
            $textRun1->addText($certificate->promedio, ['bold' => true, 'size' => 9]);
            $textRun1->addText(" ($promedioLetra), ", ['bold' => true, 'size' => 9]);
            $textRun1->addText('acorde a la documentación existente en los archivos de este departamento.', $bodyFontStyle);
        }

        // Párrafo 2
        $textRun2 = $section->addTextRun($bodyParStyle);
        $textRun2->addText("Por lo anterior, se hace constar que $estatus ", $bodyFontStyle);
        $textRun2->addText('ACREDITÓ', ['bold' => true, 'size' => 9]);
        $textRun2->addText(', el requisito de una lengua extranjera para efectos de titulación en una Licenciatura del Tecnológico Nacional de México.', $bodyFontStyle);

        // Párrafo 3
        $textRun3 = $section->addTextRun($bodyParStyle);
        $textRun3->addText('La presente se expide con la facultad que otorga el registro:    ', $bodyFontStyle);
        $textRun3->addText('TecNM-SEyV-DVIA-CNLE-ACT-09/24-ITLEÓN-05', ['bold' => true, 'size' => 9]);

        // Párrafo 4
        $textRun4 = $section->addTextRun($bodyParStyle);
        $textRun4->addText('El cual fue expedido por el TecNM y acredita a la Coordinación de Lenguas Extranjeras (CLE) del Instituto Tecnológico de León como institución formadora y para acreditar el segundo idioma como requisito de titulación.', $bodyFontStyle);

        // Párrafo 5
        $textRun5 = $section->addTextRun($bodyParStyle);
        $vigenciaTexto = $studentType === 'actual' 
            ? 'dos años contados a partir de la fecha de emisión.' 
            : 'dos años contados a partir de la fecha de egreso del estudiante.';
        $textRun5->addText('La presente constancia tendrá una vigencia de ', $bodyFontStyle);
        $textRun5->addText($vigenciaTexto, ['bold' => true, 'size' => 9]);

        // Párrafo 6
        $textRun6 = $section->addTextRun($bodyParStyle);
        $textRun6->addText("Se extiende la presente en la ciudad de León Guanajuato, a los $diaActual días del mes de " . strtolower($mesActual) . " del año " . strtolower($anioLetra) . ", para los fines legales que convengan al interesado.", $bodyFontStyle);

        $section->addTextBreak(1);

        // ── ATENTAMENTE, VOBO, QR Y FIRMAS ───────────────────────────────────
        $verifyUrl = route('certificates.verify', $certificate->validation_code);
        $qrTempPath = null;

        $sigTable = $section->addTable('HeaderTable');
        
        // Fila 1: ATENTAMENTE a la izquierda y QR a la derecha para subirlo un poco
        $sigTable->addRow();
        
        $atentamenteCell = $sigTable->addCell(5000);
        $atentamenteCell->addText('A T E N T A M E N T E', ['bold' => true, 'size' => 10, 'spacing' => 2], ['spaceAfter' => 0]);
        $atentamenteCell->addText('Excelencia en Educación Tecnológica®', ['italic' => true, 'bold' => true, 'size' => 8], ['spaceAfter' => 0]);
        $atentamenteCell->addText('Ciencia, Tecnología y Libertad.', ['italic' => true, 'bold' => true, 'size' => 8], ['spaceAfter' => 0]);
        $atentamenteCell->addTextBreak(2);

        $qrCell = $sigTable->addCell(5000, ['valign' => 'bottom']);

        try {
            $qrPng = QrCode::format('png')->size(150)->margin(1)->generate($verifyUrl);
            $qrTempPath = tempnam(sys_get_temp_dir(), 'qr_') . '.png';
            file_put_contents($qrTempPath, $qrPng);
            $qrCell->addImage($qrTempPath, ['width' => 60, 'height' => 60, 'alignment' => Jc::CENTER]);
        } catch (\Throwable $e) {
            // Si falla la generación del QR, se omite silenciosamente
        }

        $qrCell->addText('Vo.Bo.', ['bold' => true, 'size' => 10], ['alignment' => Jc::CENTER, 'spaceAfter' => 0, 'spaceBefore' => 0]);
        $qrCell->addTextBreak(1);

        $sigTable->addRow();
        
        $sigLeft = $sigTable->addCell(5000);
        $sigLeft->addText($certificate->signer_one_name ?? 'FÁTIMA DEL ROCÍO BECERRA LÓPEZ', ['bold' => true, 'size' => 10], ['alignment' => Jc::CENTER, 'spaceAfter' => 0]);
        $titleFatima = str_replace(' LENGUAS EXTRANJERAS', " LENGUAS\nEXTRANJERAS", $certificate->signer_one_title ?? 'COORDINADORA DE LENGUAS EXTRANJERAS');
        foreach (explode("\n", $titleFatima) as $line) {
            $sigLeft->addText($line, ['bold' => true, 'size' => 10], ['alignment' => Jc::CENTER, 'spaceAfter' => 0]);
        }

        $sigRight = $sigTable->addCell(5000);
        $sigRight->addText($certificate->signer_two_name ?? 'ROCÍO SILVIA VARGAS MONTES DE OCA', ['bold' => true, 'size' => 10], ['alignment' => Jc::CENTER, 'spaceAfter' => 0]);
        $titleRocio = str_replace(' PLANEACIÓN Y VINCULACIÓN', " PLANEACIÓN\nY VINCULACIÓN", $certificate->signer_two_title ?? 'SUBDIRECTORA DE PLANEACIÓN Y VINCULACIÓN');
        foreach (explode("\n", $titleRocio) as $line) {
            $sigRight->addText($line, ['bold' => true, 'size' => 10], ['alignment' => Jc::CENTER, 'spaceAfter' => 0]);
        }

        // ── CCP Y CADENA ÚNICA ────────────────────────
        $section->addTextBreak(1);
        $footerTable = $section->addTable('HeaderTable');
        $footerTable->addRow();
        
        $ccpCell = $footerTable->addCell(4000, ['valign' => 'bottom']);
        $ccpCell->addText("ccp. Archivo\nFDBL/", ['size' => 8], ['spaceAfter' => 0]);
        
        $cadenaCell = $footerTable->addCell(6000, ['valign' => 'bottom']);
        if (!empty($certificate->validation_code)) {
            $cadenaCell->addText("Cadena Única de Caracteres  |  {$certificate->validation_code}", ['size' => 8], ['alignment' => Jc::RIGHT, 'spaceAfter' => 0]);
        }

        // ── LIMPIEZA DE ARCHIVOS TEMPORALES ─────────────────────────
        if ($qrTempPath && file_exists($qrTempPath)) {
            @unlink($qrTempPath);
        }

        return $phpWord;
    }
}
