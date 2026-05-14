import { useMemo, useState } from "react";
import { Head } from "@inertiajs/react";

import { DataTable } from "@/Components/DataTable/DataTable";
import DashboardHeader from "@/Components/Menus/DashboardHeader";
import { useDynamicColumns } from "@/Hooks/useDynamicColumns";
import { useBulkActions } from "@/Hooks/useBulkActions";
import { usePermission } from "@/Utils/auth";
import ConfirmModal from "@/Components/ui/ConfirmModal";
import ResourceEmptyState from "@/Components/ui/ResourceEmptyState";

const EMPTY_DATA = [];

/**
 * ResourceDashboard — Super-componente de gestión de datos.
 *
 * Orquesta la vista de datos, los controles globales y las acciones masivas.
 * La tabla (DataTable) se encarga de la visualización granular de los datos,
 * mientras que ResourceEmptyState maneja los estados sin registros.
 */
export default function ResourceDashboard({
    title,
    dataMap = {},
    viewOptions = [],
    deleteRoute,
    bulkDeleteMethod = "post",
    hiddenColumns = { created_at: false, updated_at: false },
    onEditRow,
    onDeleteRow,
    canPerformDelete = true,
    onPrint,
    buttonSpace,
    onNew,
    onViewChange,
    editableColumns = [],
    restrictedColumns = [],
    onCellChange,
    customActions,
    customRowActions,
    editingRowId = null,
    editAllRows = false,
    onSaveRow,
    onCancelRow,
    selectOptions = {},
    getRowClassName,
    bulkDeleteModal,
    baseDataMap,
    forcedKeys = [],
    columnConfig = {}, // Inyección de configuración externa
}) {
    const { hasRole } = usePermission();
    const debeOcultarAcciones = hasRole("student");

    const firstView = viewOptions[0]?.value ?? "";
    const [vistaActual, setVistaActual] = useState(firstView);

    const currentData = dataMap[vistaActual] || EMPTY_DATA;
    const currentBaseData = baseDataMap ? (baseDataMap[vistaActual] || EMPTY_DATA) : currentData;
    const currentViewLabel =
        viewOptions.find((o) => o.value === vistaActual)?.label ?? title;

    const generatedColumns = useDynamicColumns(currentBaseData, onEditRow, onDeleteRow, {
        editableColumns,
        restrictedColumns,
        forcedKeys,
        selectOptions,
        onCellChange,
        editingRowId,
        editAllRows,
        onSaveRow,
        onCancelRow,
        customRowActions,
        columnConfig: columnConfig,
        canPerformDelete,
    });

    const columns = useMemo(() => {
        if (!debeOcultarAcciones) {
            return generatedColumns;
        }

        return generatedColumns.filter(
            (column) => column.id !== "actions" && column.id !== "select",
        );
    }, [generatedColumns, debeOcultarAcciones]);

    const {
        filasSeleccionadas,
        handleSelectionChange,
        handleBulkCopy,
        handleBulkDelete,
        resetSelection,
        rowSelection,
        setRowSelection,
        isConfirmingBulkDelete,
        setIsConfirmingBulkDelete,
        executeBulkDelete
    } = useBulkActions(deleteRoute, vistaActual, bulkDeleteMethod);

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

            <div className="mx-auto w-full max-w-[96rem] sm:px-6 lg:px-8">
                <DashboardHeader
                    title={title}
                    currentViewLabel={currentViewLabel}
                    viewOptions={viewOptions}
                    vistaActual={vistaActual}
                    onViewChange={handleViewChange}
                    selectionCount={filasSeleccionadas.length}
                    onBulkCopy={handleBulkCopy}
                    onBulkDelete={handleBulkDelete}
                    customActions={customActions}
                />

                <div className="p-6 overflow-hidden bg-white rounded-sm shadow-sm">
                    {currentBaseData.length > 0 || buttonSpace ? (
                        <DataTable
                            key={`table-${vistaActual}-${columns.map(c => c.id || c.accessorKey).join('-')}`}
                            columns={columns}
                            data={currentData}
                            hiddenColumns={hiddenColumns}
                            rowSelection={rowSelection}
                            onRowSelectionChange={setRowSelection}
                            onSelectionChange={handleSelectionChange}
                            searchPlaceholder={`Buscar en ${currentViewLabel.toLowerCase()}...`}
                            onPrint={onPrint}
                            buttonSpace={buttonSpace}
                            onNew={onNew}
                            getRowClassName={getRowClassName}
                        />
                    ) : (
                        <ResourceEmptyState 
                            label={currentViewLabel} 
                            onNew={onNew} 
                        />
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={isConfirmingBulkDelete}
                onClose={() => setIsConfirmingBulkDelete(false)}
                onConfirm={executeBulkDelete}
                title={bulkDeleteModal?.title || "Eliminación Masiva"}
                message={bulkDeleteModal?.message || `¿Estás seguro de que deseas eliminar ${filasSeleccionadas.length} registros seleccionados? Esta acción no se puede deshacer.`}
                confirmText={bulkDeleteModal?.confirmText || "Sí, eliminar"}
                variant={bulkDeleteModal?.variant || "danger"}
            />
        </div>
    );
}

