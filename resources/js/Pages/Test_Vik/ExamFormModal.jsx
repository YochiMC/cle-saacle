import React from "react";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import DataFormModal from "@/Components/DataTable/DataFormModal";
import SelectForm from "@/components/Forms/SelectForm";
import {
    FieldDescription,
    FieldGroup,
    FieldLegend,
    FieldSeparator,
    FieldSet,
} from "@/Components/ui/field";

/**
 * Modal de Creación/Edición para Exámenes.
 * Componente "Tonto" que delega su estado y submisión a su manager provisto.
 * Hace uso de `DataFormModal` (Wrapper Contenedor).
 *
 * @param {Object} props
 */
export default function ExamFormModal({
    manager,
    periods = [],
    typeOptions = [],
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

    const modeOptions = [
        { value: "Presencial", label: "Presencial" },
        { value: "Virtual", label: "Virtual" },
    ];

    return (
        <DataFormModal
            isOpen={isOpen}
            onClose={() => manager.handleCloseModal("formulario")}
            title={title}
            onSubmit={manager.submitForm}
            processing={manager.processing}
            maxWidth="2xl"
        >
            {Object.keys(manager.errors).length > 0 && (
                <div className="p-4 mb-4 text-sm text-white bg-red-500 rounded-lg">
                    <strong>Errores detectados:</strong>
                    <ul className="ml-5 list-disc w-full">
                        {Object.values(manager.errors).map((err, i) => (
                            <li key={i}>{err}</li>
                        ))}
                    </ul>
                </div>
            )}

            <FieldGroup>
                <FieldSet>
                    <FieldLegend>Clasificación del Examen</FieldLegend>
                    <FieldDescription>
                        Define el tipo, modalidad y lugar.
                    </FieldDescription>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <SelectForm
                            options={typeOptions}
                            label="Tipo de Examen"
                            selectId="exam_type"
                            placeholder="Ej. Convalidación"
                            value={manager.formData.exam_type}
                            onValueChange={(v) => manager.setFormData("exam_type", v)}
                        />
                        <SelectForm
                            options={modeOptions}
                            label="Modalidad"
                            selectId="mode"
                            placeholder="Ej. Presencial"
                            value={manager.formData.mode}
                            onValueChange={(v) => manager.setFormData("mode", v)}
                        />
                        <SelectForm
                            options={statuses}
                            label="Estado del Examen"
                            selectId="status"
                            placeholder="Selecciona el estado"
                            value={manager.formData.status}
                            onValueChange={(v) => manager.setFormData("status", v)}
                        />
                    </div>
                </FieldSet>

                <FieldSeparator />

                <FieldSet>
                    <FieldLegend>Horario y Apertura</FieldLegend>
                    <FieldDescription>
                        Configura las fechas exactas, el periodo escolar y el
                        horario de aplicación.
                    </FieldDescription>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <InputLabel
                                htmlFor="start_date"
                                value="Fecha de Inicio"
                            />
                            <TextInput
                                id="start_date"
                                type="date"
                                className="mt-1 block w-full"
                                value={manager.formData.start_date}
                                onChange={(e) =>
                                    manager.setFormData(
                                        "start_date",
                                        e.target.value,
                                    )
                                }
                                required
                            />
                        </div>

                        <div>
                            <InputLabel
                                htmlFor="end_date"
                                value="Fecha de Fin"
                            />
                            <TextInput
                                id="end_date"
                                type="date"
                                className="mt-1 block w-full"
                                value={manager.formData.end_date}
                                onChange={(e) =>
                                    manager.setFormData(
                                        "end_date",
                                        e.target.value,
                                    )
                                }
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mt-4">
                        <SelectForm
                            options={periodOptions}
                            label="Periodo Escolar"
                            selectId="period_id"
                            placeholder="Selecciona el Periodo"
                            value={manager.formData.period_id}
                            onValueChange={(v) =>
                                manager.setFormData("period_id", v)
                            }
                        />
                        <div>
                            <InputLabel
                                htmlFor="application_time"
                                value="Hora (Opcional)"
                            />
                            <TextInput
                                id="application_time"
                                type="text"
                                className="mt-1 block w-full"
                                value={manager.formData.application_time}
                                onChange={(e) =>
                                    manager.setFormData(
                                        "application_time",
                                        e.target.value,
                                    )
                                }
                                placeholder="10:00"
                            />
                        </div>
                        <div>
                            <InputLabel
                                htmlFor="capacity"
                                value="Cupo (Plazas)"
                            />
                            <TextInput
                                id="capacity"
                                type="number"
                                className="mt-1 block w-full"
                                value={manager.formData.capacity}
                                onChange={(e) =>
                                    manager.setFormData(
                                        "capacity",
                                        e.target.value,
                                    )
                                }
                                placeholder="Ej. 10"
                                required
                            />
                        </div>
                    </div>
                </FieldSet>

                <FieldSeparator />

                <FieldSet>
                    <FieldLegend>Sede y Docente Evaluador</FieldLegend>
                    <FieldDescription>
                        Asigna sala y supervisor (opcionales).
                    </FieldDescription>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <InputLabel
                                htmlFor="classroom"
                                value="Aula / Link"
                            />
                            <TextInput
                                id="classroom"
                                type="text"
                                className="mt-1 block w-full"
                                value={manager.formData.classroom}
                                onChange={(e) =>
                                    manager.setFormData(
                                        "classroom",
                                        e.target.value,
                                    )
                                }
                                placeholder="A-101 / Zoom Link"
                            />
                        </div>

                        <SelectForm
                            options={teacherOptions}
                            label="Docente a cargo"
                            selectId="teacher_id"
                            placeholder="Selecciona Especialista"
                            value={manager.formData.teacher_id}
                            onValueChange={(v) =>
                                manager.setFormData("teacher_id", v)
                            }
                        />
                    </div>
                </FieldSet>
            </FieldGroup>
        </DataFormModal>
    );
}
