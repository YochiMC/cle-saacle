import { Calendar, GraduationCap } from 'lucide-react';
import InputForm from '@/Components/Forms/InputForm';
import {
    FieldSet,
    FieldLegend,
    FieldDescription,
    FieldSeparator,
} from '@/Components/ui/field';

/**
 * Componente Presentacional de Sección de Calendario.
 * 
 * Centraliza la UI para las configuraciones de fechas aplicando el principio DRY.
 * Renderiza de uno a tres bloques dependiendo de la prop `hasActivePeriod`.
 */
export default function CalendarSection({
    title,
    description,
    Icon,
    prefix,
    formData,
    onChange,
    hasActivePeriod = true,
    labels = {}
}) {
    // Diccionario de etiquetas por defecto, permitiendo overrrides.
    const t = {
        enrollment_title: labels.enrollment_title || 'Periodo de Inscripción',
        enrollment_start: labels.enrollment_start || 'Día de apertura de inscripciones',
        enrollment_start_desc: labels.enrollment_start_desc || 'Día en que los alumnos podrán empezar a inscribirse.',
        enrollment_end: labels.enrollment_end || 'Día de cierre de inscripciones',
        enrollment_end_desc: labels.enrollment_end_desc || 'Último día de inscripciones. Al terminar esta fecha, los grupos se cerrarán temporalmente.',

        active_title: labels.active_title || 'Periodo de Clases Activas',
        active_start: labels.active_start || 'Día de inicio de clases',
        active_start_desc: labels.active_start_desc || 'Día oficial en el que arrancan las clases pertinentes.',
        active_end: labels.active_end || 'Día de término de clases',
        active_end_desc: labels.active_end_desc || 'Último día de clases. Se mantendrán activos en modo lectura hasta la evaluación.',

        evaluation_title: labels.evaluation_title || 'Periodo de Evaluación / Calificaciones',
        evaluation_start: labels.evaluation_start || 'Día de apertura para evaluar',
        evaluation_start_desc: labels.evaluation_start_desc || 'A partir de este día, los docentes tendrán acceso para subir calificaciones.',
        evaluation_end: labels.evaluation_end || 'Día de cierre de evaluaciones',
        evaluation_end_desc: labels.evaluation_end_desc || 'Fecha límite e impostergable para registrar las calificaciones.'
    };

    // Helper DRY para formar las keys como "courses_enrollment_start"
    const k = (suffix) => `${prefix}_${suffix}`;

    return (
        <FieldSet>
            <div className="flex items-center gap-2">
                {Icon && <Icon className="h-5 w-5 text-blueTec" aria-hidden="true" />}
                <FieldLegend>{title}</FieldLegend>
            </div>
            {description && (
                <FieldDescription>{description}</FieldDescription>
            )}

            <div>
                <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                    {t.enrollment_title}
                </p>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <InputForm
                        label={t.enrollment_start}
                        inputId={k('enrollment_start')}
                        type="date"
                        value={formData[k('enrollment_start')]}
                        onChange={onChange(k('enrollment_start'))}
                        required={false}
                        description={t.enrollment_start_desc}
                    />
                    <InputForm
                        label={t.enrollment_end}
                        inputId={k('enrollment_end')}
                        type="date"
                        value={formData[k('enrollment_end')]}
                        onChange={onChange(k('enrollment_end'))}
                        required={false}
                        description={t.enrollment_end_desc}
                    />
                </div>
            </div>

            {hasActivePeriod && (
                <>
                    <FieldSeparator />
                    <div>
                        <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                            {t.active_title}
                        </p>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <InputForm
                                label={t.active_start}
                                inputId={k('active_start')}
                                type="date"
                                value={formData[k('active_start')]}
                                onChange={onChange(k('active_start'))}
                                required={false}
                                description={t.active_start_desc}
                            />
                            <InputForm
                                label={t.active_end}
                                inputId={k('active_end')}
                                type="date"
                                value={formData[k('active_end')]}
                                onChange={onChange(k('active_end'))}
                                required={false}
                                description={t.active_end_desc}
                            />
                        </div>
                    </div>
                </>
            )}

            <FieldSeparator />

            <div>
                <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
                    {t.evaluation_title}
                </p>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <InputForm
                        label={t.evaluation_start}
                        inputId={k('evaluation_start')}
                        type="date"
                        value={formData[k('evaluation_start')]}
                        onChange={onChange(k('evaluation_start'))}
                        required={false}
                        description={t.evaluation_start_desc}
                    />
                    <InputForm
                        label={t.evaluation_end}
                        inputId={k('evaluation_end')}
                        type="date"
                        value={formData[k('evaluation_end')]}
                        onChange={onChange(k('evaluation_end'))}
                        required={false}
                        description={t.evaluation_end_desc}
                    />
                </div>
            </div>
        </FieldSet>
    );
}
