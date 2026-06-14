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
        padding: 28px 48px 100px 48px;
        line-height: 1.4;
    }

    /* ── CABECERA ─────────────────────────────────────── */
    .header-table {
        width: 100%;
        border-collapse: collapse;
        border: 2px solid #17365D;
    }

    .header-table td {
        vertical-align: middle;
        padding: 0;
    }

    .logo-sep {
        width: 310px;
    }

    .logo-sep img {
        max-height: 68px;
        max-width: 310px;
    }

    .logo-tecnm {
        width: 100px;
        text-align: right;
    }

    .logo-tecnm img {
        max-height: 68px;
        max-width: 100px;
    }

    .logo-itl {
        width: 100px;
        text-align: right;
        padding-right: 0;
    }

    .logo-itl img {
        max-height: 68px;
        max-width: 100px;
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
        margin-bottom: 18px;
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
        margin-top: 44px;
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
        bottom: 0;
        left: 0;
        right: 0;
        height: 130px;
        padding: 0 48px;
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
        width: 140px;
        vertical-align: bottom;
    }

    .footer-logo-left img {
        max-height: 70px;
    }

    .footer-address-cell {
        vertical-align: bottom;
        font-size: 8.5px;
        color: #666;
        padding-left: 8px;
    }

    .footer-logo-right {
        width: 130px;
        vertical-align: bottom;
        text-align: right;
    }

    .footer-logo-right img {
        max-height: 50px;
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
            <td class="logo-sep">
                <x-certificate-logo name="logo_sep" :isPdf="$is_pdf ?? false" alt="SEP" />
            </td>
            <td class="logo-tecnm">
                <x-certificate-logo name="logo_tecnm" :isPdf="$is_pdf ?? false" alt="TecNM" />
            </td>
            <td class="logo-itl">
                <x-certificate-logo name="logo_itl" :isPdf="$is_pdf ?? false" alt="ITL" />
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

    {{-- ── QR EN LUGAR DE VOBO ─────────────────────────────────── --}}
    <table style="width:100%; margin-top:18px; margin-bottom:14px;">
        <tr>
            <td>&nbsp;</td>
            <td style="text-align:right; padding-right:44px;">
                @if(!empty($qr_image))
                <img src="{{ $qr_image }}" style="width:82px; height:82px; display:block; margin-left:auto;"
                    alt="QR Verificación">
                <div style="font-size:7px; color:#555; text-align:center; margin-top:2px; width:82px;"></div>
                @endif
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

        <table class="footer-bottom-table">
            <tr>
                <td class="footer-logo-left">
                    <x-certificate-logo name="logo_margarita" :isPdf="$is_pdf ?? false" alt="2026" />
                </td>
                <td class="footer-address-cell">
                    Av. Tecnológico s/n, Fraccionamiento Industrial Julián de Obregón<br>
                    C.P. 37290 León, Gto. Tel. 477 7105200 Ext.1503<br>
                    e-mail: tecleon@leon.tecnm.mx &nbsp;|&nbsp; www.leon.tecnm.mx
                </td>
                <td style="width:10px;">&nbsp;</td>
                <td class="footer-logo-right">
                    <x-certificate-logo name="logo_seals" :isPdf="$is_pdf ?? false" alt="" />
                </td>
            </tr>
        </table>
    </div>

</body>

</html>