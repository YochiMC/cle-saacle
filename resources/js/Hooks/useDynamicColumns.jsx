import { useMemo } from 'react';
import { Button } from '@/Components/ui/button';
import { Checkbox } from '@/Components/ui/checkbox';
import { ThemeInput } from '@/Components/ThemeInput';
import { Edit, Trash2, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

// ── Helpers ────────────────────────────────────────────────────────────────────

const formatLabel = (key) =>
    key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/** Devuelve el tipo de <input> adecuado basándose en el nombre del campo. */
const resolveInputType = (fieldKey) => {
    const lower = fieldKey.toLowerCase();
    if (lower.includes('name')  || lower.includes('nombre')) return 'text';
    if (lower.includes('email') || lower.includes('correo')) return 'email';
    if (lower.includes('date')  || lower.includes('fecha'))  return 'date';
    return 'number'; // Default: calificación numérica
};

const SortIcon = ({ column }) => {
    const sorted = column.getIsSorted();
    if (sorted === 'asc')  return <ArrowUp   className="w-4 h-4 ml-2" />;
    if (sorted === 'desc') return <ArrowDown className="w-4 h-4 ml-2" />;
    return <ArrowUpDown className="w-4 h-4 ml-2 opacity-40" />;
};

// ── EditableCell ───────────────────────────────────────────────────────────────

/**
 * Celda editable para el Modo Docente.
 *
 * OCP: extiende el comportamiento de la celda sin tocar la definición base.
 * ISP: este componente solo conoce SU campo — no el modo global.
 *
 * Usa <ThemeInput> (wrapper institucional de Shadcn Input) en lugar de
 * un <input> nativo para mantener consistencia visual con el resto del sistema.
 *
 * @param {string|number} value    – Valor actual del campo.
 * @param {number|string} rowId   – ID del registro.
 * @param {string}        fieldKey – Clave del campo (determina tipo de input).
 * @param {Function}      onChange – Callback opcional: (fieldKey, rowId, value) => void
 */
const EditableCell = ({ value, rowId, fieldKey, onChange }) => {
    const inputType = resolveInputType(fieldKey);

    const extraNumericProps = inputType === 'number'
        ? { min: 0, max: 100, step: 0.1 }
        : {};

    return (
        <ThemeInput
            type={inputType}
            defaultValue={value ?? ''}
            aria-label={`${formatLabel(fieldKey)} — fila ${rowId}`}
            wrapperClassName="w-28"
            className="text-sm text-center"
            onChange={(e) => {
                const next = e.target.value;
                if (onChange) {
                    onChange(fieldKey, rowId, next);
                } else {
                    console.log(
                        `[Modo Docente] campo="${fieldKey}" alumno_id=${rowId} valor=${next}`,
                    );
                }
            }}
            {...extraNumericProps}
        />
    );
};

/**
 * useDynamicColumns
 *
 * Genera columnas TanStack Table a partir de las claves del primer registro.
 * Incluye columna de selección, columnas de datos con sort y, opcionalmente,
 * columna de acciones (solo en Modo Administrador).
 *
 * @param {Array}    data             - Array de registros del que se extraen las claves.
 * @param {Function} onEditRow        - Callback al pulsar Editar: (item) => void. Solo Modo Admin.
 * @param {object}   modeOptions      - Opciones de modo de usuario:
 * @param {boolean}  modeOptions.isTeacherMode     - true = Modo Docente.
 * @param {string[]} modeOptions.editableColumns   - Keys de columnas que serán inputs en Modo Docente.
 * @param {string[]} modeOptions.restrictedColumns - Keys ELIMINADAS en Modo Docente
 *                                                   (no llegan a TanStack ni al menú Toggle Columns).
 * @param {Function} modeOptions.onCellChange      - (fieldKey, rowId, value) => void
 *                                                   Callback cuando el docente edita una celda.
 *                                                   Si no se provee se usa console.log.
 * @returns {Array} Definición de columnas lista para pasar a <DataTable />.
 */
export function useDynamicColumns(
    data,
    onEditRow,
    onDeleteRow,
    { isTeacherMode = false, editableColumns = [], restrictedColumns = [], onCellChange } = {},
) {
    return useMemo(() => {
        if (!data || data.length === 0) return [];

        const allKeys = Object.keys(data[0]);
        const editableSet = new Set(editableColumns);
        // SRP: el filtrado de privacidad ocurre en un único lugar, antes de cualquier
        // lógica de renderizado. Las columnas restringidas nunca llegan a TanStack Table.
        const restrictedSet = new Set(isTeacherMode ? restrictedColumns : []);
        const keys = allKeys.filter((k) => !restrictedSet.has(k));

        // ── Columnas de datos (con lógica de celda condicional) ───────────────
        const baseColumns = keys.map((key) => ({
            accessorKey: key,
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="hover:bg-white/10 hover:text-white"
                >
                    {formatLabel(key)}
                    <SortIcon column={column} />
                </Button>
            ),
            // ISP: la celda solo sabe si ELLA es editable, no conoce el modo global.
            cell: ({ row, getValue }) => {
                if (isTeacherMode && editableSet.has(key)) {
                    return (
                        <EditableCell
                            value={getValue()}
                            rowId={row.original.id}
                            fieldKey={key}
                            onChange={onCellChange}
                        />
                    );
                }
                // Celda de solo-lectura (comportamiento original)
                return <span>{getValue() ?? '—'}</span>;
            },
        }));

        const selectionColumn = {
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Seleccionar todos"
                    className="border-white data-[state=checked]:bg-white data-[state=checked]:text-[#17365D]"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Seleccionar fila"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        };

        // ── Columna de acciones: solo en Modo Administrador ───────────────────
        // SRP: la decisión de incluir esta columna está aislada aquí, no dispersa.
        const actionsColumn = {
            id: 'actions',
            header: 'Acciones',
            enableHiding: false,
            cell: ({ row }) => {
                const item = row.original;
                const itemName = item.name || item.nombre || item.matricula || item.id;
                return (
                    <div className="flex items-center justify-center gap-2">
                        <Button
                            onClick={() => (onEditRow ? onEditRow(item) : alert(`Editar: ${itemName}`))}
                            className="w-8 h-8 p-0 text-white bg-orange-500 rounded-md hover:bg-orange-600"
                            title="Editar"
                        >
                            <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                            onClick={() => (onDeleteRow ? onDeleteRow(item) : alert(`Eliminar: ${itemName}`))}
                            className="w-8 h-8 p-0 text-white bg-red-600 rounded-md hover:bg-red-700"
                            title="Eliminar"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                );
            },
        };

        return [
            // SRP: en Modo Docente no hay acciones masivas → la columna de
            // selección no tiene utilidad y se omite para mantener la UI limpia.
            ...(isTeacherMode ? [] : [selectionColumn]),
            ...baseColumns,
            // OCP: añadimos/quitamos la columna sin tocar su definición interna.
            ...(isTeacherMode ? [] : [actionsColumn]),
        ];
    }, [data, onEditRow, onDeleteRow, isTeacherMode, editableColumns, restrictedColumns, onCellChange]);
}
