import React, { memo } from "react";
import { UserCircle, ExternalLink } from "lucide-react";
import { Link } from "@inertiajs/react";
import { usePermission } from "@/Utils/auth";
import CatalogCard from "@/Components/ui/CatalogCard";
import { resolverEstado } from "@/Components/ui/StatusBadge";
import { abreviarEtiqueta } from "@/Utils/textFormatters";
import { formatDateRange } from "@/Utils/dateUtils";
import { formatUserName } from "@/Utils/userUtils";

/**
 * CardExam — Tarjeta visual de una Sesión de Examen.
 * 
 * Orquestador de dominio para CatalogCard en el contexto de Exámenes.
 */
const CardExam = memo(
    ({ examen, seleccionado = false, onToggleSelect, onVerDetalles, onInscribir, onEditar }) => {
        const { hasRole } = usePermission();
        const esEstudiante = hasRole("student");
        const esAdminOCoord = hasRole("admin") || hasRole("coordinator");
        const esStaff = hasRole("admin") || hasRole("coordinator") || hasRole("teacher");
        const puedeInscribirse = examen.status === "enrolling" && !(esEstudiante && examen.is_enrolled);

        const badge = resolverEstado(examen.status);
        const examTypeCompleto = (examen.exam_type?.value ?? examen.exam_type ?? "Sin tipo").toString();
        const tipoAbreviado = abreviarEtiqueta(examTypeCompleto);

        const dateRangeDisplay = formatDateRange(examen.start_date, examen.end_date);
        const fechaHora = [dateRangeDisplay, examen.application_time]
            .filter(Boolean)
            .join("  ");

        const nombreDocente = formatUserName(examen.teacher || { teacher_name: examen.teacher_name });

        const quotaInfo = {
            enrolled: examen.registered ?? examen.enrolled_count,
            capacity: examen.capacity ?? "Ilimitado",
            isFull: (examen.capacity && (examen.registered ?? examen.enrolled_count) >= examen.capacity),
            label: "Registrados"
        };

        const footerActions = (
            <>
                {esEstudiante && onInscribir && puedeInscribirse && (
                    <button
                        onClick={() => onInscribir(examen.id)}
                        className="w-full py-3 bg-[#1B396A] text-white font-semibold rounded-lg hover:bg-[#142952] active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        Inscribirse
                    </button>
                )}

                {esAdminOCoord && onEditar && (
                    <button
                        onClick={() => onEditar(examen)}
                        className="w-full py-3 bg-[#1B396A] text-white font-semibold rounded-lg hover:bg-[#142952] active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        Editar
                    </button>
                )}

                {esStaff && (
                    <Link
                        href={route("exams.show", examen.id)}
                        className="w-full py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                        <ExternalLink size={15} strokeWidth={2.5} />
                        Ver Examen
                    </Link>
                )}

                <button
                    onClick={() => onVerDetalles(examen)}
                    className="w-full py-2.5 border-2 border-[#1B396A] text-[#1B396A] font-semibold rounded-lg hover:bg-[#1B396A] hover:text-white active:scale-95 transition-all duration-200"
                >
                    Ver Detalles
                </button>
            </>
        );

        return (
            <CatalogCard
                isSelected={seleccionado}
                onToggleSelect={() => onToggleSelect?.(examen.id)}
                showSelection={esAdminOCoord}
                badge={badge}
                categoryLabel={tipoAbreviado}
                categoryTitle={examTypeCompleto}
                title={examen.name ?? "Sin nombre"}
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
                    <span className="text-gray-600 font-medium">Rango de Aplicación:</span>
                    <span className="text-gray-900 font-semibold">{fechaHora}</span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Modalidad:</span>
                    <span className="text-[#1B396A] font-bold bg-blue-50 px-3 py-1 rounded-full text-xs">
                        {examen.mode || "Sin modalidad"}
                    </span>
                </div>
            </CatalogCard>
        );
    },
);

CardExam.displayName = "CardExam";
export default CardExam;

