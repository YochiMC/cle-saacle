import FormModal from "@/Components/Forms/FormModal";
import { FieldDescription, FieldGroup, FieldLegend, FieldSeparator, FieldSet } from '@/Components/ui/field';
import SelectForm from "@/components/Forms/SelectForm";
import InputForm from "@/components/Forms/InputForm";
import ButtonForm from "@/components/Forms/ButtonForm";
import { useForm } from '@inertiajs/react';

// Constantes extraídas para evitar re-renders innecesarios
const CATEGORY_OPTIONS = [
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' }
];

const NATIVE_OPTIONS = [
    { value: '0', label: 'No' },
    { value: '1', label: 'Sí' }
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
        email: '', // Para la creación del usuario asociado
    });

    const submit = (e) => {
        e.preventDefault();
        
        // Transformamos datos antes de enviar (ej. convertir string a boolean)
        transform((currentData) => ({
            ...currentData,
            is_native: currentData.is_native === '1',
            ttc_hours: parseInt(currentData.ttc_hours) || 0,
        }));

        post('/teachers', { 
            onSuccess: () => { 
                reset(); 
                onClose(); 
            } 
        });
    };

    return (
        <FormModal title={title} show={show} onClose={onClose}>
            <form onSubmit={submit}>
                
                {/* Visualización de errores de validación */}
                {Object.keys(errors).length > 0 && (
                    <div className="p-4 mb-4 text-sm text-white bg-red-500 rounded-lg">
                        <strong>Errores detectados:</strong>
                        <ul className="list-disc ml-5">
                            {Object.values(errors).map((err, i) => <li key={i}>{err}</li>)}
                        </ul>
                    </div>
                )}

                <FieldGroup>
                    {/* --- SECCIÓN 1: INFORMACIÓN PERSONAL --- */}
                    <FieldSet>
                        <FieldLegend>Información Personal</FieldLegend>
                        <FieldDescription>Datos de identificación oficial del docente.</FieldDescription>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputForm label="Nombre(s)" inputId="first_name" value={data.first_name} onChange={e => setData('first_name', e.target.value)} />
                            <InputForm label="Apellidos" inputId="last_name" value={data.last_name} onChange={e => setData('last_name', e.target.value)} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputForm label="RFC" inputId="rfc" value={data.rfc} onChange={e => setData('rfc', e.target.value.toUpperCase())} />
                            <InputForm label="CURP" inputId="curp" value={data.curp} onChange={e => setData('curp', e.target.value.toUpperCase())} />
                        </div>

                        <InputForm label="Correo Electrónico" type="email" inputId="email" value={data.email} onChange={e => setData('email', e.target.value)} />
                    </FieldSet>

                    <FieldSeparator />

                    {/* --- SECCIÓN 2: PERFIL ACADÉMICO Y LABORAL --- */}
                    <FieldSet>
                        <FieldLegend>Perfil Académico y Laboral</FieldLegend>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputForm label="Grado Académico (Ej. Mtro, Dr)" inputId="grade" value={data.grade} onChange={e => setData('grade', e.target.value)} />
                            <SelectForm options={CATEGORY_OPTIONS} label="Categoría" selectId="category" value={data.category} onValueChange={v => setData('category', v)} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <InputForm label="Nivel" inputId="level" value={data.level} onChange={e => setData('level', e.target.value)} />
                            <InputForm label="Horas TTC" type="number" inputId="ttc_hours" value={data.ttc_hours} onChange={e => setData('ttc_hours', e.target.value)} />
                            <SelectForm options={NATIVE_OPTIONS} label="¿Es Nativo?" selectId="is_native" value={data.is_native} onValueChange={v => setData('is_native', v)} />
                        </div>
                    </FieldSet>

                    <FieldSeparator />

                    {/* --- SECCIÓN 3: DATOS BANCARIOS --- */}
                    <FieldSet>
                        <FieldLegend>Información de Pago</FieldLegend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputForm label="Nombre del Banco" inputId="bank_name" value={data.bank_name} onChange={e => setData('bank_name', e.target.value)} />
                            <InputForm label="CLABE Interbancaria" inputId="clabe" value={data.clabe} onChange={e => setData('clabe', e.target.value)} />
                        </div>
                    </FieldSet>

                    <ButtonForm onCancel={onClose} disabled={processing} />
                </FieldGroup>
            </form>
        </FormModal>
    );
}