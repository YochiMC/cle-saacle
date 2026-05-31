import { ThemeButton } from '@/Components/ui/ThemeButton';

/**
 * DataTablePagination
 *
 * Barra inferior de la tabla: contador de filas seleccionadas y botones
 * de paginación Anterior / Siguiente.
 *
 * @param {object} table - Instancia de la tabla de TanStack.
 */
export default function DataTablePagination({ table }) {
    return (
        <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:space-x-2">
            <div className="text-center text-sm text-slate-500 sm:text-left">
                {table.getFilteredSelectedRowModel().rows.length} de{' '}
                {table.getFilteredRowModel().rows.length} fila(s) seleccionada(s).
            </div>
            <div className="flex justify-center gap-2 sm:justify-end">
                <ThemeButton
                    theme="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Anterior
                </ThemeButton>
                <ThemeButton
                    theme="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Siguiente
                </ThemeButton>
            </div>
        </div>
    );
}
