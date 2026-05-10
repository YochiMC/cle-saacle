import React, { memo, useState } from "react";
import { X, Edit2, Trash2 } from "lucide-react";
import ConfirmModal from "@/Components/ui/ConfirmModal";

/**
 * Barra flotante de acciones masivas desacoplada de Inertia.
 *
 * @param {Object} props
 * @param {Array<string|number>} props.seleccionados
 * @param {Array<{value: string, label: string}>} [props.statuses]
 * @param {function(): void} props.onClearSelection
 * @param {function(string, Array<string|number>): void} [props.onBulkStatus]
 * @param {function(Array<string|number>): void} [props.onBulkDelete]
 * @param {string} [props.selectedSingularLabel]
 * @param {string} [props.selectedPluralLabel]
 * @param {string} [props.statusPlaceholder]
 * @param {string} [props.deleteButtonText]
 * @param {string} [props.deleteModalTitle]
 * @param {function(number): string} [props.deleteModalMessage]
 */
const ResourceBulkActionBar = memo(
    ({
        seleccionados = [],
        statuses = [],
        onClearSelection,
        onBulkStatus,
        onBulkDelete,
        selectedSingularLabel = "Elemento seleccionado",
        selectedPluralLabel = "Elementos seleccionados",
        statusPlaceholder = "Cambiar estado",
        confirmStatusChange = false,
        statusModalTitle = "Actualizar estado",
        statusModalMessage = (count, statusLabel) =>
            `¿Estas seguro de que deseas actualizar ${count} elementos al estado ${statusLabel}?`,
        statusConfirmText = "Si, actualizar",
        deleteButtonText = "Eliminar",
        deleteModalTitle = "Eliminar elementos",
        deleteModalMessage = (count) =>
            `¿Estas seguro de que deseas eliminar ${count} elementos? Esta accion no se puede deshacer.`,
    }) => {
        const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
        const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
        const [pendingStatus, setPendingStatus] = useState("");

        if (seleccionados.length === 0) return null;

        const handleStatusChange = (e) => {
            const newStatus = e.target.value;
            if (!newStatus) return;

            if (confirmStatusChange) {
                setPendingStatus(newStatus);
                setIsStatusModalOpen(true);
            } else {
                onBulkStatus?.(newStatus, seleccionados);
            }

            e.target.value = "";
        };

        const handleConfirmStatus = () => {
            if (!pendingStatus) return;

            onBulkStatus?.(pendingStatus, seleccionados);
            setPendingStatus("");
            setIsStatusModalOpen(false);
        };

        const handleConfirmDelete = () => {
            onBulkDelete?.(seleccionados);
            setIsDeleteModalOpen(false);
        };

        return (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
                <div className="bg-[#1B396A] text-white px-6 py-4 rounded-2xl shadow-2xl flex flex-wrap items-center justify-center gap-6 border border-[#142952]/50">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/30 font-bold text-blue-50">
                            {seleccionados.length}
                        </span>
                        <span className="font-semibold text-sm tracking-wide">
                            {seleccionados.length === 1
                                ? selectedSingularLabel
                                : selectedPluralLabel}
                        </span>
                    </div>

                    <div className="hidden sm:block h-6 w-px bg-white/20"></div>

                    <div className="flex items-center gap-3">
                        {statuses.length > 0 && (
                            <div className="relative flex items-center bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors text-sm pl-3 overflow-hidden cursor-pointer">
                                <Edit2
                                    size={16}
                                    className="pointer-events-none"
                                />
                                <select
                                    onChange={handleStatusChange}
                                    defaultValue=""
                                    className="bg-transparent text-white font-medium py-2 pl-2 pr-6 border-none outline-none focus:ring-0 appearance-none cursor-pointer"
                                >
                                    <option
                                        value=""
                                        disabled
                                        className="text-gray-900"
                                    >
                                        {statusPlaceholder}
                                    </option>
                                    {statuses.map((status) => (
                                        <option
                                            key={status.value}
                                            value={status.value}
                                            className="text-gray-900"
                                        >
                                            {status.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <button
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium shadow-sm transition-colors text-sm"
                        >
                            <Trash2 size={16} />
                            <span className="hidden sm:inline">
                                {deleteButtonText}
                            </span>
                        </button>

                        <div className="h-6 w-px bg-white/20 mx-1"></div>

                        <button
                            onClick={onClearSelection}
                            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                            aria-label="Cancelar seleccion"
                            title="Cancelar seleccion"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <ConfirmModal
                    isOpen={isStatusModalOpen}
                    onClose={() => {
                        setIsStatusModalOpen(false);
                        setPendingStatus("");
                    }}
                    onConfirm={handleConfirmStatus}
                    title={statusModalTitle}
                    message={statusModalMessage(
                        seleccionados.length,
                        statuses.find(
                            (status) => status.value === pendingStatus,
                        )?.label ?? pendingStatus,
                    )}
                    confirmText={statusConfirmText}
                    variant="institutional"
                />

                <ConfirmModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    title={deleteModalTitle}
                    message={deleteModalMessage(seleccionados.length)}
                    confirmText="Si, eliminar"
                    variant="warning"
                />
            </div>
        );
    },
);

export default ResourceBulkActionBar;
