import React, { memo } from "react";
import { X, Calendar, Clock, Users } from "lucide-react";

/** Badge de estado con etiquetas 100% en español. */
const StatusBadge = ({ status }) => {
    const map = {
        enrolling:  { label: "Inscripciones Abiertas", cls: "bg-blue-100 text-blue-800" },
        active:     { label: "Activo",                  cls: "bg-green-100 text-green-800" },
        pending:    { label: "En Espera",               cls: "bg-yellow-100 text-yellow-800" },
        grading:    { label: "En Evaluación",           cls: "bg-purple-100 text-purple-800" },
        completed:  { label: "Completado",              cls: "bg-gray-100 text-gray-800" },
    };
    const key = (status?.value ?? status ?? "").toLowerCase();
    const { label, cls } = map[key] ?? { label: key || "Sin estado", cls: "bg-gray-100 text-gray-500" };
    return (
        <span className={`inline-block text-sm font-semibold px-3 py-1 rounded-full ${cls}`}>
            {label}
        </span>
    );
};

/**
 * Fila de detalle idéntica a GroupDetailsModal:
 * etiqueta en mayúsculas gris + valor en negrita.
 * Con `pill` muestra el valor dentro de una píldora azul.
 */
const DetailRow = ({ label, value, fallback, pill = false, children }) => {
    const content = children ?? value;
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                {label}
            </span>
            {content ? (
                pill ? (
                    <span className="inline-block w-fit text-[#1B396A] font-bold bg-blue-50 px-3 py-1 rounded-full text-sm">
                        {content}
                    </span>
                ) : (
                    <span className="text-sm text-gray-900 font-semibold">{content}</span>
                )
            ) : (
                <span className="text-sm italic text-gray-400">{fallback ?? "—"}</span>
            )}
        </div>
    );
};

/** Genera la clave legible: CONV-Mar26, 4HAB-Abr26, etc. */
const generarClave = (examen) => {
    const tipo  = examen.exam_type?.value ?? examen.exam_type ?? "";
    const fecha = examen.application_date ?? "";

    const abrevTipo = {
        "Convalidación":     "CONV",
        "Planes anteriores": "PLAN",
        "4 habilidades":     "4HAB",
        "Ubicación":         "UBI",
    }[tipo] ?? tipo.substring(0, 4).toUpperCase();

    if (!fecha) return `${abrevTipo}-???`;

    const [year, month] = fecha.split("-");
    const meses   = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
    const mesStr  = meses[parseInt(month, 10) - 1] ?? "???";
    const anioStr = (year ?? "").slice(-2);

    return `${abrevTipo}-${mesStr}${anioStr}`;
};

/**
 * Modal de detalles de un examen.
 * Diseño idéntico a GroupDetailsModal:
 *   - franja institucional azul
 *   - encabezado con badge-tipo + clave + nombre + docente + X
 *   - cuerpo en grid de 2 columnas
 *   - pie con botón Cerrar azul
 */
const ExamDetailsModal = memo(({ examen, onClose }) => {
    if (!examen) return null;

    const tipoDisplay   = examen.exam_type?.value ?? examen.exam_type ?? null;
    const claveExamen   = generarClave(examen);
    const nombreDocente = examen.teacher_name ?? examen.teacher?.full_name ?? null;
    const nombrePeriodo = examen.period_name  ?? examen.period?.name      ?? null;
    const capacidad     = examen.capacity     ?? 0;
    const inscritos     = examen.enrolled_count ?? 0;
    const disponibles   = examen.available_seats ?? (capacidad - inscritos);
    const lleno         = capacidad > 0 && disponibles <= 0;

    // Fecha y hora formateadas
    const fechaDisplay  = examen.application_date ?? null;
    const horaDisplay   = examen.application_time ?? null;
    const horarioDisplay =
        fechaDisplay && horaDisplay
            ? `${fechaDisplay}  ${horaDisplay}`
            : fechaDisplay ?? horaDisplay ?? null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── Franja azul institucional (igual que GroupDetailsModal) */}
                <div className="h-2 bg-gradient-to-r from-[#1B396A] to-[#142952] shrink-0" />

                {/* ── ENCABEZADO ─────────────────────────────────────────────── */}
                <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-start justify-between gap-4 shrink-0">
                    <div className="space-y-0.5">
                        {/* Badge tipo (≡ nivel en grupos) */}
                        {tipoDisplay && (
                            <span className="inline-block mb-1 bg-[#1B396A] text-white text-xs font-bold px-3 py-0.5 rounded-full">
                                {tipoDisplay}
                            </span>
                        )}
                        {/* Clave generada (≡ GRP-5282 en grupos) */}
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">
                            {claveExamen}
                        </h2>
                        {/* Docente (≡ Tracey Mante Spencer en grupos) */}
                        {nombreDocente ? (
                            <p className="text-sm font-semibold text-[#1B396A]">{nombreDocente}</p>
                        ) : (
                            <p className="text-sm italic text-gray-400">Docente sin asignar</p>
                        )}
                    </div>

                    <button
                        onClick={onClose}
                        className="shrink-0 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        aria-label="Cerrar modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* ── CUERPO — grid 2 columnas idéntico a GroupDetailsModal ──── */}
                <div className="px-6 py-5 overflow-y-auto flex-grow grid grid-cols-2 gap-x-8 gap-y-5">

                    {/* Estado */}
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Estado</span>
                        <StatusBadge status={examen.status} />
                    </div>

                    {/* Tipo de examen (≡ Tipo de curso en grupos) */}
                    <DetailRow
                        label="Tipo de examen"
                        value={tipoDisplay}
                        fallback="Sin definir"
                    />

                    {/* Cupo */}
                    <DetailRow
                        label="Cupo"
                        value={capacidad ? `${capacidad} lugares` : null}
                        fallback="Sin definir"
                    />

                    {/* Período */}
                    <DetailRow
                        label="Período"
                        value={nombrePeriodo}
                        fallback="Sin período asignado"
                    />

                    {/* Fecha de aplicación (≡ Horario en grupos) */}
                    <DetailRow
                        label="Fecha de aplicación"
                        value={fechaDisplay}
                        fallback="Por definir"
                    />

                    {/* Hora */}
                    <DetailRow
                        label="Hora"
                        value={horaDisplay}
                        fallback="Por definir"
                    />

                    {/* Aula (≡ Modalidad en grupos, con pill azul — col-span-2) */}
                    <div className="col-span-2">
                        <DetailRow
                            label="Aula / Sede"
                            value={examen.classroom}
                            fallback="Por asignar"
                            pill
                        />
                    </div>

                    {/* Disponibilidad — col-span-2, idéntica a GroupDetailsModal */}
                    <div className="col-span-2">
                        <div className={`flex justify-between items-center p-3 rounded-xl border shadow-sm ${lleno ? "bg-red-50/60 border-red-100" : "bg-blue-50/60 border-blue-100"}`}>
                            <div className={`flex items-center gap-2 font-semibold ${lleno ? "text-red-700" : "text-[#1B396A]"}`}>
                                <Users size={16} strokeWidth={2.5} />
                                <span>{lleno ? "Examen Lleno" : "Disponibilidad"}</span>
                            </div>
                            <div className={`bg-white px-3 py-1 rounded-lg shadow-sm border flex items-center justify-center ${lleno ? "border-red-200" : "border-blue-100"}`}>
                                <span className={`text-base font-black ${lleno ? "text-red-600" : "text-[#1B396A]"}`}>
                                    {inscritos}{" "}
                                    <span className="text-sm font-semibold opacity-70">/ {capacidad}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── PIE ────────────────────────────────────────────────────── */}
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
});

export default ExamDetailsModal;
