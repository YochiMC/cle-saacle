/**
 * TeacherForm
 *
 * Sub-formulario de información del docente para el perfil de usuario.
 * Renderiza todos los campos requeridos por UpdateTeacherRequest y recibe
 * el estado compartido desde UpdateProfileInformationForm para mantener
 * un único punto de verdad en el formulario padre.
 *
 * @component
 *
 * @param {Object}   data                 - Estado del formulario (desde useForm del padre).
 * @param {Function} setData              - Setter del estado del formulario.
 *
 * @example
 * <TeacherForm
 *   data={data}
 *   setData={setData}
 * />
 */

import {
    FieldDescription,
    FieldGroup,
    FieldLegend,
    FieldSet,
} from "@/Components/ui/field";
import InputForm from "@/Components/Forms/InputForm";
import SelectForm from "@/Components/Forms/SelectForm";
import CheckboxForm from "@/Components/Forms/CheckboxForm";

export default function TeacherForm({ data, setData }) {
    // ── Opciones del select de categoría ────────────────────────────────────
    const categoryOptions = [
        { value: "A", label: "A" },
        { value: "B", label: "B" },
        { value: "C", label: "C" },
    ];

    return (
        <FieldSet>
            <FieldLegend>Datos del Docente</FieldLegend>
            <FieldDescription>
                Identificación y contacto para su registro.
            </FieldDescription>
            <FieldGroup>
                {/* ── Nombre y apellido ── */}
                <InputForm
                    label="Nombre(s)"
                    inputId="teacher-first-name"
                    placeholder="Ej. Ana Maria"
                    description="Captura los nombres como aparecen en su identificación."
                    value={data.first_name}
                    onChange={(e) => setData("first_name", e.target.value)}
                />
                <InputForm
                    label="Apellidos"
                    inputId="teacher-last-name"
                    placeholder="Ej. Perez Gomez"
                    value={data.last_name}
                    onChange={(e) => setData("last_name", e.target.value)}
                />

                {/* ── Documentos de identidad ── */}
                <InputForm
                    label="RFC"
                    inputId="teacher-rfc"
                    placeholder="ABCD9001011A1"
                    description="Se convertirá automáticamente a mayúsculas."
                    value={data.rfc}
                    onChange={(e) =>
                        setData("rfc", e.target.value.toUpperCase())
                    }
                />
                <InputForm
                    label="CURP"
                    inputId="teacher-curp"
                    placeholder="ABCD900101HDFRRN01"
                    description="Se convertirá automáticamente a mayúsculas."
                    value={data.curp}
                    onChange={(e) =>
                        setData("curp", e.target.value.toUpperCase())
                    }
                />

                <InputForm
                    label="Correo electrónico"
                    inputId="teacher-email"
                    type="email"
                    placeholder="docente@institucion.edu.mx"
                    description="Usado para comunicación y acceso al sistema."
                    value={data.email}
                    onChange={(e) => setData("email", e.target.value)}
                />
                <InputForm
                    label="Teléfono"
                    inputId="teacher-phone"
                    placeholder="10 dígitos"
                    value={data.phone}
                    onChange={(e) => setData("phone", e.target.value)}
                />

                {/* ── Datos bancarios ── */}
                <FieldLegend>Perfil Académico</FieldLegend>
                <FieldDescription>
                    Información de categoría, nivel y carga docente.
                </FieldDescription>
                <SelectForm
                    label="Categoría"
                    selectId="teacher-category"
                    placeholder="Selecciona una categoría"
                    options={categoryOptions}
                    value={data.category}
                    onValueChange={(val) => setData("category", val)}
                />
                <InputForm
                    label="Nivel"
                    inputId="teacher-level"
                    placeholder="Ej. Licenciatura"
                    value={data.level}
                    onChange={(e) => setData("level", e.target.value)}
                />
                <InputForm
                    label="Grado académico (ej. Mtro., Dr.)"
                    inputId="teacher-grade"
                    placeholder="Ej. Mtro."
                    value={data.grade}
                    onChange={(e) => setData("grade", e.target.value)}
                />
                <InputForm
                    label="Horas TTC"
                    inputId="teacher-ttc-hours"
                    type="number"
                    placeholder="Ej. 20"
                    description="Carga horaria asignada al docente."
                    value={data.ttc_hours}
                    onChange={(e) => setData("ttc_hours", e.target.value)}
                />

                {/* ── Docente nativo ── */}
                <CheckboxForm
                    label="Docente nativo"
                    checkboxId="teacher-is-native"
                    description="Marcar si el docente es hablante nativo del idioma que imparte."
                    checked={Boolean(data.is_native)}
                    onCheckedChange={(checked) =>
                        setData("is_native", Boolean(checked))
                    }
                />

                <FieldLegend>Datos de Pago</FieldLegend>
                <FieldDescription>
                    Cuenta bancaria para gestión administrativa.
                </FieldDescription>
                <InputForm
                    label="Banco"
                    inputId="teacher-bank-name"
                    placeholder="Ej. BBVA"
                    value={data.bank_name}
                    onChange={(e) => setData("bank_name", e.target.value)}
                />
                <InputForm
                    label="CLABE Interbancaria"
                    inputId="teacher-clabe"
                    placeholder="18 dígitos"
                    description="Verifica la CLABE antes de guardar."
                    value={data.clabe}
                    onChange={(e) => setData("clabe", e.target.value)}
                />
            </FieldGroup>
        </FieldSet>
    );
}
