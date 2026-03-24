import React, { useState, useMemo } from "react";
import Modal from "@/Components/Modal";
import ThemeInput from "@/Components/ThemeInput";
import ThemeButton from "@/Components/ThemeButton";
import { Checkbox } from "@/Components/ui/checkbox";

export default function EnrollStudentModal({ show, onClose, availableStudents = [], onEnroll }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedIds, setSelectedIds] = useState([]);

    const filteredStudents = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return availableStudents;
        return availableStudents.filter(
            (s) =>
                s.full_name?.toLowerCase().includes(term) ||
                s.num_control?.toLowerCase().includes(term)
        );
    }, [availableStudents, searchTerm]);

    const toggleStudent = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleClose = () => {
        setSearchTerm("");
        setSelectedIds([]);
        onClose();
    };

    return (
        <Modal show={show} onClose={handleClose} maxWidth="lg">
            <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-[#17365D]">Inscribir Alumnos</h2>

                <ThemeInput
                    placeholder="Buscar por nombre o matrícula..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <div className="max-h-80 overflow-y-auto border border-slate-200 rounded-md p-2 mt-4 flex flex-col gap-1">
                    {filteredStudents.length === 0 ? (
                        <p className="text-center text-slate-500 py-4 text-sm">
                            No se encontraron alumnos disponibles.
                        </p>
                    ) : (
                        filteredStudents.map((student) => (
                            <label
                                key={student.id}
                                className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-md cursor-pointer border border-transparent select-none"
                            >
                                <Checkbox
                                    checked={selectedIds.includes(student.id)}
                                    onCheckedChange={() => toggleStudent(student.id)}
                                />
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-slate-800">{student.full_name}</span>
                                    <span className="text-xs text-slate-500">{student.num_control}</span>
                                </div>
                            </label>
                        ))
                    )}
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                    <ThemeButton theme="outline" onClick={handleClose}>
                        Cancelar
                    </ThemeButton>
                    <ThemeButton
                        theme="institutional"
                        onClick={() => {
                            onEnroll(selectedIds);
                            // handleClose(); will be triggered by onSuccess closing the modal in parent
                        }}
                        disabled={selectedIds.length === 0}
                    >
                        Inscribir Seleccionados
                    </ThemeButton>
                </div>
            </div>
        </Modal>
    );
}
