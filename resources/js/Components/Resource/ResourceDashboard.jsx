import { useState } from "react";
import { Head } from "@inertiajs/react";
import { PlusCircle } from "lucide-react";

import { DataTable } from "@/Components/DataTable/DataTable";
import DashboardHeader from "@/Components/Menus/DashboardHeader";
import { useDynamicColumns } from "@/Hooks/useDynamicColumns";
import { useBulkActions } from "@/Hooks/useBulkActions";
import ConfirmModal from "@/Components/ui/ConfirmModal";
import ThemeButton from "@/Components/ui/ThemeButton";

const EMPTY_DATA = [];

/**
 * ResourceDashboard — Super-componente de gestión de datos.
 *
 * SRP aplicado: este componente orquesta la vista de datos y los controles
 * globales. La tabla (DataTable) solo tiene responsabilidad de pintar datos.
 * Los controles de acción (buttonSpace, onNew) viven en una Toolbar propia
 * que se renderiza SIEMPRE, independientemente de si hay datos o no.
 *
 * @param {string}          title           - Título principal (ej: "Carreras").
 * @param {object}          dataMap         - Datos por vista: { carreras: [], alumnos: [] }
 * @param {Array}           viewOptions     - [{ value, label }] para el selector de vistas.
 * @param {string|object}   deleteRoute     - Ruta de eliminación masiva (string) o mapa por vista.
 * @param {"post"|"delete"|"put"|"patch"} bulkDeleteMethod - Método HTTP para eliminación masiva.
 * @param {object}          hiddenColumns   - Columnas ocultas por defecto.
 * @param {Function}        onEditRow       - Callback al pulsar Editar: (item) => void.
 * @param {Function}        onDeleteRow     - Callback al pulsar Eliminar: (item) => void.
 * @param {React.ReactNode} buttonSpace     - Acciones extras para la toolbar (ej: "Capturar Calificaciones").
 * @param {Function}        onNew           - Callback para el botón "+ Nuevo" siempre visible.
 * @param {number|null}     editingRowId    - ID de la fila en edición individual.
 * @param {boolean}         editAllRows     - Activa la edición global de todas las filas.
 * @param {Function}        onSaveRow       - Callback al guardar fila individual.
 * @param {Function}        onCancelRow     - Callback al cancelar edición individual.
 * @param {string[]}        editableColumns - Keys de columnas editables durante edición de fila.
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
    baseDataMap, // NUEVO: Permite saber si hay datos antes de filtrar
}) {
    const firstView = viewOptions[0]?.value ?? "";
    const [vistaActual, setVistaActual] = useState(firstView);

    const currentData = dataMap[vistaActual] || EMPTY_DATA;
    const currentBaseData = baseDataMap ? (baseDataMap[vistaActual] || EMPTY_DATA) : currentData;
    const currentViewLabel =
        viewOptions.find((o) => o.value === vistaActual)?.label ?? title;

    // Generación reactiva de columnas basado en currentBaseData para que los encabezados no desaparezcan al filtrar
    const columns = useDynamicColumns(currentBaseData, onEditRow, onDeleteRow, {
        editableColumns,
        restrictedColumns,
        selectOptions,
        onCellChange,
        editingRowId,
        editAllRows,
        onSaveRow,
        onCancelRow,
        customRowActions,
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
    } = useBulkActions(deleteRoute, vistaActual, bulkDeleteMethod);

    const handleViewChange = (newView) => {
        setVistaActual(newView);
        resetSelection();

        if (onViewChange) {
            onViewChange(newView);
        }
    };

    const bulkModalTitle = bulkDeleteModal?.title ?? "Acción masiva";
    const bulkModalMessage =
        bulkDeleteModal?.message ??
        `¿Estás seguro de que deseas aplicar esta acción a los ${filasSeleccionadas.length} registros seleccionados?`;
    const bulkModalConfirmText =
        bulkDeleteModal?.confirmText ?? "Sí, continuar";
    const bulkModalVariant = bulkDeleteModal?.variant ?? "warning";

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
                    {/* ── Tabla de Datos o Estado Vacío ────── */}
                    {currentBaseData.length > 0 ? (
                        <DataTable
                            key={`table-${vistaActual}-${currentData.length}`}
                            columns={columns}
                            data={currentData}
                            hiddenColumns={hiddenColumns}
                            onSelectionChange={handleSelectionChange}
                            searchPlaceholder={`Buscar en ${currentViewLabel.toLowerCase()}...`}
                            onPrint={onPrint}
                            buttonSpace={buttonSpace}
                            onNew={onNew}
                            getRowClassName={getRowClassName}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center p-12 text-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 mt-2">
                            <h3 className="text-lg font-medium text-[#17365D] mb-2">
                                No hay registros en{" "}
                                {currentViewLabel.toLowerCase()}
                            </h3>
                            <p className="text-sm text-slate-500 mb-6 max-w-sm">
                                Aún no hay registros para mostrar en esta vista.
                                {onNew
                                    ? " Comienza agregando el primero para poder gestionar la información."
                                    : ""}
                            </p>
                            {onNew && (
                                <ThemeButton
                                    theme="institutional"
                                    icon={PlusCircle}
                                    onClick={onNew}
                                >
                                    Registrar Nuevo
                                </ThemeButton>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={isConfirmingBulkDelete}
                onClose={() => setIsConfirmingBulkDelete(false)}
                onConfirm={executeBulkDelete}
                title="Eliminación Masiva"
                message={`¿Estás seguro de que deseas eliminar ${filasSeleccionadas.length} registros seleccionados de ${currentViewLabel.toLowerCase()}? Esta acción no se puede deshacer.`}
                confirmText="Sí, eliminar"
                variant="warning"
            />
        </div>
    );
}
