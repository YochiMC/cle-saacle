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
        <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-slate-500">
                {table.getFilteredSelectedRowModel().rows.length} de{' '}
                {table.getFilteredRowModel().rows.length} fila(s) seleccionada(s).
            </div>
            <div className="flex space-x-2">
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
