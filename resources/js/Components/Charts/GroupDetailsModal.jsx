import React from "react";
import { X, ExternalLink } from "lucide-react";

// ── Sub-componentes ───────────────────────────────────────────────────────────

/** Badge de color según el status del grupo. */
const StatusBadge = ({ status, status_label }) => {
    const map = {
        active: { label: "Activo", cls: "bg-green-100 text-green-800" },
        pending: { label: "En espera", cls: "bg-yellow-100 text-yellow-800" },
        waiting: { label: "En espera", cls: "bg-yellow-100 text-yellow-800" },
        closed: { label: "Cerrado", cls: "bg-red-100 text-red-800" },
        inactive: { label: "Cerrado", cls: "bg-red-100 text-red-800" },
    };
    const { label, cls } = map[status?.toLowerCase()] ?? {
        label: status ?? "Sin estado",
        cls: "bg-gray-100 text-gray-500",
    };
    return (
        <span
            className={`inline-block text-sm font-semibold px-3 py-1 rounded-full ${cls}`}
        >
            {status_label || label}
        </span>
    );
};

/**
 * Fila de detalle reutilizable.
 * Si `empty` es true, renderiza el fallback en gris itálica.
 */
const DetailRow = ({ label, children, fallback, empty = false }) => (
    <div className="flex flex-col gap-0.5">
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
            {label}
        </span>
        {empty ? (
            <span className="text-sm italic text-gray-400">{fallback}</span>
        ) : (
            <span className="text-sm text-gray-900 font-semibold">
                {children}
            </span>
        )}
    </div>
);

// ── Componente principal ──────────────────────────────────────────────────────

/**
 * @component GroupDetailsModal
 *
 * Modal de detalles completos de un grupo académico.
 * Apegado estrictamente al esquema `groups` y sus relaciones:
 *  - teacher_name (aplanado desde teacher->full_name por GroupResource)
 *  - level.level_tecnm, level.level_mcer, level.hours (LevelResource)
 *  - period.name
 *  - Campos directos: name, type, capacity, schedule, mode, status, classroom, meeting_link
 *
 * Cierre: botón X, botón "Cerrar", o clic en el overlay.
 *
 * @param {object|null} grupo   - Grupo seleccionado (null = modal oculto).
 * @param {Function}    onClose - Callback para cerrar.
 */
const GroupDetailsModal = ({ grupo, onClose }) => {
    if (!grupo) return null;

    const isOnline = ["online", "en línea", "virtual", "en linea"].includes(
        grupo.mode?.toLowerCase() ?? "",
    );

    // Docente: aplanado por GroupResource como teacher_name. null si fue ocultado.
    const nombreDocente = grupo.teacher_name ?? null;

    return (
        /* ── OVERLAY ────────────────────────────────────────────────────────── */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
        >
            {/* ── PANEL ─────────────────────────────────────────────────────── */}
            <div
                className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Franja institucional */}
                <div className="h-2 bg-gradient-to-r from-[#1B396A] to-[#142952] shrink-0" />

                {/* ── ENCABEZADO ───────────────────────────────────────────── */}
                <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-start justify-between gap-4 shrink-0">
                    <div className="space-y-0.5">
                        {/* Badge level_tecnm */}
                        {grupo.level?.level_tecnm && (
                            <span className="inline-block mb-1 bg-[#1B396A] text-white text-xs font-bold px-3 py-0.5 rounded-full">
                                {grupo.level?.level_tecnm}
                            </span>
                        )}
                        {/* Nombre del grupo */}
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">
                            {grupo.name ?? `Grupo #${grupo.id}`}
                        </h2>
                        {/* Docente: full_name o fallback */}
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

                    {/* Botón cerrar */}
                    <button
                        onClick={onClose}
                        className="shrink-0 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        aria-label="Cerrar modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* ── CUERPO — scrollable, grid de 2 columnas ──────────────── */}
                <div className="px-6 py-5 overflow-y-auto flex-grow grid grid-cols-2 gap-x-8 gap-y-5">
                    {/* Estado (badge con color) */}
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                            Estado
                        </span>
                        <StatusBadge status={grupo.status} status_label={grupo.status_label} />
                    </div>

                    {/* Tipo de curso */}
                    <DetailRow label="Tipo de curso">{grupo.type}</DetailRow>

                    {/* Cupo */}
                    <DetailRow label="Cupo">{grupo.capacity} alumnos</DetailRow>

                    {/* Período — aplanado por GroupResource como period_name */}
                    <DetailRow
                        label="Período"
                        empty={!grupo.period_name}
                        fallback="Sin período asignado"
                    >
                        {grupo.period_name}
                    </DetailRow>

                    {/* Nivel TECNM */}
                    <DetailRow
                        label="Nivel (TECNM)"
                        empty={!grupo.level?.level_tecnm}
                        fallback="Sin nivel asignado"
                    >
                        {grupo.level?.level_tecnm}
                    </DetailRow>

                    {/* Nivel MCER */}
                    <DetailRow
                        label="Nivel (MCER)"
                        empty={!grupo.level?.level_mcer}
                        fallback="—"
                    >
                        {grupo.level?.level_mcer}
                    </DetailRow>

                    {/* Horas */}
                    <DetailRow
                        label="Horas del nivel"
                        empty={!grupo.level?.hours}
                        fallback="—"
                    >
                        {grupo.level?.hours} hrs
                    </DetailRow>

                    {/* Horario */}
                    <DetailRow label="Horario">{grupo.schedule}</DetailRow>

                    {/* Modalidad — ocupa columna completa */}
                    <div className="col-span-2">
                        <DetailRow label="Modalidad">
                            <span className="inline-block text-[#1B396A] font-bold bg-blue-50 px-3 py-1 rounded-full text-xs">
                                {grupo.mode}
                            </span>
                        </DetailRow>
                    </div>

                    {/* ── SEDE / UBICACIÓN — ocupa columna completa */}
                    <div className="col-span-2 flex flex-col gap-3">
                        {grupo.classroom && (
                            <DetailRow label="Aula">
                                {grupo.classroom}
                            </DetailRow>
                        )}

                        {grupo.meeting_link && (
                            <DetailRow label="Enlace de clase">
                                <a
                                    href={grupo.meeting_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1B396A] underline underline-offset-2 hover:text-[#142952] transition-colors"
                                >
                                    <ExternalLink size={14} />
                                    Enlace de clase
                                </a>
                            </DetailRow>
                        )}

                        {(!grupo.classroom && !grupo.meeting_link) && (
                            <DetailRow 
                                label="Sede / Ubicación" 
                                empty={true} 
                                fallback="Sede por asignar" 
                            />
                        )}
                    </div>
                </div>

                {/* ── PIE ──────────────────────────────────────────────────── */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end shrink-0">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-[#1B396A] text-white text-sm font-semibold rounded-lg hover:bg-[#142952] active:scale-95 transition-all duration-200 shadow-sm"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GroupDetailsModal;
