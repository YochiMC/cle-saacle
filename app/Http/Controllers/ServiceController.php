<?php

namespace App\Http\Controllers;

use App\Actions\DeleteStudentService;
use App\Actions\StoreStudentService;
use App\Http\Requests\StoreServiceRequest;
use App\Http\Requests\UpdateServiceRequest;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * Controlador de Pagos/Servicios de Usuario.
 *
 * Implementa un orquestador ligero usando FormRequests para validación
 * y Actions para la lógica de almacenamiento.
 */
class ServiceController extends Controller
{
    private function canReviewServices(): bool
    {
        /** @var User|null $user */
        $user = Auth::user();

        return $user?->hasAnyRole(['admin', 'coordinator']) ?? false;
    }

    private function canDownloadService(Service $service): bool
    {
        return $service->student_id === Auth::user()->student?->id || $this->canReviewServices();
    }

    private function resolveServiceAbsolutePath(Service $service): string
    {
        if (! Storage::disk($service->disk)->exists($service->file_path)) {
            abort(404, 'Archivo no encontrado.');
        }

        return Storage::disk($service->disk)->path($service->file_path);
    }

    /**
     * Almacena un nuevo pago para el alumno autenticado.
     */
    public function store(StoreServiceRequest $request, StoreStudentService $action): RedirectResponse
    {
        $studentId = Auth::user()->student?->id;
        
        if ($studentId === null) {
            abort(403, 'Solo los alumnos pueden subir pagos.');
        }

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
    public function update(UpdateServiceRequest $request, Service $service): RedirectResponse
    {
        if (!$this->canReviewServices()) {
            abort(403, 'No autorizado para revisar pagos.');
        }

        $service->update($request->validated());

        $student = $service->student;
        if ($student) {
            if ($request->status === \App\Enums\ServiceStatus::APPROVED->value) {
                $student->update(['status' => \App\Enums\StudentStatus::VALIDATED]);
                
                $activePeriod = \App\Models\Period::where('is_active', true)->first();
                if ($activePeriod) {
                    $service->update(['period_id' => $activePeriod->id]);
                }
            } elseif ($request->status === \App\Enums\ServiceStatus::REJECTED->value) {
                $student->update(['status' => \App\Enums\StudentStatus::WAITING]);
            }
        }

        return back()->with('success', 'Pago actualizado exitosamente.');
    }

    /**
     * Elimina un pago del sistema (Físico y Lógico).
     */
    public function destroy(Service $service, DeleteStudentService $action): RedirectResponse
    {
        // Solo el propietario puede eliminar su pago
        if ($service->student_id !== Auth::user()->student?->id) {
            abort(403, 'No autorizado para eliminar este pago.');
        }

        $action->execute($service);

        return back()->with('success', 'Pago eliminado exitosamente.');
    }

    /**
     * Descarga un comprobante de pago autorizado.
     */
    public function download(Service $service): BinaryFileResponse
    {
        if (! $this->canDownloadService($service)) {
            abort(403, 'No autorizado para descargar este documento.');
        }

        $absolutePath = $this->resolveServiceAbsolutePath($service);

        return response()->download($absolutePath, $service->original_name);
    }
}
