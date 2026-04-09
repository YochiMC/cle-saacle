import React, { useState, useMemo } from "react";
import Modal from "@/Components/Modal";
import ThemeInput from "@/Components/ThemeInput";
import ThemeButton from "@/Components/ThemeButton";
import { Checkbox } from "@/Components/ui/checkbox";

/**
 * EnrollStudentModal — Modal de selección de alumnos para inscripción masiva.
 *
 * Componente compartido movido a `SharedModals` para ser reutilizado por
 * ambos módulos: Grupos (`GroupView`) y Exámenes (cuando aplique).
 *
 * Permite buscar alumnos por nombre o número de control y seleccionar
 * múltiples de ellos antes de confirmar la inscripción.
 *
 * @param {Object}   props
 * @param {boolean}  props.show                 - Controla la visibilidad del modal.
 * @param {Function} props.onClose              - Callback al cerrar el modal.
 * @param {Array}    [props.availableStudents]  - Lista de alumnos disponibles para inscribir.
 * @param {Function} props.onEnroll             - Callback que recibe el array de IDs seleccionados.
 */
export default function EnrollStudentModal({
    show,
    onClose,
    availableStudents = [],
    onEnroll,
}) {
    const [terminoBusqueda, setTerminoBusqueda] = useState("");
    const [idsSeleccionados, setIdsSeleccionados] = useState([]);

    // Filtrado reactivo y memoizado de alumnos disponibles
    const alumnosFiltrados = useMemo(() => {
        const termino = terminoBusqueda.toLowerCase().trim();
        if (!termino) return availableStudents;
        return availableStudents.filter(
            (alumno) =>
                alumno.full_name?.toLowerCase().includes(termino) ||
                alumno.num_control?.toLowerCase().includes(termino),
        );
    }, [availableStudents, terminoBusqueda]);

    /** Alterna la selección de un alumno por su ID. */
    const toggleAlumno = (id) => {
        setIdsSeleccionados((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
        );
    };

    /** Limpia el estado interno al cerrar el modal. */
    const handleClose = () => {
        setTerminoBusqueda("");
        setIdsSeleccionados([]);
        onClose();
    };

    return (
        <Modal show={show} onClose={handleClose} maxWidth="lg">
            <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-[#17365D]">
                    Inscribir Alumnos
                </h2>

                <ThemeInput
                    placeholder="Buscar por nombre o matrícula..."
                    value={terminoBusqueda}
                    onChange={(e) => setTerminoBusqueda(e.target.value)}
                />

                {/* Lista de alumnos con checkbox individual */}
                <div className="max-h-80 overflow-y-auto border border-slate-200 rounded-md p-2 mt-4 flex flex-col gap-1">
                    {alumnosFiltrados.length === 0 ? (
                        <p className="text-center text-slate-500 py-4 text-sm">
                            No se encontraron alumnos disponibles.
                        </p>
                    ) : (
                        alumnosFiltrados.map((alumno) => (
                            <label
                                key={alumno.id}
                                className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-md cursor-pointer border border-transparent select-none"
                            >
                                <Checkbox
                                    checked={idsSeleccionados.includes(alumno.id)}
                                    onCheckedChange={() => toggleAlumno(alumno.id)}
                                />
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-slate-800">
                                        {alumno.full_name}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        {alumno.num_control}
                                    </span>
                                </div>
                            </label>
                        ))
                    )}
                </div>

                {/* Acciones del modal */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                    <ThemeButton theme="outline" onClick={handleClose}>
                        Cancelar
                    </ThemeButton>
                    <ThemeButton
                        theme="institutional"
                        onClick={() => onEnroll(idsSeleccionados)}
                        disabled={idsSeleccionados.length === 0}
                    >
                        Inscribir Seleccionados
                    </ThemeButton>
                </div>
            </div>
        </Modal>
    );
}
