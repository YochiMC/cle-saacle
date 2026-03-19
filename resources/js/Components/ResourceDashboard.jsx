import { useState } from 'react';
import { Head } from '@inertiajs/react';

import { DataTable } from '@/Components/DataTable/DataTable';
import DashboardHeader from '@/Components/DashboardHeader';
import { useDynamicColumns } from '@/Hooks/useDynamicColumns';
import { useBulkActions } from '@/Hooks/useBulkActions';

const EMPTY_DATA = [];

/**
 * ResourceDashboard — Super-componente de gestión de datos.
 *
 * @param {string}   title           - Título principal (ej: "Carreras").
 * @param {object}   dataMap         - Datos por vista: { carreras: [], alumnos: [] }
 * @param {Array}    viewOptions     - [{ value, label }] para el selector de vistas.
 * @param {string}   deleteRoute     - Ruta POST para eliminación masiva.
 * @param {object}   hiddenColumns   - Columnas ocultas por defecto.
 * @param {Function} onEditRow       - Callback opcional al pulsar Editar: (item) => void.
 * @param {string[]} editableColumns - Keys de columnas que se vuelven <input> en Modo Docente.
 */
export default function ResourceDashboard({
    title,
    dataMap = {},
    viewOptions = [],
    deleteRoute,
    hiddenColumns = { created_at: false, updated_at: false },
    onEditRow,
    onDeleteRow,
    onPrint,
    onNew,
    onViewChange,
    editableColumns = [],
    restrictedColumns = [],
}) {
    const firstView = viewOptions[0]?.value ?? '';
    const [vistaActual, setVistaActual] = useState(firstView);

    // ── Feature Toggle: Modo Admin / Modo Docente ──────────────────────────
    // El estado vive aquí (DIP: los hijos dependen de la abstracción isTeacherMode,
    // no de un sistema de roles real que aún no existe).
    const [isTeacherMode, setIsTeacherMode] = useState(false);
    const handleToggleMode = () => setIsTeacherMode((prev) => !prev);

    const currentData = dataMap[vistaActual] || EMPTY_DATA;
    const currentViewLabel = viewOptions.find((o) => o.value === vistaActual)?.label ?? title;

    // Generación reactiva de columnas — reacciona también al modo, columnas editables y restringidas
    const columns = useDynamicColumns(currentData, onEditRow, onDeleteRow, { isTeacherMode, editableColumns, restrictedColumns });

    // Estado y handlers de acciones masivas
    const {
        filasSeleccionadas,
        handleSelectionChange,
        handleBulkCopy,
        handleBulkDelete,
        resetSelection,
    } = useBulkActions(deleteRoute, vistaActual);

    const handleViewChange = (newView) => {
        setVistaActual(newView);
        resetSelection();

        if (onViewChange) {
            onViewChange(newView);
        }
    };



    return (
        <div className="min-h-screen py-12 bg-gray-100">
            <Head title={currentViewLabel} />

            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                <DashboardHeader
                    title={title}
                    currentViewLabel={currentViewLabel}
                    viewOptions={viewOptions}
                    vistaActual={vistaActual}
                    onViewChange={handleViewChange}
                    selectionCount={filasSeleccionadas.length}
                    onBulkCopy={handleBulkCopy}
                    onBulkDelete={handleBulkDelete}
                    isTeacherMode={isTeacherMode}
                    onToggleMode={handleToggleMode}
                />

                <div className="p-6 overflow-hidden bg-white rounded-sm shadow-sm">
                    {currentData.length > 0 ? (
                        <DataTable
                            columns={columns}
                            data={currentData}
                            hiddenColumns={hiddenColumns}
                            onSelectionChange={handleSelectionChange}
                            searchPlaceholder={`Buscar en ${currentViewLabel.toLowerCase()}...`}
                            onPrint={onPrint}
                            onNew={onNew}
                            isTeacherMode={isTeacherMode}
                        />
                    ) : (
                        <div className="py-10 text-center text-slate-500">
                            No hay registros almacenados en {currentViewLabel.toLowerCase()}.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

