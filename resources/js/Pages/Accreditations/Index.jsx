import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ResourceDashboard from "@/Components/Resource/ResourceDashboard";
import { Head, Link, router } from "@inertiajs/react";
import { useMemo, useState } from "react";
import ThemeButton from "@/Components/ui/ThemeButton";
import { Check, Edit, Eye, Trash2, X } from "lucide-react";
import useFlashAlert from "@/Hooks/useFlashAlert";
import ModalAlert from "@/Components/ui/ModalAlert";
import ConfirmModal from "@/Components/ui/ConfirmModal";

export default function Index({ candidates, accreditationTypeOptions = [] }) {
    const { flashModal, closeFlashModal, showFlash } = useFlashAlert();
    const [itemToSuspend, setItemToSuspend] = useState(null);
    const [itemToChange, setItemToChange] = useState(null);
    const [editingRowId, setEditingRowId] = useState(null);

    const [statusFilter, setStatusFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");

    const filteredCandidates = useMemo(() => {
        return candidates.filter((item) => {
            const matchesStatus = statusFilter === "" || item.status === statusFilter;
            const matchesType = typeFilter === "" || 
                (item?.achieved_by && item.achieved_by.toLowerCase() === typeFilter.toLowerCase());
            return matchesStatus && matchesType;
        });
    }, [candidates, statusFilter, typeFilter]);

    const viewOptions = [
        { value: "candidatos", label: "Candidatos a Acreditación" },
    ];

    // Opciones para el <Select> inyectado en las celdas directamente por OCP
    const statusSelectOptions = [
        { value: "in_review", label: "En Revisión" },
        { value: "accredited", label: "Acreditado" },
        { value: "released", label: "Liberado" },
        { value: "suspended", label: "Suspendido" },
    ];

    // Envío del PATCH tras la edición Inline (por celda) interceptado por el modal de confirmación
    const handleCellChange = (fieldKey, rowId, value) => {
        if (fieldKey === "status") {
            const itemToEdit = candidates.find((c) => c.id === rowId);
            setItemToChange({
                rowId,
                newValue: value,
                targetName: itemToEdit?.full_name || "este alumno",
                newLabel: statusSelectOptions.find((opt) => opt.value === value)?.label || value,
            });
        }
    };

    const handleConfirmChange = () => {
        if (!itemToChange) return;

        const { rowId, newValue } = itemToChange;
        setItemToChange(null); // Ocultar pre-carga

        router.patch(
            route("accreditations.update-status", rowId),
            { status: newValue },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    showFlash(
                        "success",
                        "El estatus de acreditación se ha actualizado.",
                    );
                    setEditingRowId(null);
                },
                onError: () => {
                    showFlash(
                        "error",
                        "Ha ocurrido un error al actualizar el estatus de acreditación.",
                    );
                },
            },
        );
    };

    const handleEditRow = (item) => {
        setEditingRowId(item.id);
    };

    const handleCancelRowEdit = () => {
        setEditingRowId(null);
    };

    const requestSuspendRow = (item) => {
        setItemToSuspend(item);
    };

    const handleConfirmSuspend = () => {
        if (!itemToSuspend) return;

        const target = itemToSuspend;
        // Cerramos el warning de inmediato para evitar overlays persistentes.
        setItemToSuspend(null);

        router.patch(
            route("accreditations.update-status", target.id),
            {
                status: "suspended",
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    showFlash(
                        "success",
                        "Alumno actualizado a estatus Suspendido.",
                    );
                },
                onError: () => {
                    showFlash(
                        "error",
                        "No se pudo actualizar el estatus del alumno.",
                    );
                },
                onFinish: () => {
                    setItemToSuspend(null);
                },
            },
        );
    };

    // Componente custom inyectado en "buttonSpace" de ResourceDashboard
    // Hemos refactorizado esto para filtrar 100% en el cliente instantáneamente.
    const ActionToolbar = () => {
        return (
            <div className="flex items-center gap-4">
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border-gray-300 rounded-md shadow-sm text-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                    <option value="">Todos los estatus</option>
                    <option value="in_review">En Revisión</option>
                    <option value="accredited">Acreditado</option>
                    <option value="released">Liberado</option>
                </select>

                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="border-gray-300 rounded-md shadow-sm text-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 min-w-44"
                >
                    <option value="">Todos los tipos</option>
                    {(accreditationTypeOptions || []).map((type) => (
                        <option key={type} value={type}>
                            {type}
                        </option>
                    ))}
                </select>
            </div>
        );
    };

    // OCP: Inyección de acciones personalizadas por fila sin alterar la tabla base
    const customRowActionsRender = (item) => {
        const isEditingRow = editingRowId === item.id;

        return (
            <div className="flex items-center justify-center gap-2">
                <ThemeButton
                    onClick={() =>
                        isEditingRow
                            ? handleCancelRowEdit()
                            : handleEditRow(item)
                    }
                    theme={isEditingRow ? "outline" : "warning"}
                    icon={isEditingRow ? X : Edit}
                    title={isEditingRow ? "Cancelar edición" : "Editar"}
                    className="flex items-center justify-center w-8 h-8 p-0 !px-0"
                />
                <Link href={route("profiles", item.user_id)}>
                    <ThemeButton
                        theme="institutional"
                        icon={Eye}
                        title="Ver Perfil"
                        className="flex items-center justify-center w-8 h-8 p-0 !px-0 bg-blue-600 hover:bg-blue-700"
                    />
                </Link>
                <ThemeButton
                    theme="danger"
                    icon={Trash2}
                    onClick={() => requestSuspendRow(item)}
                    title="Eliminar"
                    className="flex items-center justify-center w-8 h-8 p-0 !px-0"
                />
            </div>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Acreditaciones
                </h2>
            }
        >
            <Head title="Acreditaciones" />

            <ResourceDashboard
                title="Dictamen de Acreditaciones"
                dataMap={{ candidatos: filteredCandidates }}
                baseDataMap={{ candidatos: candidates }}
                viewOptions={viewOptions}
                deleteRoute={route("accreditations.bulk-suspend")}
                bulkDeleteModal={{
                    title: "Suspender candidatos seleccionados",
                    message:
                        "Estos alumnos dejarán de ser considerados candidatos activos en el proceso de acreditación. Su estatus pasará a Suspendido de manera inmediata. ¿Estás seguro?",
                    confirmText: "Sí, suspender alumnos",
                    variant: "warning",
                }}
                onEditRow={handleEditRow}
                customRowActions={customRowActionsRender}
                buttonSpace={<ActionToolbar />}
                editableColumns={["status"]}
                editAllRows={false}
                editingRowId={editingRowId}
                onCellChange={handleCellChange}
                selectOptions={{ status: statusSelectOptions }}
                hiddenColumns={{
                    id: false,
                    user_id: false,
                    status_label: false,
                }}
            />

            <ModalAlert
                isOpen={flashModal.isOpen}
                onClose={closeFlashModal}
                type={flashModal.type}
                title={flashModal.title}
                message={flashModal.message}
            />

            <ConfirmModal
                isOpen={itemToSuspend != null}
                onClose={() => setItemToSuspend(null)}
                onConfirm={handleConfirmSuspend}
                title="Suspender candidato"
                message={`Al confirmar, ${itemToSuspend?.full_name || "el alumno"} será extraído del flujo de acreditaciones y su estatus pasará a "Suspendido". ¿Deseas proceder?`}
                confirmText="Sí, suspender alumno"
                variant="warning"
            />

            <ConfirmModal
                isOpen={itemToChange != null}
                onClose={() => setItemToChange(null)}
                onConfirm={handleConfirmChange}
                title="Confirmar actualización"
                message={`¿Estás seguro de que deseas cambiar el estatus de ${itemToChange?.targetName} a "${itemToChange?.newLabel}"? Esto alterará su historial académico.`}
                confirmText="Sí, actualizar estatus"
                variant="warning"
            />
        </AuthenticatedLayout>
    );
}
