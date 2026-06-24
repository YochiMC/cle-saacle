@extends('certificates.base')

@section('oficio_line')
Oficio No. CLE-4H-<span class="highlight">{{ $no_oficio }}</span>/{{ date('Y') }}
@endsection

@section('body_content')
<div class="body-text">
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Por este conducto, la Coordinación de Lenguas Extranjeras de este Instituto, hace constar que
    {{ strtolower($estatus) }} <b>{{ $nombre }}</b> con Número de Control <b>{{ $numero_control }}</b>,
    de la carrera de <b>{{ $carrera }}</b> con clave del Plan de Estudio <b>{{ $plan_estudios }}</b>,
    acreditó el examen de 4 habilidades, obteniendo un nivel <b>{{ $nivel }}</b> con base al
    Marco Común Europeo de Referencia (MCER), acorde a la documentación existente en los archivos
    de este departamento.
</div>
@endsection
