<?php

namespace App\Observers;

use App\Models\Service;
use App\Enums\ServiceStatus;
use App\Enums\StudentStatus;

class ServiceObserver
{
    /**
     * Maneja los cambios de estado del servicio/pago.
     *
     * Cuando un administrador aprueba un pago, el alumno queda elegible
     * para inscribirse al concepto que pagó (examen o curso).
     */
    public function updated(Service $service): void
    {
        // Solo procesa si el status cambió
        if (!$service->wasChanged('status')) {
            return;
        }

        // Si el pago fue aprobado, marca al estudiante como elegible para inscripción
        if ($service->status === ServiceStatus::APPROVED) {
            $student = $service->student;
            if ($student) {
                $student->update([
                    'status' => StudentStatus::ELEGIBLE_INSCRIPCION,
                ]);
            }
        }
    }
}
