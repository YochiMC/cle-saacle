import { useState } from "react";
import { Head } from "@inertiajs/react";
import { BookOpen, FlaskConical, Eye, Save, Briefcase } from "lucide-react";

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useSettingsManagement } from "@/Hooks/useSettingsManagement";
import useFlashAlert from "@/Hooks/useFlashAlert";

import InputForm from "@/Components/Forms/InputForm";
import ThemeButton from "@/Components/ui/ThemeButton";
import ConfirmModal from "@/Components/ui/ConfirmModal";
import FormErrors from "@/Components/ui/FormErrors";
import ModalAlert from "@/Components/ui/ModalAlert";
import {
    FieldGroup,
    FieldSet,
    FieldLegend,
    FieldDescription,
} from "@/Components/ui/field";

import CalendarSection from "./Partials/CalendarSection";

export default function Index({ configuraciones = {} }) {
    const [confirmOpen, setConfirmOpen] = useState(false);

    const { formData, setFormData, processing, errors, submitSettings } =
        useSettingsManagement(configuraciones);

    const { flashModal, closeFlashModal } = useFlashAlert();

    const alCambiar = (campo) => (e) => setFormData(campo, e.target.value);

    const solicitarConfirmacion = (e) => {
        e.preventDefault();
        if (processing) return;
        setConfirmOpen(true);
    };

    const confirmarGuardado = () => {
        setConfirmOpen(false);
        submitSettings();
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blueTec/10 text-blueTec">
                        <BookOpen className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">
                            Configuraciones del Sistema
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Define los calendarios que controlan los estados
                            automáticos de Grupos y Exámenes
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Configuraciones del Sistema" />

            {/* ── Formulario principal ─────────────────────────────────────── */}
            <form
                id="form-configuraciones"
                onSubmit={solicitarConfirmacion}
                className="mx-auto max-w-4xl space-y-6 pb-40"
            >
                {/* El ModalAlert ahora se renderiza al final del layout */}

                {/* Errores de validación del servidor */}
                <FormErrors errors={errors} />

                <FieldGroup>
                    {/* ── Sección 1: Cursos Regulares ────────────────────────── */}
                    <CalendarSection
                        title="Calendario de Cursos Regulares"
                        description="Define las fechas en las que el sistema abrirá las inscripciones y cerrará las evaluaciones automáticamente. ¡Cuidado, esto afecta a todos los alumnos!"
                        Icon={BookOpen}
                        prefix="courses"
                        formData={formData}
                        onChange={alCambiar}
                    />

                    {/* ── Sección 2: Programa de Egresados (PE) ──────────────── */}
                    <CalendarSection
                        title="Calendario Programa de Egresados (PE)"
                        description="Configura las fechas específicas para los cursos del Programa de Egresados. Este calendario opera de forma independiente a los cursos regulares."
                        Icon={Briefcase}
                        prefix="pe"
                        formData={formData}
                        onChange={alCambiar}
                    />

                    {/* ── Sección 3: Exámenes ─────────────────────────────────── */}
                    <CalendarSection
                        title="Calendario de Exámenes"
                        description="Configura las fechas de inscripción, aplicación y calificación para los exámenes. Controla la temporalidad automática de dicho ciclo."
                        Icon={FlaskConical}
                        prefix="exams"
                        formData={formData}
                        onChange={alCambiar}
                        hasActivePeriod={false}
                        labels={{
                            enrollment_title: "Inscripción a Exámenes",
                            enrollment_start: "Apertura de inscripciones",
                            enrollment_start_desc:
                                "Día en que los alumnos podrán empezar a solicitar su inscripción a exámenes.",
                            enrollment_end: "Cierre de inscripciones",
                            enrollment_end_desc:
                                "Día límite para que los alumnos aseguren su lugar en los exámenes listados.",
                            evaluation_title: "Evaluación y Resultados",
                            evaluation_start:
                                "Apertura de registro de resultados",
                            evaluation_start_desc:
                                "A partir de esta fecha, los docentes podrán ingresar al sistema para capturar los resultados.",
                            evaluation_end: "Límite de registro de resultados",
                            evaluation_end_desc:
                                "Día máximo en el que todos los resultados de examen deberán estar oficialmente subidos.",
                        }}
                    />

                    {/* ── Sección 4: Configuración Visual ────────────────────── */}
                    <FieldSet>
                        <div className="flex items-center gap-2">
                            <Eye
                                className="h-5 w-5 text-blueTec"
                                aria-hidden="true"
                            />
                            <FieldLegend>Configuración Visual</FieldLegend>
                        </div>
                        <FieldDescription>
                            Controla qué información es visible para los
                            estudiantes en determinadas fechas del calendario
                            académico.
                        </FieldDescription>

                        <div className="sm:max-w-md">
                            <InputForm
                                label="Revelar nombre del docente a partir de"
                                inputId="teacher_reveal_date"
                                type="date"
                                value={formData.teacher_reveal_date}
                                onChange={alCambiar("teacher_reveal_date")}
                                required={false}
                                description="Antes de esta fecha, el nombre del docente permanece oculto (se muestra 'Por asignar') para evitar que los estudiantes elijan grupos por popularidad."
                            />
                        </div>
                    </FieldSet>
                </FieldGroup>
            </form>

            {/* ── Barra de acción fija inferior ───────────────────────────── */}
            <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/85 px-6 py-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] backdrop-blur-md">
                <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
                    <p className="text-sm font-medium text-muted-foreground">
                        Los cambios afectarán el comportamiento automático del
                        sistema de forma inmediata.
                    </p>
                    <ThemeButton
                        theme="institutional"
                        type="submit"
                        form="form-configuraciones"
                        icon={Save}
                        disabled={processing}
                        className="h-11 min-w-[230px] rounded-xl px-6 text-sm font-semibold tracking-wide"
                    >
                        {processing
                            ? "Guardando cambios..."
                            : "Guardar Configuraciones"}
                    </ThemeButton>
                </div>
            </div>

            <ConfirmModal
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={confirmarGuardado}
                title="Confirmar actualización de calendario"
                message="Vas a actualizar fechas que afectan estados automáticos de grupos y exámenes. ¿Deseas continuar?"
                confirmText="Sí, guardar cambios"
                variant="institutional"
            />

            <ModalAlert
                isOpen={flashModal.isOpen}
                onClose={closeFlashModal}
                type={flashModal.type || 'info'}
                title={flashModal.title}
                message={flashModal.message}
            />
        </AuthenticatedLayout>
    );
    
}
