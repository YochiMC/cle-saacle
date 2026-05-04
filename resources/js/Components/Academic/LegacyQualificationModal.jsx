/**
 * LegacyQualificationModal
 *
 * Modal CRUD para gestionar calificaciones históricas (OG) de un alumno.
 * Funciona en modo "Crear" (qualification = null) o "Editar" (qualification = objeto).
 *
 * @param {boolean}  show           – Controla la visibilidad del modal.
 * @param {Function} onClose        – Callback al cerrar el modal.
 * @param {number}   userId         – ID del usuario (para construir la ruta anidada).
 * @param {Array}    levels         – Catálogo [{id, level_tecnm}] para el select.
 * @param {Object|null} qualification – null → modo crear | objeto → modo editar.
 */
import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import ThemeButton from '@/Components/ui/ThemeButton';
import SelectForm from '@/Components/Forms/SelectForm';
import InputForm from '@/Components/Forms/InputForm';

export default function LegacyQualificationModal({
    show,
    onClose,
    userId,
    levels = [],
    qualification = null,
}) {
    const isEditing = qualification !== null;

    const { data, setData, post, put, processing, errors, reset } = useForm({
        level_id:    '',
        period:      '',
        final_grade: '',
    });

    // Sincronizar datos cuando cambia el registro (modo editar) o se abre en blanco (modo crear)
    useEffect(() => {
        if (isEditing) {
            setData({
                level_id:    String(qualification.level_id),
                period:      qualification.period,
                final_grade: String(qualification.final_grade),
            });
        } else {
            reset();
        }
    }, [qualification, show]);   // eslint-disable-line react-hooks/exhaustive-deps

    const levelOptions = levels.map((l) => ({
        value: String(l.id),
        label: l.level_tecnm,
    }));

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const options = { onSuccess: handleClose };

        if (isEditing) {
            put(route('legacy-qualifications.update', [userId, qualification.id]), options);
        } else {
            post(route('legacy-qualifications.store', userId), options);
        }
    };

    return (
        <Modal show={show} onClose={handleClose} maxWidth="sm">
            <div className="p-6">
                <h2 className="text-xl font-semibold mb-6 text-[#17365D]">
                    {isEditing ? 'Editar Calificación Histórica' : 'Añadir Calificación Histórica'}
                </h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                    {/* Nivel académico */}
                    <SelectForm
                        label="Nivel"
                        selectId="lq-level"
                        placeholder="Selecciona un nivel..."
                        options={levelOptions}
                        value={data.level_id}
                        onValueChange={(val) => setData('level_id', val)}
                    />
                    {errors.level_id && (
                        <p className="text-sm text-red-600 -mt-2">{errors.level_id}</p>
                    )}

                    {/* Periodo textual */}
                    <InputForm
                        label="Periodo"
                        inputId="lq-period"
                        placeholder="Ej. Ene-Jun 2023"
                        value={data.period}
                        onChange={(e) => setData('period', e.target.value)}
                        required
                    />
                    {errors.period && (
                        <p className="text-sm text-red-600 -mt-2">{errors.period}</p>
                    )}

                    {/* Calificación final */}
                    <InputForm
                        label="Calificación Final"
                        inputId="lq-grade"
                        type="number"
                        placeholder="0 – 100"
                        value={data.final_grade}
                        onChange={(e) => setData('final_grade', e.target.value)}
                        required
                        min={0}
                        max={100}
                        step="1"
                    />
                    {errors.final_grade && (
                        <p className="text-sm text-red-600 -mt-2">{errors.final_grade}</p>
                    )}

                    {/* Acciones */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <ThemeButton
                            type="button"
                            theme="outline"
                            onClick={handleClose}
                            disabled={processing}
                        >
                            Cancelar
                        </ThemeButton>
                        <ThemeButton
                            type="submit"
                            theme="institutional"
                            disabled={processing}
                        >
                            {isEditing ? 'Guardar Cambios' : 'Añadir'}
                        </ThemeButton>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
