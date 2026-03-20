import React, { memo } from "react";
import Modal from "@/Components/ui/ModalAlert"; // O utiliza el Modal existente
import ModalBreeze from "@/Components/Modal";

const ExamDetailsModal = memo(({ examen, onClose }) => {
    if (!examen) return null;

    return (
        <ModalBreeze show={!!examen} onClose={onClose} maxWidth="md">
            <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Detalles del Examen</h2>
                
                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-gray-500 font-semibold">Nombre del Examen</p>
                        <p className="text-lg text-gray-900">{examen.nombre_examen}</p>
                    </div>

                    

                    <div>
                        <p className="text-sm text-gray-500 font-semibold">Estudiante ID</p>
                        <p className="text-gray-900">
                            {examen.student ? `${examen.student.name} ${examen.student.last_name || ''}` : examen.student_id}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500 font-semibold">Fecha de Aplicación</p>
                        <p className="text-gray-900">{examen.fecha_aplicacion}</p>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </ModalBreeze>
    );
});

export default ExamDetailsModal;
