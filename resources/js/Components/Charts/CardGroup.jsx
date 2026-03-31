import React, { memo } from "react";
import { Users, ExternalLink, UserCircle } from "lucide-react";
import { Link } from "@inertiajs/react";
import { usePermission } from "@/Utils/auth";

const getStatusBadge = (grupo) => {
    const status = grupo?.status?.toLowerCase();
    const label = grupo?.status_label || status;
    switch (status) {
        case "enrolling":
            return { label, cls: "bg-blue-100 text-blue-800" };
        case "active":
            return { label, cls: "bg-green-100 text-green-800" };
        case "pending":
            return { label, cls: "bg-yellow-100 text-yellow-800" };
        case "grading":
            return { label, cls: "bg-purple-100 text-purple-800" };
        case "completed":
            return { label, cls: "bg-gray-100 text-gray-800" };
        default:
            return {
                label: label ?? "Sin estado",
                cls: "bg-gray-100 text-gray-500",
            };
    }
};

/**
 * Representación visual (Tarjeta) de un grupo académico.
 * Componente presentacional puro, optimizado con React.memo para evitar re-procesamientos
 * innecesarios en grillas de datos extensas.
 *
 * @component
 * @param {Object} props - Propiedades del componente.
 * @param {Object} props.grupo - Objeto de datos del grupo (GroupResource).
 * @param {boolean} [props.seleccionado=false] - Define si la tarjeta está marcada en la selección múltiple.
 * @param {function(string|number): void} [props.onToggleSelect] - Notifica el cambio de selección.
 * @param {function(Object): void} props.onVerDetalles - Abre el modal de información extendida.
 * @param {function(string|number): void} props.onInscribir - Dispara el flujo de inscripción.
 * @param {function(Object): void} props.onEditar - Dispara el flujo de edición administrativa.
 */
const CardGroup = memo(
    ({
        grupo,
        seleccionado = false,
        onToggleSelect,
        onVerDetalles,
        onInscribir,
        onEditar,
    }) => {
        const badge = getStatusBadge(grupo);

        const { hasRole } = usePermission();
        const esEstudiante = hasRole("student");
        const esAdminOCoord = hasRole("admin") || hasRole("coordinator");
        const esStaff =
            hasRole("admin") || hasRole("coordinator") || hasRole("teacher");

        const nombreDocente = grupo.teacher_name ?? null;
        let nivelDisplay =
            (grupo.level?.level_tecnm || "").toString().toUpperCase() ||
            "NIVEL NO DEFINIDO";
        
        // Acrónimos para mejorar UI
        nivelDisplay = nivelDisplay.replace("PROGRAMA EGRESADOS", "PE");

        return (
            <div className="w-full bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-[#1B396A] h-full flex flex-col">
                <div className="h-2 bg-gradient-to-r from-[#1B396A] to-[#142952]" />

                <div className="px-6 pt-4 flex items-center justify-between gap-3 overflow-hidden">
                    <div className="flex items-center gap-2 flex-grow min-w-0">
                        {esAdminOCoord && onToggleSelect ? (
                            <div className="relative flex items-start shrink-0">
                                <div className="flex items-center h-5">
                                    <input
                                        type="checkbox"
                                        checked={seleccionado}
                                        onChange={() =>
                                            onToggleSelect(grupo.id)
                                        }
                                        className="w-5 h-5 text-[#1B396A] bg-gray-50 border-gray-300 rounded focus:ring-[#1B396A] focus:ring-2 cursor-pointer transition-all hover:scale-110 shadow-sm"
                                    />
                                </div>
                            </div>
                        ) : null}
                        <span className="text-sm font-extrabold tracking-wide text-[#1B396A] uppercase truncate mt-0.5">
                            {nivelDisplay}
                        </span>
                    </div>
                    <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full text-center shadow-sm shrink-0 whitespace-nowrap ${badge.cls}`}
                    >
                        {badge.label}
                    </span>
                </div>

                <div className="px-6 pb-6 flex flex-col flex-grow gap-4">
                    <div className="text-center space-y-1">
                        <h3 className="text-xl font-bold text-gray-900 leading-tight">
                            {grupo.name ?? `Grupo #${grupo.id}`}
                        </h3>
                    </div>

                    <div className="border-t border-gray-200" />

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
                                {nombreDocente || "Docente por asignar"}
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-medium">
                                Horario:
                            </span>
                            <span className="text-gray-900 font-semibold">
                                {grupo.schedule || "Por definir"}
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-medium">
                                Modalidad:
                            </span>
                            <span className="text-[#1B396A] font-bold bg-blue-50 px-3 py-1 rounded-full text-xs">
                                {grupo.mode || "Por definir"}
                            </span>
                        </div>

                        <div
                            className={`flex justify-between items-center mt-3 p-2.5 rounded-xl border shadow-sm ${grupo.available_seats === 0 ? "bg-red-50/60 border-red-100" : "bg-blue-50/60 border-blue-100"}`}
                        >
                            <div
                                className={`flex items-center gap-2 font-semibold ${grupo.available_seats === 0 ? "text-red-700" : "text-[#1B396A]"}`}
                            >
                                <Users size={16} strokeWidth={2.5} />
                                <span>
                                    {grupo.available_seats === 0
                                        ? "Grupo Lleno"
                                        : "Cupo"}
                                </span>
                            </div>
                            <div
                                className={`bg-white px-3 py-1 rounded-lg shadow-sm border flex items-center justify-center ${grupo.available_seats === 0 ? "border-red-200" : "border-blue-100"}`}
                            >
                                <span
                                    className={`text-base font-black ${grupo.available_seats === 0 ? "text-red-600" : "text-[#1B396A]"}`}
                                >
                                    {grupo.enrolled_count ?? "0"}{" "}
                                    <span className="text-sm font-semibold opacity-70 mb-0.5">
                                        / {grupo.capacity ?? "0"}
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-200" />

                    <div className="mt-auto flex flex-col gap-2">
                        {/* Botón primario: Inscribirse (solo estudiantes) */}
                        {esEstudiante && (
                            <button
                                onClick={() => onInscribir(grupo.id)}
                                className="w-full py-3 bg-[#1B396A] text-white font-semibold rounded-lg hover:bg-[#142952] active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                Inscribirse
                            </button>
                        )}

                        {/* Botón edición rápida: solo admin/coordinador */}
                        {esAdminOCoord && (
                            <button
                                onClick={() => onEditar(grupo)}
                                className="w-full py-3 bg-[#1B396A] text-white font-semibold rounded-lg hover:bg-[#142952] active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                Editar
                            </button>
                        )}

                        {/* Botón gestión profunda: admin, coordinador o maestro */}
                        {esStaff && (
                            <Link
                                href={route("groups.show", grupo.id)}
                                className="w-full py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                            >
                                <ExternalLink size={15} strokeWidth={2.5} />
                                Abrir Grupo
                            </Link>
                        )}

                        {/* Botón vista rápida: accesible para todos los roles */}
                        <button
                            onClick={() => onVerDetalles(grupo)}
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

export default CardGroup;
