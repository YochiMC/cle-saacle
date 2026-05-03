import React, { memo } from "react";
import { ExternalLink } from "lucide-react";
import DataViewModal, { DataLabel } from "@/Components/DataTable/DataViewModal";
import StatusBadge from "@/Components/ui/StatusBadge";

/**
 * ExamDetailsModal — Modal de detalles de solo lectura para un examen.
 *
 * Componente presentacional optimizado con `React.memo`.
 * Usa `StatusBadge` compartido para la visualización del estado.
 *
 * @param {Object}   props
 * @param {Object}   props.examen  - Objeto del examen a mostrar (ExamResource del backend).
 * @param {Function} props.onClose - Callback para cerrar el modal.
 */
const ExamDetailsModal = memo(({ examen, onClose }) => {
    if (!examen) return null;

    /**
     * Formatea una fecha ISO (YYYY-MM-DD) al formato legible en es-MX.
     * Ej: "2026-04-14" → "14 abr 2026".
     *
     * @param {string} dateString - Fecha en formato ISO.
     * @returns {string} Fecha formateada o cadena vacía si no hay valor.
     */
    const formatDate = (dateString) => {
        if (!dateString) return "";

        const date = new Date(`${dateString}T00:00:00`);
        if (Number.isNaN(date.getTime())) return dateString;

        return new Intl.DateTimeFormat("es-MX", {
            day: "numeric",
            month: "short",
            year: "numeric",
        }).format(date);
    };

    const tipoDisplay = examen.exam_type?.value ?? examen.exam_type ?? null;
    const claveExamen = examen.name ?? "Sin Nomenclatura";
    const nombreDocente =
        examen.teacher_name ?? examen.teacher?.full_name ?? null;
    const nombrePeriodo =
        examen.period_name ??
        examen.period?.period_name ??
        examen.period?.name ??
        null;

    const startDateDisplay = formatDate(examen.start_date);
    const endDateDisplay = formatDate(examen.end_date);
    const rangoFechas =
        startDateDisplay && endDateDisplay
            ? startDateDisplay === endDateDisplay
                ? startDateDisplay
                : `Del ${startDateDisplay} al ${endDateDisplay}`
            : startDateDisplay || endDateDisplay || "Sin definir";

    const horaDisplay = examen.application_time ?? null;
    const modalidadDisplay = examen.mode ?? "Sin definir";

    /** Detecta si el valor de `classroom` es una URL válida. */
    const esUrl = (string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    };

    const TitleHeader = (
        <>
            {tipoDisplay && (
                <span className="inline-block mb-1 bg-[#1B396A] text-white text-xs font-bold px-3 py-0.5 rounded-full">
                    {tipoDisplay}
                </span>
            )}
            <h2 className="text-xl font-bold text-gray-900 leading-tight">
                {claveExamen}
            </h2>
            {nombreDocente ? (
                <p className="text-sm font-semibold text-[#1B396A]">
                    {nombreDocente}
                </p>
            ) : (
                <p className="text-sm italic text-gray-400">
                    Docente sin asignar
                </p>
            )}
        </>
    );

    return (
        <DataViewModal isOpen={!!examen} onClose={onClose} title={TitleHeader}>
            {/* Badge de estado — componente compartido con Grupos */}
            <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                    Estado
                </span>
                <StatusBadge status={examen.status} />
            </div>

            <DataLabel
                label="Tipo de examen"
                value={tipoDisplay}
                fallback="Sin definir"
            />

            <DataLabel
                label="Modalidad"
                value={modalidadDisplay}
                fallback="Sin definir"
            />

            <DataLabel
                label="Período"
                value={nombrePeriodo}
                fallback="Sin período asignado"
            />

            <DataLabel label="Rango de Aplicación" value={rangoFechas} />

            <DataLabel
                label="Hora de Aplicación"
                value={horaDisplay}
                fallback="Todo el día"
            />

            <div className="col-span-2">
                <DataLabel
                    label="Aula / Sede o LINK"
                    value={
                        examen.classroom ? (
                            esUrl(examen.classroom) ? (
                                <a
                                    href={examen.classroom}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1B396A] underline underline-offset-2 hover:text-[#142952] transition-colors"
                                >
                                    <ExternalLink size={16} />
                                    Abrir enlace
                                </a>
                            ) : (
                                <span className="inline-block bg-blue-50 text-[#1B396A] text-sm font-semibold px-3 py-1 rounded-full">
                                    {examen.classroom}
                                </span>
                            )
                        ) : null
                    }
                    fallback="Por asignar"
                />
            </div>
        </DataViewModal>
    );
});

ExamDetailsModal.displayName = "ExamDetailsModal";
export default ExamDetailsModal;
