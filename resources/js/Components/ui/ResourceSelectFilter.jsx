import React, { memo } from "react";
import { ChevronDown } from "lucide-react";

const baseSelectClass =
    "w-full h-11 appearance-none pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg " +
    "shadow-sm text-sm font-medium text-gray-700 transition-all duration-200 cursor-pointer " +
    "hover:border-blue-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 " +
    "focus:border-blue-500";

/**
 * Selector reutilizable para barras de filtros.
 */
const ResourceSelectFilter = memo(
    ({
        icon: Icon,
        value,
        onChange,
        options = [],
        placeholder = "Seleccionar",
        ariaLabel = "Filtro",
        minWidthClassName = "min-w-[180px]",
        className = baseSelectClass,
    }) => {
        return (
            <div className={`relative ${minWidthClassName}`}>
                {Icon && (
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5 pointer-events-none" />
                )}
                <select
                    value={value}
                    onChange={onChange}
                    className={className}
                    aria-label={ariaLabel}
                >
                    <option value="">{placeholder}</option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
            </div>
        );
    },
);

export default ResourceSelectFilter;
