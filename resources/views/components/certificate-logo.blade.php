@props(['name', 'isPdf' => false, 'is_pdf' => false, 'alt' => ''])

@php
    $isPdfResolved = $isPdf || $is_pdf;
    $extension = null;
    if (file_exists(public_path("images/{$name}.png"))) {
        $extension = 'png';
    } elseif (file_exists(public_path("images/{$name}.jpg"))) {
        $extension = 'jpg';
    }
@endphp

@if($extension)
    @php
        $path = "images/{$name}.{$extension}";
        if ($isPdfResolved) {
            $src = 'file:///' . str_replace('\\', '/', public_path($path));
        } else {
            $src = asset($path);
        }
    @endphp
    <img src="{{ $src }}" alt="{{ $alt }}" {{ $attributes }}>
@endif
