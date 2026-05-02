<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Gate;
use App\Http\Requests\StorePeriodRequest;
use App\Http\Requests\UpdatePeriodRequest;
use App\Http\Requests\BulkDeletePeriodsRequest;
use App\Models\Period;
use App\Services\PeriodNamingService;
use App\Traits\HandlesCatalogDeletion;
use Illuminate\Http\RedirectResponse;

/**
 * Controlador para la Gestión del Catálogo de Periodos.
 */
class PeriodController extends Controller
{
    use HandlesCatalogDeletion;

    public function store(StorePeriodRequest $request, PeriodNamingService $periodNamingService): RedirectResponse
    {
        Gate::authorize('create', Period::class);
        $validated = $request->validated();
        $validated['name'] = $periodNamingService->generate($validated['start_date'], $validated['end_date']);

        Period::create($validated);

        return redirect()->back()->with('success', 'Periodo creado correctamente.');
    }

    public function update(UpdatePeriodRequest $request, Period $period, PeriodNamingService $periodNamingService): RedirectResponse
    {
        Gate::authorize('update', $period);
        $validated = $request->validated();
        $validated['name'] = $periodNamingService->generate($validated['start_date'], $validated['end_date']);

        $period->update($validated);

        return redirect()->back()->with('success', 'Periodo actualizado correctamente.');
    }

    public function destroy(Period $period): RedirectResponse
    {
        Gate::authorize('delete', $period);
        return $this->handleDeletion(
            fn() => $period->delete(),
            'Periodo eliminado correctamente.',
            'Ocurrió un error al intentar eliminar el periodo.'
        );
    }

    public function bulkDestroy(BulkDeletePeriodsRequest $request): RedirectResponse
    {
        Gate::authorize('deleteAny', Period::class);
        return $this->handleBulkDeletion(
            fn() => Period::whereIn('id', $request->validated()['ids'])->delete(),
            'Periodos eliminados correctamente.',
            'Ocurrió un error al intentar eliminar los periodos.'
        );
    }
}
