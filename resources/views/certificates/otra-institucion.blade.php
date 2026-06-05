@extends('certificates.base')

@section('oficio_line')
Oficio No. CLE-CNV-<span class="highlight">«No_Oficio»</span>/{{ date('Y') }}
@endsection

@section('body_content')
<div class="body-text">
    Por este conducto, la Coordinación de Lenguas Extranjeras de este Instituto, hace constar que
    <b>{{ $estatus }} {{ $nombre }}</b> con Número de Control <b>{{ $numero_control }}</b>,
    de la carrera de <b>{{ $carrera }}</b> con clave del Plan de Estudio <b>{{ $plan_estudios }}</b>,
    presentó la documentación de acreditación emitida por otra institución, acreditando el equivalente
    al nivel B1 (<b>{{ $nivel }}</b>) con base al Marco Común Europeo de Referencia (MCER),
    acorde a la documentación existente en los archivos de este departamento.
</div>
@endsection