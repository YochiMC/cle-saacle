import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ResourceDashboard from "@/Components/ResourceDashboard";
import { usePermission } from "@/Utils/auth";
import ThemeButton from "@/Components/ThemeButton";
import { Check, X, Save, Edit3 } from "lucide-react";
import { router } from "@inertiajs/react";

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
export default function GroupView({ auth, grupo, enrolledStudents = [] }) {
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

    // ── Callbacks de Edición Individual ────────────────────────────────────────────
    const handleEditRow = (item) => {
        setEditingRowId(item.id);
    };

    const handleSaveRow = (item) => {
        console.log("Guardando fila", item);
        const rowToSave = localData.find(row => row.id === item.id);
        if (rowToSave && rowToSave.qualification_id) {
            router.patch(route('qualifications.update', rowToSave.qualification_id), rowToSave, {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingRowId(null);
                },
                onError: (errors) => {
                    console.error("Error al guardar fila:", errors);
                }
            });
        } else {
            console.warn("No se encontró el qualification_id para la fila.");
            setEditingRowId(null);
        }
    };

    const handleCancelRow = () => {
        setEditingRowId(null);
    };

    // ── Callbacks de Edición Global ────────────────────────────────────────────────
    const handleCellChange = (fieldKey, rowId, newValue) => {
        setLocalData((prev) =>
            prev.map((row) =>
                row.id === rowId ? { ...row, [fieldKey]: newValue } : row
            )
        );
    };

    const handleSaveGlobal = () => {
        console.log("Guardando cambios globales...");
        router.patch(route('qualifications.bulk-update'), { qualifications: localData }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditingMode(false);
            },
            onError: (errors) => {
                console.error("Errores al guardar", errors);
            }
        });
    };

    // Lógica de Roles: Configuramos las columnas editables dinámicamente.
    // Usamos EXACTAMENTE las keys devueltas por el StudentQualificationResource.
    // Cuando una fila está en edición, todas sus columnas configuradas aquí se vuelven editables.
    const editableColumns = canEditQualifications
        ? ["unit_1", "unit_2", "is_approved", "is_left"]
        : [];

    // Definimos las columnas que NO deseamos que se rendericen en TanStack Table durante modo lectura.
    // Usamos EXACTAMENTE las keys del recurso
    const restrictedColumns = [];

    // Formateamos las opciones de vista para el ResourceDashboard
    const viewOptions = [{ value: "alumnos", label: "Alumnos Inscritos" }];

    // DataMap inyecta los alumnos que ahora vienen listos desde el API Resource de Laravel
    const dataMap = {
        alumnos: localData,
    };

    return (
        <AuthenticatedLayout
            user={auth?.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Gestión de Grupo: {grupo?.name || "N/A"}
                </h2>
            }
        >
            <div className="py-12 pb-32">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* ── Barra Superior: Botón "Capturar Calificaciones" ──────────────────── */}
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

                    {/* ── Dashboard Principal ────────────────────────────────────────────── */}
                    <ResourceDashboard
                        title={`Calificaciones del Grupo: ${grupo?.name || "N/A"}`}
                        dataMap={dataMap}
                        viewOptions={viewOptions}
                        deleteRoute={route("groups.bulk-delete")}
                        editableColumns={editableColumns}
                        restrictedColumns={restrictedColumns}
                        hiddenColumns={{ qualification_id: false }}
                        isTeacherMode={canEditQualifications && isEditingMode}
                        onCellChange={handleCellChange}
                        editingRowId={editingRowId}
                        onEditRow={(item) => setEditingRowId(item.id)}
                        onSaveRow={handleSaveRow}
                        onCancelRow={() => setEditingRowId(null)}
                    />
                </div>
            </div>

            {/* ── Barra Inferior: Panel de Guardado Global ──────────────────────────── */}
            {isEditingMode && canEditQualifications && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-6">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 flex justify-end gap-4">
                        <ThemeButton
                            theme="outline"
                            icon={X}
                            onClick={() => setIsEditingMode(false)}
                        >
                            Cancelar
                        </ThemeButton>
                        <ThemeButton
                            theme="success"
                            icon={Save}
                            onClick={handleSaveGlobal}
                        >
                            Guardar Cambios
                        </ThemeButton>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
