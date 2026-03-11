import React, { useState, useMemo } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { UsersRound } from "lucide-react";
import CardGroup from "@/Components/Charts/CardGroup";
import GroupDetailsModal from "@/Components/Charts/GroupDetailsModal";
import GridToolbar from "@/Components/DataTable/GridToolbar";
import GridPagination from "@/Components/DataTable/GridPagination";

const ITEMS_POR_PAGINA = 12;

export default function Groups({ auth, grupos = [] }) {
    // ── Estado ──────────────────────────────────────────────────────────────
    const [busqueda, setBusqueda] = useState("");
    const [paginaActual, setPaginaActual] = useState(1);
    const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);

    // ── Misión 1 & 2: Buscador multi-campo ──────────────────────────────────
    // Busca simultáneamente en: nombre del grupo, nombre completo del docente
    // (full_name del accessor de Laravel) y nivel TECNM.
    const gruposFiltrados = useMemo(() => {
        setPaginaActual(1);
        const q = busqueda.toLowerCase();
        return grupos.filter((g) => {
            const nombre = (g.name || "").toLowerCase();
            const maestro = (g.teacher?.full_name || "").toLowerCase();
            const nivel = (
                g.level?.level_tecnm ||
                g.level?.name ||
                ""
            ).toLowerCase();
            return (
                nombre.includes(q) || maestro.includes(q) || nivel.includes(q)
            );
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

    // Mock visual — la lógica real será implementada por otro equipo en un sprint futuro.
    const handleInscripcion = (_grupoId) => {
        alert("Inscripción en construcción.");
    };

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
                    {/* ── TOOLBAR ─────────────────────────────────────────── */}
                    {grupos.length > 0 && (
                        <GridToolbar
                            busqueda={busqueda}
                            setBusqueda={setBusqueda}
                            placeholder="Buscar por grupo, docente o nivel..."
                            totalFiltrados={gruposFiltrados.length}
                            labelItem="grupos"
                        />
                    )}

                    {/* ── GRID ────────────────────────────────────────────── */}
                    {gruposFiltrados.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                                {gruposPaginados.map((grupo) => (
                                    <CardGroup
                                        key={grupo.id}
                                        grupo={grupo}
                                        auth={auth}
                                        onVerDetalles={setGrupoSeleccionado}
                                        onInscribir={handleInscripcion}
                                    />
                                ))}
                            </div>

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

            {/* ── MODAL — montado al fondo del árbol para evitar z-index issues */}
            <GroupDetailsModal
                grupo={grupoSeleccionado}
                onClose={() => setGrupoSeleccionado(null)}
            />
        </AuthenticatedLayout>
    );
}
