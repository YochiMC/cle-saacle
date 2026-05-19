import React, { useEffect } from "react";
import {
    FieldDescription,
    FieldLegend,
    FieldSeparator,
    FieldSet,
} from "@/Components/ui/field";
import SelectForm from "@/components/Forms/SelectForm";
import InputForm from "@/components/Forms/InputForm";
import InputError from "@/Components/ui/InputError";
import BaseResourceModal from "@/Components/ui/BaseResourceModal";

/**
 * GroupModal — Formulario de dominio para la gestión de Grupos.
 *
 * Refactoreado para usar BaseResourceModal, eliminando la duplicación estructural
 * y centrando el archivo en la lógica de negocio y campos del grupo.
 */
export default function GroupModal({
    manager,
    teachers = [],
    levels = [],
    periods = [],
    statuses = [],
    modes = [],
    types = [],
}) {
    if (!manager) return null;

    const {
        formData,
        setFormData,
        submitForm,
        processing,
        errors,
        modales,
        itemEditando,
        handleCloseModal,
    } = manager;

    const isOpen = modales.formulario;
    const titulo = itemEditando
        ? `Editar grupo: ${itemEditando.name}`
        : "Añadir Nuevo Grupo";

    // ── Opciones de selects (Lógica de Dominio) ───────────────────────────────
    const teacherOptions = [
        { value: "none", label: "Sin docente asignado" },
        ...teachers.map((t) => ({
            value: t.id.toString(),
            label: t.full_name,
        })),
    ];

    const levelOptions = levels
        .filter((l) => {
            const programType = l.program_type || "Regular";
            return formData.type === "Programa Egresados"
                ? programType === "Egresados"
                : programType === "Regular";
        })
        .map((l) => ({ value: l.id.toString(), label: l.level_tecnm }));

    const periodOptions = periods.map((p) => ({
        value: p.id.toString(),
        label: p.name,
    }));
    const statusOptions = statuses.map((s) => ({
        value: s.value,
        label: s.label,
    }));

    // ── Efectos reactivos (Lógica de Presentación de Dominio) ──────────────────
    useEffect(() => {
        if (!isOpen) return;

        // Evitar sobrescribir el nivel inicial al abrir el modal de edición
        if (itemEditando && formData.type === itemEditando.type) return;

        // Determinamos si el nivel actual es de tipo "Egresados" para saber si es compatible con el nuevo tipo
        const currentLevel = levels.find(
            (l) => l.id.toString() === formData.level_id,
        );
        const isCurrentLevelEgresados =
            currentLevel?.program_type === "Egresados";
        const isNewTypeEgresados = formData.type === "Programa Egresados";

        if (isNewTypeEgresados) {
            // Si cambiamos a Egresados y el nivel actual no lo es, forzamos el nivel único de egresados
            if (!isCurrentLevelEgresados) {
                const nivelEgresados = levels.find(
                    (l) => l.program_type === "Egresados",
                );
                if (nivelEgresados)
                    setFormData("level_id", nivelEgresados.id.toString());
            }
        } else {
            // Si cambiamos a cualquier tipo Regular y el nivel actual es de Egresados,
            // debemos limpiarlo porque ya no es válido para este tipo de grupo.
            // SI EL NIVEL YA ERA REGULAR, SE MANTIENE (Corrige bug de pérdida de nivel).
            if (isCurrentLevelEgresados) {
                setFormData("level_id", "");
            }
        }
    }, [formData.type, levels, isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        if (itemEditando && formData.mode === itemEditando.mode) return;

        if (formData.mode === "Presencial") setFormData("meeting_link", "");
        else if (formData.mode === "Virtual") setFormData("classroom", "");
    }, [formData.mode]);

    // Configuración de la advertencia para cambios de tipo (DIP)
    const confirmConfig = {
        isOpen: modales.confirmTypeChange,
        onClose: () =>
            manager.setModales((prev) => ({
                ...prev,
                confirmTypeChange: false,
            })),
        onConfirm: manager.confirmSubmit,
        title: "Atención: Cambio de Tipo de Grupo",
        message:
            "Has cambiado el tipo de grupo. Si confirmas este cambio, se reiniciarán a cero TODAS las calificaciones de los alumnos inscritos para adaptarse a las nuevas unidades de evaluación. ¿Deseas continuar y guardar de todos modos?",
        confirmText: "Sí, reiniciar y guardar",
        variant: "warning",
    };

    return (
        <BaseResourceModal
            isOpen={isOpen}
            onClose={() => handleCloseModal("formulario")}
            title={titulo}
            onSubmit={submitForm}
            processing={processing}
            errors={errors}
            confirmConfig={confirmConfig}
            maxWidth="2xl"
        >
            {/* SECCIÓN 1: INFORMACIÓN GENERAL */}
            <FieldSet>
                <FieldLegend>Datos del Grupo</FieldLegend>
                <FieldDescription>
                    Configuración base para apertura del grupo.
                </FieldDescription>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-1">
                        <SelectForm
                            options={modes}
                            label="Modalidad"
                            selectId="mode"
                            placeholder="Selecciona una modalidad"
                            value={formData.mode}
                            onValueChange={(v) => setFormData("mode", v)}
                            required
                        />
                        <InputError message={errors.mode} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <SelectForm
                            options={types}
                            label="Tipo"
                            selectId="type"
                            placeholder="Selecciona un tipo"
                            value={formData.type}
                            onValueChange={(v) => setFormData("type", v)}
                            required
                        />
                        <InputError message={errors.type} />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4">
                    <div className="flex flex-col gap-1">
                        <InputForm
                            label="Capacidad (estudiantes)"
                            type="number"
                            inputId="capacity"
                            placeholder="Ej. 25"
                            description="Número máximo de estudiantes del grupo."
                            value={formData.capacity}
                            onChange={(e) =>
                                setFormData("capacity", e.target.value)
                            }
                            required
                            min="1"
                            max="999"
                        />
                        <InputError message={errors.capacity} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <SelectForm
                            options={statusOptions}
                            label="Estado"
                            selectId="status"
                            placeholder="Selecciona un estado"
                            value={formData.status}
                            onValueChange={(v) => setFormData("status", v)}
                            required
                        />
                        <InputError message={errors.status} />
                    </div>
                </div>
            </FieldSet>

            <FieldSeparator />

            {/* SECCIÓN 2: HORARIO Y UBICACIÓN */}
            <FieldSet>
                <FieldLegend>Horario y Sede</FieldLegend>
                <FieldDescription>
                    Define horario, aula o enlace de clase.
                </FieldDescription>

                <div className="grid grid-cols-1 gap-4">
                    <div className="flex flex-col gap-1">
                        <InputForm
                            label="Horario"
                            inputId="schedule"
                            placeholder="Ej. Lunes y Miércoles 16:00 - 18:00"
                            description="Incluye días y rango de horas."
                            value={formData.schedule}
                            onChange={(e) =>
                                setFormData("schedule", e.target.value)
                            }
                            required
                            maxLength="255"
                        />
                        <InputError message={errors.schedule} />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4">
                    <div className="flex flex-col gap-1">
                        <InputForm
                            label="Aula"
                            inputId="classroom"
                            required={false}
                            disabled={formData.mode === "Virtual"}
                            placeholder="Ej. B-203"
                            description="Opcional"
                            value={formData.classroom}
                            onChange={(e) =>
                                setFormData("classroom", e.target.value)
                            }
                            maxLength="255"
                        />
                        <InputError message={errors.classroom} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <InputForm
                            label="Enlace de reunión (URL)"
                            inputId="meeting_link"
                            required={false}
                            disabled={formData.mode === "Presencial"}
                            placeholder="https://..."
                            description="Opcional para grupos virtuales o híbridos."
                            value={formData.meeting_link}
                            onChange={(e) =>
                                setFormData("meeting_link", e.target.value)
                            }
                            type="url"
                            maxLength="255"
                        />
                        <InputError message={errors.meeting_link} />
                    </div>
                </div>
            </FieldSet>

            <FieldSeparator />

            {/* SECCIÓN 3: ASIGNACIONES */}
            <FieldSet>
                <FieldLegend>Asignaciones</FieldLegend>
                <FieldDescription>
                    Vincula periodo, nivel y docente responsable.
                </FieldDescription>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="flex flex-col gap-1">
                        <SelectForm
                            options={periodOptions}
                            label="Periodo"
                            selectId="period_id"
                            placeholder="Selecciona un periodo"
                            value={formData.period_id}
                            onValueChange={(v) => setFormData("period_id", v)}
                            required
                        />
                        <InputError message={errors.period_id} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <SelectForm
                            options={levelOptions}
                            label="Nivel"
                            selectId="level_id"
                            placeholder="Selecciona un nivel"
                            value={formData.level_id}
                            disabled={formData.type === "Programa Egresados"}
                            onValueChange={(v) => setFormData("level_id", v)}
                            required
                        />
                        <InputError message={errors.level_id} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <SelectForm
                            options={teacherOptions}
                            label="Docente"
                            selectId="teacher_id"
                            placeholder="Selecciona un docente"
                            value={formData.teacher_id}
                            onValueChange={(v) => setFormData("teacher_id", v)}
                        />
                        <InputError message={errors.teacher_id} />
                    </div>
                </div>
            </FieldSet>
        </BaseResourceModal>
    );
}
