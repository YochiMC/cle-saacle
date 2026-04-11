<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Service;

/**
 * Controlador de Servicios / Pagos de Alumno.
 *
 * @todo PENDIENTE DE INTEGRACIÓN — Este controlador no tiene rutas activas en web.php.
 *       Antes de conectarlo, se deben realizar las siguientes mejoras:
 *
 *       1. Extraer validaciones inline (7 reglas duplicadas entre create y update) a FormRequests:
 *          - createService()  → App\Http\Requests\StoreServiceRequest
 *          - updateService()  → App\Http\Requests\UpdateServiceRequest
 *
 *       2. Corregir los retornos: todos los métodos devuelven void.
 *          Deben retornar RedirectResponse o JsonResponse.
 *
 *       3. getServices() no retorna ni pasa los datos a ninguna vista.
 */
class ServiceController extends Controller
{
    public function createService(Request $request): void
    {
        $validate = $request->validate([
            'type'             => 'required|string|max:255',
            'amount'           => 'required|numeric',
            'status'           => 'required|string|max:255',
            'description'      => 'nullable|string',
            'reference_number' => 'nullable|string|max:255',
            'file_path'        => 'nullable|string|max:255',
            'student_id'       => 'required|exists:students,id',
        ]);

        $service = Service::create($validate);
    }

    public function getServices(): void
    {
        $services = Service::all();
    }

    public function updateService(Service $service, Request $request): void
    {
        $validate = $request->validate([
            'type'             => 'required|string|max:255',
            'amount'           => 'required|numeric',
            'status'           => 'required|string|max:255',
            'description'      => 'nullable|string',
            'reference_number' => 'nullable|string|max:255',
            'file_path'        => 'nullable|string|max:255',
            'student_id'       => 'required|exists:students,id',
        ]);

        $service->update($validate);
    }

    public function deleteService(Service $service): void
    {
        $service->delete();
    }
}
