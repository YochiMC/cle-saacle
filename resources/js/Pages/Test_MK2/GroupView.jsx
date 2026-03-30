import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ResourceDashboard from "@/Components/ResourceDashboard";
import { usePermission } from "@/Utils/auth";
import ThemeButton from "@/Components/ThemeButton";
import { X, Save, Edit3 } from "lucide-react";
import { router } from "@inertiajs/react";
import EnrollStudentModal from "@/Pages/Test_MK2/FormModals/EnrollStudentModal";
import ConfirmModal from '@/Components/ConfirmModal';
import ModalAlert from "@/Components/ui/ModalAlert";
import useFlashAlert from "@/Hooks/useFlashAlert";

/**
 * Vista de Gestión de Grupo (Dashboard).
 * Muestra los alumnos inscritos y permite la captura de calificaciones.
 *
 * - La transformación y aplanado de datos ('flattening') ahora se maneja
 *   desde Laravel a través del StudentQualificationResource, siguiendo
 *   el Principio de Responsabilidad Única (SRP). El frontend solo renderiza.
 *
 * - Edición Individual: Cada fila tiene botones Editar/Eliminar. Al pulsar Editar,
 *   esa fila se vuelve editable en línea, y sus botones cambian a Guardar/Cancelar.
 *   Esta arquitectura separa la edición individual de la global (OCP).
 *
 * @param {Object} props
 * @param {Object} props.auth - Objeto de autenticación de Inertia.
 * @param {Object} props.grupo - El objeto del grupo cargado.
 * @param {Array} props.enrolledStudents - Colección serializada de alumnos listos para la tabla.
 */
export default function GroupView({
    auth,
    grupo,
    enrolledStudents = [],
    availableStudents = [],
}) {
    // Utilizamos el Custom Hook para el manejo de roles
    const { hasRole } = usePermission();

    // Inertia puede recibir ResourceCollection como { data: [...] } o como array plano.
    const normalizedEnrolledStudents = Array.isArray(enrolledStudents)
        ? enrolledStudents
        : Array.isArray(enrolledStudents?.data)
          ? enrolledStudents.data
          : [];

    // Estado local para los estudiantes y sus calificaciones
    const [localData, setLocalData] = useState(normalizedEnrolledStudents);

    // Sincronizar el estado local si cambian los props desde servidor
    useEffect(() => {
        setLocalData(normalizedEnrolledStudents);
    }, [enrolledStudents]);

    // Verificamos si el usuario actual es docente o administrador
    const canEditQualifications = hasRole("teacher") || hasRole("admin");

    // ── Estados de Edición ──────────────────────────────────────────────────────────
    // Estado para edición individual: rastrea qué fila está siendo editada
    const [editingRowId, setEditingRowId] = useState(null);
    // Estado para edición global: indica si estamos en modo "Capturar Calificaciones"
    const [isEditingMode, setIsEditingMode] = useState(false);
    // Control del modal de inscripción
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
    // Control de advertencia para baja individual
    const [itemToDelete, setItemToDelete] = useState(null);
    // Alertas globales flash
    const { flashModal, closeFlashModal } = useFlashAlert();

    // ── Callbacks de Edición Individual ────────────────────────────────────────────
    const handleEditRow = (item) => {
        setEditingRowId(item.id);
    };

    const handleSaveRow = (item) => {
        console.log("Guardando fila", item);
        const rowToSave = localData.find((row) => row.id === item.id);
        if (rowToSave && rowToSave.qualification_id) {
            router.patch(
                route("qualifications.update", rowToSave.qualification_id),
                rowToSave,
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setEditingRowId(null);
                    },
                    onError: (errors) => {
                        console.error("Error al guardar fila:", errors);
                    },
                },
            );
        } else {
            console.warn("No se encontró el qualification_id para la fila.");
            setEditingRowId(null);
        }
    };

    const handleCancelRow = () => {
        setEditingRowId(null);
    };

    const handleDeleteRow = (item) => {
        setItemToDelete(item);
    };

    const confirmDelete = () => {
        if (!itemToDelete) return;
        router.delete(route('groups.unenroll', [grupo.id, itemToDelete.id]), {
            preserveScroll: true,
            onSuccess: () => setItemToDelete(null)
        });
    };

    const handleCellChange = (fieldKey, rowId, newValue) => {
        setLocalData((prevData) =>
            prevData.map((row) => {
                if (row.id === rowId) {
                    const updatedRow = { ...row, [fieldKey]: newValue };

                    if (fieldKey === 'unit_1' || fieldKey === 'unit_2') {
                        const u1 = parseFloat(updatedRow.unit_1) || 0;
                        const u2 = parseFloat(updatedRow.unit_2) || 0;
                        
                        const average = Math.round((u1 + u2) / 2);
                        updatedRow.final_average = average;
                        updatedRow.is_approved = average >= 70;
                    }

                    return updatedRow;
                }
                return row;
            })
        );
    };

    const handleSaveGlobal = () => {
        console.log("Guardando cambios globales...");
        router.patch(
            route("qualifications.bulk-update"),
            { qualifications: localData },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsEditingMode(false);
                },
                onError: (errors) => {
                    console.error("Errores al guardar", errors);
                },
            },
        );
    };

    const handleEnroll = (selectedIds) => {
        router.post(
            route("groups.enroll", grupo.id),
            { student_ids: selectedIds },
            {
                preserveScroll: true,
                onSuccess: () => setIsEnrollModalOpen(false),
            },
        );
    };

    // Lógica de Roles: Configuramos las columnas editables dinámicamente.
    // Usamos EXACTAMENTE las keys devueltas por el StudentQualificationResource.
    // Cuando una fila está en edición, todas sus columnas configuradas aquí se vuelven editables.
    const editableColumns = canEditQualifications
        ? ["unit_1", "unit_2", "is_approved", "is_left"]
        : [];

    // Formateamos las opciones de vista para el ResourceDashboard
    const viewOptions = [{ value: "alumnos", label: "Alumnos Inscritos" }];

    // DataMap inyecta los alumnos que ahora vienen listos desde el API Resource de Laravel
    const dataMap = {
        alumnos: localData,
    };

    return (
        <>
            <AuthenticatedLayout
                user={auth?.user}
                header={
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Gestión de Grupo: {grupo?.name || "N/A"}
                    </h2>
                }
            >
                <div className="py-12 pb-32">
                    {/* ── Dashboard Principal ────────────────────────────────────────────── */}
                    <ResourceDashboard
                        title={`Calificaciones del Grupo: ${grupo?.name || "N/A"}`}
                        dataMap={dataMap}
                        viewOptions={viewOptions}
                        deleteRoute={route('groups.unenroll-bulk', grupo.id)}
                        onDeleteRow={handleDeleteRow}
                        editableColumns={editableColumns}
                        hiddenColumns={{ qualification_id: false }}
                        onCellChange={handleCellChange}
                        editingRowId={editingRowId}
                        onEditRow={(item) => setEditingRowId(item.id)}
                        onSaveRow={handleSaveRow}
                        onCancelRow={() => setEditingRowId(null)}
                        buttonSpace={
                            canEditQualifications && !isEditingMode ? (
                                <ThemeButton
                                    theme="institutional"
                                    icon={Edit3}
                                    size="sm"
                                    onClick={() => setIsEditingMode(true)}
                                >
                                    Capturar Calificaciones
                                </ThemeButton>
                            ) : null
                        }
                        onNew={
                            canEditQualifications
                                ? () => setIsEnrollModalOpen(true)
                                : undefined
                        }
                    />
                </div>

                {/* ── Barra Inferior: Panel de Guardado Global ──────────────────────────── */}
                {isEditingMode && canEditQualifications && (
                    <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/95 p-6 shadow-[0_-6px_20px_rgba(23,54,93,0.12)] backdrop-blur-sm">
                        <div className="mx-auto flex w-full max-w-[96rem] items-center justify-end gap-4 sm:px-6 lg:px-8">
                            <ThemeButton
                                theme="outline"
                                icon={X}
                                onClick={() => setIsEditingMode(false)}
                            >
                                Cancelar
                            </ThemeButton>
                            <ThemeButton
                                theme="institutional"
                                icon={Save}
                                onClick={handleSaveGlobal}
                            >
                                Guardar Cambios
                            </ThemeButton>
                        </div>
                    </div>
                )}
            </AuthenticatedLayout>

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
                message={`¿Estás seguro de que deseas dar de baja a ${itemToDelete?.full_name || 'este alumno'} del grupo?`}
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
