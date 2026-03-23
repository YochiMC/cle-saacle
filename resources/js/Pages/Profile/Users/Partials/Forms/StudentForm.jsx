/**
 * StudentForm
 *
 * Sub-formulario de información del estudiante para el perfil de usuario.
 * Renderiza todos los campos requeridos por UpdateStudentRequest y recibe
 * el estado compartido desde UpdateProfileInformationForm para mantener
 * un único punto de verdad en el formulario padre.
 *
 * @component
 *
 * @param {Object}   data                          - Estado del formulario (desde useForm del padre).
 * @param {Function} setData                       - Setter del estado del formulario.
 * @param {Array<{id: number, name: string}>}               degrees      - Catálogo de carreras.
 * @param {Array<{id: number, level_mcer: string}>}         levels       - Catálogo de niveles MCER.
 * @param {Array<{id: number, name: string}>}               typeStudents - Catálogo de tipos de estudiante.
 *
 * @example
 * <StudentForm
 *   data={data}
 *   setData={setData}
 *   degrees={degrees}
 *   levels={levels}
 *   typeStudents={typeStudents}
 * />
 */

import { useEffect, useState } from "react";

import {
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLegend,
    FieldSet,
} from "@/Components/ui/field";
import InputForm from "@/Components/Forms/InputForm";
import SelectForm from "@/Components/Forms/SelectForm";

const SEMESTER_OPTIONS = Array.from({ length: 14 }, (_, i) => ({ value: (i + 1).toString(), label: `Semestre ${i + 1}` }));

const DAYS = Array.from({ length: 31 }, (_, i) => ({
    value: (i + 1).toString(),
    label: (i + 1).toString(),
}));

const MONTHS = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: new Date(0, i).toLocaleString("default", { month: "long" }),
}));

const YEARS = Array.from({ length: 100 }, (_, i) => {
    const year = (new Date().getFullYear() - i).toString();
    return { value: year, label: year };
});

function parseBirthdate(value) {
    if (!value || typeof value !== "string") {
        return { year: "", month: "", day: "" };
    }

    const [year = "", month = "", day = ""] = value.split("-");
    return {
        year,
        month: month ? String(Number(month)) : "",
        day: day ? String(Number(day)) : "",
    };
}

function composeBirthdate(year, month, day) {
    if (!year || !month || !day) {
        return "";
    }

    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

export default function StudentForm({
    data,
    setData,
    degrees = [],
    levels = [],
    typeStudents = [],
    errors = {},
}) {
    const [birthDay, setBirthDay] = useState("");
    const [birthMonth, setBirthMonth] = useState("");
    const [birthYear, setBirthYear] = useState("");

    useEffect(() => {
        const { year, month, day } = parseBirthdate(data.birthdate);
        setBirthYear(year);
        setBirthMonth(month);
        setBirthDay(day);
    }, [data.birthdate]);

    // ── Opciones de los selects ──────────────────────────────────────────────
    const genderOptions = [
        { value: "M", label: "Masculino" },
        { value: "F", label: "Femenino" },
    ];

    const degreeOptions = degrees.map((d) => ({
        value: String(d.id),
        label: d.name,
    }));

    const levelOptions = levels.map((l) => ({
        value: String(l.id),
        label: l.level_tecnm,
    }));

    const typeStudentOptions = typeStudents.map((t) => ({
        value: String(t.id),
        label: t.name,
    }));

    // Determina si el tipo seleccionado es "Egresado" para adaptar los campos del formulario.
    const selectedType = typeStudents.find(
        (t) => String(t.id) === String(data.type_student_id ?? "")
    );
    const isEgresado = selectedType?.name.toLowerCase() === 'egresado';

    return (
        <FieldSet>
            <FieldLegend>Datos del Alumno</FieldLegend>
            <FieldDescription>
                Información personal para alta y seguimiento.
            </FieldDescription>
            <FieldGroup>
                <SelectForm
                    label="Tipo de estudiante"
                    selectId="student-type"
                    placeholder="Selecciona un tipo"
                    description="Define los campos académicos y de acceso."
                    options={typeStudentOptions}
                    value={String(data.type_student_id)}
                    onValueChange={(val) => setData("type_student_id", Number(val))}
                />
                <FieldError>{errors.type_student_id}</FieldError>

                {/* ── Nombre y apellido ── */}
                <InputForm
                    label="Nombre(s)"
                    inputId="student-first-name"
                    placeholder="Ej. Carlos Alberto"
                    value={data.first_name}
                    onChange={(e) => setData("first_name", e.target.value)}
                />
                <FieldError>{errors.first_name}</FieldError>
                <InputForm
                    label="Apellidos"
                    inputId="student-last-name"
                    placeholder="Ej. Lopez Martinez"
                    value={data.last_name}
                    onChange={(e) => setData("last_name", e.target.value)}
                />
                <FieldError>{errors.last_name}</FieldError>

                {/* ── Número de control ── */}
                <InputForm
                    label="Número de control"
                    inputId="student-num-control"
                    placeholder="Ej. 22161045"
                    description="Identificador escolar único."
                    value={data.num_control}
                    onChange={(e) => setData("num_control", e.target.value)}
                />
                <FieldError>{errors.num_control}</FieldError>

                {/* ── Género ── */}
                <SelectForm
                    label="Género"
                    selectId="student-gender"
                    placeholder="Selecciona una opción"
                    options={genderOptions}
                    value={data.gender}
                    onValueChange={(val) => setData("gender", val)}
                />
                <FieldError>{errors.gender}</FieldError>

                {/* ── Fecha de nacimiento ── */}
                <FieldLegend>Fecha de nacimiento</FieldLegend>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <SelectForm
                        options={DAYS}
                        label="Día"
                        selectId="student-birth-day"
                        value={birthDay}
                        onValueChange={(day) => {
                            setBirthDay(day);
                            setData("birthdate", composeBirthdate(birthYear, birthMonth, day));
                        }}
                    />
                    <SelectForm
                        options={MONTHS}
                        label="Mes"
                        selectId="student-birth-month"
                        value={birthMonth}
                        onValueChange={(month) => {
                            setBirthMonth(month);
                            setData("birthdate", composeBirthdate(birthYear, month, birthDay));
                        }}
                    />
                    <SelectForm
                        options={YEARS}
                        label="Año"
                        selectId="student-birth-year"
                        value={birthYear}
                        onValueChange={(year) => {
                            setBirthYear(year);
                            setData("birthdate", composeBirthdate(year, birthMonth, birthDay));
                        }}
                    />
                </div>
                <FieldError>{errors.birthdate}</FieldError>

                {/* ── Semestre ── */}
                {!isEgresado && (
                    <>
                        <SelectForm
                            options={SEMESTER_OPTIONS}
                            label="Semestre"
                            selectId="semester"
                            placeholder="Selecciona un semestre"
                            description="Semestre actual del estudiante."
                            value={String(data.semester ?? "")}
                            onValueChange={(val) => setData("semester", val ? Number(val) : "")}
                        />
                        <FieldError>{errors.semester}</FieldError>
                    </>
                )}
                {/* ── Catálogos ── */}
                <SelectForm
                    label="Carrera"
                    selectId="student-degree"
                    placeholder="Selecciona una carrera"
                    options={degreeOptions}
                    value={String(data.degree_id)}
                    onValueChange={(val) => setData("degree_id", Number(val))}
                />
                <FieldError>{errors.degree_id}</FieldError>
                <SelectForm
                    label="Nivel"
                    selectId="student-level"
                    placeholder="Selecciona un nivel"
                    options={levelOptions}
                    value={String(data.level_id)}
                    onValueChange={(val) => setData("level_id", Number(val))}
                />
                <FieldError>{errors.level_id}</FieldError>
            </FieldGroup>
        </FieldSet>
    );
}
