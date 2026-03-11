import React from "react";

// ── Helper: badge de estado ───────────────────────────────────────────────────
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

// ── Componente ────────────────────────────────────────────────────────────────

/**
 * @component CardGroup
 *
 * Tarjeta resumen de un grupo. Recibe el objeto `grupo` completo y acciones inyectadas.
 *
 * Principio SRP: solo renderiza, no ejecuta lógica de negocio.
 * Principio DIP: las acciones se inyectan (onVerDetalles, onInscribir).
 *
 * Campos clave:
 *  - Docente : grupo.teacher?.full_name  (accessor Teacher::fullName() → serializa como full_name)
 *  - Nivel   : grupo.level?.level_tecnm  (columna real en BD) con fallback a level.name
 */
const CardGroup = ({ grupo, auth, onVerDetalles, onInscribir }) => {
    const badge = getStatusBadge(grupo?.status);

    // Regla de negocio (Spatie): "Inscribirse" solo existe en el DOM para estudiantes.
    const esEstudiante = auth?.roles?.includes("student") ?? false;

    // Docente: accessor full_name. null si el backend lo ocultó por fecha/rol.
    const nombreDocente = grupo.teacher?.full_name ?? null;

    // Nivel: campo level_tecnm (columna real). Fallback a .name por si el esquema varía.
    const nivelDisplay =
        grupo.level?.level_tecnm || grupo.level?.level_mcer || null;

    return (
        <div className="w-full bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-[#1B396A] h-full flex flex-col">
            {/* ── FRANJA + BADGE DE ESTADO ─────────────────────────────── */}
            <div className="h-2 bg-gradient-to-r from-[#1B396A] to-[#142952]" />
            <div className="px-6 pt-4 flex justify-end">
                <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${badge.cls}`}
                >
                    {badge.label}
                </span>
            </div>

            {/* ── CUERPO ── flex-grow empuja los botones al fondo ───────── */}
            <div className="px-6 pb-6 flex flex-col flex-grow gap-4">
                {/* ── ENCABEZADO: Nivel + Nombre + Docente ─────────────── */}
                <div className="text-center space-y-1">
                    {/* Badge de nivel */}
                    {nivelDisplay ? (
                        <span className="inline-block bg-[#1B396A] text-white text-xs font-bold px-3 py-0.5 rounded-full tracking-wide">
                            {nivelDisplay}
                        </span>
                    ) : (
                        <span className="inline-block bg-gray-200 text-gray-500 text-xs italic px-3 py-0.5 rounded-full">
                            Nivel no definido
                        </span>
                    )}

                    {/* Nombre del grupo */}
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">
                        {grupo.name ?? `Grupo #${grupo.id}`}
                    </h3>

                    {/* Docente (full_name accessor) — "Docente por asignar" si es null */}
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

                {/* ── SEPARADOR ────────────────────────────────────────── */}
                <div className="border-t border-gray-200" />

                {/* ── DATOS CLAVE ───────────────────────────────────────── */}
                <div className="space-y-3 text-sm flex-grow">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">
                            Horario:
                        </span>
                        <span className="text-gray-900 font-semibold">
                            {grupo.schedule}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">
                            Modalidad:
                        </span>
                        <span className="text-[#1B396A] font-bold bg-blue-50 px-3 py-1 rounded-full text-xs">
                            {grupo.mode}
                        </span>
                    </div>
                </div>

                {/* ── SEPARADOR ────────────────────────────────────────── */}
                <div className="border-t border-gray-200" />

                {/* ── BOTONES ───────────────────────────────────────────── */}
                <div className="mt-auto flex flex-col gap-2">
                    {/* "Inscribirse" — SOLO para rol 'student' (Spatie) */}
                    {esEstudiante && (
                        <button
                            onClick={() => onInscribir(grupo.id)}
                            className="w-full py-3 bg-[#1B396A] text-white font-semibold rounded-lg hover:bg-[#142952] active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            Inscribirse
                        </button>
                    )}

                    {/* "Ver Detalles" — visible para TODOS los roles */}
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
};

export default CardGroup;
