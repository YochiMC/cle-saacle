/**
 * UpdateProfileInformationForm
 *
 * Formulario de actualización de información de perfil. Detecta el tipo de
 * perfil del usuario (student | teacher) y renderiza el sub-formulario
 * correspondiente, inyectándole el estado de `useForm` para mantener un único
 * punto de verdad y un único submit.
 *
 * El envío se realiza mediante `put` de useForm de Inertia hacia la ruta específica
 * del perfil (students.update o teachers.update), conservando la semántica REST
 * y reutilizando las Actions y Requests ya existentes.
 *
 * @component
 *
 * @param {Object}   user                  - Objeto de usuario entregado por UserResource.
 * @param {string}   user.name             - Nombre completo del usuario.
 * @param {string}   user.email            - Correo principal.
 * @param {string}   [user.email_recovery] - Correo alternativo.
 * @param {string}   [user.phone]          - Número de teléfono.
 * @param {Object}   [user.profile]        - Perfil del usuario (StudentProfileResource o TeacherProfileResource).
 * @param {string}   user.profile.type     - Tipo de perfil: "student" | "teacher".
 * @param {Array}    degrees               - Catálogo de carreras para el formulario de estudiante.
 * @param {Array}    levels                - Catálogo de niveles MCER.
 * @param {Array}    typeStudents          - Catálogo de tipos de estudiante.
 * @param {string}   [className]           - Clases CSS adicionales para el elemento section.
 *
 * @example
 * <UpdateProfileInformationForm
 *   user={user}
 *   degrees={degrees}
 *   levels={levels}
 *   typeStudents={typeStudents}
 *   className="max-w-xl"
 * />
 */

import {
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLegend,
    FieldSeparator,
    FieldSet,
} from "@/Components/ui/field";
import InputForm from "@/Components/Forms/InputForm";
import ButtonForm from "@/Components/Forms/ButtonForm";
import { useForm } from "@inertiajs/react";
import StudentForm from "./Forms/StudentForm";
import TeacherForm from "./Forms/TeacherForm";

export default function UpdateProfileInformationForm({
    roles,
    user,
    degrees = [],
    levels = [],
    typeStudents = [],
    className = "",
}) {
    // ── Estado del formulario ────────────────────────────────────────────────
    // Se inicializa con los campos del usuario más todos los campos del perfil
    // aplanados en un único objeto. De esta manera, StudentForm y TeacherForm
    // sólo necesitan leer/escribir en `data` y el submit conoce el valor actual.
    const { data, setData, put, processing, errors } = useForm({
        // Campos comunes del usuario
        email: user.email ?? "",
        email_recovery: user.email_recovery ?? "",
        phone: user.phone ?? "",

        // Campos del estudiante (se ignoran si el perfil es teacher)
        first_name: user.profile?.first_name ?? "",
        last_name: user.profile?.last_name ?? "",
        num_control: user.profile?.num_control ?? "",
        gender: user.profile?.gender ?? "",
        birthdate: user.profile?.birthdate ?? "",
        semester: user.profile?.semester ?? "",
        degree_id: user.profile?.degree_id ?? "",
        level_id: user.profile?.level_id ?? "",
        type_student_id: user.profile?.type_student_id ?? "",

        // Campos del docente (se ignoran si el perfil es student)
        category: user.profile?.category ?? "",
        level: user.profile?.level ?? "",
        rfc: user.profile?.rfc ?? "",
        curp: user.profile?.curp ?? "",
        clabe: user.profile?.clabe ?? "",
        ttc_hours: user.profile?.ttc_hours ?? "",
        bank_name: user.profile?.bank_name ?? "",
        grade: user.profile?.grade ?? "",
        is_native: user.profile?.is_native ?? false,
    });

    // ── Submit ───────────────────────────────────────────────────────────────
    // Enruta la petición según el tipo de perfil hacia las rutas
    // students.update o teachers.update definidas en web.php.
    const submit = (e) => {
        e.preventDefault();

        if (user.profile?.type === "student") {
            put(route("students.update", user.profile.id));
        } else if (user.profile?.type === "teacher") {
            put(route("teachers.update", user.profile.id));
        }
    };

    // ── Sub-formulario según tipo de perfil ──────────────────────────────────
    const renderProfileForm = () => {
        switch (user.profile?.type) {
            case "student":
                return (
                    <StudentForm
                        data={data}
                        setData={setData}
                        degrees={degrees}
                        levels={levels}
                        typeStudents={typeStudents}
                        errors={errors}
                    />
                );
            case "teacher":
                return (
                    <TeacherForm
                        data={data}
                        setData={setData}
                        errors={errors}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <section className={className}>
            {roles.map((role)=>{
                return <p key={role.id}>{role.name}</p>
            })}
            <form onSubmit={submit}>
                {Object.keys(errors).length > 0 && (
                    <div className="p-4 mb-4 text-sm text-white bg-red-500 rounded-lg">
                        <strong>Errores detectados:</strong>
                        <ul className="ml-5 list-disc">
                            {Object.values(errors).map((err, i) => (
                                <li key={i}>{err}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <FieldGroup>
                    {/* ── Sección: Información del usuario ── */}
                    <FieldSet>
                        <FieldLegend>Información del usuario</FieldLegend>
                        <FieldDescription>
                            Datos de acceso y contacto de la cuenta.
                        </FieldDescription>
                        <FieldGroup>
                            <InputForm
                                label="Correo electrónico"
                                inputId="profile-email"
                                type="email"
                                placeholder="correo@ejemplo.com"
                                description="Correo principal con el que se inicia sesión."
                                value={data.email}
                                onChange={(e) => setData("email", e.target.value)}
                            />
                            <FieldError>{errors.email}</FieldError>
                            <InputForm
                                label="Correo alternativo"
                                inputId="profile-email-recovery"
                                type="email"
                                placeholder="alternativo@ejemplo.com"
                                description="Correo de recuperación de cuenta."
                                required={false}
                                value={data.email_recovery}
                                onChange={(e) =>
                                    setData("email_recovery", e.target.value)
                                }
                            />
                            <FieldError>{errors.email_recovery}</FieldError>
                            <InputForm
                                label="Teléfono"
                                inputId="profile-phone"
                                type="tel"
                                placeholder="0123456789"
                                description="Número de teléfono principal."
                                required={false}
                                value={data.phone}
                                onChange={(e) => setData("phone", e.target.value)}
                            />
                            <FieldError>{errors.phone}</FieldError>
                        </FieldGroup>
                    </FieldSet>

                    {/* ── Separador + sub-formulario del perfil ── */}
                    {user.profile && <FieldSeparator />}
                    {renderProfileForm()}

                    <ButtonForm
                        submitLabel="Guardar cambios"
                        cancelLabel="Cancelar"
                        isLoading={processing}
                        tone="institutional"
                    />
                </FieldGroup>
            </form>
        </section>
    );
}
