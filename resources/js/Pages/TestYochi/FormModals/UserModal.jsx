import FormModal from "@/Components/Forms/FormModal";
import {
    FieldDescription,
    FieldGroup,
    FieldLegend,
    FieldSeparator,
    FieldSet,
} from '@/Components/ui/field';
import SelectForm from "@/components/Forms/SelectForm";
import InputForm from '@/components/Forms/InputForm';
import ButtonForm from '@/components/Forms/ButtonForm';
// 1. Importamos useForm de Inertia
import { useForm } from '@inertiajs/react';

export default function UserModal({ show = false, onClose, title, degrees, levels, typeStudents }) {

    // --- OPCIONES PARA LOS SELECTS ---
    const semesterOptions = Array.from({ length: 14 }, (_, i) => ({ value: (i + 1).toString(), label: `Semestre ${i + 1}` }));
    const months = Array.from({ length: 12 }, (_, i) => {
        const month = new Date(0, i).toLocaleString('default', { month: 'long' });
        return { value: (i + 1).toString(), label: month };
    });
    const years = Array.from({ length: 100 }, (_, i) => {
        const year = new Date().getFullYear() - i;
        return { value: year.toString(), label: year.toString() };
    });
    const days = Array.from({ length: 31 }, (_, i) => ({ value: (i + 1).toString(), label: (i + 1).toString() }));
    const degreesOption = degrees.map(degree => ({ value: degree.id.toString(), label: degree.name }));
    const levelsOption = levels.map(level => ({ value: level.id.toString(), label: level.level_tecnm }));
    const genderOption = [
        { value: 'M', label: 'Masculino' },
        { value: 'F', label: 'Femenino' },
    ];
    const typeStudentsOption = typeStudents.map(type => ({ value: type.id.toString(), label: type.name }));

    // 2. Inicializamos el estado del formulario
    const { data, setData, post, processing, errors, reset, transform } = useForm({
        type_student_id: '',
        first_name: '',
        last_name: '',
        birth_day: '',   // Variables temporales para la fecha
        birth_month: '',
        birth_year: '',
        gender: '',
        number_control: '',
        degree_id: '',
        semester: '',
        level_id: '',
        phone: '',
    });

    // 3. Función para enviar el formulario
    const submit = (e) => {
        e.preventDefault();

        // 1. Formateamos la fecha
        const formattedBirthDate = data.birth_year && data.birth_month && data.birth_day
            ? `${data.birth_year}-${data.birth_month.padStart(2, '0')}-${data.birth_day.padStart(2, '0')}`
            : null;

        // 2. Le decimos a Inertia cómo debe transformar los datos justo ANTES de enviarlos
        transform((currentData) => ({
            ...currentData,
            num_control: currentData.number_control,
            birthdate: formattedBirthDate,
        }));

        // Enviamos los datos. Ajusta '/students' por la ruta real que uses en routes/web.php
        post('/students', {
            onSuccess: () => {
                reset(); // Limpiamos el formulario
                onClose(); // Cerramos el modal
            },
        });
    };

    return (
        <FormModal title={title} show={show} onClose={onClose}>
            {/* 4. Agregamos el evento onSubmit al form */}
            <form onSubmit={submit}>
                {/* --- CÓDIGO TEMPORAL PARA VER LOS ERRORES --- */}
                {Object.keys(errors).length > 0 && (
                    <div className="p-4 mb-4 text-sm text-white bg-red-500 rounded-lg">
                        <strong>Errores de validación:</strong>
                        <pre>{JSON.stringify(errors, null, 2)}</pre>
                    </div>
                )}
                {/* ------------------------------------------- */}
                <FieldGroup>
                    <FieldSet>
                        <FieldLegend>Añadir nuevo alumno</FieldLegend>
                        <FieldDescription>
                            Ingresar todos los datos del alumno
                        </FieldDescription>

                        {/* 5. Selectores actualizados con onValueChange */}
                        <SelectForm
                            options={typeStudentsOption}
                            label="Tipo de estudiante"
                            placeholder="Tipo de estudiante"
                            selectId="type_student_id"
                            value={data.type_student_id}
                            onValueChange={(value) => setData('type_student_id', value)}
                        />

                        <FieldGroup>
                            {/* InputForm sigue usando onChange con e.target.value */}
                            <InputForm
                                label="Nombre del alumno"
                                placeholder="Nombre(s) del alumno"
                                inputId="first_name"
                                value={data.first_name}
                                onChange={(e) => setData('first_name', e.target.value)}
                            />
                            <InputForm
                                label="Apellidos del alumno"
                                placeholder="Apellidos del alumno"
                                inputId="last_name"
                                value={data.last_name}
                                onChange={(e) => setData('last_name', e.target.value)}
                            />

                            <FieldLegend>Fecha de nacimiento</FieldLegend>
                            <div className="grid grid-cols-3 gap-4">
                                <SelectForm
                                    options={days} label="Día" placeholder="DD"
                                    selectId="birth_day"
                                    value={data.birth_day}
                                    onValueChange={(value) => setData('birth_day', value)}
                                />
                                <SelectForm
                                    options={months} label="Mes" placeholder="MM"
                                    selectId="birth_month"
                                    value={data.birth_month}
                                    onValueChange={(value) => setData('birth_month', value)}
                                />
                                <SelectForm
                                    options={years} label="Año" placeholder="YYYY"
                                    selectId="birth_year"
                                    value={data.birth_year}
                                    onValueChange={(value) => setData('birth_year', value)}
                                />
                            </div>

                            <SelectForm
                                options={genderOption} label="Género" placeholder="Selecciona el género"
                                selectId="gender"
                                value={data.gender}
                                onValueChange={(value) => setData('gender', value)}
                            />
                            <InputForm
                                label="Teléfono" placeholder="Número de teléfono del alumno"
                                inputId="phone"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                            />
                        </FieldGroup>
                    </FieldSet>

                    <FieldSeparator />

                    <FieldSet>
                        <FieldGroup>
                            <InputForm
                                label="Número de control" placeholder="Número de control del alumno"
                                inputId="number_control"
                                value={data.number_control}
                                onChange={(e) => setData('number_control', e.target.value)}
                            />
                            <SelectForm
                                options={degreesOption} label="Carrera" placeholder="Selecciona la carrera"
                                selectId="degree_id"
                                value={data.degree_id}
                                onValueChange={(value) => setData('degree_id', value)}
                            />
                            <SelectForm
                                options={semesterOptions} label="Semestre" placeholder="Selecciona el semestre"
                                selectId="semester"
                                value={data.semester}
                                onValueChange={(value) => setData('semester', value)}
                            />
                            <SelectForm
                                options={levelsOption} label="Nivel" placeholder="Selecciona el nivel"
                                selectId="level_id"
                                value={data.level_id}
                                onValueChange={(value) => setData('level_id', value)}
                            />
                        </FieldGroup>
                    </FieldSet>

                    {/* Asegúrate de que ButtonForm tenga un botón type="submit" dentro para enviar el formulario */}
                    <ButtonForm onCancel={onClose} disabled={processing} />
                </FieldGroup>
            </form>
        </FormModal>
    );
}