import { useMemo, useState, useEffect } from "react";
import { Button } from "@/Components/ui/button";
import { Checkbox } from "@/Components/ui/checkbox";
import { ThemeInput } from "@/Components/ui/ThemeInput";
import StatusBadge from "@/Components/ui/StatusBadge";
import { METADATA_KEYS as EXAM_METADATA_KEYS } from "@/Pages/Exams/Constants/examConstants";
import { METADATA_KEYS as GROUP_METADATA_KEYS } from "@/Pages/Groups/Constants/groupConstants";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import {
    Edit,
    Trash2,
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
    Check,
    X,
} from "lucide-react";

// ── Helpers ────────────────────────────────────────────────────────────────────

const formatLabel = (key) => {
    if (key === "num_control") return "Matrícula";
    if (key === "attempt") return "Oportunidad";
    if (key === "score") return "Score";
    if (key === "certified_level" || key === "nivel_certificado")
        return "Nivel Certificado";
    if (key === "grade_1") return "Calificación 1";
    if (key === "grade_2") return "Calificación 2";
    if (key === "grade_3") return "Calificación 3";
    if (key === "is_curso_nivelacion") return "Curso Nivelación";
    if (key === "calificacion_curso_nivelacion") return "Calif. Curso";
    if (key === "calificacion_examen") return "Calif. Examen";
    if (key === "calificacion_final") return "Calif. Final";
    return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const renderCellValue = (value) => {
    if (value === null || value === undefined || value === "" || value === "-")
        return "—";
    if (typeof value === "object") {
        // Evita crashear React cuando accidentalmente llega un objeto como valor de celda.
        return JSON.stringify(value);
    }
    return value;
};

/** Devuelve el tipo de <input> adecuado basándose en el nombre del campo. */
const resolveInputType = (fieldKey) => {
    const lower = fieldKey.toLowerCase();

    // Campos booleanos → Checkbox (OCP)
    if (
        lower.startsWith("is_") ||
        lower.includes("aprobado") ||
        lower.includes("activo") ||
        lower.includes("left") ||
        lower.includes("certificacion") ||
        lower.includes("hizo_")
    )
        return "checkbox";

    if (lower.includes("name") || lower.includes("nombre")) return "text";
    if (lower.includes("email") || lower.includes("correo")) return "email";
    if (lower.includes("date") || lower.includes("fecha")) return "date";

    // Campos de texto libre para exámenes
    if (lower.includes("promedio") || lower.includes("oportunidad"))
        return "text";

    // Selector de niveles y habilidades
    if (
        lower.includes("nivel_asignado") ||
        lower.includes("nivel_certificado") ||
        lower.includes("certified_level") ||
        lower.includes("listening") ||
        lower.includes("reading") ||
        lower.includes("writing") ||
        lower.includes("speaking") ||
        lower.includes("status") ||
        lower.includes("attempt")
    )
        return "select";

    return "number"; // Default: calificación numérica
};

const getInitialEditableValue = (fieldKey, initialValue) => {
    const inputType = resolveInputType(fieldKey);

    if (
        initialValue !== null &&
        initialValue !== undefined &&
        initialValue !== "" &&
        initialValue !== "-"
    ) {
        return initialValue;
    }

    if (inputType === "number") {
        return 0;
    }

    if (inputType === "select" || inputType === "text") {
        return "";
    }

    return "";
};

const SortIcon = ({ column }) => {
    const sorted = column.getIsSorted();
    if (sorted === "asc") return <ArrowUp className="w-4 h-4 ml-2" />;
    if (sorted === "desc") return <ArrowDown className="w-4 h-4 ml-2" />;
    return <ArrowUpDown className="w-4 h-4 ml-2 opacity-40" />;
};

const BASE_STUDENT_KEYS = [
    "id",
    "full_name",
    "num_control",
    "gender",
    "semester",
];
// STATUS_KEYS: Campos de estado que se incluyen solo si existen en los datos
// y no están en restrictedColumns. Algunos pueden estar ocultos por defecto
// en ciertos contextos (controlado por restrictedColumns).
const STATUS_KEYS = ["is_left", "attempt", "is_approved"];
const FOOTER_KEYS = ["final_average", "promedio_habilidades"];

const IGNORED_DYNAMIC_KEYS = new Set([
    ...EXAM_METADATA_KEYS,
    ...GROUP_METADATA_KEYS,
    ...BASE_STUDENT_KEYS,
    ...STATUS_KEYS,
    ...FOOTER_KEYS,
    "exam_student_id",
    "student_id",
    "group_id",
]);

const collectRowKeys = (rows = []) => {
    const seen = new Set();
    const keys = [];

    rows.forEach((row) => {
        Object.keys(row || {}).forEach((key) => {
            if (!seen.has(key)) {
                seen.add(key);
                keys.push(key);
            }
        });
    });

    return keys;
};

// ── EditableCell ───────────────────────────────────────────────────────────────

/**
 * Celda editable para edición en línea.
 *
 * OCP: extiende el comportamiento de la celda sin tocar la definición base.
 * ISP: este componente solo conoce SU campo — no el modo global.
 *
 * Usa <ThemeInput> (wrapper institucional de Shadcn Input) en lugar de
 * un <input> nativo para mantener consistencia visual con el resto del sistema.
 *
 * @param {string|number} value    – Valor actual del campo.
 * @param {number|string} rowId   – ID del registro.
 * @param {Function}      onChange – Callback opcional: (fieldKey, rowId, value) => void
 */
const EditableCell = ({
    value: initialValue,
    rowId,
    fieldKey,
    onChange,
    selectOptions = {},
    row = {}, // Tarea 1: Recibir fila completa
}) => {
    const inputType = resolveInputType(fieldKey);
    const [value, setValue] = useState(
        getInitialEditableValue(fieldKey, initialValue),
    );

    useEffect(() => {
        setValue(getInitialEditableValue(fieldKey, initialValue));
    }, [fieldKey, initialValue]);

    // OCP: Nueva rama de renderizado para checkboxes (sin tocar inputs de texto/número)
    if (inputType === "checkbox") {
        return (
            <div className="flex justify-center w-full">
                <Checkbox
                    checked={!!value}
                    onCheckedChange={(checked) => {
                        // Enviamos 1 o 0 (Laravel acepta ambos boolean/tinyint idealmente)
                        const next = checked ? 1 : 0;
                        setValue(next);
                        if (onChange) {
                            onChange(fieldKey, rowId, next);

                            // Tarea 1 (Opcional): Si desmarca el curso, resetear calificación a 0
                            if (fieldKey === "is_curso_nivelacion" && !checked) {
                                onChange("calificacion_curso_nivelacion", rowId, 0);
                            }
                        } else {
                            console.log(
                                `[Edicion Tabla] campo="${fieldKey}" alumno_id=${rowId} valor=${next}`,
                            );
                        }
                    }}
                    aria-label={`${formatLabel(fieldKey)} — fila ${rowId}`}
                    // Consistencia UI usando las clases base en tu sistema (asumiendo que Checkbox las maneje. Puedes ajustar colores)
                    className="border-gray-500 data-[state=checked]:bg-[#17365D]"
                />
            </div>
        );
    }

    // OCP: Nueva rama para selector de nivel (examen de Ubicación) y certificado
    if (inputType === "select") {
        const fallbackOptions =
            fieldKey.includes("nivel_certificado") ||
            fieldKey.includes("certified_level")
                ? ["A1", "A2", "B1", "B2", "C1", "C2"]
                : fieldKey.includes("attempt")
                  ? [
                        { value: "first", label: "Primera" },
                        { value: "second", label: "Segunda" },
                    ]
                  : [
                        "Básico 1",
                        "Básico 2",
                        "Intermedio 1",
                        "Intermedio 2",
                        "Intermedio 3",
                        "Intermedio 4",
                        "Intermedio 5",
                        "Avanzado 1",
                        "Avanzado 2",
                    ];

        const options = selectOptions[fieldKey] || fallbackOptions;

        return (
            <Select
                value={String(value ?? "")}
                onValueChange={(newValue) => {
                    setValue(newValue);
                    if (onChange) onChange(fieldKey, rowId, newValue);
                }}
            >
                <SelectTrigger className="w-[140px] mx-auto h-8 text-xs">
                    <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                    {options.map((opt) => {
                        const val =
                            typeof opt === "object"
                                ? String(opt.value)
                                : String(opt);
                        const lbl = typeof opt === "object" ? opt.label : opt;

                        return (
                            <SelectItem
                                key={val}
                                value={val}
                                className="text-xs"
                            >
                                {lbl}
                            </SelectItem>
                        );
                    })}
                </SelectContent>
            </Select>
        );
    }

    const extraNumericProps =
        inputType === "number"
            ? (fieldKey === "score" || fieldKey.includes("calificacion_"))
                ? { min: 0, max: fieldKey === "score" ? 2000 : 100, step: 1 }
                : { min: 0, max: 100, step: 0.1 }
            : {};

    const handleKeyDown = (e) => {
        // Prevent decimal separators and exponent notation for integer-only fields
        if (fieldKey === "score" || fieldKey.includes("calificacion_")) {
            if (
                e.key === "." ||
                e.key === "," ||
                e.key === "e" ||
                e.key === "E"
            ) {
                e.preventDefault();
            }
        }
    };

    const isLevelingDisabled = fieldKey === "calificacion_curso_nivelacion" && !row.is_curso_nivelacion;

    return (
        <ThemeInput
            type={inputType}
            value={value ?? ""}
            disabled={isLevelingDisabled}
            aria-label={`${formatLabel(fieldKey)} — fila ${rowId}`}
            wrapperClassName="w-28"
            className={`text-sm text-center ${isLevelingDisabled ? "bg-slate-100 cursor-not-allowed opacity-50" : ""}`}
            onChange={(e) => {
                setValue(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            onBlur={() => {
                if (onChange) {
                    onChange(fieldKey, rowId, value);
                } else {
                    console.log(
                        `[Edicion Tabla] campo="${fieldKey}" alumno_id=${rowId} valor=${value}`,
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
 * columna de acciones.
 *
 * @param {Array}    data             - Array de registros del que se extraen las claves.
 * @param {Function} onEditRow        - Callback al pulsar Editar: (item) => void.
 * @param {object}   modeOptions      - Opciones de edición:
 * @param {string[]} modeOptions.editableColumns   - Keys de columnas que serán inputs en edición.
 * @param {string[]} modeOptions.restrictedColumns - Keys ELIMINADAS de la tabla
 *                                                   (no llegan a TanStack ni al menú Toggle Columns).
 * @param {Function} modeOptions.onCellChange      - (fieldKey, rowId, value) => void
 *                                                   Callback cuando se edita una celda.
 *                                                   Si no se provee se usa console.log.
 * @returns {Array} Definición de columnas lista para pasar a <DataTable />.
 */
export function useDynamicColumns(
    data,
    onEditRow,
    onDeleteRow,
    {
        editableColumns = [],
        restrictedColumns = [],
        selectOptions = {},
        onCellChange,
        editingRowId = null,
        editAllRows = false,
        onSaveRow,
        onCancelRow,
        customRowActions,
    } = {},
) {
    const rowKeys = collectRowKeys(data || []);

    return useMemo(() => {
        const editableSet = new Set(editableColumns);
        const restrictedSet = new Set(restrictedColumns);
        
        // Detectar contexto: ¿es una tabla de estudiantes o un catálogo genérico?
        // Los contextos de estudiantes siempre tienen 'full_name' o 'num_control'
        const isStudentContext = rowKeys.includes("full_name") || rowKeys.includes("num_control");
        
        // Campos que ya están en METADATA_KEYS no deben aparecer como columnas de estado adicionales
        const allMetadataKeys = new Set([...EXAM_METADATA_KEYS, ...GROUP_METADATA_KEYS]);
        
        const dynamicKeys = rowKeys.filter(
            (key) => !IGNORED_DYNAMIC_KEYS.has(key) && !restrictedSet.has(key),
        );

        const orderedDynamicKeys = [];
        const convalidationCertifiedKey = dynamicKeys.includes(
            "certified_level",
        )
            ? "certified_level"
            : dynamicKeys.includes("nivel_certificado")
              ? "nivel_certificado"
              : null;

        const preferredDynamicOrder = [
            convalidationCertifiedKey,
            "score",
            "speaking",
        ].filter(Boolean);

        for (const key of preferredDynamicOrder) {
            if (dynamicKeys.includes(key)) orderedDynamicKeys.push(key);
        }

        for (const key of dynamicKeys) {
            if (!orderedDynamicKeys.includes(key)) orderedDynamicKeys.push(key);
        }

        // En catálogos genéricos, no aplicar BASE_STUDENT_KEYS
        const visibleBaseKeys = isStudentContext
            ? BASE_STUDENT_KEYS.filter((key) => !restrictedSet.has(key))
            : [];

        // STATUS_KEYS solo se muestra si:
        // 1. Estamos en contexto de estudiantes
        // 2. No está en restrictedColumns (explícitamente excluido)
        // 3. Existe en los datos (rowKeys)
        // 4. No está en METADATA_KEYS (ya controlado en otro lado)
        const visibleStatusKeys = isStudentContext
            ? STATUS_KEYS.filter((key) => {
                  // Excluir si está explícitamente en restrictedColumns
                  if (restrictedSet.has(key)) return false;
                  // Solo mostrar si existe en los datos
                  if (!rowKeys.includes(key)) return false;
                  // Excluir si ya está en METADATA_KEYS (evitar duplicados)
                  if (allMetadataKeys.has(key)) return false;
                  return true;
              })
            : [];

        const visibleFooterKeys = FOOTER_KEYS.filter((key) =>
            rowKeys.includes(key),
        ).filter((key) => !restrictedSet.has(key));

        // ── Columnas de datos (con lógica de celda condicional) ───────────────
        const buildColumn = (key) => ({
            accessorKey: key,
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                    className="hover:bg-white/10 hover:text-white"
                >
                    {formatLabel(key)}
                    <SortIcon column={column} />
                </Button>
            ),
            // ISP: la celda solo sabe si ELLA es editable.
            cell: ({ row }) => {
                const cellValue = row.original[key];
                const isRowEditing =
                    editAllRows || row.original.id === editingRowId;

                if (isRowEditing && editableSet.has(key)) {
                    return (
                        <EditableCell
                            value={cellValue}
                            rowId={row.original.id}
                            fieldKey={key}
                            onChange={onCellChange}
                            selectOptions={selectOptions}
                            row={row.original}
                        />
                    );
                }

                if (key === "status") {
                    return (
                        <div className="flex justify-center w-full">
                            <StatusBadge status={cellValue} />
                        </div>
                    );
                }

                // Handle is_active by showing a disabled Checkbox
                if (key === "is_active") {
                    const isActiveByStatus = row.original.is_active || row.original.status === "Vigente" || row.original.status === "Activo";

                    return (
                        <div className="flex justify-center w-full">
                            <Checkbox
                                checked={isActiveByStatus}
                                disabled
                                aria-label={`${formatLabel(key)} — fila ${row.original.id}`}
                                className="border-gray-500 data-[state=checked]:bg-[#17365D] data-[state=checked]:text-white"
                            />
                        </div>
                    );
                }

                // Handle is_left keys by showing 'Baja' or '-'
                if (key.includes("is_left")) {
                    return cellValue ? (
                        <span className="px-2 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full">
                            Baja
                        </span>
                    ) : (
                        <span className="text-slate-400">-</span>
                    );
                }

                // Renderizar booleanos de forma legible (Sí/No with indigo styling)
                if (typeof cellValue === "boolean" || (key.startsWith("is_") || key.includes("hizo_"))) {
                    return cellValue ? (
                        <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-600 text-white rounded-full">
                            Sí
                        </span>
                    ) : (
                        <span className="text-slate-400">No</span>
                    );
                }

                let textColor = "text-slate-700"; // Color por defecto

                // 1. Definir qué columnas SON calificaciones (Lista Blanca)
                const gradeColumns = [
                    "score",
                    "final_average",
                    "calificacion",
                    "calificacion_final",
                    "promedio",
                    "listening",
                    "reading",
                    "writing",
                    "speaking",
                    "unit_",
                    "a1",
                    "a2",
                    "b1",
                    "b2",
                    "c1",
                    "c2",
                    "grade_",
                ];
                const isGradeColumn = gradeColumns.some((col) =>
                    key.includes(col),
                );

                // 2. Solo aplicar lógica de colores si es una columna de calificación
                if (isGradeColumn) {
                    const isNumericGrade = /^\d+$/.test(String(cellValue));
                    const grade = isNumericGrade
                        ? parseInt(cellValue, 10)
                        : null;
                    const failedNumeric =
                        isNumericGrade && grade !== null && grade < 70;
                    const approvedNumeric =
                        isNumericGrade && grade !== null && grade >= 70;

                    if (!row.original.is_left) {
                        if (
                            cellValue === "NA" ||
                            failedNumeric ||
                            ["A1", "A2"].includes(cellValue)
                        ) {
                            textColor = "text-red-600 font-bold";
                        } else if (
                            approvedNumeric ||
                            ["B1", "B2", "C1", "C2"].includes(cellValue)
                        ) {
                            textColor = "text-emerald-600 font-bold";
                        }
                    } else {
                        // Forzar texto atenuado para bajas
                        textColor = "text-slate-400";
                    }
                }

                // Celda de solo-lectura
                let displayValue = cellValue;
                if (key === "attempt") {
                    displayValue =
                        cellValue === "second" ? "Segunda" : "Primera";
                }

                return (
                    <span className={textColor}>
                        {renderCellValue(displayValue)}
                    </span>
                );
            },
        });

        const baseColumns = [
            ...visibleBaseKeys.map(buildColumn),
            ...visibleStatusKeys.map(buildColumn),
            ...orderedDynamicKeys.map(buildColumn),
            ...visibleFooterKeys.map(buildColumn),
        ];

        const selectionColumn = {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(value) =>
                        table.toggleAllPageRowsSelected(!!value)
                    }
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

        // ── Columna de acciones ────────────────────────────────────────────────
        // SRP: la decisión de incluir esta columna está aislada aquí, no dispersa.
        const actionsColumn = {
            id: "actions",
            header: "Acciones",
            enableHiding: false,
            cell: ({ row }) => {
                const item = row.original;
                const itemName =
                    item.name || item.nombre || item.num_control || item.id;
                const isRowEditing = editAllRows || item.id === editingRowId;

                // OCP: si existe una acción personalizada, tiene prioridad sobre acciones por defecto
                // (incluyendo estado de edición global) para no acoplar el comportamiento al core de la tabla.
                if (customRowActions) {
                    return customRowActions(item);
                }

                // Si esta fila está en edición, mostrar botones de Guardar/Cancelar
                if (isRowEditing) {
                    return (
                        <div className="flex items-center justify-center gap-2">
                            <Button
                                onClick={() =>
                                    onSaveRow
                                        ? onSaveRow(item)
                                        : alert(`Guardar: ${itemName}`)
                                }
                                className="w-8 h-8 p-0 text-white bg-green-600 rounded-md hover:bg-green-700"
                                title="Guardar"
                            >
                                <Check className="w-4 h-4" />
                            </Button>
                            <Button
                                onClick={() =>
                                    onCancelRow
                                        ? onCancelRow()
                                        : alert(`Cancelar edición`)
                                }
                                className="w-8 h-8 p-0 text-white bg-gray-500 rounded-md hover:bg-gray-600"
                                title="Cancelar"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    );
                }

                // Botones normales de Editar y Eliminar
                return (
                    <div className="flex items-center justify-center gap-2">
                        <Button
                            onClick={() =>
                                onEditRow
                                    ? onEditRow(item)
                                    : alert(`Editar: ${itemName}`)
                            }
                            className="w-8 h-8 p-0 text-white bg-orange-500 rounded-md hover:bg-orange-600"
                            title="Editar"
                        >
                            <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                            onClick={() =>
                                onDeleteRow
                                    ? onDeleteRow(item)
                                    : alert(`Eliminar: ${itemName}`)
                            }
                            className="w-8 h-8 p-0 text-white bg-red-600 rounded-md hover:bg-red-700"
                            title="Eliminar"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                );
            },
        };

        return [selectionColumn, ...baseColumns, actionsColumn];
    }, [
        rowKeys,
        onEditRow,
        onDeleteRow,
        editableColumns,
        restrictedColumns,
        onCellChange,
        editingRowId,
        editAllRows,
        onSaveRow,
        onCancelRow,
        customRowActions,
    ]);
}
