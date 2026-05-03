import React, { memo } from "react";

/**
 * Mapa unificado de estados del sistema (Grupos y Exámenes).
 * Fuente de verdad única para la presentación visual de estados — elimina
 * la triplicación que existía en CardGroup, ExamDetailsModal y GroupDetailsModal.
 */
const ESTADO_MAP = {
    enrolling: { etiqueta: "Inscripciones Abiertas", cls: "bg-blue-100 text-blue-800" },
    active:    { etiqueta: "Activo",                 cls: "bg-green-100 text-green-800" },
    pending:   { etiqueta: "En Espera",              cls: "bg-yellow-100 text-yellow-800" },
    waiting:   { etiqueta: "En Espera",              cls: "bg-yellow-100 text-yellow-800" },
    grading:   { etiqueta: "En Evaluación",          cls: "bg-purple-100 text-purple-800" },
    completed: { etiqueta: "Completado",             cls: "bg-gray-100 text-gray-800" },
    closed:    { etiqueta: "Cerrado",                cls: "bg-red-100 text-red-800" },
    inactive:  { etiqueta: "Cerrado",                cls: "bg-red-100 text-red-800" },
    
    // Acreditaciones
    in_review: { etiqueta: "En Revisión",            cls: "bg-orange-100 text-orange-800" },
    accredited:{ etiqueta: "Acreditado",             cls: "bg-emerald-100 text-emerald-800" },
    released:  { etiqueta: "Liberado",               cls: "bg-indigo-100 text-indigo-800" },
    suspended: { etiqueta: "Suspendido",             cls: "bg-red-100 text-red-800" },
};

/**
 * Normaliza el estado soportando strings planos y objetos Enum de Laravel.
 * @param {string|{value: string}} status
 * @returns {string}
 */
const normalizarClave = (status) =>
    (status?.value ?? status ?? "").toString().toLowerCase();

/**
 * Resuelve el badge de estado (etiqueta + clases CSS) dado un valor de estado.
 * Exportada para ser consumida por componentes que necesitan solo el objeto badge
 * (ej. CatalogCard, CardGroup, CardExam) sin montar el elemento.
 *
 * @param {string|{value: string}} status - Estado de la entidad.
 * @param {string} [etiquetaCustom] - Etiqueta alternativa (ej. `status_label` del backend).
 * @returns {{ etiqueta: string, cls: string }}
 */
export const resolverEstado = (status, etiquetaCustom) => {
    const clave = normalizarClave(status);
    const base = ESTADO_MAP[clave] ?? {
        etiqueta: clave || "Sin estado",
        cls: "bg-gray-100 text-gray-500",
    };
    return { etiqueta: etiquetaCustom || base.etiqueta, cls: base.cls };
};

/**
 * StatusBadge — Componente presentacional compartido para mostrar el estado
 * de cualquier entidad del sistema (Grupo o Examen).
 *
 * Soporta objetos Enum de Laravel (`.value`) y strings planos.
 * Optimizado con `React.memo` para evitar re-renders innecesarios.
 *
 * @param {Object} props
 * @param {string|{value: string}} props.status - Estado de la entidad.
 * @param {string} [props.etiquetaCustom] - Reemplaza la etiqueta por defecto (usa `status_label` del backend).
 */
const StatusBadge = memo(({ status, etiquetaCustom }) => {
    const { etiqueta, cls } = resolverEstado(status, etiquetaCustom);

    return (
        <span className={`inline-block text-sm font-semibold px-3 py-1 rounded-full ${cls}`}>
            {etiqueta}
        </span>
    );
});

StatusBadge.displayName = "StatusBadge";
export default StatusBadge;
