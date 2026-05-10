import React, { memo } from "react";
import { Users } from "lucide-react";

/**
 * CatalogCard — Tarjeta base puramente presentacional.
 *
 * Sigue el patrón de Componente Tonto (Dumb Component). 
 * No conoce roles, permisos ni lógica de negocio específica.
 * Recibe toda la información de estado y acciones desde sus padres.
 *
 * @param {Object} props
 * @param {boolean} [props.isSelected=false] - Estado del checkbox.
 * @param {Function} [props.onToggleSelect]  - Callback de selección.
 * @param {boolean} [props.showSelection]    - Determina si mostrar el checkbox.
 * @param {Object} props.badge               - Badge de estado { etiqueta, cls }.
 * @param {string} props.categoryLabel       - Texto corto superior (ej: "B1").
 * @param {string} props.categoryTitle       - Texto completo para el tooltip.
 * @param {string} props.title               - Título principal.
 * @param {React.ReactNode} props.children   - Contenido central (detalles).
 * @param {Object} props.quotaInfo           - Información de cupo { enrolled, capacity, isFull, label }.
 * @param {React.ReactNode} props.footerActions - Botones de acción pre-renderizados.
 */
const CatalogCard = memo(
    ({
        isSelected = false,
        onToggleSelect,
        showSelection = false,
        badge,
        categoryLabel,
        categoryTitle,
        title,
        children,
        quotaInfo,
        footerActions,
    }) => {
        // Estilos visuales del widget de cupo (puros)
        const isFull = quotaInfo?.isFull;
        const cupoStyles = isFull
            ? {
                  contenedor: "bg-red-50/60 border-red-100",
                  icono: "text-red-700",
                  insignia: "border-red-200",
                  numero: "text-red-600",
              }
            : {
                  contenedor: "bg-blue-50/60 border-blue-100",
                  icono: "text-[#1B396A]",
                  insignia: "border-blue-100",
                  numero: "text-[#1B396A]",
              };

        return (
            <div className="w-full bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-[#1B396A] h-full flex flex-col">
                <div className="h-2 bg-gradient-to-r from-[#1B396A] to-[#142952]" />

                <div className="px-6 pt-4 flex items-center justify-between gap-3 overflow-hidden">
                    <div className="flex items-center gap-2 flex-grow min-w-0">
                        {showSelection && (
                            <div className="flex items-center h-5 shrink-0">
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={onToggleSelect}
                                    className="w-5 h-5 text-[#1B396A] bg-gray-50 border-gray-300 rounded focus:ring-[#1B396A] focus:ring-2 cursor-pointer transition-all hover:scale-110 shadow-sm"
                                />
                            </div>
                        )}
                        <span 
                            className="text-sm font-extrabold tracking-wide text-[#1B396A] uppercase truncate mt-0.5 cursor-help"
                            title={categoryTitle || categoryLabel}
                        >
                            {categoryLabel}
                        </span>
                    </div>

                    {badge && (
                        <span
                            className={`text-xs font-semibold px-3 py-1 rounded-full text-center shadow-sm shrink-0 whitespace-nowrap ${badge.cls}`}
                        >
                            {badge.etiqueta}
                        </span>
                    )}
                </div>

                <div className="px-6 pb-6 flex flex-col flex-grow gap-4">
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-gray-900 leading-tight">{title}</h3>
                    </div>

                    <div className="border-t border-gray-200" />

                    <div className="space-y-3 text-sm flex-grow">
                        {children}

                        {quotaInfo && (
                            <div className={`flex justify-between items-center mt-3 p-2.5 rounded-xl border shadow-sm ${cupoStyles.contenedor}`}>
                                <div className={`flex items-center gap-2 font-semibold ${cupoStyles.icono}`}>
                                    <Users size={16} strokeWidth={2.5} />
                                    <span>{quotaInfo.label || (isFull ? "Grupo Lleno" : "Cupo")}</span>
                                </div>
                                <div className={`bg-white px-3 py-1 rounded-lg shadow-sm border flex items-center justify-center ${cupoStyles.insignia}`}>
                                    <span className={`text-base font-black ${cupoStyles.numero}`}>
                                        {quotaInfo.enrolled ?? "0"}{" "}
                                        <span className="text-sm font-semibold opacity-70">
                                            / {quotaInfo.capacity ?? "—"}
                                        </span>
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-gray-200" />

                    <div className="mt-auto flex flex-col gap-2">
                        {footerActions}
                    </div>
                </div>
            </div>
        );
    },
);

CatalogCard.displayName = "CatalogCard";
export default CatalogCard;
