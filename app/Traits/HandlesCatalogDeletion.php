<?php

namespace App\Traits;

use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;

/**
 * Trait HandlesCatalogDeletion
 * 
 * Centraliza la lógica de eliminación individual y masiva para los catálogos,
 * manejando excepciones de integridad referencial (error 23000) de forma unificada.
 */
trait HandlesCatalogDeletion
{
    /**
     * Ejecuta la eliminación de un registro y gestiona la respuesta.
     */
    protected function handleDeletion(callable $callback, string $successMessage, string $errorMessage): RedirectResponse
    {
        try {
            $callback();
            return redirect()->back()->with('success', $successMessage);
        } catch (QueryException $e) {
            return $this->handleQueryException($e, $errorMessage);
        }
    }

    /**
     * Ejecuta la eliminación masiva de registros y gestiona la respuesta.
     */
    protected function handleBulkDeletion(callable $callback, string $successMessage, string $errorMessage): RedirectResponse
    {
        try {
            $callback();
            return redirect()->back()->with('success', $successMessage);
        } catch (QueryException $e) {
            return $this->handleQueryException($e, $errorMessage);
        }
    }

    /**
     * Procesa la QueryException para retornar mensajes amigables.
     */
    private function handleQueryException(QueryException $e, string $defaultError): RedirectResponse
    {
        if ($e->getCode() == 23000) {
            return redirect()->back()->with('error', 'No se puede eliminar el registro porque está en uso en otras partes del sistema.');
        }

        return redirect()->back()->with('error', $defaultError);
    }
}
