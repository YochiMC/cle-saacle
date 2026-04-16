import React from "react";
import EnrollStudentModal from "@/Components/SharedModals/EnrollStudentModal";
import ConfirmModal from '@/Components/ui/ConfirmModal';
import ModalAlert from "@/Components/ui/ModalAlert";

/**
 * Componente: GroupModals
 * 
 * Orquestador de todos los diálogos y confirmaciones del módulo de grupos.
 */
const GroupModals = ({ 
    isEnrollModalOpen, 
    setIsEnrollModalOpen, 
    availableStudents, 
    handleEnroll, 
    itemToDelete, 
    setItemToDelete, 
    confirmDelete, 
    confirmModal, 
    setConfirmModal, 
    confirmSave, 
    flashModal, 
    closeFlashModal 
}) => {
    return (
        <>
            {/* 1. Modal de Inscripción de Alumnos */}
            <EnrollStudentModal
                show={isEnrollModalOpen}
                onClose={() => setIsEnrollModalOpen(false)}
                availableStudents={availableStudents}
                onEnroll={handleEnroll}
            />

            {/* 2. Modal para De-matriculación Individual */}
            <ConfirmModal
                isOpen={itemToDelete !== null}
                onClose={() => setItemToDelete(null)}
                onConfirm={confirmDelete}
                title="Dar de baja alumno"
                message={`¿Estás seguro de que deseas dar de baja a ${itemToDelete?.full_name || 'este alumno'} del grupo?`}
                confirmText="Sí, dar de baja"
                variant="warning"
            />

            {/* 3. Modal Universal de Confirmación (Guardado Row/Global, Cierre, Esquema) */}
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

            {/* 4. Modal de Feedback (Flash Messages) */}
            <ModalAlert
                isOpen={flashModal.isOpen}
                onClose={closeFlashModal}
                type={flashModal.type}
                title={flashModal.title}
                message={flashModal.message}
            />
        </>
    );
};

export default React.memo(GroupModals);
