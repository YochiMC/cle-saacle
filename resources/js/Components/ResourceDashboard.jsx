import { useState } from "react";
import { Head } from "@inertiajs/react";

import { DataTable } from "@/Components/DataTable/DataTable";
import DashboardHeader from "@/Components/DashboardHeader";
import { useDynamicColumns } from "@/Hooks/useDynamicColumns";
import { useBulkActions } from "@/Hooks/useBulkActions";
import ConfirmModal from '@/Components/ConfirmModal';

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
 * @param {Function} onDeleteRow     - Callback opcional al pulsar Eliminar: (item) => void.
 * @param {number|null} editingRowId - ID de la fila actualmente en edición (para edición individual).
 * @param {Function} onSaveRow       - Callback opcional al guardar fila individual: (item) => void.
 * @param {Function} onCancelRow     - Callback opcional al cancelar edición individual: () => void.
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
    isTeacherMode = false,
    onCellChange,
    customActions,
    editingRowId = null,
    onSaveRow,
    onCancelRow,
}) {
    const firstView = viewOptions[0]?.value ?? "";
    const [vistaActual, setVistaActual] = useState(firstView);

    const currentData = dataMap[vistaActual] || EMPTY_DATA;
    const currentViewLabel =
        viewOptions.find((o) => o.value === vistaActual)?.label ?? title;

    // Generación reactiva de columnas — reacciona también al modo, columnas editables y restringidas
    const columns = useDynamicColumns(currentData, onEditRow, onDeleteRow, {
        isTeacherMode,
        editableColumns,
        restrictedColumns,
        onCellChange,
        editingRowId,
        onSaveRow,
        onCancelRow,
    });

    // Estado y handlers de acciones masivas
    const {
        filasSeleccionadas,
        handleSelectionChange,
        handleBulkCopy,
        handleBulkDelete,
        resetSelection,
        isConfirmingBulkDelete, 
        setIsConfirmingBulkDelete, 
        executeBulkDelete 
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
                    customActions={customActions}
                />

                <div className="p-6 overflow-hidden bg-white rounded-sm shadow-sm">
                    {currentData.length > 0 ? (
                        <DataTable
                            key={`table-${vistaActual}-${currentData.length}`}
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
                            No hay registros almacenados en{" "}
                            {currentViewLabel.toLowerCase()}.
                        </div>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={isConfirmingBulkDelete}
                onClose={() => setIsConfirmingBulkDelete(false)}
                onConfirm={executeBulkDelete}
                title="Baja Masiva"
                message={`¿Estás seguro de que deseas dar de baja a los ${filasSeleccionadas.length} alumnos seleccionados del grupo? Esta acción puede deshacerse volviendo a inscribirlos.`}
                confirmText="Sí, dar de baja"
                variant="warning"
            />
        </div>
    );
}
