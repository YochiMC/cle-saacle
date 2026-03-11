// ── Componentes de UI propios ───────────────────────────────────────────────
import { ThemeButton } from '@/Components/ThemeButton';

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
        <div className="flex items-center justify-between space-x-2 py-4">

            {/* ── CONTADOR ──────────────────────────────────────────────── */}
            <div className="text-sm text-slate-500">
                Página{' '}
                <span className="font-semibold">{paginaActual}</span>
                {' '}de{' '}
                <span className="font-semibold">{totalPaginas}</span>
            </div>

            {/* ── BOTONES ───────────────────────────────────────────────── */}
            <div className="flex space-x-2">
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
