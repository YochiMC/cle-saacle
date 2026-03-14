import FormModal from "@/Components/Forms/FormModal";
import { FieldDescription, FieldGroup, FieldLegend, FieldSeparator, FieldSet } from '@/Components/ui/field';
import SelectForm from "@/components/Forms/SelectForm";
import InputForm from "@/components/Forms/InputForm";
import ButtonForm from "@/components/Forms/ButtonForm";
import { useForm } from '@inertiajs/react';

// Opciones de ejemplo para los campos fijos. Puedes ajustarlos según tus reglas de negocio.
const MODE_OPTIONS = [
    { value: 'Presencial', label: 'Presencial' },
    { value: 'Virtual', label: 'Virtual' },
    { value: 'Híbrido', label: 'Híbrido' }
];

const TYPE_OPTIONS = [
    { value: 'Regular', label: 'Regular' },
    { value: 'Intensivo', label: 'Intensivo' }
];

const STATUS_OPTIONS = [
    { value: 'Activo', label: 'Activo' },
    { value: 'Inactivo', label: 'Inactivo' }
];

export default function GroupModal({ show = false, onClose, title, teachers = [], levels = [], periods = [] }) {

    // Mapeamos las opciones que vienen de la base de datos para los componentes SelectForm
    const teacherOptions = teachers.map(t => ({ value: t.id.toString(), label: t.full_name }));
    const levelOptions = levels.map(l => ({ value: l.id.toString(), label: l.level_tecnm }));
    const periodOptions = periods.map(p => ({ value: p.id.toString(), label: p.name }));

    const { data, setData, post, processing, errors, reset, transform } = useForm({
        name:'',
        mode: '',
        type: '',
        capacity: '',
        schedule: '',
        classroom: '',
        meeting_link: '',
        status: 'Activo', // Por defecto
        period_id: '',
        teacher_id: '',
        level_id: ''
    });

    const submit = (e) => {
        e.preventDefault();

        // Nos aseguramos de enviar la capacidad como número entero
        transform((currentData) => ({
            ...currentData,
            capacity: parseInt(currentData.capacity) || 0,
        }));

        post('/groups', {
            onSuccess: () => {
                reset();
                onClose();
            }
        });
    };

    return (
        <FormModal title={title} show={show} onClose={onClose}>
            <form onSubmit={submit}>

                {Object.keys(errors).length > 0 && (
                    <div className="p-4 mb-4 text-sm text-white bg-red-500 rounded-lg">
                        <strong>Errores detectados:</strong>
                        <ul className="ml-5 list-disc">
                            {Object.values(errors).map((err, i) => <li key={i}>{err}</li>)}
                        </ul>
                    </div>
                )}

                <FieldGroup>
                    {/* --- SECCIÓN 1: INFORMACIÓN GENERAL --- */}
                    <FieldSet>
                        <FieldLegend>Información del Grupo</FieldLegend>
                        <FieldDescription>Datos básicos y configuración de la clase.</FieldDescription>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <SelectForm options={MODE_OPTIONS} label="Modalidad" selectId="mode" value={data.mode} onValueChange={v => setData('mode', v)} />
                            <SelectForm options={TYPE_OPTIONS} label="Tipo" selectId="type" value={data.type} onValueChange={v => setData('type', v)} />
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <InputForm label="Nombre del grupo" inputId="name" value={data.name} onChange={e=>setData('name', e.target.value)} />
                            <InputForm label="Capacidad (Alumnos)" type="number" inputId="capacity" value={data.capacity} onChange={e => setData('capacity', e.target.value)} />
                            <SelectForm options={STATUS_OPTIONS} label="Estado" selectId="status" value={data.status} onValueChange={v => setData('status', v)} />
                        </div>
                    </FieldSet>

                    <FieldSeparator />

                    {/* --- SECCIÓN 2: HORARIO Y UBICACIÓN --- */}
                    <FieldSet>
                        <FieldLegend>Horario y Ubicación</FieldLegend>

                        <div className="grid grid-cols-1 gap-4">
                            <InputForm label="Horario (Ej. Lunes y Miércoles 16:00 - 18:00)" inputId="schedule" value={data.schedule} onChange={e => setData('schedule', e.target.value)} />
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4">
                            <InputForm label="Aula Física" inputId="classroom" value={data.classroom} onChange={e => setData('classroom', e.target.value)} />
                            <InputForm label="Enlace de Reunión (URL)" inputId="meeting_link" value={data.meeting_link} onChange={e => setData('meeting_link', e.target.value)} />
                        </div>
                    </FieldSet>

                    <FieldSeparator />

                    {/* --- SECCIÓN 3: ASIGNACIONES --- */}
                    <FieldSet>
                        <FieldLegend>Asignaciones</FieldLegend>
                        <FieldDescription>Relaciona el grupo con un periodo, nivel y docente.</FieldDescription>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <SelectForm options={periodOptions} label="Periodo" selectId="period_id" value={data.period_id} onValueChange={v => setData('period_id', v)} />
                            <SelectForm options={levelOptions} label="Nivel" selectId="level_id" value={data.level_id} onValueChange={v => setData('level_id', v)} />
                            <SelectForm options={teacherOptions} label="Docente" selectId="teacher_id" value={data.teacher_id} onValueChange={v => setData('teacher_id', v)} />
                        </div>
                    </FieldSet>

                    <ButtonForm onCancel={onClose} disabled={processing} />
                </FieldGroup>
            </form>
        </FormModal>
    );
}