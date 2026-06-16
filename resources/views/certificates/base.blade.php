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
            font-family: Arial, Helvetica, sans-serif;
            font-size: 12.5px;
            color: #000;
            padding: 0.42cm 1.5cm 6.2cm 2.5cm;
            line-height: 1.4;
        }

        /* ── CABECERA ─────────────────────────────────────── */
        .header-table {
            width: 100%;
            border-collapse: collapse;
            border: none;
            /* ¡Aquí eliminamos el borde! */
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
        }

        .logo-itl {
            text-align: right;
            width: 40%;
            padding-right: 0;
        }

        .logo-itl img {
            height: 70px;
            /* Reducido para hacer juego con los de la izquierda */
            width: auto;
        }

        /* ── INFO INSTITUTO ───────────────────────────────── */
        .institute-info {
            text-align: right;
            font-size: 11px;
            font-weight: bold;
            margin-top: 6px;
            line-height: 1.5;
        }

        .institute-info span {
            font-weight: normal;
            font-size: 10px;
        }

        /* ── META OFICIO ──────────────────────────────────── */
        .meta-info {
            text-align: right;
            margin-top: 22px;
            margin-bottom: 28px;
            line-height: 1.7;
            font-size: 12.5px;
        }

        .highlight {
            background-color: #FF9800;
            padding: 0 2px;
        }

        /* ── CUERPO ───────────────────────────────────────── */
        .saludo {
            font-weight: bold;
            font-size: 13px;
            margin-bottom: 18px;
        }

        .body-text {
            text-align: justify;
            margin-bottom: 12px;
            font-size: 12.5px;
        }

        .body-text b {
            font-weight: bold;
        }

        /* ── ATENTAMENTE ──────────────────────────────────── */
        .atentamente {
            font-weight: bold;
            font-size: 12.5px;
            letter-spacing: 2px;
            margin-top: 28px;
            margin-bottom: 2px;
        }

        .lema {
            font-style: italic;
            font-size: 10px;
            font-weight: normal;
            letter-spacing: 0;
        }

        /* ── VOBO ─────────────────────────────────────────── */
        .vobo-row {
            width: 100%;
            margin-top: 16px;
            margin-bottom: 16px;
        }

        .vobo-cell {
            text-align: right;
            font-weight: bold;
            padding-right: 60px;
        }

        /* ── FIRMAS ───────────────────────────────────────── */
        .signatures-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }

        .sig-left {
            width: 50%;
            vertical-align: top;
            text-align: left;
            font-size: 12px;
        }

        .sig-right {
            width: 50%;
            vertical-align: top;
            text-align: right;
            font-size: 12px;
        }

        .sig-name {
            font-weight: bold;
        }

        .sig-title {
            font-weight: bold;
        }

        /* ── PIE DE PÁGINA ────────────────────────────────── */
        .footer {
            position: fixed;
            bottom: 2cm;
            left: 0;
            right: 0;
            height: 145px;
            padding-left: 2.5cm;
            padding-right: 1.5cm;
        }

        .ccp {
            font-size: 9px;
            color: #333;
            margin-bottom: 4px;
        }

        .cadena-box {
            border: 1px dotted #555;
            display: inline-block;
            padding: 1px 8px;
            font-size: 8.5px;
            float: right;
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

        .footer-logo-right {
            display: none;
        }

        /* ── QR ───────────────────────────────────────────── */
        .qr-area {
            margin-top: 0;
            position: relative;
            top: -10px;
        }

        .qr-area img {
            width: 72px;
            height: 72px;
            display: block;
            margin: 0 auto;
        }

        .qr-code-label {
            font-size: 7px;
            color: #666;
            text-align: center;
            width: 72px;
            margin-top: 2px;
        }
    </style>
</head>

<body>

    {{-- ── CABECERA CON LOGOS ──────────────────────────────── --}}
    <table class="header-table">
        <tr>
            <td class="logo-sep-tecnm">
                <span style="display: inline-block; vertical-align: middle;">
                    <x-certificate-logo name="logo_sep" class="img-sep" :is-pdf="$is_pdf ?? false" alt="SEP" />
                </span>
                <span class="golden-separator"></span>
                <span style="display: inline-block; vertical-align: middle;">
                    <x-certificate-logo name="logo_tecnm" class="img-tecnm" :is-pdf="$is_pdf ?? false" alt="TecNM" />
                </span>
            </td>
            <td class="logo-itl">
                <x-certificate-logo name="logo_itl" :is-pdf="$is_pdf ?? false" alt="ITL / Membrete" />
            </td>
        </tr>
    </table>

    <div class="institute-info">
        Instituto Tecnológico de León<br>
        <span>Subdirección de Planeación y Vinculación</span>
    </div>

    {{-- ── META OFICIO ─────────────────────────────────────── --}}
    <div class="meta-info">
        León, Guanajuato, <span
            class="highlight">{{ \Carbon\Carbon::now()->format('d') . '/' . strtoupper(\Carbon\Carbon::now()->isoFormat('MMMM')) . '/' . date('Y') }}</span><br>
        @yield('oficio_line')<br>
        Asunto: Constancia de Inglés
    </div>

    {{-- ── SALUDO ───────────────────────────────────────────── --}}
    <div class="saludo">A QUIEN CORRESPONDA:</div>

    {{-- ── CUERPO ESPECÍFICO DE CADA PLANTILLA ────────────── --}}
    @yield('body_content')

    {{-- ── PÁRRAFOS COMUNES ─────────────────────────────────── --}}
    <div class="body-text">
        Por lo anterior, se hace constar que <b>{{ $estatus }} {{ $nombre }}</b> ACREDITÓ, el requisito de una lengua
        extranjera para efectos de titulación en una Licenciatura del Tecnológico Nacional de México.
    </div>

    <div class="body-text">
        La presente se expide con la facultad que otorga el registro: &nbsp;&nbsp;&nbsp;
        <b>TecNM-SEyV-DVIA-CNLE-ACT-09/24-ITLEÓN-05</b>
    </div>

    <div class="body-text">
        El cual fue expedido por el TecNM y acredita a la Coordinación de Lenguas Extranjeras (CLE) del Instituto
        Tecnológico de León como institución formadora y para acreditar el segundo idioma como requisito de titulación.
    </div>

    <div class="body-text">
        @if(isset($student_type) && $student_type === 'actual')
        La presente constancia tendrá una vigencia de <b>2 años</b> contados apartir de la fecha de emisión.
        @else
        La presente constancia tendrá una vigencia de <b>2 años</b> contados a partir de la fecha de egreso del
        estudiante.
        @endif
    </div>

    <div class="body-text">
        Se extiende la presente en la ciudad de León Guanajuato, a los {{ \Carbon\Carbon::now()->format('d') }} días del
        mes de {{ strtolower(\Carbon\Carbon::now()->isoFormat('MMMM')) }} del año {{ strtolower($anio_letra) }}, para
        los fines legales que convengan al interesado.
    </div>

    {{-- ── ATENTAMENTE ───────────────────────────────────────── --}}
    <div class="atentamente">
        A T E N T A M E N T E<br>
        <div class="lema">Excelencia en Educación Tecnológica®<br>Ciencia, Tecnología y Libertad.</div>
    </div>

    {{-- ── VOBO Y QR ─────────────────────────────────── --}}
    <table style="width:100%; margin-top:18px; margin-bottom:14px;">
        <tr>
            <td>&nbsp;</td>
            <td style="text-align:right; padding-right:44px; vertical-align: bottom;">
                <table style="float: right; text-align: center;">
                    <tr>
                        <td style="padding-right: 15px; vertical-align: bottom; padding-bottom: 5px;">
                            <div style="font-weight:bold; font-size:14px;">Vo.Bo.</div>
                        </td>
                        <td style="vertical-align: bottom;">
                            @if(!empty($qr_image))
                            <img src="{{ $qr_image }}" style="width:82px; height:82px; display:block; margin-left:auto;"
                                alt="QR Verificación">
                            <div style="font-size:7px; color:#555; text-align:center; margin-top:2px; width:82px;">
                            </div>
                            @endif
                        </td>
                    </tr>
                </table>
                <div style="clear: both;"></div>
            </td>
        </tr>
    </table>

    {{-- ── FIRMAS ────────────────────────────────────────────── --}}
    <table class="signatures-table">
        <tr>
            <td class="sig-left">
                <div class="sig-name">{{ $signer_one_name ?? 'FÁTIMA DEL ROCÍO BECERRA LÓPEZ' }}</div>
                <div class="sig-title">{{ $signer_one_title ?? 'COORDINADORA DE LENGUAS<br>EXTRANJERAS' }}</div>
            </td>
            <td class="sig-right">
                <div class="sig-name">{{ $signer_two_name ?? 'ROCÍO SILVIA VARGAS MONTES DE OCA' }}</div>
                <div class="sig-title">{{ $signer_two_title ?? 'SUBDIRECTORA DE PLANEACIÓN<br>Y VINCULACIÓN' }}</div>
            </td>
        </tr>
    </table>

    {{-- ── PIE DE PÁGINA (FIJO) ─────────────────────────────── --}}
    <div class="footer">
        <div class="ccp">
            ccp. Archivo<br>
            FDBL/
            <span class="cadena-box">
                Cadena Única de Caracteres &nbsp; | &nbsp; {{ $validation_code }}
            </span>
        </div>

        <div style="clear:both; margin-top: 6px;"></div>

        <div style="text-align: right; padding-right: 0px; margin-bottom: 4px;">
            <x-certificate-logo name="logo_seals" :is-pdf="$is_pdf ?? false" alt=""
                style="max-height: 45px; display: inline-block;" />
        </div>

        <table class="footer-bottom-table">
            <tr>
                <td class="footer-logo-left">
                    <x-certificate-logo name="logo_margarita" :is-pdf="$is_pdf ?? false" alt="2026" />
                </td>
                <td class="footer-address-cell">
                    <div class="address-container">
                        Av. Tecnológico s/n, Fraccionamiento Industrial Julián de Obregón<br>
                        C.P. 37290 León, Gto. Tel. 477 7105200<br>
                        e-mail: tecleon@leon.tecnm.mx &nbsp;|&nbsp; www.leon.tecnm.mx
                    </div>
                </td>
            </tr>
        </table>
    </div>

</body>

</html>