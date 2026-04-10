import React, { useState, useEffect, useMemo } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ResourceDashboard from "@/Components/ResourceDashboard";
import { usePermission } from "@/Utils/auth";
import ThemeButton from "@/Components/ThemeButton";
import Dropdown from "@/Components/Dropdown";
import { X, Save, Edit3, Settings } from "lucide-react";
import { router } from "@inertiajs/react";
import EnrollStudentModal from "@/Components/SharedModals/EnrollStudentModal";
import ConfirmModal from '@/Components/ConfirmModal';
import ModalAlert from "@/Components/ui/ModalAlert";
import useFlashAlert from "@/Hooks/useFlashAlert";

const METADATA_KEYS = new Set([
    "id",
    "full_name",
    "matricula",
    "gender",
    "semester",
    "qualification_id",
    "final_average",
    "is_approved",
    "is_left",
]);

const getUnitKeysFromRows = (grupo) => {
    // Regla estricta para Egresados
    if (grupo?.type === 'Programa Egresados') {
        return ['hizo_certificacion', 'a1', 'a2', 'b1'];
    }

    // Regla dinámica basada en la configuración del maestro
    const unitsCount = grupo?.evaluable_units || 0;
    if (unitsCount > 0) {
        return Array.from({ length: unitsCount }, (_, i) => `unit_${i + 1}`);
    }

    return [];
};

const normalizeQualificationRow = (row, grupo) => {
    // Convierte units_breakdown (objeto JSON) en columnas planas para la tabla dinámica.
    const rawBreakdown =
        row?.units_breakdown && typeof row.units_breakdown === "object" && !Array.isArray(row.units_breakdown)
            ? row.units_breakdown
            : {};
            
    const expectedKeys = getUnitKeysFromRows(grupo);
    const unitsBreakdown = {};
    expectedKeys.forEach((key) => {
        unitsBreakdown[key] = rawBreakdown[key] ?? (key === "hizo_certificacion" ? 0 : 0);
    });

    const { units_breakdown: _ignored, ...rest } = row;
    const { final_average, is_approved: _unused1, is_left, ...baseFields } = rest;

    return {
        ...baseFields,
        is_left: is_left ?? false,
        ...unitsBreakdown,
        final_average: final_average !== undefined ? final_average : 0,
    };
};

const buildUnitsBreakdown = (row) =>
    Object.fromEntries(
        Object.entries(row).filter(([key]) => !METADATA_KEYS.has(key))
    );

const calculateAverage = (unitsBreakdown) => {
    const numericValues = Object.entries(unitsBreakdown)
        .filter(([key, v]) => key !== 'hizo_certificacion' && (typeof v === 'number' || (typeof v === 'string' && v !== '' && !isNaN(Number(v)))))
        .map(([, v]) => Number(v));

    if (numericValues.length === 0) return 0;

    // Regla de Negocio: si alguna calificación es menor a 70, el promedio es 'NA'
    const isFailing = numericValues.some(val => val < 70);
    if (isFailing) return 'NA';

    return Math.round(numericValues.reduce((sum, v) => sum + v, 0) / numericValues.length);
};

const serializeQualification = (row) => ({
    // Reconstruye el contrato que espera el backend antes de persistir.
    // is_approved se omite: el backend lo calcula a partir de final_average.
    qualification_id: row.qualification_id,
    units_breakdown: buildUnitsBreakdown(row),
    final_average: row.final_average,
    is_left: !!row.is_left,
});

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

    const normalizedQualificationRows = useMemo(
        () => normalizedEnrolledStudents.map((row) => normalizeQualificationRow(row, grupo)),
        [normalizedEnrolledStudents, grupo]
    );

    // Estado local para los estudiantes y sus calificaciones
    const [localData, setLocalData] = useState(normalizedQualificationRows);

    // Sincronizar el estado local si cambian los props desde servidor
    useEffect(() => {
        setLocalData(normalizedQualificationRows);
    }, [normalizedQualificationRows]);

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

    // Modal de confirmación unificado (save global | save row | cerrar grupo)
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        type: null, // 'global' | 'row' | 'close'
        itemData: null,
    });

    const handleSaveRow = (item) => {
        setConfirmModal({ isOpen: true, type: 'row', itemData: item });
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

    const getRowClassName = (row) => {
        // Si el alumno es baja, se atenúa visualmente (Ghost effect) en lugar de oscurecerse agresivamente.
        return row.original.is_left 
            ? "bg-slate-50/50 text-slate-400 opacity-75 hover:bg-slate-100 transition-colors" 
            : "text-slate-700 bg-white"; 
    };

    const handleCellChange = (fieldKey, rowId, newValue) => {
        setLocalData((prevData) =>
            prevData.map((row) => {
                if (row.id !== rowId) {
                    return row;
                }

                const updatedRow = { ...row, [fieldKey]: newValue };

                if (!METADATA_KEYS.has(fieldKey)) {
                    // Regla local: cualquier cambio de unidad recalcula el promedio.
                    // is_approved es calculado por el backend; no se gestiona en cliente.
                    const unitsBreakdown = buildUnitsBreakdown(updatedRow);
                    updatedRow.final_average = calculateAverage(unitsBreakdown);
                }

                return updatedRow;
            })
        );
    };

    const handleSaveGlobal = () => {
        setConfirmModal({ isOpen: true, type: 'global', itemData: null });
    };

    // ── Ejecutor Maestro (Llamado por el modal de confirmación) ──────────────────
    const confirmSave = () => {
        if (confirmModal.type === 'global') {
            router.patch(
                route('qualifications.bulk-update'),
                { qualifications: localData.map(serializeQualification) },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setIsEditingMode(false);
                        setConfirmModal({ isOpen: false, type: null, itemData: null });
                    },
                    onError: (errors) => console.error('Errores al guardar', errors),
                },
            );
        } else if (confirmModal.type === 'row' && confirmModal.itemData) {
            const rowToSave = localData.find((row) => row.id === confirmModal.itemData.id);
            const qualificationId = rowToSave?.qualification_id;

            if (rowToSave && qualificationId) {
                router.patch(
                    route('qualifications.update', qualificationId),
                    serializeQualification(rowToSave),
                    {
                        preserveScroll: true,
                        onSuccess: () => {
                            setEditingRowId(null);
                            setConfirmModal({ isOpen: false, type: null, itemData: null });
                        },
                        onError: (errors) => console.error('Error al guardar fila:', errors),
                    },
                );
            } else {
                console.warn('No se encontró el qualification_id para la fila.');
                setConfirmModal({ isOpen: false, type: null, itemData: null });
            }
        } else if (confirmModal.type === 'close') {
            router.patch(route('groups.complete', grupo.id), {}, {
                preserveScroll: true,
                onSuccess: () => setConfirmModal({ isOpen: false, type: null, itemData: null }),
                onError: (errors) => console.error('Error al cerrar el grupo:', errors),
            });
        } else if (confirmModal.type === 'units') {
            router.patch(route('groups.update-units', grupo.id), { evaluable_units: Number(confirmModal.itemData) }, {
                preserveScroll: true,
                onSuccess: () => setConfirmModal({ isOpen: false, type: null, itemData: null }),
                onError: (err) => console.error('Error actualizando unidades:', err),
            });
        }
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
    const unitColumns = useMemo(
        () => getUnitKeysFromRows(grupo),
        [grupo],
    );
    const editableColumns = canEditQualifications
        ? [...unitColumns, "is_left"]
        : [];

    // Formateamos las opciones de vista para el ResourceDashboard
    const viewOptions = [{ value: "alumnos", label: "Alumnos Inscritos" }];

    // DataMap inyecta los alumnos que ahora vienen listos desde el API Resource de Laravel
    const dataMap = useMemo(
        () => ({
            alumnos: localData,
        }),
        [localData],
    );

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
                        editAllRows={isEditingMode}
                        hiddenColumns={{ qualification_id: false }}
                        onCellChange={handleCellChange}
                        editingRowId={editingRowId}
                        onEditRow={(item) => setEditingRowId(item.id)}
                        onSaveRow={handleSaveRow}
                        onCancelRow={handleCancelRow}
                        buttonSpace={
                            <div className="flex items-center gap-2">
                                {/* 1. Botón Fantasma (Settings) — Dropdown de Unidades */}
                                {grupo?.type !== "Programa Egresados" && canEditQualifications && !isEditingMode && (
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-300 bg-white text-slate-700 rounded-md hover:bg-slate-50 focus:ring-2 focus:ring-[#1B396A] transition-all font-medium text-sm shadow-sm">
                                                <Settings size={16} />
                                                <span className="hidden sm:inline">Esquema</span>
                                            </button>
                                        </Dropdown.Trigger>
                                        <Dropdown.Content align="right" width="48">
                                            <div className="block px-4 py-2 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                                                Unidades a Evaluar
                                            </div>
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                                                <Dropdown.Button
                                                    key={num}
                                                    onClick={() => setConfirmModal({ isOpen: true, type: 'units', itemData: num })}
                                                    className={grupo?.evaluable_units === num ? 'bg-slate-50 font-bold text-[#1B396A]' : ''}
                                                >
                                                    {num} {num === 1 ? 'Unidad' : 'Unidades'}
                                                </Dropdown.Button>
                                            ))}
                                        </Dropdown.Content>
                                    </Dropdown>
                                )}

                                {/* 2. Botón Cerrar Grupo */}
                                {grupo?.status !== 'completed' && canEditQualifications && !isEditingMode && (
                                    <ThemeButton
                                        theme="danger"
                                        size="sm"
                                        className="whitespace-nowrap"
                                        onClick={() => setConfirmModal({ isOpen: true, type: 'close', itemData: null })}
                                    >
                                        Cerrar Grupo
                                    </ThemeButton>
                                )}

                                {/* 3. Botón Capturar Calificaciones */}
                                {canEditQualifications && !isEditingMode && (
                                    <ThemeButton
                                        theme="institutional"
                                        icon={Edit3}
                                        size="sm"
                                        onClick={() => setIsEditingMode(true)}
                                    >
                                        Capturar Calificaciones
                                    </ThemeButton>
                                )}
                            </div>
                        }
                        onNew={
                            canEditQualifications
                                ? () => setIsEnrollModalOpen(true)
                                : undefined
                        }
                        getRowClassName={getRowClassName}
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

            {/* Modal de confirmación unificado: guardar global, guardar fila, cerrar grupo, cambiar unidades */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, type: null, itemData: null })}
                onConfirm={confirmSave}
                title={
                    confirmModal.type === 'global' ? 'Confirmar guardado masivo' :
                    confirmModal.type === 'close'  ? 'Cerrar Grupo Definitivamente' :
                    confirmModal.type === 'units'  ? 'Cambiar esquema de evaluación' :
                    'Guardar calificación'
                }
                message={
                    confirmModal.type === 'global' ? '¿Deseas guardar las calificaciones de todos los alumnos?' :
                    confirmModal.type === 'close'  ? 'Asegúrate de que todas las calificaciones hayan sido capturadas y validadas correctamente. Al cerrar el grupo, no podrás realizar más modificaciones y se dará por concluido. Esta acción es irreversible.' :
                    confirmModal.type === 'units'  ? `¿Estás seguro de que deseas evaluar ${confirmModal.itemData} ${confirmModal.itemData === 1 ? 'unidad' : 'unidades'}? Esto actualizará la tabla para todos los alumnos del grupo.` :
                    '¿Estás seguro de guardar la calificación de este alumno?'
                }
                confirmText={
                    confirmModal.type === 'close' ? 'Sí, cerrar grupo' :
                    confirmModal.type === 'units' ? 'Sí, cambiar esquema' :
                    'Sí, guardar'
                }
                cancelText="Cancelar"
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
