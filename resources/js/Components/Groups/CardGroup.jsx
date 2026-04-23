import React, { memo } from "react";
import { UserCircle } from "lucide-react";
import { usePermission } from "@/Utils/auth";
import CatalogCard from "@/Components/DataTable/CatalogCard";
import { resolverEstado } from "@/Components/ui/StatusBadge";
import { abreviarEtiqueta } from "@/Utils/textFormatters";

/**
 * CardGroup — Tarjeta visual de un Grupo Académico.
 *
 * Wrapper delgado sobre `CatalogCard` (SRP + OCP).
 * Su única responsabilidad es preparar los datos específicos del dominio
 * "Grupo" e inyectar las filas de detalle mediante `children` (composición).
 *
 * @component
 * @param {Object}   props
 * @param {Object}   props.grupo            - Objeto del grupo (GroupResource).
 * @param {boolean}  [props.seleccionado]   - Estado del checkbox de selección múltiple.
 * @param {Function} [props.onToggleSelect] - Notifica el cambio de selección.
 * @param {Function} props.onVerDetalles    - Abre el modal de información extendida.
 * @param {Function} [props.onInscribir]    - Dispara el flujo de inscripción.
 * @param {Function} [props.onEditar]       - Dispara el flujo de edición administrativa.
 */
const CardGroup = memo(
    ({ grupo, seleccionado = false, onToggleSelect, onVerDetalles, onInscribir, onEditar }) => {
        const { hasRole } = usePermission();
        const esEstudiante = hasRole("student");
        const esAdminOCoord = hasRole("admin") || hasRole("coordinator");
        const esStaff = hasRole("admin") || hasRole("coordinator") || hasRole("teacher");
        const puedeInscribirse = grupo.status === "enrolling";

        // Badge de estado resuelto con el helper compartido (fuente única de verdad)
        const badge = resolverEstado(grupo.status, grupo.status_label);

        // Preparar nivel y abreviación usando la utilidad centralizada (SRP)
        const nivelCompleto = (grupo.level?.level_tecnm || grupo.type || "NIVEL NO DEFINIDO").toString();
        const nivelAbreviado = abreviarEtiqueta(nivelCompleto);

        return (
            <CatalogCard
                seleccionado={seleccionado}
                onToggleSelect={() => onToggleSelect?.(grupo.id)}
                badge={badge}
                categoryLabel={nivelAbreviado}
                categoryTitle={nivelCompleto}
                title={grupo.name ?? `Grupo #${grupo.id}`}
                enrolledCount={grupo.enrolled_count}
                capacity={grupo.capacity}
                isLleno={grupo.available_seats === 0}
                onVerDetalles={() => onVerDetalles(grupo)}
                onInscribir={onInscribir && puedeInscribirse ? () => onInscribir(grupo.id) : undefined}
                onEditar={onEditar ? () => onEditar(grupo) : undefined}
                openHref={route("groups.show", grupo.id)}
                openLabel="Abrir Grupo"
                esEstudiante={esEstudiante}
                esAdminOCoord={esAdminOCoord}
                esStaff={esStaff}
            >
                {/* Detalles específicos del dominio Grupo (composición via children) */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-gray-600 font-medium">
                        <UserCircle size={16} className="text-[#1B396A]" />
                        <span>Docente:</span>
                    </div>
                    <span className="text-gray-900 font-semibold text-right max-w-[65%] truncate">
                        {grupo.teacher_name || "Docente por asignar"}
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
