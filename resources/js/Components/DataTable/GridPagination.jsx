// ── Componentes de UI propios ───────────────────────────────────────────────
import { ThemeButton } from '@/Components/ui/ThemeButton';

/**
 * @component GridPagination
 *
 * Versión genérica (agnóstica) de DataTablePagination.
 * No depende de TanStack Table; recibe el estado de paginación directamente.
 *
 * @param {number}   paginaActual  - Página actualmente visible (1-indexed).
 * @param {number}   totalPaginas  - Total de páginas calculadas por el padre.
 * @param {Function} onPageChange  - Callback que recibe el número de la nueva página.
 */
export default function GridPagination({ paginaActual, totalPaginas, onPageChange }) {
    const puedeAnterior = paginaActual > 1;
    const puedeSiguiente = paginaActual < totalPaginas;

    return (
        /*
         * Misma estructura visual que DataTablePagination:
         * flex justify-between con el contador a la izquierda y los botones a la derecha.
         */
        <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:space-x-2">

            {/* ── CONTADOR ──────────────────────────────────────────────── */}
            <div className="text-center text-sm text-slate-500 sm:text-left">
                Página{' '}
                <span className="font-semibold">{paginaActual}</span>
                {' '}de{' '}
                <span className="font-semibold">{totalPaginas}</span>
            </div>

            {/* ── BOTONES ───────────────────────────────────────────────── */}
            <div className="flex justify-center gap-2 sm:justify-end">
                {/*
                 * Mismos ThemeButton con theme="outline" y size="sm"
                 * que usa DataTablePagination.
                 */}
                <ThemeButton
                    theme="outline"
                    size="sm"
                    onClick={() => onPageChange(paginaActual - 1)}
                    disabled={!puedeAnterior}
                >
                    Anterior
                </ThemeButton>
                <ThemeButton
                    theme="outline"
                    size="sm"
                    onClick={() => onPageChange(paginaActual + 1)}
                    disabled={!puedeSiguiente}
                >
                    Siguiente
                </ThemeButton>
            </div>
        </div>
    );
}
