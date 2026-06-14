@props(['name', 'isPdf' => false, 'is_pdf' => false, 'alt' => ''])

@php
$isPdfResolved = $isPdf || $is_pdf;
$extension = null;
$fullPath = null;

// 1. Buscamos la imagen en la carpeta correcta: resources/images/
if (file_exists(resource_path("images/{$name}.png"))) {
$extension = 'png';
$fullPath = resource_path("images/{$name}.png");
} elseif (file_exists(resource_path("images/{$name}.jpg"))) {
$extension = 'jpg';
$fullPath = resource_path("images/{$name}.jpg");
} elseif (file_exists(resource_path("images/{$name}.jpeg"))) {
$extension = 'jpeg';
$fullPath = resource_path("images/{$name}.jpeg");
}
@endphp

@if($fullPath)
@php
// 2. Leemos el archivo físico
$imageData = file_get_contents($fullPath);

// 3. Lo convertimos a texto Base64
$base64 = base64_encode($imageData);

// 4. Armamos la ruta incrustada (data URI)
$src = 'data:image/' . $extension . ';base64,' . $base64;
@endphp

<img src="{{ $src }}" alt="{{ $alt }}" {{ $attributes }}>
@endif
