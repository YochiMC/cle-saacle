@extends('certificates.base')

@section('oficio_line')
Oficio No. CLE-CR-<span class="highlight">{{ $no_oficio }}</span>/{{ date('Y') }}
@endsection

@section('body_content')
<div class="body-text">
    Por este conducto, la Coordinación de Lenguas Extranjeras de este Instituto, hace constar que
    <b>{{ $estatus }} {{ $nombre }}</b> con Número de Control <b>{{ $numero_control }}</b>,
    de la carrera de <b>{{ $carrera }}</b> con clave del Plan de Estudio <b>{{ $plan_estudios }}</b>,
    acreditó los cursos correspondientes al Programa Institucional de Inglés, obteniendo una
    calificación promedio de <b>{{ $promedio }}</b> (<b>{{ $promedio_letra }}</b>)
    en el periodo <b>{{ $periodo }}</b>, acorde a la documentación existente en los archivos
    de este departamento.
</div>
@endsection