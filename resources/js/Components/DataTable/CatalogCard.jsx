import React, { memo } from "react";
import { Users, ExternalLink } from "lucide-react";
import { Link } from "@inertiajs/react";

/**
 * CatalogCard — Tarjeta base reutilizable para catálogos de recursos (Grupos y Exámenes).
 *
 * Implementa el Principio Abierto/Cerrado (OCP) mediante el patrón de composición:
 * la sección de detalles variable del cuerpo se inyecta vía `children`,
 * permitiendo extensión sin modificar este componente.
 *
 * Estructura fija de la tarjeta:
 * ┌─────────────────────────────────┐
 * │  Barra de acento institucional  │
 * ├─────────────────────────────────┤
 * │  Cabecera: [checkbox] [cat] [badge] │
 * │  Título principal               │
 * │  ── separator ──                │
 * │  {children} ← detalles vars.   │
 * │  Widget de Cupo                 │
 * │  ── separator ──                │
 * │  Botones de acción              │
 * └─────────────────────────────────┘
 *
 * @param {Object}   props
 * @param {boolean}  [props.seleccionado=false]   - Estado del checkbox de selección múltiple.
 * @param {Function} [props.onToggleSelect]        - Callback al cambiar el checkbox.
 * @param {{ etiqueta: string, cls: string }} props.badge - Badge de estado resuelto por `resolverEstado`.
 * @param {string}   props.categoryLabel           - Etiqueta de categoría (nivel, tipo de examen, etc.).
 * @param {string}   props.title                   - Nombre/título principal de la entidad.
 * @param {React.ReactNode} props.children         - Filas de detalle específicas de cada dominio (OCP).
 * @param {number|string} [props.enrolledCount]   - Alumnos inscritos actualmente.
 * @param {number|string} [props.capacity]        - Capacidad total.
 * @param {boolean}  [props.isLleno=false]        - Indica cupo lleno (activa tema de color rojo).
 * @param {Function} props.onVerDetalles           - Abre el modal de detalles.
 * @param {Function} [props.onInscribir]           - Acción de inscripción (solo estudiantes).
 * @param {Function} [props.onEditar]              - Acción de edición (solo admin/coord).
 * @param {string}   [props.openHref]             - URL Inertia para el botón "Ver [entidad]".
 * @param {string}   [props.openLabel="Ver"]      - Etiqueta del botón de apertura.
 * @param {boolean}  [props.esEstudiante=false]   - Determina visibilidad del botón Inscribirse.
 * @param {boolean}  [props.esAdminOCoord=false]  - Determina visibilidad del checkbox y botón Editar.
 * @param {boolean}  [props.esStaff=false]        - Determina visibilidad del botón Abrir.
 */
const CatalogCard = memo(
    ({
        seleccionado = false,
        onToggleSelect,
        badge,
        categoryLabel,
        categoryTitle,
        title,
        children,
        enrolledCount,
        capacity,
        isLleno = false,
        onVerDetalles,
        onInscribir,
        onEditar,
        openHref,
        openLabel = "Ver",
        esEstudiante = false,
        esAdminOCoord = false,
        esStaff = false,
    }) => {
        // Tema del widget de cupo basado en disponibilidad
        const cupoTema = isLleno
            ? {
                  contenedor: "bg-red-50/60 border-red-100",
                  icono: "text-red-700",
                  insignia: "border-red-200",
                  numero: "text-red-600",
                  etiqueta: "Grupo Lleno",
              }
            : {
                  contenedor: "bg-blue-50/60 border-blue-100",
                  icono: "text-[#1B396A]",
                  insignia: "border-blue-100",
                  numero: "text-[#1B396A]",
                  etiqueta: "Cupo",
              };

        return (
            <div className="w-full bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-[#1B396A] h-full flex flex-col">
                {/* Barra de acento institucional */}
                <div className="h-2 bg-gradient-to-r from-[#1B396A] to-[#142952]" />

                {/* Cabecera: checkbox de selección + categoría + badge de estado */}
                <div className="px-6 pt-4 flex items-center justify-between gap-3 overflow-hidden">
                    <div className="flex items-center gap-2 flex-grow min-w-0">
                        {esAdminOCoord && onToggleSelect && (
                            <div className="flex items-center h-5 shrink-0">
                                <input
                                    type="checkbox"
                                    checked={seleccionado}
                                    onChange={onToggleSelect}
                                    className="w-5 h-5 text-[#1B396A] bg-gray-50 border-gray-300 rounded focus:ring-[#1B396A] focus:ring-2 cursor-pointer transition-all hover:scale-110 shadow-sm"
                                />
                            </div>
                        )}
                        <span 
                            className="text-sm font-extrabold tracking-wide text-[#1B396A] uppercase truncate mt-0.5 cursor-help"
                            title={categoryTitle || categoryLabel}
                        >
                            {categoryLabel}
                        </span>
                    </div>

                    {badge && (
                        <span
                            className={`text-xs font-semibold px-3 py-1 rounded-full text-center shadow-sm shrink-0 whitespace-nowrap ${badge.cls}`}
                        >
                            {badge.etiqueta}
                        </span>
                    )}
                </div>

                {/* Cuerpo de la tarjeta */}
                <div className="px-6 pb-6 flex flex-col flex-grow gap-4">
                    {/* Nombre / título principal de la entidad */}
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-gray-900 leading-tight">{title}</h3>
                    </div>

                    <div className="border-t border-gray-200" />

                    {/* Sección de detalles variables — inyectada por composición (OCP) */}
                    <div className="space-y-3 text-sm flex-grow">
                        {children}

                        {/* Widget de cupo / disponibilidad */}
                        <div
                            className={`flex justify-between items-center mt-3 p-2.5 rounded-xl border shadow-sm ${cupoTema.contenedor}`}
                        >
                            <div className={`flex items-center gap-2 font-semibold ${cupoTema.icono}`}>
                                <Users size={16} strokeWidth={2.5} />
                                <span>{cupoTema.etiqueta}</span>
                            </div>
                            <div
                                className={`bg-white px-3 py-1 rounded-lg shadow-sm border flex items-center justify-center ${cupoTema.insignia}`}
                            >
                                <span className={`text-base font-black ${cupoTema.numero}`}>
                                    {enrolledCount ?? "0"}{" "}
                                    <span className="text-sm font-semibold opacity-70">
                                        / {capacity ?? "—"}
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-200" />

                    {/* Botones de acción — renderizados condicionalmente por rol */}
                    <div className="mt-auto flex flex-col gap-2">
                        {/* Inscribirse: solo estudiantes */}
                        {esEstudiante && onInscribir && (
                            <button
                                onClick={onInscribir}
                                className="w-full py-3 bg-[#1B396A] text-white font-semibold rounded-lg hover:bg-[#142952] active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                Inscribirse
                            </button>
                        )}

                        {/* Editar: solo administradores y coordinadores */}
                        {esAdminOCoord && onEditar && (
                            <button
                                onClick={onEditar}
                                className="w-full py-3 bg-[#1B396A] text-white font-semibold rounded-lg hover:bg-[#142952] active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                Editar
                            </button>
                        )}

                        {/* Abrir [entidad]: staff con acceso a la vista de gestión interna */}
                        {esStaff && openHref && (
                            <Link
                                href={openHref}
                                className="w-full py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                            >
                                <ExternalLink size={15} strokeWidth={2.5} />
                                {openLabel}
                            </Link>
                        )}

                        {/* Ver Detalles: accesible para todos los roles */}
                        {onVerDetalles && (
                            <button
                                onClick={onVerDetalles}
                                className="w-full py-2.5 border-2 border-[#1B396A] text-[#1B396A] font-semibold rounded-lg hover:bg-[#1B396A] hover:text-white active:scale-95 transition-all duration-200"
                            >
                                Ver Detalles
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    },
);

CatalogCard.displayName = "CatalogCard";
export default CatalogCard;
