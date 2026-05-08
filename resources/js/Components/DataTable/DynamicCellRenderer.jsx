import React, { memo } from "react";
import StatusBadge from "@/Components/ui/StatusBadge";
import { Checkbox } from "@/Components/ui/checkbox";
import { formatLabel, GRADE_COLUMNS } from "@/Constants/tableDictionary";
import EditableCell from "./EditableCell";

/**
 * Helper para renderizar valores nulos o vacíos.
 */
const renderCellValue = (value) => {
    if (value === null || value === undefined || value === "" || value === "-")
        return "—";
    if (typeof value === "object") return JSON.stringify(value);
    return value;
};

/**
 * Componente principal para el renderizado de celdas dinámicas.
 * 
 * Rendimiento: Envuelto en React.memo con una función de comparación personalizada.
 * Garantiza que solo se re-renderice la celda que realmente cambió su valor o estado.
 */
const DynamicCellRenderer = memo(({
    row,
    fieldKey,
    isRowEditing,
    isEditable,
    onCellChange,
    selectOptions,
}) => {
    const cellValue = row.original[fieldKey];

    // 1. Modo Edición: Delegar a EditableCell
    if (isRowEditing && isEditable) {
        return (
            <EditableCell
                value={cellValue}
                rowId={row.original.id}
                fieldKey={fieldKey}
                onChange={onCellChange}
                selectOptions={selectOptions}
                row={row.original}
            />
        );
    }

    // 2. Renderizado de Status
    if (fieldKey === "status") {
        return (
            <div className="flex justify-center w-full">
                <StatusBadge status={cellValue} />
            </div>
        );
    }

    // 3. Renderizado de is_active
    if (fieldKey === "is_active") {
        const isActiveByStatus =
            row.original.is_active ||
            row.original.status === "Vigente" ||
            row.original.status === "Activo";

        return (
            <div className="flex justify-center w-full">
                <Checkbox
                    checked={isActiveByStatus}
                    disabled
                    className="border-gray-500 data-[state=checked]:bg-[#17365D] data-[state=checked]:text-white"
                />
            </div>
        );
    }

    // 4. Renderizado de is_left (Bajas)
    if (fieldKey.includes("is_left")) {
        return cellValue ? (
            <span className="px-2 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full">
                Baja
            </span>
        ) : (
            <span className="text-slate-400">-</span>
        );
    }

    // 5. Renderizado de Booleanos genéricos
    if (typeof cellValue === "boolean" || fieldKey.startsWith("is_") || fieldKey.includes("hizo_")) {
        return cellValue ? (
            <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-600 text-white rounded-full">
                Sí
            </span>
        ) : (
            <span className="text-slate-400">No</span>
        );
    }

    // 6. Lógica de Colores para Calificaciones
    let textColor = "text-slate-700";
    const isGradeColumn = GRADE_COLUMNS.some((col) => fieldKey.includes(col));

    if (isGradeColumn) {
        const isNumericGrade = /^\d+$/.test(String(cellValue));
        const grade = isNumericGrade ? parseInt(cellValue, 10) : null;
        const failedNumeric = isNumericGrade && grade !== null && grade < 70;
        const approvedNumeric = isNumericGrade && grade !== null && grade >= 70;

        if (!row.original.is_left) {
            if (cellValue === "NA" || failedNumeric || ["A1", "A2"].includes(cellValue)) {
                textColor = "text-red-600 font-bold";
            } else if (approvedNumeric || ["B1", "B2", "C1", "C2"].includes(cellValue)) {
                textColor = "text-emerald-600 font-bold";
            }
        } else {
            textColor = "text-slate-400";
        }
    }

    // 7. Formateo de valores específicos
    let displayValue = cellValue;
    if (fieldKey === "attempt") {
        displayValue = cellValue === "second" ? "Segunda" : "Primera";
    }

    return (
        <span className={textColor}>
            {renderCellValue(displayValue)}
        </span>
    );
}, (prevProps, nextProps) => {
    /**
     * Función de comparación personalizada para máxima optimización.
     * La celda NO se re-renderiza a menos que ocurra uno de estos cambios críticos:
     */
    
    // 1. Cambió el valor principal de la celda
    if (prevProps.row.original[prevProps.fieldKey] !== nextProps.row.original[nextProps.fieldKey]) {
        return false;
    }

    // 2. Cambió el estado de edición global o la editabilidad de esta columna
    if (prevProps.isRowEditing !== nextProps.isRowEditing || prevProps.isEditable !== nextProps.isEditable) {
        return false;
    }

    // 3. Cambiaron valores colaterales que afectan el renderizado visual (Status o Bajas)
    if (prevProps.row.original.status !== nextProps.row.original.status || 
        prevProps.row.original.is_left !== nextProps.row.original.is_left) {
        return false;
    }

    // 4. Cambiaron las referencias de callbacks u opciones (Prop Drilling)
    if (prevProps.onCellChange !== nextProps.onCellChange || prevProps.selectOptions !== nextProps.selectOptions) {
        return false;
    }

    // Si nada de lo anterior cambió, la celda es idéntica. Evitamos el render.
    return true;
});

export default DynamicCellRenderer;
