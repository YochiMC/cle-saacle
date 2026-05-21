<?php

namespace App\Exceptions;

use Exception;

class EnrollmentWindowClosedException extends Exception
{
    /**
     * Render the exception into an HTTP response.
     */
    public function render($request)
    {
        // Redirige al usuario de vuelta a la pantalla donde originó la petición
        // inyectando la clave 'error' en la sesión flash para Inertia.
        return back()->with('error', 'El periodo de inscripción para este grupo/examen se encuentra cerrado o inactivo.');
    }
}
