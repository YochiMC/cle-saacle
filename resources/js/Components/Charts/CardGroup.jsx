import React, { memo } from "react";
import { Users, ExternalLink } from "lucide-react";
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
 * Tarjeta (Card) que representa visualmente un grupo en la grilla.
 * Componente presentacional puro, las acciones de negocio se inyectan a través de callbacks.
 * Se memoriza para evitar renders si el grupo asignado no cambia.
 *
 * @param {Object} props
 * @param {Object} props.grupo - Objeto con los datos del grupo (con relaciones eager loaded).
 * @param {function(Object): void} props.onVerDetalles - Callback para abrir el modal de vista rápida (todos los roles).
 * @param {function(Object): void} props.onEditar - Callback para abrir el modal de edición (solo admin/coord).
 * @param {function(string|number): void} props.onInscribir - Callback de inscripción (solo estudiantes).
 * @param {boolean} [props.seleccionado=false] - Define si la tarjeta está seleccionada.
 * @param {function(string|number): void} [props.onToggleSelect] - Callback al alternar selección.
 */
const CardGroup = memo(({ grupo, seleccionado = false, onToggleSelect, onVerDetalles, onInscribir, onEditar }) => {
    const badge = getStatusBadge(grupo);

    const { hasRole } = usePermission();
    const esEstudiante = hasRole("student");
    const esAdminOCoord = hasRole("admin") || hasRole("coordinator");
    const esStaff = hasRole("admin") || hasRole("coordinator") || hasRole("teacher");

    const nombreDocente = grupo.teacher_name ?? null;
    const nivelDisplay = grupo.level?.level_tecnm || null;

    return (
        <div className="w-full bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-[#1B396A] h-full flex flex-col">
            <div className="h-2 bg-gradient-to-r from-[#1B396A] to-[#142952]" />
            <div className="px-6 pt-4 flex justify-between items-start">
                {esAdminOCoord && onToggleSelect ? (
                    <div className="relative flex items-start">
                        <div className="flex items-center h-5 mt-0.5">
                            <input
                                type="checkbox"
                                checked={seleccionado}
                                onChange={() => onToggleSelect(grupo.id)}
                                className="w-5 h-5 text-[#1B396A] bg-gray-50 border-gray-300 rounded focus:ring-[#1B396A] focus:ring-2 cursor-pointer transition-all hover:scale-110 shadow-sm"
                            />
                        </div>
                    </div>
                ) : (
                    <div />
                )}
                <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${badge.cls}`}
                >
                    {badge.label}
                </span>
            </div>

            <div className="px-6 pb-6 flex flex-col flex-grow gap-4">
                <div className="text-center space-y-1">
                    {nivelDisplay ? (
                        <span className="inline-block bg-[#1B396A] text-white text-xs font-bold px-3 py-0.5 rounded-full tracking-wide">
                            {nivelDisplay}
                        </span>
                    ) : (
                        <span className="inline-block bg-gray-200 text-gray-500 text-xs italic px-3 py-0.5 rounded-full">
                            Nivel no definido
                        </span>
                    )}

                    <h3 className="text-xl font-bold text-gray-900 leading-tight">
                        {grupo.name ?? `Grupo #${grupo.id}`}
                    </h3>

                    {nombreDocente ? (
                        <p className="text-sm font-semibold text-[#1B396A]">
                            {nombreDocente}
                        </p>
                    ) : (
                        <p className="text-sm italic text-gray-400">
                            Docente por asignar
                        </p>
                    )}
                </div>

                <div className="border-t border-gray-200" />

                <div className="space-y-3 text-sm flex-grow">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Horario:</span>
                        <span className="text-gray-900 font-semibold">{grupo.schedule}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Modalidad:</span>
                        <span className="text-[#1B396A] font-bold bg-blue-50 px-3 py-1 rounded-full text-xs">
                            {grupo.mode}
                        </span>
                    </div>

                    <div className={`flex justify-between items-center mt-3 p-2.5 rounded-xl border shadow-sm ${grupo.available_seats === 0 ? 'bg-red-50/60 border-red-100' : 'bg-blue-50/60 border-blue-100'}`}>
                        <div className={`flex items-center gap-2 font-semibold ${grupo.available_seats === 0 ? 'text-red-700' : 'text-[#1B396A]'}`}>
                            <Users size={16} strokeWidth={2.5} />
                            <span>{grupo.available_seats === 0 ? 'Grupo Lleno' : 'Disponibilidad'}</span>
                        </div>
                        <div className={`bg-white px-3 py-1 rounded-lg shadow-sm border flex items-center justify-center ${grupo.available_seats === 0 ? 'border-red-200' : 'border-blue-100'}`}>
                            <span className={`text-base font-black ${grupo.available_seats === 0 ? 'text-red-600' : 'text-[#1B396A]'}`}>
                                {grupo.enrolled_count ?? "0"} <span className="text-sm font-semibold opacity-70 mb-0.5">/ {grupo.capacity ?? "0"}</span>
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
                            href={route('groups.show', grupo.id)}
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
});

export default CardGroup;

