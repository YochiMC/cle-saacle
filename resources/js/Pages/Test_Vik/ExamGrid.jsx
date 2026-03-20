import React, { memo } from "react";
import { UsersRound } from "lucide-react";
import CardExam from "./CardExam";
import GridPagination from "@/Components/DataTable/GridPagination";

const ExamGrid = memo(({
    examenesPaginados,
    hayFiltros,
    paginaActual,
    totalPaginas,
    onPageChange,
    onVerDetalles,
    onInscribir,
    onEditar,
    examenesSeleccionados = [],
    onToggleSelect,
}) => {
    if (examenesPaginados.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="mb-6 flex items-center justify-center w-24 h-24 rounded-full bg-blue-50 border border-blue-100">
                    <UsersRound
                        size={48}
                        className="text-[#1B396A] opacity-70"
                        strokeWidth={1.5}
                    />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                    {hayFiltros ? "No hay resultados" : "Sin exámenes registrados"}
                </h3>
                <p className="text-gray-400 max-w-sm">
                    {hayFiltros
                        ? "No encontramos ningún examen que coincida con los filtros seleccionados."
                        : "Aún no hay exámenes registrados en el sistema."}
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                {examenesPaginados.map((examen) => (
                    <CardExam
                        key={examen.id}
                        examen={examen}
                        seleccionado={examenesSeleccionados.includes(examen.id)}
                        onToggleSelect={onToggleSelect}
                        onVerDetalles={onVerDetalles}
                        onInscribir={onInscribir}
                        onEditar={onEditar}
                    />
                ))}
            </div>

            {totalPaginas > 1 && (
                <GridPagination
                    paginaActual={paginaActual}
                    totalPaginas={totalPaginas}
                    onPageChange={onPageChange}
                />
            )}
        </>
    );
});

export default ExamGrid;
