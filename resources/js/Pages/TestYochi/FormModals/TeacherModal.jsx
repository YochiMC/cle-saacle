/**
 * TeacherModal
 *
 * Modal de registro para docentes. Contiene un formulario organizado en tres
 * secciones: Información Personal, Perfil Académico y Laboral, e Información
 * de Pago. Transforma los datos antes de enviarlos (booleano is_native,
 * entero ttc_hours) y resetea el formulario al completar el registro.
 *
 * @component
 *
 * @param {boolean}  [show=false]  - Controla la visibilidad del modal.
 * @param {Function} onClose       - Callback invocado al cerrar o cancelar el modal.
 * @param {string}   [title]       - Título del encabezado del modal.
 *
 * @example
 * <TeacherModal
 *   title="Añadir maestro"
 *   show={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 * />
 */

import FormModal from "@/Components/Forms/FormModal";
import { FieldDescription, FieldGroup, FieldLegend, FieldSeparator, FieldSet } from '@/Components/ui/field';
import SelectForm from "@/Components/Forms/SelectForm";
import InputForm from "@/Components/Forms/InputForm";
import ButtonForm from "@/Components/Forms/ButtonForm";
import { useForm } from '@inertiajs/react';

// Opciones estáticas — definidas fuera del componente para evitar recreaciones en cada render.
const CATEGORY_OPTIONS = [
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' },
];

const NATIVE_OPTIONS = [
    { value: '0', label: 'No' },
    { value: '1', label: 'Sí' },
];

export default function TeacherModal({ show = false, onClose, title }) {

    const { data, setData, post, processing, errors, reset, transform } = useForm({
        first_name: '',
        last_name: '',
        category: '',
        level: '',
        rfc: '',
        curp: '',
        clabe: '',
        ttc_hours: '',
        bank_name: '',
        grade: '',
        is_native: '0', // Por defecto 'No'
        email: '',
        phone: '',
    });

    const submit = (e) => {
        e.preventDefault();

        // Transformamos los tipos antes de enviar: string → boolean / integer.
        transform((currentData) => ({
            ...currentData,
            is_native: currentData.is_native === '1',
            ttc_hours: parseInt(currentData.ttc_hours) || 0,
        }));

        post('/teachers', {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
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
                    {/* --- SECCIÓN 1: INFORMACIÓN PERSONAL --- */}
                    <FieldSet>
                        <FieldLegend>Datos del Docente</FieldLegend>
                        <FieldDescription>Identificación y contacto para su registro.</FieldDescription>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <InputForm label="Nombre(s)" inputId="first_name" placeholder="Ej. Ana María" description="Captura los nombres como aparecen en su identificación." value={data.first_name} onChange={e => setData('first_name', e.target.value)} />
                            <InputForm label="Apellidos" inputId="last_name" placeholder="Ej. Pérez Gómez" value={data.last_name} onChange={e => setData('last_name', e.target.value)} />
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <InputForm label="RFC" inputId="rfc" placeholder="ABCD9001011A1" description="Se convertirá automáticamente a mayúsculas." value={data.rfc} onChange={e => setData('rfc', e.target.value.toUpperCase())} />
                            <InputForm label="CURP" inputId="curp" placeholder="ABCD900101HDFRRN01" description="Se convertirá automáticamente a mayúsculas." value={data.curp} onChange={e => setData('curp', e.target.value.toUpperCase())} />
                        </div>

                        <InputForm label="Correo electrónico" type="email" inputId="email" placeholder="docente@institucion.edu.mx" description="Usado para comunicación y acceso al sistema." value={data.email} onChange={e => setData('email', e.target.value)} />
                        <InputForm label="Teléfono" inputId="phone" placeholder="10 dígitos" value={data.phone} onChange={e => setData('phone', e.target.value)} />
                    </FieldSet>

                    <FieldSeparator />

                    {/* --- SECCIÓN 2: PERFIL ACADÉMICO Y LABORAL --- */}
                    <FieldSet>
                        <FieldLegend>Perfil Académico</FieldLegend>
                        <FieldDescription>Información de categoría, nivel y carga docente.</FieldDescription>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <InputForm label="Grado académico (ej. Mtro., Dr.)" inputId="grade" placeholder="Ej. Mtro." value={data.grade} onChange={e => setData('grade', e.target.value)} />
                            <SelectForm options={CATEGORY_OPTIONS} label="Categoría" selectId="category" placeholder="Selecciona una categoría" value={data.category} onValueChange={v => setData('category', v)} />
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <InputForm label="Nivel" inputId="level" placeholder="Ej. Licenciatura" value={data.level} onChange={e => setData('level', e.target.value)} />
                            <InputForm label="Horas TTC" type="number" inputId="ttc_hours" placeholder="Ej. 20" description="Carga horaria asignada al docente." value={data.ttc_hours} onChange={e => setData('ttc_hours', e.target.value)} />
                            <SelectForm options={NATIVE_OPTIONS} label="Docente nativo" selectId="is_native" placeholder="Selecciona una opción" value={data.is_native} onValueChange={v => setData('is_native', v)} />
                        </div>
                    </FieldSet>

                    <FieldSeparator />

                    {/* --- SECCIÓN 3: DATOS BANCARIOS --- */}
                    <FieldSet>
                        <FieldLegend>Datos de Pago</FieldLegend>
                        <FieldDescription>Cuenta bancaria para gestión administrativa.</FieldDescription>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <InputForm label="Banco" inputId="bank_name" placeholder="Ej. BBVA" value={data.bank_name} onChange={e => setData('bank_name', e.target.value)} />
                            <InputForm label="CLABE Interbancaria" inputId="clabe" placeholder="18 dígitos" description="Verifica la CLABE antes de guardar." value={data.clabe} onChange={e => setData('clabe', e.target.value)} />
                        </div>
                    </FieldSet>

                    <ButtonForm onCancel={onClose} disabled={processing} />
                </FieldGroup>
            </form>
        </FormModal>
    );
}
