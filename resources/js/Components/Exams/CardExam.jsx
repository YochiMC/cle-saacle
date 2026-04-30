import React, { memo } from "react";
import { UserCircle } from "lucide-react";
import { usePermission } from "@/Utils/auth";
import CatalogCard from "@/Components/DataTable/CatalogCard";
import { resolverEstado } from "@/Components/ui/StatusBadge";
import { abreviarEtiqueta } from "@/Utils/textFormatters";

/**
 * Formatea una fecha ISO (YYYY-MM-DD) al formato legible en es-MX.
 * Ej: "2026-04-08" → "08 abr 2026".
 *
 * @param {string} dateString - Fecha en formato ISO.
 * @returns {string} Fecha formateada o cadena vacía si no hay valor.
 */
const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(date.getTime())) return dateString;

    return new Intl.DateTimeFormat("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
};

/**
 * CardExam — Tarjeta visual de una Sesión de Examen.
 *
 * Wrapper delgado sobre `CatalogCard` (SRP + OCP).
 * Su única responsabilidad es preparar los datos específicos del dominio
 * "Examen" e inyectar las filas de detalle mediante `children` (composición).
 *
 * @component
 * @param {Object}   props
 * @param {Object}   props.examen           - Objeto del examen (ExamResource).
 * @param {boolean}  [props.seleccionado]   - Estado del checkbox de selección múltiple.
 * @param {Function} [props.onToggleSelect] - Notifica el cambio de selección.
 * @param {Function} props.onVerDetalles    - Abre el modal de información extendida.
 * @param {Function} [props.onInscribir]    - Dispara el flujo de inscripción del alumno.
 * @param {Function} [props.onEditar]       - Dispara el flujo de edición administrativa.
 */
const CardExam = memo(
    ({ examen, seleccionado = false, onToggleSelect, onVerDetalles, onInscribir, onEditar }) => {
        const { hasRole } = usePermission();
        const esEstudiante = hasRole("student");
        const esAdminOCoord = hasRole("admin") || hasRole("coordinator");
        const esStaff = hasRole("admin") || hasRole("coordinator") || hasRole("teacher");

        // Badge de estado resuelto con el helper compartido (fuente única de verdad)
        const badge = resolverEstado(examen.status);

        // Tipo del examen y abreviación usando la utilidad centralizada (SRP)
        const examTypeCompleto = (examen.exam_type?.value ?? examen.exam_type ?? "Sin tipo").toString();
        const tipoAbreviado = abreviarEtiqueta(examTypeCompleto);

        // Construcción del rango de fechas formateado
        const startDate = examen.start_date || "";
        const endDate = examen.end_date || "";
        const startDateDisplay = formatDate(startDate);
        const endDateDisplay = formatDate(endDate);
        const dateRangeDisplay =
            startDate && endDate
                ? startDate === endDate
                    ? startDateDisplay
                    : `Del ${startDateDisplay} al ${endDateDisplay}`
                : startDateDisplay || endDateDisplay || "Por definir";

        // Si hay hora definida, se concatena al rango de fechas
        const fechaHora = [dateRangeDisplay, examen.application_time]
            .filter(Boolean)
            .join("  ");

        // Normaliza el nombre del docente desde diferentes estructuras posibles del backend
        const nombreDocente =
            [examen.teacher?.name, examen.teacher?.last_name].filter(Boolean).join(" ") ||
            [examen.teacher?.first_name, examen.teacher?.last_name].filter(Boolean).join(" ") ||
            examen.teacher_name ||
            "Docente sin asignar";

        return (
            <CatalogCard
                seleccionado={seleccionado}
                onToggleSelect={() => onToggleSelect?.(examen.id)}
                badge={badge}
                categoryLabel={tipoAbreviado}
                categoryTitle={examTypeCompleto}
                title={examen.name ?? "Sin nombre"}
                enrolledCount={examen.registered ?? examen.enrolled_count}
                capacity={examen.capacity ?? "Ilimitado"}
                onVerDetalles={() => onVerDetalles(examen)}
                onInscribir={onInscribir ? () => onInscribir(examen.id) : undefined}
                onEditar={onEditar ? () => onEditar(examen) : undefined}
                openHref={route("exams.show", examen.id)}
                openLabel="Ver Examen"
                esEstudiante={esEstudiante}
                esAdminOCoord={esAdminOCoord}
                esStaff={esStaff}
            >
                {/* Detalles específicos del dominio Examen (composición via children) */}
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
