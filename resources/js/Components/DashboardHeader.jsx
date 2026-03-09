import { ThemeButton } from '@/Components/ThemeButton';
import { Copy, Trash2 } from 'lucide-react';

/**
 * DashboardHeader
 *
 * Renderiza la cabecera institucional: título con barra naranja, selector de
 * vistas, **toggle de modo (Admin / Docente)** y —cuando hay filas
 * seleccionadas— la barra de acciones masivas.
 *
 * @param {string}   title              - Título de la pantalla.
 * @param {string}   currentViewLabel   - Etiqueta de la vista activa.
 * @param {Array}    viewOptions        - [{ value, label }] para el selector.
 * @param {string}   vistaActual        - Valor actualmente seleccionado.
 * @param {Function} onViewChange       - (newValue: string) => void.
 * @param {number}   selectionCount     - Número de filas seleccionadas.
 * @param {Function} onBulkCopy         - Handler para copiar a Excel.
 * @param {Function} onBulkDelete       - Handler para eliminar seleccionados.
 * @param {boolean}  isTeacherMode      - true = Modo Docente activo.
 * @param {Function} onToggleMode       - () => void — alterna el modo.
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
    isTeacherMode = false,
    onToggleMode,
}) {
    return (
        <div className="mb-8">
            {/* Fila superior: título + toggle de modo + selector */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="w-1.5 h-8 bg-orange-500 rounded-full inline-block" />
                        <h2 className="text-3xl font-extrabold text-[#17365D]">
                            {currentViewLabel || title}
                        </h2>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 ml-5">
                        {isTeacherMode
                            ? 'Modo Docente — captura de calificaciones.'
                            : 'Administración general de los registros del sistema.'}
                    </p>
                </div>

                {/* ── Controles del lado derecho ───────────────────────────── */}
                <div className="flex items-center gap-3 flex-wrap justify-end">

                    {/* ── TOGGLE MODO ADMIN / DOCENTE ──────────────────────── */}
                    <button
                        type="button"
                        onClick={onToggleMode}
                        aria-pressed={isTeacherMode}
                        title={isTeacherMode ? 'Cambiar a Modo Administrador' : 'Cambiar a Modo Docente'}
                        className="flex items-center gap-2 bg-white border border-slate-200 shadow-sm rounded-full px-3 py-1.5 cursor-pointer select-none hover:bg-slate-50 transition-colors"
                    >
                        {/* Etiqueta izquierda */}
                        <span
                            className={`text-xs font-semibold transition-colors ${
                                !isTeacherMode ? 'text-[#17365D]' : 'text-slate-400'
                            }`}
                        >
                            Admin
                        </span>

                        {/* Pill animado */}
                        <span
                            className={`relative inline-flex w-10 h-5 rounded-full transition-colors duration-300 ${
                                isTeacherMode ? 'bg-blue-500' : 'bg-slate-300'
                            }`}
                        >
                            <span
                                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${
                                    isTeacherMode ? 'translate-x-5' : 'translate-x-0'
                                }`}
                            />
                        </span>

                        {/* Etiqueta derecha */}
                        <span
                            className={`text-xs font-semibold transition-colors ${
                                isTeacherMode ? 'text-blue-600' : 'text-slate-400'
                            }`}
                        >
                            Docente
                        </span>
                    </button>

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
                        {/* El docente NO puede eliminar registros masivamente */}
                        {!isTeacherMode && (
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

