/**
 * GroupModal — Modal de Creación/Edición para Grupos.
 *
 * Componente "Tonto" (Dumb Component) que delega su estado,
 * lógica de envío y validaciones al `manager` provisto por `useGroupsManagement`.
 * Patrón homologado con `ExamFormModal` (SRP + DIP).
 *
 * Contiene dos efectos UX reactivos propios del formulario:
 * - Tipo → actualiza el nivel automáticamente (Egresados vs Regular).
 * - Modalidad → limpia el campo de sede contrario (Presencial/Virtual).
 * Estos efectos son lógica de presentación y por diseño permanecen en el modal.
 */
import React, { useEffect } from "react";
import {
    FieldDescription,
    FieldGroup,
    FieldLegend,
    FieldSeparator,
    FieldSet,
} from "@/Components/ui/field";
import SelectForm from "@/components/Forms/SelectForm";
import InputForm from "@/components/Forms/InputForm";
import DataFormModal from "@/Components/DataTable/DataFormModal";
import FormErrors from "@/Components/ui/FormErrors";

/**
 * @param {Object}   props
 * @param {Object}   props.manager    - Objeto completo del hook `useGroupsManagement`.
 * @param {Array}    props.teachers   - Lista de docentes disponibles.
 * @param {Array}    props.levels     - Lista de niveles académicos.
 * @param {Array}    props.periods    - Lista de periodos escolares.
 * @param {Array}    props.statuses   - Opciones de estado del grupo.
 * @param {Array}    props.modes      - Opciones de modalidad.
 * @param {Array}    props.types      - Opciones de tipo de grupo.
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
    // El título se calcula aquí para no contaminar la página contenedora
    const titulo = itemEditando
        ? `Editar grupo: ${itemEditando.name}`
        : "Añadir Nuevo Grupo";

    // ── Opciones de selects ────────────────────────────────────────────────────
    const teacherOptions = [
        { value: "none", label: "Sin docente asignado" },
        ...teachers.map((t) => ({ value: t.id.toString(), label: t.full_name })),
    ];

    // Filtra niveles según el tipo de programa seleccionado
    const levelOptions = levels
        .filter((l) => {
            const programType = l.program_type || "Regular";
            return formData.type === "Programa Egresados"
                ? programType === "Egresados"
                : programType === "Regular";
        })
        .map((l) => ({ value: l.id.toString(), label: l.level_tecnm }));

    const periodOptions = periods.map((p) => ({ value: p.id.toString(), label: p.name }));
    const statusOptions = statuses.map((s) => ({ value: s.value, label: s.label }));

    // ── Efecto reactivo: Tipo del grupo → autoselección de Nivel ──────────────
    useEffect(() => {
        if (!isOpen) return;
        // Evita limpiar el nivel al abrir en modo edición con el mismo tipo
        if (itemEditando && formData.type === itemEditando.type) return;

        if (formData.type === "Programa Egresados") {
            const nivelEgresados = levels.find((l) => l.program_type === "Egresados");
            if (nivelEgresados) setFormData("level_id", nivelEgresados.id.toString());
        } else {
            setFormData("level_id", "");
        }
    }, [formData.type]);

    // ── Efecto reactivo: Modalidad → limpia el campo de sede contrario ─────────
    useEffect(() => {
        if (!isOpen) return;
        // Evita limpiar la sede al abrir en modo edición con la misma modalidad
        if (itemEditando && formData.mode === itemEditando.mode) return;

        if (formData.mode === "Presencial") setFormData("meeting_link", "");
        else if (formData.mode === "Virtual") setFormData("classroom", "");
    }, [formData.mode]);

    return (
        <DataFormModal
            isOpen={isOpen}
            onClose={() => handleCloseModal("formulario")}
            title={titulo}
            onSubmit={submitForm}
            processing={processing}
            maxWidth="2xl"
        >
            {/* Bloque de errores de validación — componente compartido */}
            <FormErrors errors={errors} />

            <FieldGroup>
                {/* ── SECCIÓN 1: INFORMACIÓN GENERAL ── */}
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
                            value={formData.mode}
                            onValueChange={(v) => setFormData("mode", v)}
                        />
                        <SelectForm
                            options={types}
                            label="Tipo"
                            selectId="type"
                            placeholder="Selecciona un tipo"
                            value={formData.type}
                            onValueChange={(v) => setFormData("type", v)}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4">
                        <InputForm
                            label="Capacidad (estudiantes)"
                            type="number"
                            inputId="capacity"
                            placeholder="Ej. 25"
                            description="Número máximo de estudiantes del grupo."
                            value={formData.capacity}
                            onChange={(e) => setFormData("capacity", e.target.value)}
                        />
                        <SelectForm
                            options={statusOptions}
                            label="Estado"
                            selectId="status"
                            placeholder="Selecciona un estado"
                            value={formData.status}
                            onValueChange={(v) => setFormData("status", v)}
                        />
                    </div>
                </FieldSet>

                <FieldSeparator />

                {/* ── SECCIÓN 2: HORARIO Y UBICACIÓN ── */}
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
                            value={formData.schedule}
                            onChange={(e) => setFormData("schedule", e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4">
                        <InputForm
                            label="Aula"
                            inputId="classroom"
                            required={false}
                            disabled={formData.mode === "Virtual"}
                            placeholder="Ej. B-203"
                            description="Opcional"
                            value={formData.classroom}
                            onChange={(e) => setFormData("classroom", e.target.value)}
                        />
                        <InputForm
                            label="Enlace de reunión (URL)"
                            inputId="meeting_link"
                            required={false}
                            disabled={formData.mode === "Presencial"}
                            placeholder="https://..."
                            description="Opcional para grupos virtuales o híbridos."
                            value={formData.meeting_link}
                            onChange={(e) => setFormData("meeting_link", e.target.value)}
                        />
                    </div>
                </FieldSet>

                <FieldSeparator />

                {/* ── SECCIÓN 3: ASIGNACIONES ── */}
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
                            value={formData.period_id}
                            onValueChange={(v) => setFormData("period_id", v)}
                        />
                        <SelectForm
                            options={levelOptions}
                            label="Nivel"
                            selectId="level_id"
                            placeholder="Selecciona un nivel"
                            value={formData.level_id}
                            disabled={formData.type === "Programa Egresados"}
                            onValueChange={(v) => setFormData("level_id", v)}
                        />
                        <SelectForm
                            options={teacherOptions}
                            label="Docente"
                            selectId="teacher_id"
                            placeholder="Selecciona un docente"
                            value={formData.teacher_id}
                            onValueChange={(v) => setFormData("teacher_id", v)}
                        />
                    </div>
                </FieldSet>
            </FieldGroup>
        </DataFormModal>
    );
}
