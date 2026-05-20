<?php

namespace App\Http\Controllers;

use App\Actions\ApproveServiceAction;
use App\Actions\DeleteStudentService;
use App\Actions\ServeStoredFile;
use App\Actions\StoreStudentService;
use App\Http\Requests\StoreServiceRequest;
use App\Http\Requests\UpdateServiceRequest;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Controlador de Pagos/Servicios de Usuario.
 *
 * Implementa un orquestador ligero usando FormRequests para validación
 * y Actions para la lógica de almacenamiento.
 */
class ServiceController extends Controller
{
    /**
     * Almacena un nuevo pago para el alumno autenticado.
     */
    public function store(StoreServiceRequest $request, StoreStudentService $action): RedirectResponse
    {
        Gate::authorize('create', Service::class);

        $studentId = Auth::user()->student?->id;

        $action->execute(
            $request->file('file'),
            $request->validated(),
            (int) $studentId
        );

        return back()->with('success', 'Pago subido exitosamente.');
    }

    /**
     * Actualiza el estatus y comentarios de un pago (Revisión Administrativa).
     */
    public function update(UpdateServiceRequest $request, Service $service, ApproveServiceAction $approveAction): RedirectResponse
    {
        Gate::authorize('update', $service);
        $approveAction->execute($service, $request->validated());

        return back()->with('success', 'Pago actualizado exitosamente.');
    }

    /**
     * Elimina un pago del sistema (Físico y Lógico).
     */
    public function destroy(Service $service, DeleteStudentService $action): RedirectResponse
    {
        Gate::authorize('delete', $service);

        $action->execute($service);

        return back()->with('success', 'Pago eliminado exitosamente.');
    }

    /**
     * Descarga un comprobante de pago autorizado.
     */
    public function download(Service $service, ServeStoredFile $action): StreamedResponse
    {
        Gate::authorize('download', $service);

        return $action->execute($service->disk, $service->file_path, $service->original_name);
    }

    /**
     * Muestra un comprobante de pago en modo inline para formatos compatibles.
     */
    public function preview(Service $service, ServeStoredFile $action): StreamedResponse
    {
        Gate::authorize('view', $service);

        return $action->execute($service->disk, $service->file_path, $service->original_name, 'inline');
    }
}
