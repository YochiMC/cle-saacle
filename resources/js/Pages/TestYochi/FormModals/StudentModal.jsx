/**
 * StudentModal
 *
 * Modal de registro para alumnos. Contiene un formulario dividido en dos
 * secciones: Datos Personales y Datos Escolares. Adapta dinámicamente los
 * campos visibles según el tipo de estudiante seleccionado (ej. oculta el
 * semestre para egresados y solicita credenciales de acceso).
 *
 * @component
 *
 * @param {boolean}  [show=false]   - Controla la visibilidad del modal.
 * @param {Function} onClose        - Callback invocado al cerrar o cancelar el modal.
 * @param {string}   [title]        - Título del encabezado del modal.
 * @param {Array}    degrees        - Listado de carreras: [{ id, name }].
 * @param {Array}    levels         - Listado de niveles académicos: [{ id, level_tecnm }].
 * @param {Array}    typeStudents   - Listado de tipos de estudiante: [{ id, name }].
 *
 * @example
 * <StudentModal
 *   title="Añadir alumno"
 *   show={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   degrees={degrees}
 *   levels={levels}
 *   typeStudents={typeStudents}
 * />
 */

import FormModal from "@/Components/Forms/FormModal";
import { FieldDescription, FieldGroup, FieldLegend, FieldSeparator, FieldSet } from '@/Components/ui/field';
import SelectForm from "@/Components/Forms/SelectForm";
import InputForm from "@/Components/Forms/InputForm";
import ButtonForm from "@/Components/Forms/ButtonForm";
import { useForm } from '@inertiajs/react';

// Opciones estáticas — definidas fuera del componente para evitar recreaciones en cada render.
const SEMESTER_OPTIONS = Array.from({ length: 14 }, (_, i) => ({ value: (i + 1).toString(), label: `Semestre ${i + 1}` }));
const MONTHS = Array.from({ length: 12 }, (_, i) => ({ value: (i + 1).toString(), label: new Date(0, i).toLocaleString('default', { month: 'long' }) }));
const YEARS = Array.from({ length: 100 }, (_, i) => ({ value: (new Date().getFullYear() - i).toString(), label: (new Date().getFullYear() - i).toString() }));
const DAYS = Array.from({ length: 31 }, (_, i) => ({ value: (i + 1).toString(), label: (i + 1).toString() }));
const GENDER_OPTIONS = [{ value: 'M', label: 'Masculino' }, { value: 'F', label: 'Femenino' }];

export default function StudentModal({ show = false, onClose, title, degrees, levels, typeStudents }) {

    // Mapeamos las props que vienen de la base de datos al formato { value, label }.
    const degreesOption = degrees.map(d => ({ value: d.id.toString(), label: d.name }));
    const levelsOption = levels.map(l => ({ value: l.id.toString(), label: l.level_tecnm }));
    const typeStudentsOption = typeStudents.map(t => ({ value: t.id.toString(), label: t.name }));

    const { data, setData, post, processing, errors, reset, transform } = useForm({
        type_student_id: '', first_name: '', last_name: '', birth_day: '', birth_month: '', birth_year: '',
        gender: '', number_control: '', degree_id: '', semester: '', level_id: '', phone: '', email: '', password: '', password_confirmation: '',
    });

    // Determina si el tipo seleccionado es "Egresado" para adaptar los campos del formulario.
    const selectedType = typeStudents.find(t => t.id.toString() === data.type_student_id);
    const isEgresado = selectedType?.name.toLowerCase() === 'egresado';

    const submit = (e) => {
        e.preventDefault();

        transform((currentData) => ({
            ...currentData,
            num_control: currentData.number_control,
            semester: isEgresado ? null : currentData.semester,
            birthdate: (data.birth_year && data.birth_month && data.birth_day)
                ? `${data.birth_year}-${data.birth_month.padStart(2, '0')}-${data.birth_day.padStart(2, '0')}`
                : null,
        }));

        post('/students', { onSuccess: () => { reset(); onClose(); } });
    };

    return (
        <FormModal title={title} show={show} onClose={onClose}>
            <form onSubmit={submit}>

                {/* Visualización de errores de validación */}
                {Object.keys(errors).length > 0 && (
                    <div className="p-4 mb-4 text-sm text-white bg-red-500 rounded-lg">
                        <strong>Errores detectados:</strong>
                        <ul className="ml-5 list-disc">
                            {Object.values(errors).map((err, i) => <li key={i}>{err}</li>)}
                        </ul>
                    </div>
                )}

                <FieldGroup>
                    {/* --- PARTE 1: DATOS PERSONALES --- */}
                    <FieldSet>
                        <FieldLegend>Añadir nuevo alumno</FieldLegend>
                        <FieldDescription>Ingresar todos los datos del alumno</FieldDescription>

                        <SelectForm options={typeStudentsOption} label="Tipo de estudiante" selectId="type_student_id" value={data.type_student_id} onValueChange={v => setData('type_student_id', v)} />

                        <FieldGroup>
                            <InputForm label="Nombre del alumno" inputId="first_name" value={data.first_name} onChange={e => setData('first_name', e.target.value)} />
                            <InputForm label="Apellidos del alumno" inputId="last_name" value={data.last_name} onChange={e => setData('last_name', e.target.value)} />

                            <FieldLegend>Fecha de nacimiento</FieldLegend>
                            <div className="grid grid-cols-3 gap-4">
                                <SelectForm options={DAYS} label="Día" selectId="birth_day" value={data.birth_day} onValueChange={v => setData('birth_day', v)} />
                                <SelectForm options={MONTHS} label="Mes" selectId="birth_month" value={data.birth_month} onValueChange={v => setData('birth_month', v)} />
                                <SelectForm options={YEARS} label="Año" selectId="birth_year" value={data.birth_year} onValueChange={v => setData('birth_year', v)} />
                            </div>

                            <SelectForm options={GENDER_OPTIONS} label="Género" selectId="gender" value={data.gender} onValueChange={v => setData('gender', v)} />
                            <InputForm label="Teléfono" inputId="phone" value={data.phone} onChange={e => setData('phone', e.target.value)} />
                        </FieldGroup>
                    </FieldSet>

                    <FieldSeparator />

                    {/* --- PARTE 2: DATOS ESCOLARES --- */}
                    <FieldSet>
                        <FieldGroup>
                            <InputForm label="Número de control" inputId="number_control" value={data.number_control} onChange={e => setData('number_control', e.target.value)} />

                            {isEgresado && (
                                <>
                                    <InputForm label="Correo personal" inputId="email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} />
                                    <InputForm label="Contraseña" inputId="password" type="password" value={data.password} onChange={e => setData('password', e.target.value)} />
                                    <InputForm label="Confirmar Contraseña" inputId="password_confirmation" type="password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} />
                                </>
                            )}

                            <SelectForm options={degreesOption} label="Carrera" selectId="degree_id" value={data.degree_id} onValueChange={v => setData('degree_id', v)} />

                            {!isEgresado && (
                                <SelectForm options={SEMESTER_OPTIONS} label="Semestre" selectId="semester" value={data.semester} onValueChange={v => setData('semester', v)} />
                            )}

                            <SelectForm options={levelsOption} label="Nivel" selectId="level_id" value={data.level_id} onValueChange={v => setData('level_id', v)} />
                        </FieldGroup>
                    </FieldSet>

                    <ButtonForm onCancel={onClose} disabled={processing} />
                </FieldGroup>
            </form>
        </FormModal>
    );
}
