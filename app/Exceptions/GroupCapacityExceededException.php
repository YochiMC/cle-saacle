<?php

namespace App\Exceptions;

use Exception;

class GroupCapacityExceededException extends Exception
{
    /**
     * Render the exception into an HTTP response.
     */
    public function render($request)
    {
        // Redirige al usuario de vuelta a la pantalla donde originó la petición
        // inyectando la clave 'error' en la sesión flash para Inertia.
        return back()->with('error', 'No se pudo inscribir al alumno: El grupo ha alcanzado su límite máximo de capacidad.');
    }
}
