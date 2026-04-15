<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Http\Requests\StoreServiceRequest;
use App\Http\Requests\UpdateServiceRequest;
use Illuminate\Http\RedirectResponse;

/**
 * Controlador para la Gestión de Servicios / Pagos de Alumnos.
 * 
 * Implementa el patrón Thin Controller para asegurar un flujo de datos limpio
 * y compatible con el ciclo de vida de Inertia.js.
 */
class ServiceController extends Controller
{
    /**
     * Lista todos los servicios registrados.
     */
    public function index()
    {
        return Service::with('student')->get();
    }

    /**
     * Almacena un nuevo servicio o pago.
     */
    public function store(StoreServiceRequest $request): RedirectResponse
    {
        Service::create($request->validated());

        return redirect()->back()->with('success', 'Servicio registrado correctamente.');
    }

    /**
     * Actualiza un registro de servicio existente.
     */
    public function update(UpdateServiceRequest $request, Service $service): RedirectResponse
    {
        $service->update($request->validated());

        return redirect()->back()->with('success', 'Servicio actualizado correctamente.');
    }

    /**
     * Elimina un registro de servicio.
     */
    public function destroy(Service $service): RedirectResponse
    {
        $service->delete();

        return redirect()->back()->with('success', 'Servicio eliminado correctamente.');
    }
}
