import { ThemeButton } from '@/Components/ui/ThemeButton';
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
    customActions,
}) {
    return (
        <div className="mb-8">
            {/* Fila superior: título + toggle de modo + selector */}
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="w-1.5 h-8 bg-orange-500 rounded-full inline-block" />
                        <h2 className="text-3xl font-extrabold text-[#17365D]">
                            {currentViewLabel || title}
                        </h2>
                    </div>
                    <p className="mt-2 ml-5 text-sm text-gray-600">
                        Administracion general de los registros del sistema.
                    </p>
                </div>

                {/* ── Controles del lado derecho ───────────────────────────── */}
                <div className="flex flex-wrap items-center justify-end gap-3">
                    {/* Selector de vistas (solo si hay más de una opción) */}
                    {viewOptions.length > 1 && (
                        <div className="flex items-center gap-3 p-2 bg-white border rounded-md shadow-sm border-slate-200">
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
            </div>

            {customActions && <div className="flex items-center gap-2">{customActions}</div>}

            {/* Barra de acciones masivas */}
            {selectionCount > 0 && (
                <div className="flex items-center justify-between p-3 mt-4 border rounded-md bg-slate-50 border-slate-200">
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

