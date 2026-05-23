import React, { memo } from "react";
import StatusBadge from "@/Components/ui/StatusBadge";
import { formatLabel, GRADE_COLUMNS } from "@/Constants/tableDictionary";
import EditableCell from "./EditableCell";

/**
 * Helper para renderizar valores nulos o vacíos con un fallback visual.
 */
const renderCellValue = (value) => {
    if (value === null || value === undefined || value === "" || value === "-") return "—";
    if (typeof value === "object") return JSON.stringify(value);
    return value;
};

/**
 * Componente principal para el renderizado de celdas dinámicas.
 * Orquesta la visualización basada en tipos de datos y estados de edición.
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

    if (fieldKey === "status") {
        return (
            <div className="flex justify-center w-full">
                <StatusBadge status={cellValue} />
            </div>
        );
    }

    if (fieldKey === "is_active") {
        const isActive = Boolean(row.original.is_active);

        return (
            <div className="flex justify-center w-full">
                <span
                    className={
                        isActive
                            ? "px-2 py-0.5 text-xs font-semibold bg-emerald-600 text-white rounded-full"
                            : "px-2 py-0.5 text-xs font-semibold bg-slate-300 text-slate-700 rounded-full"
                    }
                >
                    {isActive ? "Activo" : "Inactivo"}
                </span>
            </div>
        );
    }

    if (fieldKey.includes("is_left")) {
        return cellValue ? (
            <span className="px-2 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full">
                Baja
            </span>
        ) : (
            <span className="text-slate-400">-</span>
        );
    }

    if (typeof cellValue === "boolean" || fieldKey.startsWith("is_") || fieldKey.includes("hizo_")) {
        return cellValue ? (
            <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-600 text-white rounded-full">
                Sí
            </span>
        ) : (
            <span className="text-slate-400">No</span>
        );
    }

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
    // Optimización de re-renderizado: solo permitir actualizaciones si cambian valores críticos
    
    if (prevProps.row.original[prevProps.fieldKey] !== nextProps.row.original[nextProps.fieldKey]) return false;
    if (prevProps.isRowEditing !== nextProps.isRowEditing || prevProps.isEditable !== nextProps.isEditable) return false;
    if (prevProps.row.original.status !== nextProps.row.original.status || 
        prevProps.row.original.is_left !== nextProps.row.original.is_left) return false;
    if (prevProps.onCellChange !== nextProps.onCellChange || prevProps.selectOptions !== nextProps.selectOptions) return false;

    return true;
});

DynamicCellRenderer.displayName = "DynamicCellRenderer";

export default DynamicCellRenderer;
