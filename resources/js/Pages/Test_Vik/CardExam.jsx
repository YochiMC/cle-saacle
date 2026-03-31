import React, { memo } from "react";
import { ExternalLink, UserCircle, Users } from "lucide-react";
import { Link } from "@inertiajs/react";
import { usePermission } from "@/Utils/auth";

/** Mapa de estados con etiquetas en español y clases de color. */
const STATUS_MAP = {
    enrolling: {
        label: "Inscripciones Abiertas",
        cls: "bg-blue-100 text-blue-800",
    },
    active: { label: "Activo", cls: "bg-green-100 text-green-800" },
    pending: { label: "En Espera", cls: "bg-yellow-100 text-yellow-800" },
    grading: { label: "En Evaluación", cls: "bg-purple-100 text-purple-800" },
    completed: { label: "Completado", cls: "bg-gray-100 text-gray-800" },
};

const getStatusBadge = (examen) => {
    const key = (examen?.status?.value ?? examen?.status ?? "").toLowerCase();
    return (
        STATUS_MAP[key] ?? {
            label: key || "Sin estado",
            cls: "bg-gray-100 text-gray-500",
        }
    );
};

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
 * Tarjeta visual de una sesión de examen.
 * Clon pixel-perfecto de CardGroup con datos del examen.
 */
const CardExam = memo(
    ({
        examen,
        seleccionado = false,
        onToggleSelect,
        onVerDetalles,
        onInscribir,
        onEditar,
    }) => {
        const badge = getStatusBadge(examen);

        const { hasRole } = usePermission();
        const esEstudiante = hasRole("student");
        const esAdminOCoord = hasRole("admin") || hasRole("coordinator");
        const esStaff =
            hasRole("admin") || hasRole("coordinator") || hasRole("teacher");

        const nombreExamen = examen.name ?? "Sin nombre";
        const examTypeDisplay = (
            examen.exam_type?.value ??
            examen.exam_type ??
            "Sin tipo"
        )
            .toString()
            .toUpperCase();
        const nombreDocente =
            [examen.teacher?.name, examen.teacher?.last_name]
                .filter(Boolean)
                .join(" ") ||
            [examen.teacher?.first_name, examen.teacher?.last_name]
                .filter(Boolean)
                .join(" ") ||
            examen.teacher_name ||
            "Docente sin asignar";
        const registeredDisplay =
            examen.registered ?? examen.enrolled_count ?? "--";
        const capacityDisplay = examen.capacity ?? "Ilimitado";

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

        const fechaHora = [dateRangeDisplay, examen.application_time]
            .filter(Boolean)
            .join("  ");

        const modalidadDisplay = examen.mode || "Sin modalidad";

        return (
            <div className="w-full bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-[#1B396A] h-full flex flex-col">
                {/* Barra de acento superior */}
                <div className="h-2 bg-gradient-to-r from-[#1B396A] to-[#142952]" />

                {/* Cabecera: checkbox + tipo + badge */}
                <div className="px-6 pt-4 flex justify-between items-start">
                    <div className="flex items-center gap-3 min-w-0">
                        {esAdminOCoord && onToggleSelect ? (
                            <div className="relative flex items-start">
                                <div className="flex items-center h-5 mt-0.5">
                                    <input
                                        type="checkbox"
                                        checked={seleccionado}
                                        onChange={() =>
                                            onToggleSelect(examen.id)
                                        }
                                        className="w-5 h-5 text-[#1B396A] bg-gray-50 border-gray-300 rounded focus:ring-[#1B396A] focus:ring-2 cursor-pointer transition-all hover:scale-110 shadow-sm"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="w-5" />
                        )}
                        <span className="text-sm font-extrabold tracking-wide text-[#1B396A] uppercase truncate">
                            {examTypeDisplay}
                        </span>
                    </div>
                    <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${badge.cls}`}
                    >
                        {badge.label}
                    </span>
                </div>

                {/* Cuerpo */}
                <div className="px-6 pb-6 flex flex-col flex-grow gap-4">
                    {/* Identidad */}
                    <div className="text-center space-y-1">
                        {/* Nombre del examen */}
                        <h3 className="text-xl font-bold text-gray-900 leading-tight">
                            {nombreExamen}
                        </h3>
                    </div>

                    <div className="border-t border-gray-200" />

                    {/* Detalles */}
                    <div className="space-y-3 text-sm flex-grow">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 text-gray-600 font-medium">
                                <UserCircle
                                    size={16}
                                    className="text-[#1B396A]"
                                />
                                <span>Docente:</span>
                            </div>
                            <span className="text-gray-900 font-semibold text-right max-w-[65%] truncate">
                                {nombreDocente}
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-medium">
                                Rango de Aplicación:
                            </span>
                            <span className="text-gray-900 font-semibold">
                                {fechaHora}
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-medium">
                                Modalidad:
                            </span>
                            <span className="text-[#1B396A] font-bold bg-blue-50 px-3 py-1 rounded-full text-xs">
                                {modalidadDisplay}
                            </span>
                        </div>

                        <div className="flex justify-between items-center mt-3 p-2.5 rounded-xl border shadow-sm bg-blue-50/60 border-blue-100">
                            <div className="flex items-center gap-2 font-semibold text-[#1B396A]">
                                <Users size={16} strokeWidth={2.5} />
                                <span>Cupo</span>
                            </div>
                            <div className="bg-white px-3 py-1 rounded-lg shadow-sm border border-blue-100 flex items-center justify-center">
                                <span className="text-base font-black text-[#1B396A]">
                                    {registeredDisplay}{" "}
                                    <span className="text-sm font-semibold opacity-70 mb-0.5">
                                        / {capacityDisplay}
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-200" />

                    {/* Botones */}
                    <div className="mt-auto flex flex-col gap-2">
                        {esEstudiante && (
                            <button
                                onClick={() => onInscribir(examen.id)}
                                className="w-full py-3 bg-[#1B396A] text-white font-semibold rounded-lg hover:bg-[#142952] active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                Inscribirse
                            </button>
                        )}

                        {esAdminOCoord && (
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
                                Abrir Examen
                            </Link>
                        )}

                        <button
                            onClick={() => onVerDetalles(examen)}
                            className="w-full py-2.5 border-2 border-[#1B396A] text-[#1B396A] font-semibold rounded-lg hover:bg-[#1B396A] hover:text-white active:scale-95 transition-all duration-200"
                        >
                            Ver Detalles
                        </button>
                    </div>
                </div>
            </div>
        );
    },
);

export default CardExam;
