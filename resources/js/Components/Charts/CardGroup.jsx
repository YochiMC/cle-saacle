import React, { memo } from "react";

const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
        case "active":
            return { label: "Activo", cls: "bg-green-100 text-green-800" };
        case "pending":
        case "waiting":
            return { label: "En espera", cls: "bg-yellow-100 text-yellow-800" };
        case "closed":
        case "inactive":
            return { label: "Cerrado", cls: "bg-red-100 text-red-800" };
        default:
            return {
                label: status ?? "Sin estado",
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
 * @param {Object} props.auth - Usuario autenticado y sus roles.
 * @param {function(Object): void} props.onVerDetalles - Callback para mostrar los detalles completos.
 * @param {function(string|number): void} props.onInscribir - Callback de acción primaria para estudiantes.
 * @param {function(Object): void} props.onEditar - Callback de acción primaria para personal del sistema.
 */
const CardGroup = memo(({ grupo, auth, onVerDetalles, onInscribir, onEditar }) => {
    const badge = getStatusBadge(grupo?.status);

    const roles = auth?.roles ?? [];
    const esEstudiante = roles.includes("student");
    const esAdminOCoord = roles.includes("admin") || roles.includes("coordinator");

    const nombreDocente = grupo.teacher_name ?? null;
    const nivelDisplay = grupo.level?.level_tecnm || null;

    return (
        <div className="w-full bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-[#1B396A] h-full flex flex-col">
            <div className="h-2 bg-gradient-to-r from-[#1B396A] to-[#142952]" />
            <div className="px-6 pt-4 flex justify-end">
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
                </div>

                <div className="border-t border-gray-200" />

                <div className="mt-auto flex flex-col gap-2">
                    {esEstudiante && (
                        <button
                            onClick={() => onInscribir(grupo.id)}
                            className="w-full py-3 bg-[#1B396A] text-white font-semibold rounded-lg hover:bg-[#142952] active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            Inscribirse
                        </button>
                    )}

                    {esAdminOCoord && (
                        <button
                            onClick={() => onEditar(grupo)}
                            className="w-full py-3 bg-[#1B396A] text-white font-semibold rounded-lg hover:bg-[#142952] active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            Editar
                        </button>
                    )}

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

