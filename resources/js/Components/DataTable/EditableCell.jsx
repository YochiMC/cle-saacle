import React, { useState, useEffect, memo } from "react";
import { Checkbox } from "@/Components/ui/checkbox";
import { ThemeInput } from "@/Components/ui/ThemeInput";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { formatLabel } from "@/Constants/tableDictionary";

/** 
 * Devuelve el tipo de <input> adecuado basándose en el nombre del campo. 
 */
const resolveInputType = (fieldKey) => {
    const lower = fieldKey.toLowerCase();
    
    if (
        lower.startsWith("is_") ||
        lower.includes("aprobado") ||
        lower.includes("activo") ||
        lower.includes("left") ||
        lower.includes("certificacion") ||
        lower.includes("hizo_")
    ) {
        return "checkbox";
    }

    if (lower.includes("name") || lower.includes("nombre")) return "text";
    if (lower.includes("email") || lower.includes("correo")) return "email";
    if (lower.includes("date") || lower.includes("fecha")) return "date";
    if (lower.includes("promedio") || lower.includes("oportunidad")) return "text";

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
    ) {
        return "select";
    }

    return "number";
};

/**
 * Obtiene el valor inicial para el estado de edición.
 */
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
    
    return inputType === "number" ? 0 : "";
};

/**
 * EditableCell - Componente de UI para edición en línea.
 * 
 * Implementación pura de infraestructura: gestiona el estado local del input 
 * y notifica cambios al padre. Optimizado con memo para evitar re-renders.
 */
const EditableCell = memo(({
    value: initialValue,
    rowId,
    fieldKey,
    onChange,
    selectOptions = {},
    row = {},
}) => {
    const inputType = resolveInputType(fieldKey);
    const [value, setValue] = useState(
        getInitialEditableValue(fieldKey, initialValue)
    );

    useEffect(() => {
        setValue(getInitialEditableValue(fieldKey, initialValue));
    }, [fieldKey, initialValue]);

    if (inputType === "checkbox") {
        return (
            <div className="flex justify-center w-full">
                <Checkbox
                    checked={!!value}
                    onCheckedChange={(checked) => {
                        const next = checked ? 1 : 0;
                        setValue(next);
                        onChange?.(fieldKey, rowId, next);
                    }}
                    aria-label={`${formatLabel(fieldKey)} — fila ${rowId}`}
                    className="border-gray-500 data-[state=checked]:bg-[#17365D]"
                />
            </div>
        );
    }

    if (inputType === "select") {
        const fallbackOptions =
            fieldKey.includes("nivel_certificado") || fieldKey.includes("certified_level")
                ? ["A1", "A2", "B1", "B2", "C1", "C2"]
                : fieldKey.includes("attempt")
                    ? [
                        { value: "first", label: "Primera" },
                        { value: "second", label: "Segunda" },
                      ]
                    : [
                        "Básico 1", "Básico 2", "Intermedio 1", "Intermedio 2",
                        "Intermedio 3", "Intermedio 4", "Intermedio 5",
                        "Avanzado 1", "Avanzado 2",
                      ];

        const options = selectOptions[fieldKey] || fallbackOptions;

        return (
            <Select
                value={String(value ?? "")}
                onValueChange={(newValue) => {
                    setValue(newValue);
                    onChange?.(fieldKey, rowId, newValue);
                }}
            >
                <SelectTrigger className="w-[140px] mx-auto h-8 text-xs">
                    <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                    {options.map((opt) => {
                        const val = typeof opt === "object" ? String(opt.value) : String(opt);
                        const lbl = typeof opt === "object" ? opt.label : opt;
                        return (
                            <SelectItem key={val} value={val} className="text-xs">
                                {lbl}
                            </SelectItem>
                        );
                    })}
                </SelectContent>
            </Select>
        );
    }

    const extraNumericProps = inputType === "number"
        ? fieldKey === "score" || fieldKey.includes("calificacion_")
            ? { min: 0, max: fieldKey === "score" ? 2000 : 100, step: 1 }
            : { min: 0, max: 100, step: 0.1 }
        : {};

    const handleKeyDown = (e) => {
        if ((fieldKey === "score" || fieldKey.includes("calificacion_")) && ["e", "E", ".", ","].includes(e.key)) {
            e.preventDefault();
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
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => onChange?.(fieldKey, rowId, value)}
            {...extraNumericProps}
        />
    );
});

EditableCell.displayName = "EditableCell";

export default EditableCell;
