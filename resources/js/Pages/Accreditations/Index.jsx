import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ResourceDashboard from "@/Components/Resource/ResourceDashboard";
import { Head } from "@inertiajs/react";

// Hooks y Controladores
import useAccreditationManager from "./Hooks/useAccreditationManager";

// Constantes
import { 
    VIEW_OPTIONS, 
    BULK_SUSPEND_MODAL_CONFIG, 
    STATUS_SELECT_OPTIONS, 
    HIDDEN_COLUMNS_DEFAULT 
} from "./Constants/accreditationConstants";

// Componentes Fragmentados
import AccreditationFilters from "./Components/AccreditationFilters";
import AccreditationActions from "./Components/AccreditationActions";
import AccreditationModals from "./Components/AccreditationModals";

/**
 * Vista Principal: Acreditaciones
 * 
 * Orquestador de la vista de dictamen de acreditaciones.
 * Utiliza el patrón Headless Controller para separar la lógica de negocio de la UI.
 */
export default function Index({ candidates, accreditationTypeOptions = [] }) {
    // 1. Invocación del Controlador Lógico (Custom Hook)
    const { 
        state, 
        derived, 
        handlers, 
        flashModal 
    } = useAccreditationManager(candidates);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Acreditaciones
                </h2>
            }
        >
            <Head title="Acreditaciones" />

            {/* Dashboard Principal de Recursos */}
            <ResourceDashboard
                title="Dictamen de Acreditaciones"
                dataMap={{ candidatos: derived.filteredCandidates }}
                baseDataMap={{ candidatos: candidates }}
                viewOptions={VIEW_OPTIONS}
                
                // Configuración de mutaciones
                deleteRoute={route("accreditations.bulk-suspend")}
                bulkDeleteModal={BULK_SUSPEND_MODAL_CONFIG}
                
                // Configuración de tabla editable
                editableColumns={["status"]}
                editAllRows={false}
                editingRowId={state.editingRowId}
                onCellChange={handlers.handleCellChange}
                selectOptions={{ status: STATUS_SELECT_OPTIONS }}
                
                // Inyección de Componentes Fragmentados
                buttonSpace={
                    <AccreditationFilters 
                        statusFilter={state.filters.status}
                        setStatusFilter={handlers.setStatusFilter}
                        typeFilter={state.filters.type}
                        setTypeFilter={handlers.setTypeFilter}
                        accreditationTypeOptions={accreditationTypeOptions}
                    />
                }
                customRowActions={(item) => (
                    <AccreditationActions 
                        item={item}
                        isEditingRow={state.editingRowId === item.id}
                        handleEditRow={handlers.handleEditRow}
                        handleCancelRowEdit={handlers.handleCancelRowEdit}
                        requestSuspendRow={handlers.requestSuspendRow}
                    />
                )}

                // Configuración visual
                hiddenColumns={HIDDEN_COLUMNS_DEFAULT}
            />

            {/* Orquestación de Modales (Confirmaciones y Alertas) */}
            <AccreditationModals 
                flashModal={flashModal}
                closeFlashModal={handlers.closeFlashModal}
                itemToSuspend={state.itemToSuspend}
                setItemToSuspend={handlers.setItemToSuspend}
                handleConfirmSuspend={handlers.handleConfirmSuspend}
                itemToChange={state.itemToChange}
                setItemToChange={handlers.setItemToChange}
                handleConfirmChange={handlers.handleConfirmChange}
            />
        </AuthenticatedLayout>
    );
}
