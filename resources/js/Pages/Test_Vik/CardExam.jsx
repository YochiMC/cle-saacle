import React, { memo } from "react";
import { Users } from "lucide-react";
import { usePermission } from "@/Utils/auth";

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
                label: status ?? "Disponible",
                cls: "bg-blue-100 text-blue-800",
            };
    }
};

const CardExam = memo(({ examen, seleccionado = false, onToggleSelect, onVerDetalles, onInscribir, onEditar }) => {
    const badge = getStatusBadge(examen?.status || "active");

    const { hasRole } = usePermission();
    const esEstudiante = hasRole("student");
    const esAdminOCoord = hasRole("admin") || hasRole("coordinator");

    const nombreExamen = examen.nombre_examen ?? `Examen #${examen.id}`;
    const fechaAplicacion = examen.fecha_aplicacion ?? "Fecha no asignada";
    const infoEstudiante = examen.student ? `${examen.student.name} ${examen.student.last_name || ''}` : `ID Alumno: ${examen.student_id || 'N/A'}`;
    const calificacionDisplay = examen.calificacion !== null ? `Calificación: ${examen.calificacion}` : "Sin calificar";

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
                                onChange={() => onToggleSelect(examen.id)}
                                className="w-5 h-5 text-[#1B396A] bg-gray-50 border-gray-300 rounded focus:ring-[#1B396A] focus:ring-2 cursor-pointer transition-all hover:scale-110 shadow-sm"
                            />
                        </div>
                    </div>
                ) : (
                    <div />
                )}
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badge.cls}`}>
                    {badge.label}
                </span>
            </div>

            <div className="px-6 pb-6 flex flex-col flex-grow gap-4">
                <div className="text-center space-y-1">
                    <span className="inline-block bg-[#1B396A] text-white text-xs font-bold px-3 py-0.5 rounded-full tracking-wide">
                        {calificacionDisplay}
                    </span>

                    <h3 className="text-xl font-bold text-gray-900 leading-tight">
                        {nombreExamen}
                    </h3>

                    <p className="text-sm font-semibold text-[#1B396A]">
                        {infoEstudiante}
                    </p>
                </div>

                <div className="border-t border-gray-200" />

                <div className="space-y-3 text-sm flex-grow">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Fecha:</span>
                        <span className="text-gray-900 font-semibold">{fechaAplicacion}</span>
                    </div>
                    
                    {/* Elementos simulados para parecerse al diseño de grupos */}
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Modalidad:</span>
                        <span className="text-[#1B396A] font-bold bg-blue-50 px-3 py-1 rounded-full text-xs">
                            Presencial (Simulado)
                        </span>
                    </div>

                    <div className={`flex justify-between items-center mt-3 p-2.5 rounded-xl border shadow-sm bg-blue-50/60 border-blue-100`}>
                        <div className={`flex items-center gap-2 font-semibold text-[#1B396A]`}>
                            <Users size={16} strokeWidth={2.5} />
                            <span>Disponibilidad</span>
                        </div>
                        <div className={`bg-white px-3 py-1 rounded-lg shadow-sm border flex items-center justify-center border-blue-100`}>
                            <span className={`text-base font-black text-[#1B396A]`}>
                                -- <span className="text-sm font-semibold opacity-70 mb-0.5">/ Ilimitado</span>
                            </span>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200" />

                <div className="mt-auto flex flex-col gap-2">
                    {/* Botón Inscribirse simulado igual que grupos */}
                    {esEstudiante && (
                        <button
                            onClick={() => onInscribir ? onInscribir(examen.id) : alert("Inscripción no disponible")}
                            className="w-full py-3 bg-[#1B396A] text-white font-semibold rounded-lg hover:bg-[#142952] active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            Inscribirse
                        </button>
                    )}

                    {esAdminOCoord && (
                        <button
                            onClick={() => onEditar ? onEditar(examen) : null}
                            className="w-full py-3 bg-[#1B396A] text-white font-semibold rounded-lg hover:bg-[#142952] active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            Editar
                        </button>
                    )}

                    <button
                        onClick={() => onVerDetalles ? onVerDetalles(examen) : null}
                        className="w-full py-2.5 border-2 border-[#1B396A] text-[#1B396A] font-semibold rounded-lg hover:bg-[#1B396A] hover:text-white active:scale-95 transition-all duration-200"
                    >
                        Ver Detalles
                    </button>
                </div>
            </div>
        </div>
    );
});

export default CardExam;
