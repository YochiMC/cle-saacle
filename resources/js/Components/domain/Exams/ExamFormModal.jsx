import React from "react";
import TextInput from "@/Components/ui/TextInput";
import InputLabel from "@/Components/ui/InputLabel";
import SelectForm from "@/components/Forms/SelectForm";
import InputError from "@/Components/ui/InputError";
import BaseResourceModal from "@/Components/ui/BaseResourceModal";
import {
    FieldDescription,
    FieldLegend,
    FieldSeparator,
    FieldSet,
} from "@/Components/ui/field";

/**
 * ExamFormModal — Formulario de dominio para la gestión de Exámenes.
 * 
 * Refactoreado para usar BaseResourceModal, eliminando la duplicación estructural
 * y centrándose únicamente en los campos y la lógica del examen.
 */
export default function ExamFormModal({
    manager,
    periods = [],
    typeOptions = [],
    modeOptions = [],
    teachers = [],
    statuses = [],
}) {
    if (!manager) return null;

    const isOpen = manager.modales.formulario;
    const title = manager.itemEditando
        ? `Editar examen`
        : "Agregar Nuevo Examen";

    const periodOptions = periods.map((p) => ({
        value: p.id.toString(),
        label: p.name,
    }));

    const teacherOptions = [
        { value: "none", label: "Sin docente asignado" },
        ...teachers.map((t) => ({
            value: t.id.toString(),
            label: t.full_name,
        })),
    ];

    // Configuración del diálogo de advertencia para cambios críticos
    const confirmConfig = {
        isOpen: manager.modales.confirmTypeChange,
        onClose: () => manager.setModales(prev => ({ ...prev, confirmTypeChange: false })),
        onConfirm: manager.confirmSubmit,
        title: "Atención: Cambio de Tipo de Examen",
        message: "Has cambiado el tipo de examen. Si confirmas este cambio, se reiniciarán a cero TODAS las calificaciones de los alumnos inscritos para adaptarse a las nuevas unidades de evaluación. ¿Deseas continuar y guardar de todos modos?",
        confirmText: "Sí, reiniciar y guardar",
        variant: "warning"
    };

    return (
        <BaseResourceModal
            isOpen={isOpen}
            onClose={() => manager.handleCloseModal("formulario")}
            title={title}
            onSubmit={manager.submitForm}
            processing={manager.processing}
            errors={manager.errors}
            confirmConfig={confirmConfig}
            maxWidth="2xl"
        >
            {/* SECCIÓN 1: CLASIFICACIÓN */}
            <FieldSet>
                <FieldLegend>Clasificación del Examen</FieldLegend>
                <FieldDescription>
                    Define el tipo, modalidad y lugar.
                </FieldDescription>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="flex flex-col gap-1">
                        <SelectForm
                            options={typeOptions}
                            label="Tipo de Examen"
                            selectId="exam_type"
                            placeholder="Ej. Convalidación"
                            value={manager.formData.exam_type}
                            onValueChange={(v) => manager.setFormData("exam_type", v)}
                        />
                        <InputError message={manager.errors.exam_type} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <SelectForm
                            options={modeOptions}
                            label="Modalidad"
                            selectId="mode"
                            placeholder="Ej. Presencial"
                            value={manager.formData.mode}
                            onValueChange={(v) => manager.setFormData("mode", v)}
                        />
                        <InputError message={manager.errors.mode} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <SelectForm
                            options={statuses}
                            label="Estado del Examen"
                            selectId="status"
                            placeholder="Selecciona el estado"
                            value={manager.formData.status}
                            onValueChange={(v) => manager.setFormData("status", v)}
                        />
                        <InputError message={manager.errors.status} />
                    </div>
                </div>
            </FieldSet>

            <FieldSeparator />

            {/* SECCIÓN 2: HORARIO Y APERTURA */}
            <FieldSet>
                <FieldLegend>Horario y Apertura</FieldLegend>
                <FieldDescription>
                    Configura las fechas exactas, el periodo escolar y el horario de aplicación.
                </FieldDescription>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="start_date" value="Fecha de Inicio" />
                        <TextInput
                            id="start_date"
                            type="date"
                            className="mt-1 block w-full"
                            value={manager.formData.start_date}
                            onChange={(e) => manager.setFormData("start_date", e.target.value)}
                            required
                        />
                        <InputError message={manager.errors.start_date} />
                    </div>

                    <div>
                        <InputLabel htmlFor="end_date" value="Fecha de Fin" />
                        <TextInput
                            id="end_date"
                            type="date"
                            className="mt-1 block w-full"
                            value={manager.formData.end_date}
                            min={manager.formData.start_date || undefined}
                            onChange={(e) => manager.setFormData("end_date", e.target.value)}
                            required
                        />
                        <InputError message={manager.errors.end_date} />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mt-4">
                    <div className="flex flex-col gap-1">
                        <SelectForm
                            options={periodOptions}
                            label="Periodo Escolar"
                            selectId="period_id"
                            placeholder="Selecciona el Periodo"
                            value={manager.formData.period_id}
                            onValueChange={(v) => manager.setFormData("period_id", v)}
                        />
                        <InputError message={manager.errors.period_id} />
                    </div>
                    <div>
                        <InputLabel htmlFor="application_time" value="Hora (Opcional)" />
                        <TextInput
                            id="application_time"
                            type="text"
                            className="mt-1 block w-full"
                            value={manager.formData.application_time}
                            onChange={(e) => manager.setFormData("application_time", e.target.value)}
                            placeholder="10:00"
                        />
                        <InputError message={manager.errors.application_time} />
                    </div>
                    <div>
                        <InputLabel htmlFor="capacity" value="Cupo (Plazas)" />
                        <TextInput
                            id="capacity"
                            type="number"
                            className="mt-1 block w-full"
                            value={manager.formData.capacity}
                            onChange={(e) => manager.setFormData("capacity", e.target.value)}
                            placeholder="Ej. 10"
                            required
                        />
                        <InputError message={manager.errors.capacity} />
                    </div>
                </div>
            </FieldSet>

            <FieldSeparator />

            {/* SECCIÓN 3: SEDE Y DOCENTE */}
            <FieldSet>
                <FieldLegend>Sede y Docente Evaluador</FieldLegend>
                <FieldDescription>
                    Asigna sala y supervisor (opcionales).
                </FieldDescription>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="site" value="Aula / Link" />
                        <TextInput
                            id="site"
                            type="text"
                            className="mt-1 block w-full"
                            value={manager.formData.site}
                            onChange={(e) => manager.setFormData("site", e.target.value)}
                            placeholder="A-101 / Zoom Link"
                        />
                        <InputError message={manager.errors.site} />
                    </div>

                    <div className="flex flex-col gap-1">
                        <SelectForm
                            options={teacherOptions}
                            label="Docente a cargo"
                            selectId="teacher_id"
                            placeholder="Selecciona Especialista"
                            value={manager.formData.teacher_id}
                            onValueChange={(v) => manager.setFormData("teacher_id", v)}
                        />
                        <InputError message={manager.errors.teacher_id} />
                    </div>
                </div>
            </FieldSet>
        </BaseResourceModal>
    );
}

