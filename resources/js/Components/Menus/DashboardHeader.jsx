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
        <div className="mb-6 sm:mb-8">
            {/* Fila superior: título + toggle de modo + selector */}
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="w-1.5 h-8 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full shadow-sm inline-block" />
                        <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#17365D] to-[#2b5999] tracking-tight drop-shadow-sm sm:text-3xl">
                            {currentViewLabel || title}
                        </h2>
                    </div>
                    <p className="mt-2 ml-5 text-xs font-medium text-slate-500 sm:text-sm">
                        Administración general de los registros del sistema.
                    </p>
                </div>

                {/* ── Controles del lado derecho ───────────────────────────── */}
                <div className="flex w-full flex-col items-stretch justify-end gap-3 md:w-auto md:flex-row md:items-center">
                    {/* Selector de vistas (solo si hay más de una opción) */}
                    {viewOptions.length > 1 && (
                        <div className="flex w-full items-center gap-3 rounded-md border border-slate-200 bg-white p-2 shadow-sm md:w-auto">
                            <label className="text-sm font-medium text-[#17365D] whitespace-nowrap">
                                Tabla a mostrar:
                            </label>
                            <select
                                className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#17365D] md:w-auto md:min-w-[150px]"
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

            {customActions && <div className="mt-4 mb-2 flex flex-wrap items-center gap-2">{customActions}</div>}

            {/* Barra de acciones masivas */}
            {selectionCount > 0 && (
                <div className="flex flex-col gap-3 p-3 mt-4 border rounded-md bg-slate-50 border-slate-200 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm font-medium text-slate-700 text-center sm:text-left">
                        {selectionCount} fila(s) seleccionada(s)
                    </span>
                    <div className="flex flex-wrap justify-center gap-2 sm:justify-end">
                        <ThemeButton
                            onClick={onBulkCopy}
                            theme="outline"
                            icon={Copy}
                            size="sm"
                        >
                            Copiar a Excel
                        </ThemeButton>
                        {typeof onBulkDelete === 'function' && (
                            <ThemeButton
                                onClick={onBulkDelete}
                                theme="danger"
                                icon={Trash2}
                                size="sm"
                            >
                                Eliminar Seleccionados
                            </ThemeButton>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

