<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Kardex — {{ $studentInfo['name'] }}</title>
    <style>
        @page { margin: 0; }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 11px;
            color: #000;
            padding: 20px 30px 60px 30px;
        }

        /* ── CABECERA ─────────────────────────────────────────── */
        .header-table {
            width: 100%;
            border-collapse: collapse;
            border: 2px solid #00008B;
        }

        .header-table td {
            vertical-align: middle;
            padding: 6px 10px;
        }

        .logo-left {
            width: 120px;
            text-align: center;
        }

        .logo-left img {
            max-height: 70px;
            max-width: 110px;
        }

        .header-center {
            text-align: center;
            border-left: 2px solid #00008B;
            border-right: 2px solid #00008B;
        }

        .header-center .title-main {
            font-size: 17px;
            font-weight: bold;
            color: #00008B;
            letter-spacing: 1px;
        }

        .header-center .title-sub {
            font-size: 12px;
            font-weight: bold;
            color: #00008B;
        }

        .logo-right {
            width: 100px;
            text-align: center;
        }

        .logo-right img {
            max-height: 70px;
            max-width: 90px;
        }

        /* ── TÍTULO REPORTE ───────────────────────────────────── */
        .report-title {
            text-align: center;
            font-size: 13px;
            font-weight: bold;
            margin-top: 14px;
            margin-bottom: 14px;
            letter-spacing: 1px;
        }

        /* ── DATOS DEL ALUMNO ─────────────────────────────────── */
        .student-data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 14px;
        }

        .student-data-table td {
            padding: 2px 4px;
            font-size: 11px;
            vertical-align: middle;
        }

        .label-box {
            background-color: #00008B;
            color: #fff;
            font-weight: bold;
            font-size: 10px;
            padding: 3px 8px;
            white-space: nowrap;
            display: inline-block;
        }

        .data-value {
            border-bottom: 1px solid #000;
            min-width: 200px;
            display: inline-block;
            padding: 2px 4px;
        }

        /* ── TABLA DE CALIFICACIONES ──────────────────────────── */
        .grades-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }

        .grades-table thead tr th {
            background-color: #00008B;
            color: #fff;
            font-size: 9.5px;
            font-weight: bold;
            text-align: center;
            padding: 4px 6px;
            border: 1px solid #00008B;
        }

        .grades-table tbody tr td {
            font-size: 10px;
            padding: 3px 6px;
            border: 1px solid #ccc;
            text-align: center;
        }

        .grades-table tbody tr td.left {
            text-align: left;
        }

        .grades-table tbody tr:nth-child(even) td {
            background-color: #f0f4ff;
        }

        /* ── SECCIÓN HISTÓRICO ────────────────────────────────── */
        .section-title {
            font-size: 11px;
            font-weight: bold;
            background-color: #e8ecf7;
            border-left: 4px solid #00008B;
            padding: 4px 8px;
            margin: 12px 0 6px 0;
        }

        /* ── PROMEDIO ─────────────────────────────────────────── */
        .promedio-row {
            width: 100%;
            margin-top: 12px;
        }

        .promedio-label {
            font-size: 11px;
            font-weight: bold;
            display: inline-block;
            width: 140px;
        }

        .promedio-value {
            font-size: 12px;
            font-weight: bold;
            background-color: #00008B;
            color: #fff;
            padding: 2px 12px;
            display: inline-block;
        }

        /* ── PIE ──────────────────────────────────────────────── */
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 50px;
            padding: 6px 30px;
            border-top: 1px solid #ccc;
            font-size: 8px;
            color: #666;
        }

        .footer-table {
            width: 100%;
        }

        .footer-table td {
            vertical-align: bottom;
            font-size: 8px;
            color: #666;
        }
    </style>
</head>
<body>

    {{-- ── CABECERA CON LOGOS ──────────────────────────────────── --}}
    <table class="header-table">
        <tr>
            <td class="logo-left">
                @if(file_exists(public_path('images/logo_tecnm.png')))
                    <img src="{{ public_path('images/logo_tecnm.png') }}" alt="TecNM">
                @elseif(file_exists(public_path('images/logo_tecnm.jpg')))
                    <img src="{{ public_path('images/logo_tecnm.jpg') }}" alt="TecNM">
                @endif
            </td>
            <td class="header-center">
                <div class="title-main">INSTITUTO TECNOLÓGICO DE LEÓN</div>
                <div class="title-sub">COORDINACIÓN DE LENGUAS EXTRANJERAS</div>
            </td>
            <td class="logo-right">
                @if(file_exists(public_path('images/logo_itl.png')))
                    <img src="{{ public_path('images/logo_itl.png') }}" alt="ITL">
                @elseif(file_exists(public_path('images/logo_itl.jpg')))
                    <img src="{{ public_path('images/logo_itl.jpg') }}" alt="ITL">
                @endif
            </td>
        </tr>
    </table>

    {{-- ── TÍTULO ───────────────────────────────────────────────── --}}
    <div class="report-title">REPORTE INDIVIDUAL DE CALIFICACIONES</div>

    {{-- ── DATOS DEL ALUMNO ────────────────────────────────────── --}}
    <table class="student-data-table">
        <tr>
            <td style="width:140px;">
                <span class="label-box">NOMBRE DEL ALUMNO</span>
            </td>
            <td>
                <span class="data-value" style="min-width:320px;">{{ mb_strtoupper($studentInfo['name'], 'UTF-8') }}</span>
            </td>
        </tr>
        <tr>
            <td style="padding-top:6px;">
                <span class="label-box">No. CONTROL</span>
            </td>
            <td style="padding-top:6px;">
                <span class="data-value" style="min-width:180px;">{{ $studentInfo['controlNumber'] }}</span>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <span style="font-weight: normal; font-size: 11px;">CARRERA:</span>
                <span class="data-value" style="min-width:220px;">{{ mb_strtoupper($studentInfo['career'], 'UTF-8') }}</span>
            </td>
        </tr>
    </table>

    {{-- ── TABLA PRINCIPAL DE CALIFICACIONES ──────────────────── --}}
    @if(!empty($kardexData) && count($kardexData) > 0)
    <table class="grades-table">
        <thead>
            <tr>
                <th style="width:40px;">No.</th>
                <th style="width:130px;">NIVEL</th>
                <th>CALIFICACIÓN FINAL</th>
                <th>DOCENTE</th>
                <th style="width:60px;">AÑO</th>
                <th style="width:110px;">PERÍODO</th>
            </tr>
        </thead>
        <tbody>
            @foreach($kardexData as $index => $row)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td class="left">{{ $row['nivel'] ?? $row['materia'] ?? 'N/A' }}</td>
                <td>
                    @php
                        $cal = $row['calificacion'] ?? $row['grade'] ?? 'N/A';
                        $isPass = is_numeric($cal) && $cal >= 70;
                    @endphp
                    <span style="{{ $isPass ? 'color:#1a5c1a; font-weight:bold;' : (is_numeric($cal) ? 'color:#8B0000; font-weight:bold;' : '') }}">
                        {{ $cal }}
                    </span>
                </td>
                <td class="left">{{ $row['teacher'] ?? $row['maestro'] ?? 'N/A' }}</td>
                <td>
                    @php
                        $periodo = $row['periodo'] ?? $row['period'] ?? '';
                        preg_match('/(\d{4})/', $periodo, $anioMatch);
                        echo $anioMatch[1] ?? '—';
                    @endphp
                </td>
                <td>{{ $periodo }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @else
    <p style="font-size:11px; color:#555; text-align:center; padding:16px 0;">Sin registros académicos en el sistema.</p>
    @endif

    {{-- ── SECCIÓN HISTÓRICO (OG) ──────────────────────────────── --}}
    @if(!empty($legacyQualifications) && count($legacyQualifications) > 0)
    <div class="section-title">Calificaciones Históricas (OG)</div>
    <table class="grades-table">
        <thead>
            <tr>
                <th style="width:40px;">No.</th>
                <th style="width:130px;">NIVEL</th>
                <th>CALIFICACIÓN FINAL</th>
                <th>PERÍODO</th>
            </tr>
        </thead>
        <tbody>
            @foreach($legacyQualifications as $index => $lq)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td class="left">{{ $lq['level_name'] ?? 'N/A' }}</td>
                <td>
                    @php
                        $grade = $lq['final_grade'] ?? 0;
                        $isPass = is_numeric($grade) && $grade >= 70;
                    @endphp
                    <span style="{{ $isPass ? 'color:#1a5c1a; font-weight:bold;' : 'color:#8B0000; font-weight:bold;' }}">
                        {{ $grade }}
                    </span>
                </td>
                <td>{{ $lq['period'] ?? '—' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    {{-- ── PROMEDIO ─────────────────────────────────────────────── --}}
    @if($promedio !== null)
    <div style="margin-top: 16px; padding: 4px 0;">
        <span class="promedio-label">PROMEDIO</span>
        <span class="promedio-value">{{ number_format($promedio, 1) }}</span>
    </div>
    @endif

    {{-- ── PIE DE PÁGINA ───────────────────────────────────────── --}}
    <div class="footer">
        <table class="footer-table">
            <tr>
                <td>
                    @if(file_exists(public_path('images/logo_sep.png')))
                        <img src="{{ public_path('images/logo_sep.png') }}" alt="SEP" style="max-height:30px;">
                    @endif
                </td>
                <td style="text-align:center;">
                    Av. Tecnológico s/n, Fraccionamiento Industrial Julián de Obregón &nbsp;|&nbsp;
                    C.P. 37290 León, Gto. &nbsp;|&nbsp; Tel. 477 7105200<br>
                    tecleon@leon.tecnm.mx &nbsp;|&nbsp; www.leon.tecnm.mx
                </td>
                <td style="text-align:right;">
                    Generado: {{ \Carbon\Carbon::now()->format('d/m/Y') }}
                </td>
            </tr>
        </table>
    </div>

</body>
</html>
