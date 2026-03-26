/**
 * GroupModal
 *
 * Modal dual de creación y edición para grupos. Contiene un formulario organizado
 * en tres secciones: Datos del Grupo, Horario y Sede, y Asignaciones.
 * Opera en modo creación (POST /groups) cuando no se pasa `grupoToEdit`,
 * y en modo edición (PUT /groups/{id}) cuando sí se pasa.
 *
 * @component
 *
 * @param {boolean}       [show=false]    - Controla la visibilidad del modal.
 * @param {Function}      onClose         - Callback invocado al cerrar o cancelar el modal.
 * @param {string}        [title]         - Título del encabezado del modal.
 * @param {Object|null}   [grupoToEdit]   - Grupo a editar. Si es null, activa el modo creación.
 * @param {Array}         teachers        - Listado de docentes: [{ id, full_name }].
 * @param {Array}         levels          - Listado de niveles: [{ id, level_tecnm }].
 * @param {Array}         periods         - Listado de periodos: [{ id, name }].
 *
 * @example
 * // Modo creación
 * <GroupModal show={isOpen} onClose={onClose} grupoToEdit={null} ... />
 *
 * // Modo edición
 * <GroupModal show={isOpen} onClose={onClose} grupoToEdit={grupo} ... />
 */

import FormModal from "@/Components/Forms/FormModal";
import {
    FieldDescription,
    FieldGroup,
    FieldLegend,
    FieldSeparator,
    FieldSet,
} from "@/Components/ui/field";
import SelectForm from "@/components/Forms/SelectForm";
import InputForm from "@/components/Forms/InputForm";
import ButtonForm from "@/components/Forms/ButtonForm";
import { useForm } from "@inertiajs/react";
import { useEffect } from "react";

export default function GroupModal({
    show = false,
    onClose,
    title,
    grupoToEdit = null,
    teachers = [],
    levels = [],
    periods = [],
    statuses = [],
    modes = [],
    types = [],
}) {
    const modoEdicion = grupoToEdit !== null;

    const { data, setData, post, put, processing, errors, reset, transform } =
        useForm({
            name: "",
            mode: "",
            type: "",
            capacity: "",
            schedule: "",
            classroom: "",
            meeting_link: "",
            status: "Activo",
            period_id: "",
            teacher_id: "none",
            level_id: "",
        });

    // Mapeamos las opciones que vienen de la base de datos para los componentes SelectForm
    const teacherOptions = [
        { value: "none", label: "Sin docente asignado" },
        ...teachers.map((t) => ({
            value: t.id.toString(),
            label: t.full_name,
        })),
    ];
    // We make the filter robust to avoid empty selects if DB data is inconsistent
    const levelOptions = levels
        .filter(l => {
            // Safe default: assume 'Regular' if program_type is missing in DB
            const currentLevelProgramType = l.program_type || 'Regular'; 
            
            if (data.type === 'Programa Egresados') {
                return currentLevelProgramType === 'Egresados';
            }
            
            // For Regular, Intensivo, or undefined types, show Regular levels
            return currentLevelProgramType === 'Regular';
        })
        .map((l) => ({
            value: l.id.toString(),
            label: l.level_tecnm,
        }));
    const periodOptions = periods.map((p) => ({
        value: p.id.toString(),
        label: p.name,
    }));
    const statusOptions = statuses.map((s) => ({
        value: s.value,
        label: s.label,
    }));

    useEffect(() => {
        if (show) {
            if (grupoToEdit) {
                setData({
                    name: grupoToEdit.name ?? "",
                    mode: grupoToEdit.mode ?? "",
                    type: grupoToEdit.type ?? "",
                    capacity: grupoToEdit.capacity?.toString() ?? "",
                    schedule: grupoToEdit.schedule ?? "",
                    classroom: grupoToEdit.classroom ?? "",
                    meeting_link: grupoToEdit.meeting_link ?? "",
                    status: grupoToEdit.status ?? "Activo",
                    period_id: grupoToEdit.period_id?.toString() ?? "",
                    teacher_id: grupoToEdit.teacher_id
                        ? grupoToEdit.teacher_id.toString()
                        : "none",
                    level_id:
                        (
                            grupoToEdit.level_id || grupoToEdit.level?.id
                        )?.toString() ?? "",
                });
            } else {
                reset();
            }
        }
    }, [show, grupoToEdit]);

    // Limpieza o auto-selección de nivel al cambiar el tipo
    useEffect(() => {
        if (show) {
            // Evitar limpiar el nivel durante la carga inicial en modo edición
            if (grupoToEdit && data.type === grupoToEdit.type) {
                return;
            }

            if (data.type === 'Programa Egresados') {
                const egresadosLevel = levels.find(l => l.program_type === 'Egresados');
                if (egresadosLevel) {
                    setData("level_id", egresadosLevel.id.toString());
                }
            } else {
                setData("level_id", "");
            }
        }
    }, [data.type]);

    // Limpieza de aula/enlace al cambiar la modalidad
    useEffect(() => {
        if (show) {
            // Evitar limpiar durante la carga inicial en modo edición
            if (grupoToEdit && data.mode === grupoToEdit.mode) {
                return;
            }

            if (data.mode === 'Presencial') {
                setData('meeting_link', '');
            } else if (data.mode === 'Virtual') {
                setData('classroom', '');
            }
        }
    }, [data.mode]);

    const submit = (e) => {
        e.preventDefault();

        // Nos aseguramos de enviar la capacidad como número entero y procesamos el docente seleccionado
        transform((currentData) => ({
            ...currentData,
            capacity: parseInt(currentData.capacity) || 0,
            teacher_id:
                currentData.teacher_id === "none"
                    ? null
                    : currentData.teacher_id,
        }));

        const onSuccess = () => {
            reset();
            onClose();
        };

        if (modoEdicion) {
            put(`/groups/${grupoToEdit.id}`, { onSuccess });
        } else {
            post("/groups", { onSuccess });
        }
    };

    return (
        <FormModal title={title} show={show} onClose={onClose}>
            <form onSubmit={submit}>
                {Object.keys(errors).length > 0 && (
                    <div className="p-4 mb-4 text-sm text-white bg-red-500 rounded-lg">
                        <strong>Errores detectados:</strong>
                        <ul className="ml-5 list-disc">
                            {Object.values(errors).map((err, i) => (
                                <li key={i}>{err}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <FieldGroup>
                    {/* --- SECCIÓN 1: INFORMACIÓN GENERAL --- */}
                    <FieldSet>
                        <FieldLegend>Datos del Grupo</FieldLegend>
                        <FieldDescription>
                            Configuración base para apertura del grupo.
                        </FieldDescription>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <SelectForm
                                options={modes}
                                label="Modalidad"
                                selectId="mode"
                                placeholder="Selecciona una modalidad"
                                value={data.mode}
                                onValueChange={(v) => setData("mode", v)}
                            />
                            <SelectForm
                                options={types}
                                label="Tipo"
                                selectId="type"
                                placeholder="Selecciona un tipo"
                                value={data.type}
                                onValueChange={(v) => setData("type", v)}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <InputForm
                                label="Capacidad (estudiantes)"
                                type="number"
                                inputId="capacity"
                                placeholder="Ej. 25"
                                description="Número máximo de estudiantes del grupo."
                                value={data.capacity}
                                onChange={(e) =>
                                    setData("capacity", e.target.value)
                                }
                            />
                            <SelectForm
                                options={statusOptions}
                                label="Estado"
                                selectId="status"
                                placeholder="Selecciona un estado"
                                value={data.status}
                                onValueChange={(v) => setData("status", v)}
                            />
                        </div>
                    </FieldSet>

                    <FieldSeparator />

                    {/* --- SECCIÓN 2: HORARIO Y UBICACIÓN --- */}
                    <FieldSet>
                        <FieldLegend>Horario y Sede</FieldLegend>
                        <FieldDescription>
                            Define horario, aula o enlace de clase.
                        </FieldDescription>

                        <div className="grid grid-cols-1 gap-4">
                            <InputForm
                                label="Horario"
                                inputId="schedule"
                                placeholder="Ej. Lunes y Miércoles 16:00 - 18:00"
                                description="Incluye días y rango de horas."
                                value={data.schedule}
                                onChange={(e) =>
                                    setData("schedule", e.target.value)
                                }
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4">
                            <InputForm
                                label="Aula"
                                inputId="classroom"
                                required={false}
                                disabled={data.mode === 'Virtual'}
                                placeholder="Ej. B-203"
                                description="Opcional"
                                value={data.classroom}
                                onChange={(e) =>
                                    setData("classroom", e.target.value)
                                }
                            />
                            <InputForm
                                label="Enlace de reunión (URL)"
                                inputId="meeting_link"
                                required={false}
                                disabled={data.mode === 'Presencial'}
                                placeholder="https://..."
                                description="Opcional para grupos virtuales o híbridos."
                                value={data.meeting_link}
                                onChange={(e) =>
                                    setData("meeting_link", e.target.value)
                                }
                            />
                        </div>
                    </FieldSet>

                    <FieldSeparator />

                    {/* --- SECCIÓN 3: ASIGNACIONES --- */}
                    <FieldSet>
                        <FieldLegend>Asignaciones</FieldLegend>
                        <FieldDescription>
                            Vincula periodo, nivel y docente responsable.
                        </FieldDescription>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <SelectForm
                                options={periodOptions}
                                label="Periodo"
                                selectId="period_id"
                                placeholder="Selecciona un periodo"
                                value={data.period_id}
                                onValueChange={(v) => setData("period_id", v)}
                            />
                            <SelectForm
                                options={levelOptions}
                                label="Nivel"
                                selectId="level_id"
                                placeholder="Selecciona un nivel"
                                value={data.level_id}
                                disabled={data.type === 'Programa Egresados'}
                                onValueChange={(v) => setData("level_id", v)}
                            />
                            <SelectForm
                                options={teacherOptions}
                                label="Docente"
                                selectId="teacher_id"
                                placeholder="Selecciona un docente"
                                value={data.teacher_id}
                                onValueChange={(v) => setData("teacher_id", v)}
                            />
                        </div>
                    </FieldSet>

                    <ButtonForm
                        onCancel={onClose}
                        isLoading={processing}
                        tone="institutional"
                    />
                </FieldGroup>
            </form>
        </FormModal>
    );
}
