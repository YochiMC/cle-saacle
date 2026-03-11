import React, { useState, useMemo } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { UsersRound } from "lucide-react";
import CardGroup from "@/Components/Charts/CardGroup";
import GridToolbar from "@/Components/DataTable/GridToolbar";
import GridPagination from "@/Components/DataTable/GridPagination";

const ITEMS_POR_PAGINA = 10;

export default function Groups({ auth, grupos = [], levels }) {
    // ── Estado ──────────────────────────────────────────────────────────────
    const [busqueda, setBusqueda] = useState("");
    const [paginaActual, setPaginaActual] = useState(1);

    // ── Filtrado (memoizado por nombre de grupo O nombre del maestro) ────────
    const gruposFiltrados = useMemo(() => {
        setPaginaActual(1);
        const q = busqueda.toLowerCase();
        return grupos.filter((grupo) => {
            const nombre = (grupo.name || "").toLowerCase();
            const maestro = (grupo.teacher?.name || "").toLowerCase();
            return nombre.includes(q) || maestro.includes(q);
        });
    }, [grupos, busqueda]);

    // ── Paginación ───────────────────────────────────────────────────────────
    const totalPaginas = Math.max(
        1,
        Math.ceil(gruposFiltrados.length / ITEMS_POR_PAGINA),
    );

    const gruposPaginados = gruposFiltrados.slice(
        (paginaActual - 1) * ITEMS_POR_PAGINA,
        paginaActual * ITEMS_POR_PAGINA,
    );

    return (
        <AuthenticatedLayout
            user={auth?.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Catálogo de Grupos
                </h2>
            }
        >
            <Head title="Catálogo de Grupos" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* ── TOOLBAR (solo si hay datos cargados) ────────────── */}
                    {grupos.length > 0 && (
                        <GridToolbar
                            busqueda={busqueda}
                            setBusqueda={setBusqueda}
                            placeholder="Buscar por grupo o maestro..."
                            totalFiltrados={gruposFiltrados.length}
                            labelItem="grupos"
                        />
                    )}

                    {/* ── GRID ────────────────────────────────────────────── */}
                    {gruposFiltrados.length > 0 ? (
                        <>
                            {/*
                             * items-stretch hace que todas las celdas del grid
                             * tengan la misma altura, y CardGroup usa h-full
                             * para estirarse hasta ocuparla por completo.
                             */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                                {gruposPaginados.map((grupo) => (
                                    <CardGroup
                                        key={grupo.id}
                                        // ── Mapeo de datos reales ──────────
                                        title={grupo.name ?? `Grupo #${grupo.id}`}
                                        instructor={grupo.teacher?.name ?? "Maestro no asignado"}
                                        Id_Grupo={grupo.id}
                                        Periodo={grupo.period?.name ?? "—"}
                                        Horario={grupo.schedule ?? "Por definir"}
                                        Modalidad={grupo.mode ?? "Presencial"}
                                    />
                                ))}
                            </div>

                            {/* ── PAGINACIÓN ──────────────────────────────── */}
                            {totalPaginas > 1 && (
                                <GridPagination
                                    paginaActual={paginaActual}
                                    totalPaginas={totalPaginas}
                                    onPageChange={setPaginaActual}
                                />
                            )}
                        </>
                    ) : (
                        /* ── EMPTY STATE ──────────────────────────────────── */
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="mb-6 flex items-center justify-center w-24 h-24 rounded-full bg-blue-50 border border-blue-100">
                                <UsersRound
                                    size={48}
                                    className="text-[#1B396A] opacity-70"
                                    strokeWidth={1.5}
                                />
                            </div>
                            <h3 className="text-xl font-bold text-gray-700 mb-2">
                                {busqueda
                                    ? "No hay resultados"
                                    : "Sin grupos registrados"}
                            </h3>
                            <p className="text-gray-400 max-w-sm">
                                {busqueda
                                    ? `No encontramos ningún grupo que coincida con "${busqueda}".`
                                    : "Aún no hay grupos registrados en el sistema."}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
