import React from "react";
import EnrollStudentModal from "@/Components/SharedModals/EnrollStudentModal";
import ConfirmModal from "@/Components/ui/ConfirmModal";
import ModalAlert from "@/Components/ui/ModalAlert";

/**
 * Componente: ExamModals
 * 
 * Agrupa todos los modales vinculados a la gestión de alumnos y calificaciones en un examen.
 */
const ExamModals = ({ 
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
            {/* 1. Modal para Inscripción de Alumnos Disponibles */}
            <EnrollStudentModal
                show={isEnrollModalOpen}
                onClose={() => setIsEnrollModalOpen(false)}
                availableStudents={availableStudents}
                onEnroll={handleEnroll}
            />

            {/* 2. Confirmación de de-matriculación individual */}
            <ConfirmModal
                isOpen={itemToDelete !== null}
                onClose={() => setItemToDelete(null)}
                onConfirm={confirmDelete}
                title="Dar de baja alumno"
                message={`¿Estás seguro de que deseas dar de baja a ${itemToDelete?.full_name || "este alumno"} del examen?`}
                confirmText="Sí, dar de baja"
                variant="warning"
            />

            {/* 3. Confirmación Universal de Guardado (Bulk/Row) y Cierre de Examen */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, type: null, itemData: null })}
                onConfirm={confirmSave}
                title={
                    confirmModal.type === 'global' ? "Confirmar guardado masivo" : 
                    confirmModal.type === 'close' ? "Cerrar Examen Definitivamente" :
                    "Guardar calificación"
                }
                message={
                    confirmModal.type === 'global' ? "¿Deseas guardar las calificaciones de todos los alumnos?" :
                    confirmModal.type === 'close' ? "Asegúrate de que todas las calificaciones hayan sido capturadas y validadas correctamente. Al cerrar el examen, no podrás realizar más modificaciones y se dará por concluido. Esta acción es irreversible." :
                    "¿Estás seguro de guardar la calificación de este alumno?"
                }
                confirmText={
                    confirmModal.type === 'close' ? "Sí, cerrar examen" : "Sí, guardar"
                }
                cancelText="Cancelar"
                variant="warning"
            />

            {/* 4. Feedback de Operación (Flash Alert) */}
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

export default React.memo(ExamModals);
