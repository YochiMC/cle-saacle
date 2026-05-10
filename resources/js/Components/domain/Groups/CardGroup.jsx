import React, { memo } from "react";
import { UserCircle, ExternalLink } from "lucide-react";
import { Link } from "@inertiajs/react";
import { usePermission } from "@/Utils/auth";
import CatalogCard from "@/Components/ui/CatalogCard";
import { resolverEstado } from "@/Components/ui/StatusBadge";
import { abreviarEtiqueta } from "@/Utils/textFormatters";
import { formatUserName } from "@/Utils/userUtils";

/**
 * CardGroup — Tarjeta visual de un Grupo Académico.
 *
 * Ahora actúa como orquestador de dominio para CatalogCard,
 * calculando los permisos y el estado del cupo antes de renderizar.
 */
const CardGroup = memo(
    ({ grupo, seleccionado = false, onToggleSelect, onVerDetalles, onEditar }) => {
        const { hasRole } = usePermission();
        const esEstudiante = hasRole("student");
        const esAdminOCoord = hasRole("admin") || hasRole("coordinator");
        const esStaff = hasRole("admin") || hasRole("coordinator") || hasRole("teacher");

        const badge = resolverEstado(grupo.status, grupo.status_label);
        const nivelCompleto = (grupo.level?.level_tecnm || grupo.type || "NIVEL NO DEFINIDO").toString();
        const nivelAbreviado = abreviarEtiqueta(nivelCompleto);
        const nombreDocente = formatUserName(grupo.teacher || { teacher_name: grupo.teacher_name });

        // Preparación de información de cupo para el componente base
        const quotaInfo = {
            enrolled: grupo.enrolled_count,
            capacity: grupo.capacity,
            isFull: grupo.available_seats === 0,
            label: grupo.available_seats === 0 ? "Grupo Lleno" : "Cupo"
        };

        // Renderizado condicional de acciones (Lógica de Negocio movida aquí)
        const footerActions = (
            <>
                {esAdminOCoord && onEditar && (
                    <button
                        onClick={() => onEditar(grupo)}
                        className="w-full py-3 bg-[#1B396A] text-white font-semibold rounded-lg hover:bg-[#142952] active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        Editar
                    </button>
                )}

                {esStaff && (
                    <Link
                        href={route("groups.show", grupo.id)}
                        className="w-full py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                        <ExternalLink size={15} strokeWidth={2.5} />
                        Ver Grupo
                    </Link>
                )}

                <button
                    onClick={() => onVerDetalles(grupo)}
                    className="w-full py-2.5 border-2 border-[#1B396A] text-[#1B396A] font-semibold rounded-lg hover:bg-[#1B396A] hover:text-white active:scale-95 transition-all duration-200"
                >
                    Ver Detalles
                </button>
            </>
        );

        return (
            <CatalogCard
                isSelected={seleccionado}
                onToggleSelect={() => onToggleSelect?.(grupo.id)}
                showSelection={esAdminOCoord}
                badge={badge}
                categoryLabel={nivelAbreviado}
                categoryTitle={nivelCompleto}
                title={grupo.name ?? `Grupo #${grupo.id}`}
                quotaInfo={quotaInfo}
                footerActions={footerActions}
            >
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-gray-600 font-medium">
                        <UserCircle size={16} className="text-[#1B396A]" />
                        <span>Docente:</span>
                    </div>
                    <span className="text-gray-900 font-semibold text-right max-w-[65%] truncate">
                        {nombreDocente}
                    </span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Horario:</span>
                    <span className="text-gray-900 font-semibold">
                        {grupo.schedule || "Por definir"}
                    </span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Modalidad:</span>
                    <span className="text-[#1B396A] font-bold bg-blue-50 px-3 py-1 rounded-full text-xs">
                        {grupo.mode || "Por definir"}
                    </span>
                </div>
            </CatalogCard>
        );
    },
);

CardGroup.displayName = "CardGroup";
export default CardGroup;

