<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Constancia de Inglés</title>
    <style>
        @page {
            margin: 0;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            /* Se usa Noto Sans como fuente principal (registrada en DomPDF via storage/fonts/) */
            font-family: 'Noto Sans', sans-serif;
            font-size: 9pt;
            color: #000;
            padding: 5.5cm 1.6cm 4.9cm 2.5cm;
            line-height: 1.15;
        }

        /* ── CABECERA ─────────────────────────────────────── */
        .header-table {
            width: 100%;
            border-collapse: collapse;
            border: none;
            display: none;
        }

        .header-table td {
            vertical-align: middle;
            /* Centra los logos verticalmente */
            padding: 0;
        }

        .logo-sep-tecnm {
            text-align: left;
            width: 60%;
            white-space: nowrap;
            padding-top: 10px;
            /* Membrete: logos ya impresos en la hoja */
            visibility: hidden;
        }

        .img-sep {
            height: 60px;
            width: auto;
            vertical-align: middle;
        }

        .img-tecnm {
            height: 70px;
            /* Ligeramente más alto para compensar el margen interno de la imagen */
            width: auto;
            vertical-align: middle;
        }

        .golden-separator {
            display: inline-block;
            vertical-align: middle;
            border-left: 2px solid #cba25d;
            height: 40px;
            margin: 0 15px;
            /* Membrete: separador ya impreso en la hoja */
            visibility: hidden;
        }

        .logo-itl {
            text-align: right;
            width: 40%;
            padding-right: 0;
            /* Membrete: logo ya impreso en la hoja */
            visibility: hidden;
        }

        .logo-itl img {
            height: 70px;
            /* Reducido para hacer juego con los de la izquierda */
            width: auto;
        }

        /* ── META OFICIO ──────────────────────────────────── */
        .meta-info {
            text-align: right;
            line-height: 1.0;
            font-size: 9pt;
        }

        .highlight {
            background-color: #999999;
            padding: 0 2px;
        }

        /* ── CUERPO ───────────────────────────────────────── */
        .saludo {
            font-weight: bold;
            font-size: 10pt;
            margin-bottom: 10pt;
        }

        .body-text {
            text-align: justify;
            margin-bottom: 9.15pt;
            /* Reducido (antes 12px) */
            font-size: 9pt;
            line-height: 1;
        }

        .body-text b {
            font-weight: bold;
        }

        /* Contenedor del cuerpo de la carta */
        .carta-cuerpo {
            margin-top: 10.15pt;
            /* Espacio respecto al texto superior (si lo hay) */
            width: 100%;
        }

        /* Estilo directo a los párrafos dentro del contenedor */
        .carta-cuerpo p {
            text-align: justify;
            margin-bottom: 10.15pt;
            /* Distancia exacta entre párrafos para replicar la imagen */
            font-size: 9pt;
            line-height: 1.15;
        }

        .carta-cuerpo b {
            font-weight: bold;
        }

        /* ── ATENTAMENTE ──────────────────────────────────── */
        .titulo-atentamente {
            font-weight: bold;
            font-size: 10pt;
            line-height: 1;
            margin-bottom: 0;
            padding-bottom: 0;
        }

        .lema {
            font-style: italic;
            font-weight: bold;
            font-size: 8pt;
            line-height: 0.9;
            margin-top: 0.5px;
            padding-top: 0;
        }

        .iconito-r {
            font-size: 4pt;
            vertical-align: baseline;
            position: relative;
            top: -1px;
        }

        /* ── FIRMAS ───────────────────────────────────────── */
        .signatures-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 55px;
            line-height: 0.9;
            /* Mantenemos el interlineado tipo Word */
        }

        .sig-left {
            width: 50%;
            vertical-align: bottom;
            text-align: left;
            /* CORRECCIÓN: Pegado al margen izquierdo */
            font-size: 10pt;
        }

        .sig-right {
            width: 50%;
            vertical-align: bottom;
            text-align: right;
            /* CORRECCIÓN: Pegado al margen derecho */
            font-size: 10pt;
        }

        .sig-name {
            font-weight: bold;
            text-transform: uppercase;
        }

        .sig-title {
            font-weight: bold;
            text-transform: uppercase;
        }

        /* ── PIE DE PÁGINA ────────────────────────────────── */
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 5.2cm;
            /* Ajustado para que el texto FDBL inicie a ~4.9cm del borde inferior */
            padding-left: 2.5cm;
            padding-right: 1.5cm;
        }

        .ccp {
            font-size: 8pt;
            line-height: 0.9;
        }

        .cadena-box {
            border: 1px dotted #555;
            display: inline-block;
            padding: 1px 8px;
            font-size: 8.5px;
            margin-top: 4px;
        }

        .footer-bottom-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 6px;
        }

        .footer-logo-left {
            width: 165px;
            vertical-align: bottom;
            position: relative;
            top: -12px;
            left: -20px;
            /* <--- Agrega esta línea para empujar el logo a la izquierda */
        }

        .footer-logo-left img {
            max-height: 90px;
        }

        .footer-address-cell {
            vertical-align: bottom;
            font-size: 8.5px;
            color: #8e2b3b;
            padding-left: 12px;
            padding-bottom: 5px;
            font-weight: bold;
        }

        .address-container {
            border-top: 3px solid #8e2b3b;
            /* Color guinda del membrete */
            padding-top: 4px;
        }

    </style>
</head>

<body>
    {{-- ── META OFICIO ─────────────────────────────────────── --}}
    <div class="meta-info">
        León, Guanajuato, <span class="highlight">{{ $fecha_emision->format('d') . '/' . strtoupper($fecha_emision->isoFormat('MMMM')) . '/' . $fecha_emision->format('Y') }}</span><br>
        @yield('oficio_line')<br>
        Asunto: Constancia de Inglés
    </div>

    {{-- ── SALUDO ───────────────────────────────────────────── --}}
    <div class="saludo">A QUIEN CORRESPONDA:</div>

    {{-- ── CUERPO ESPECÍFICO DE CADA PLANTILLA ────────────── --}}
    @yield('body_content')

    {{-- ── PÁRRAFOS COMUNES ─────────────────────────────────── --}}
    <div class="carta-cuerpo">
        <p>
            Por lo anterior, se hace constar que {{ strtolower($estatus) }} <b>ACREDITÓ</b>, el requisito de una lengua
            extranjera para efectos de titulación en una Licenciatura del Tecnológico Nacional de México.
        </p>
        <p>
            La presente se expide con la facultad que otorga el registro: &nbsp;&nbsp;&nbsp;
            <b>TecNM-SEyV-DVIA-CNLE-ACT-09/24-ITLEÓN-05</b>
        </p>
        <p>
            El cual fue expedido por el TecNM y acredita a la Coordinación de Lenguas Extranjeras (CLE) del Instituto
            Tecnológico de León como institución formadora y para acreditar el segundo idioma como requisito de titulación.
        </p>
        <p>
            @if(isset($student_type) && $student_type === 'actual')
            La presente constancia tendrá una vigencia de <b>dos años contados a partir de la fecha de emisión.</b>
            @else
            La presente constancia tendrá una vigencia de <b>dos años contados a partir de la fecha de egreso del
                estudiante.</b>
            @endif
        </p>
        <p>
            Se extiende la presente en la ciudad de León Guanajuato, a los {{ $fecha_emision->format('d') }} días del
            mes de {{ strtolower($fecha_emision->isoFormat('MMMM')) }} del año {{ strtolower($anio_letra) }}, para
            los fines legales que convengan al interesado.
        </p>
    </div>

    {{-- ── ATENTAMENTE + VOBO/QR ────────────────────────────── --}}
    <table style="width:100%; margin-top:0.5cm; margin-bottom:14px;">
        <tr>
            <td style="vertical-align: top; width:60%;">
                <div>
                    <div class="titulo-atentamente">A T E N T A M E N T E</div>
                    <div class="lema">
                        Excelencia en Educación Tecnológica<span class="iconito-r">®</span><br>
                        Ciencia, Tecnología y Libertad.
                    </div>
                </div>
            </td>
            <td style="vertical-align: top; text-align: center; width:40%;">
                @if(!empty($qr_image))
                <img src="{{ $qr_image }}" style="width:45px; height:45px; display:block; margin:0 auto;" alt="QR Verificación">
                @endif
                <div style="font-weight:bold; font-size:10pt; margin-top:2px;">Vo.Bo.</div>
            </td>
        </tr>
    </table>

    {{-- ── FIRMAS ────────────────────────────────────────────── --}}
    <table class="signatures-table">
        <tr>
            <td class="sig-left">
                <div class="sig-name">{{ $signer_one_name ?? 'FÁTIMA DEL ROCÍO BECERRA LÓPEZ' }}</div>
                <div class="sig-title">{!! str_replace(' LENGUAS EXTRANJERAS', ' LENGUAS <br>EXTRANJERAS',
                    $signer_one_title ?? 'COORDINADORA DE LENGUAS EXTRANJERAS') !!}</div>
            </td>
            <td class="sig-right">
                <div class="sig-name">{{ $signer_two_name ?? 'ROCÍO SILVIA VARGAS MONTES DE OCA' }}</div>
                <div class="sig-title">{!! str_replace(' PLANEACIÓN Y VINCULACIÓN', ' PLANEACIÓN <br> Y VINCULACIÓN',
                    $signer_two_title ?? 'SUBDIRECTORA DE PLANEACIÓN Y VINCULACIÓN') !!}</div>
            </td>
        </tr>
    </table>

    {{-- ── CCP Y CADENA ÚNICA ──────────────────────────────────────── --}}
    <table style="width: 100%; margin-top: 15px;">
        <tr>
            <td style="vertical-align: bottom;">
                <div class="ccp" style="text-align: left;">
                    ccp. Archivo<br>
                    FDBL/
                </div>
            </td>
            <td style="vertical-align: bottom; text-align: right;">
                @if(!empty($validation_code))
                <span class="cadena-box">
                    Cadena Única de Caracteres &nbsp; | &nbsp; {{ $validation_code }}
                </span>
                @else
                <div style="font-size: 8.5px; color: #999; font-weight: bold;">
                    [SE GENERARÁ AL EMITIR LA CONSTANCIA]
                </div>
                @endif
            </td>
        </tr>
    </table>

</body>

</html>
