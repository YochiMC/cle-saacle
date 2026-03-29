import React, { memo } from "react";
import { Users, ExternalLink } from "lucide-react";
import { Link } from "@inertiajs/react";
import { usePermission } from "@/Utils/auth";

/** Mapa de estados con etiquetas en español y clases de color. */
const STATUS_MAP = {
    enrolling:  { label: "Inscripciones Abiertas", cls: "bg-blue-100 text-blue-800" },
    active:     { label: "Activo",                  cls: "bg-green-100 text-green-800" },
    pending:    { label: "En Espera",               cls: "bg-yellow-100 text-yellow-800" },
    grading:    { label: "En Evaluación",           cls: "bg-purple-100 text-purple-800" },
    completed:  { label: "Completado",              cls: "bg-gray-100 text-gray-800" },
};

const getStatusBadge = (examen) => {
    const key = (examen?.status?.value ?? examen?.status ?? "").toLowerCase();
    return STATUS_MAP[key] ?? { label: key || "Sin estado", cls: "bg-gray-100 text-gray-500" };
};

/**
 * Genera la clave visible del examen.
 * Formato: {TipoAbreviado}-{Mes3Letras}{Año2Dígitos}
 * Ejemplo: "4HAB-Mar26", "UBI-Mar26", "CONV-Mar26"
 */
const generarClave = (examen) => {
    const tipo = examen.exam_type?.value ?? examen.exam_type ?? "";
    const fecha = examen.application_date ?? "";

    // Abreviatura del tipo
    const abrevTipo = {
        "Convalidación":    "CONV",
        "Planes anteriores":"PLAN",
        "4 habilidades":    "4HAB",
        "Ubicación":        "UBI",
    }[tipo] ?? tipo.substring(0, 4).toUpperCase();

    if (!fecha) return `${abrevTipo}-???`;

    // Parsear fecha "YYYY-MM-DD"
    const [year, month] = fecha.split("-");
    const meses = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
    const mesStr = meses[parseInt(month, 10) - 1] ?? "???";
    const anioStr = (year ?? "").slice(-2);

    return `${abrevTipo}-${mesStr}${anioStr}`;
};

/**
 * Tarjeta visual de una sesión de examen.
 * Clon pixel-perfecto de CardGroup con datos del examen.
 */
const CardExam = memo(({
    examen,
    seleccionado = false,
    onToggleSelect,
    onVerDetalles,
    onInscribir,
    onEditar,
}) => {
    const badge = getStatusBadge(examen);

    const { hasRole } = usePermission();
    const esEstudiante  = hasRole("student");
    const esAdminOCoord = hasRole("admin") || hasRole("coordinator");
    const esStaff       = hasRole("admin") || hasRole("coordinator") || hasRole("teacher");

    // ── Mapeo de datos ──────────────────────────────────────────────────────────
    const tipoDisplay  = examen.exam_type?.value ?? examen.exam_type ?? null;
    const claveExamen  = generarClave(examen);
    const nombreDocente =
        examen.teacher_name ??
        examen.teacher?.full_name ??
        null;

    const fechaHora =
        [examen.application_date, examen.application_time]
            .filter(Boolean)
            .join("  ") || "Por definir";

    const aulaDisplay = examen.classroom || "Por asignar";

    // Fix de disponibilidad: calcular si no viene available_seats del backend
    const capacidad   = examen.capacity ?? 0;
    const inscritos   = examen.enrolled_count ?? 0;
    const disponibles = examen.available_seats ?? (capacidad - inscritos);
    const lleno       = capacidad > 0 && disponibles <= 0;

    return (
        <div className="w-full bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-[#1B396A] h-full flex flex-col">
            {/* Barra de acento superior */}
            <div className="h-2 bg-gradient-to-r from-[#1B396A] to-[#142952]" />

            {/* Cabecera: checkbox + badge */}
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

            {/* Cuerpo */}
            <div className="px-6 pb-6 flex flex-col flex-grow gap-4">

                {/* Identidad: tipo / clave / docente */}
                <div className="text-center space-y-1">
                    {/* Píldora tipo — equivale a "Nivel" en grupos */}
                    {tipoDisplay ? (
                        <span className="inline-block bg-[#1B396A] text-white text-xs font-bold px-3 py-0.5 rounded-full tracking-wide">
                            {tipoDisplay}
                        </span>
                    ) : (
                        <span className="inline-block bg-gray-200 text-gray-500 text-xs italic px-3 py-0.5 rounded-full">
                            Tipo no definido
                        </span>
                    )}

                    {/* Código generado como título principal — es el nombre del examen */}
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">
                        {claveExamen}
                    </h3>

                    {/* Docente */}
                    {nombreDocente ? (
                        <p className="text-sm font-semibold text-[#1B396A]">
                            {nombreDocente}
                        </p>
                    ) : (
                        <p className="text-sm italic text-gray-400">
                            Docente sin asignar
                        </p>
                    )}
                </div>

                <div className="border-t border-gray-200" />

                {/* Detalles */}
                <div className="space-y-3 text-sm flex-grow">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Fecha y Hora:</span>
                        <span className="text-gray-900 font-semibold">{fechaHora}</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Aula / Sede:</span>
                        <span className="text-[#1B396A] font-bold bg-blue-50 px-3 py-1 rounded-full text-xs">
                            {aulaDisplay}
                        </span>
                    </div>

                    {/* Caja de disponibilidad con lógica correcta */}
                    <div className={`flex justify-between items-center mt-3 p-2.5 rounded-xl border shadow-sm ${lleno ? "bg-red-50/60 border-red-100" : "bg-blue-50/60 border-blue-100"}`}>
                        <div className={`flex items-center gap-2 font-semibold ${lleno ? "text-red-700" : "text-[#1B396A]"}`}>
                            <Users size={16} strokeWidth={2.5} />
                            <span>{lleno ? "Examen Lleno" : "Disponibilidad"}</span>
                        </div>
                        <div className={`bg-white px-3 py-1 rounded-lg shadow-sm border flex items-center justify-center ${lleno ? "border-red-200" : "border-blue-100"}`}>
                            <span className={`text-base font-black ${lleno ? "text-red-600" : "text-[#1B396A]"}`}>
                                {inscritos}{" "}
                                <span className="text-sm font-semibold opacity-70 mb-0.5">
                                    / {capacidad}
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
                            href={route('exams.show', examen.id)}
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
});

export default CardExam;
