import { ThemeButton } from '@/Components/ThemeButton';
import { Copy, Trash2 } from 'lucide-react';

/**
 * DashboardHeader
 *
 * Renderiza la cabecera institucional: título con barra naranja, selector de
 * vistas y —cuando hay filas seleccionadas— la barra de acciones masivas.
 *
 * @param {string}   title              - Título de la pantalla.
 * @param {string}   currentViewLabel   - Etiqueta de la vista activa.
 * @param {Array}    viewOptions        - [{ value, label }] para el selector.
 * @param {string}   vistaActual        - Valor actualmente seleccionado.
 * @param {Function} onViewChange       - (newValue: string) => void.
 * @param {number}   selectionCount     - Número de filas seleccionadas.
 * @param {Function} onBulkCopy         - Handler para copiar a Excel.
 * @param {Function} onBulkDelete       - Handler para eliminar seleccionados.
 */
export default function DashboardHeader({
    title,
    currentViewLabel,
    viewOptions = [],
    vistaActual,
    onViewChange,
    selectionCount = 0,
    onBulkCopy,
    onBulkDelete,
}) {
    return (
        <div className="mb-8">
            {/* Fila superior: título + selector */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="w-1.5 h-8 bg-orange-500 rounded-full inline-block" />
                        <h2 className="text-3xl font-extrabold text-[#17365D]">
                            {currentViewLabel || title}
                        </h2>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 ml-5">
                        Administración general de los registros del sistema.
                    </p>
                </div>

                {/* Selector de vistas (solo si hay más de una opción) */}
                {viewOptions.length > 1 && (
                    <div className="flex items-center gap-3 bg-white p-2 rounded-md shadow-sm border border-slate-200">
                        <label className="text-sm font-medium text-[#17365D] whitespace-nowrap">
                            Tabla a mostrar:
                        </label>
                        <select
                            className="border border-slate-300 rounded-md px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#17365D] bg-slate-50 min-w-[150px]"
                            value={vistaActual}
                            onChange={(e) => onViewChange(e.target.value)}
                        >
                            {viewOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Barra de acciones masivas */}
            {selectionCount > 0 && (
                <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">
                        {selectionCount} fila(s) seleccionada(s)
                    </span>
                    <div className="flex gap-2">
                        <ThemeButton
                            onClick={onBulkCopy}
                            theme="outline"
                            icon={Copy}
                            size="sm"
                        >
                            Copiar a Excel
                        </ThemeButton>
                        <ThemeButton
                            onClick={onBulkDelete}
                            theme="danger"
                            icon={Trash2}
                            size="sm"
                        >
                            Eliminar Seleccionados
                        </ThemeButton>
                    </div>
                </div>
            )}
        </div>
    );
}
