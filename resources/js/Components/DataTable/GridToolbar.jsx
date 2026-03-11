// ── React ──────────────────────────────────────────────────────────────────
import React from 'react';

// ── Componentes de UI propios ───────────────────────────────────────────────
import { ThemeInput } from '@/Components/ThemeInput';

// ── Íconos ──────────────────────────────────────────────────────────────────
import { Search } from 'lucide-react';

/**
 * @component GridToolbar
 *
 * Versión genérica (agnóstica) de DataTableToolbar.
 * No depende de TanStack Table; trabaja con estado local controlado por el padre.
 *
 * @param {string}   busqueda          - Valor actual del buscador (controlled input).
 * @param {Function} setBusqueda       - Setter del buscador.
 * @param {string}   [placeholder]     - Texto del placeholder del input.
 * @param {number}   [totalFiltrados]  - Cantidad de ítems tras el filtro (para el contador).
 * @param {string}   [labelItem]       - Etiqueta del ítem contado (ej. "carreras", "grupos").
 */
export default function GridToolbar({
    busqueda,
    setBusqueda,
    placeholder = 'Buscar...',
    totalFiltrados,
    labelItem = 'registros',
}) {
    return (
        <div className="flex items-center py-4 gap-2">

            {/* ── BUSCADOR ──────────────────────────────────────────────── */}
            {/*
             * Misma estructura visual que DataTableToolbar:
             * ThemeInput con leftIcon={Search} y wrapperClassName para el ancho.
             */}
            <ThemeInput
                leftIcon={Search}
                placeholder={placeholder}
                value={busqueda ?? ''}
                onChange={(e) => setBusqueda(e.target.value)}
                wrapperClassName="max-w-sm"
            />

            {/* ── CONTADOR (lado derecho) ────────────────────────────────── */}
            {totalFiltrados !== undefined && (
                <div className="ml-auto text-sm text-slate-500">
                    {totalFiltrados}{' '}
                    {labelItem}
                </div>
            )}
        </div>
    );
}
