import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ResourceDashboard from "@/Components/ResourceDashboard";
import { usePermission } from "@/Utils/auth";
import ThemeButton from "@/Components/ThemeButton";
import { Check, X, Save, Edit3 } from "lucide-react";
import { router } from "@inertiajs/react";
import EnrollStudentModal from "@/Pages/Test_MK2/FormModals/EnrollStudentModal";
import ConfirmModal from '@/Components/ConfirmModal';
import ModalAlert from "@/Components/ui/ModalAlert";
import useFlashAlert from "@/Hooks/useFlashAlert";

/**
 * Vista de Gestión de Examen (Dashboard).
 * Clon de GroupView adaptado al modelo de Exámenes.
 */
export default function ExamView({
    auth,
    examen,
    enrolledStudents = [],
    availableStudents = [],
}) {
    const { hasRole } = usePermission();

    const normalizedEnrolledStudents = Array.isArray(enrolledStudents)
        ? enrolledStudents
        : Array.isArray(enrolledStudents?.data)
          ? enrolledStudents.data
          : [];

    const [localData, setLocalData] = useState(normalizedEnrolledStudents);

    useEffect(() => {
        setLocalData(normalizedEnrolledStudents);
    }, [enrolledStudents]);

    // Roles que pueden calificar
    const canEditQualifications = hasRole("teacher") || hasRole("admin") || hasRole("coordinator");

    // ── Estados de Edición ──────────────────────────────────────────────────────────
    const [editingRowId, setEditingRowId] = useState(null);
    const [isEditingMode, setIsEditingMode] = useState(false);
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const { flashModal, closeFlashModal } = useFlashAlert();

    // ── Callbacks de Edición Individual ────────────────────────────────────────────
    const handleSaveRow = (item) => {
        const rowToSave = localData.find((row) => row.id === item.id);
        if (rowToSave && examen?.id) {
            router.patch(
                route("exams.qualifications.update", examen.id),
                {
                    student_id: rowToSave.id,
                    calificacion: rowToSave.calificacion
                },
                {
                    preserveScroll: true,
                    onSuccess: () => setEditingRowId(null),
                }
            );
        } else {
            setEditingRowId(null);
        }
    };

    const handleDeleteRow = (item) => {
        setItemToDelete(item);
    };

    const confirmDelete = () => {
        if (!itemToDelete) return;
        router.delete(route('exams.unenroll', [examen.id, itemToDelete.id]), {
            preserveScroll: true,
            onSuccess: () => setItemToDelete(null)
        });
    };

    const handleCellChange = (fieldKey, rowId, newValue) => {
        setLocalData((prevData) =>
            prevData.map((row) => {
                if (row.id === rowId) {
                    return { ...row, [fieldKey]: newValue };
                }
                return row;
            })
        );
    };

    const handleSaveGlobal = () => {
        router.patch(
            route("exams.qualifications.bulk-update", examen.id),
            { qualifications: localData },
            {
                preserveScroll: true,
                onSuccess: () => setIsEditingMode(false),
            }
        );
    };

    const handleEnroll = (selectedIds) => {
        router.post(
            route("exams.enroll", examen.id),
            { student_ids: selectedIds },
            {
                preserveScroll: true,
                onSuccess: () => setIsEnrollModalOpen(false),
            }
        );
    };

    // La columna a editar en exámenes es 'calificacion'
    const editableColumns = canEditQualifications ? ["calificacion"] : [];
    const restrictedColumns = [];

    const viewOptions = [{ value: "alumnos", label: "Alumnos Inscritos" }];
    const dataMap = { alumnos: localData };

    return (
        <>
            <AuthenticatedLayout
                user={auth?.user}
                header={
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Gestión de Examen: {examen?.name || `Examen #${examen?.id}`}
                    </h2>
                }
            >
                <div className="py-12 pb-32">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        {/* ── Barra Superior ─────────────────────────────────────── */}
                        {canEditQualifications && (
                            <div className="flex justify-end mb-4">
                                {!isEditingMode ? (
                                    <ThemeButton
                                        theme="primary"
                                        icon={Edit3}
                                        onClick={() => setIsEditingMode(true)}
                                    >
                                        Capturar Calificaciones
                                    </ThemeButton>
                                ) : null}
                            </div>
                        )}

                        {/* ── Dashboard Principal ───────────────────────────────── */}
                        <ResourceDashboard
                            title={`Alumnos Inscritos: ${examen?.name || "N/A"}`}
                            dataMap={dataMap}
                            viewOptions={viewOptions}
                            deleteRoute={route('exams.unenroll-bulk', examen?.id)}
                            onDeleteRow={handleDeleteRow}
                            editableColumns={editableColumns}
                            restrictedColumns={restrictedColumns}
                            hiddenColumns={{}}
                            isTeacherMode={canEditQualifications && isEditingMode}
                            onCellChange={handleCellChange}
                            editingRowId={editingRowId}
                            onEditRow={(item) => setEditingRowId(item.id)}
                            onSaveRow={handleSaveRow}
                            onCancelRow={() => setEditingRowId(null)}
                            onNew={canEditQualifications ? () => setIsEnrollModalOpen(true) : undefined}
                        />
                    </div>
                </div>

                {/* ── Barra Inferior: Guardado Global ────────────────────────── */}
                {isEditingMode && canEditQualifications && (
                    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-6 z-50">
                        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 flex justify-end gap-4">
                            <ThemeButton theme="outline" icon={X} onClick={() => setIsEditingMode(false)}>
                                Cancelar
                            </ThemeButton>
                            <ThemeButton theme="success" icon={Save} onClick={handleSaveGlobal}>
                                Guardar Cambios
                            </ThemeButton>
                        </div>
                    </div>
                )}
            </AuthenticatedLayout>

            {/* Modales */}
            <EnrollStudentModal
                show={isEnrollModalOpen}
                onClose={() => setIsEnrollModalOpen(false)}
                availableStudents={availableStudents}
                onEnroll={handleEnroll}
            />

            <ConfirmModal
                isOpen={itemToDelete !== null}
                onClose={() => setItemToDelete(null)}
                onConfirm={confirmDelete}
                title="Dar de baja alumno"
                message={`¿Estás seguro de que deseas dar de baja a ${itemToDelete?.full_name || 'este alumno'} del examen?`}
                confirmText="Sí, dar de baja"
                variant="warning"
            />

            <ModalAlert
                isOpen={flashModal.isOpen}
                onClose={closeFlashModal}
                type={flashModal.type}
                title={flashModal.title}
                message={flashModal.message}
            />
        </>
    );
}
