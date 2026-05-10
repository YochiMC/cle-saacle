import { METADATA_KEYS as EXAM_METADATA_KEYS } from "@/Pages/Exams/Constants/examConstants";
import { METADATA_KEYS as GROUP_METADATA_KEYS } from "@/Pages/Groups/Constants/groupConstants";

/**
 * Diccionario centralizado de etiquetas para las tablas del sistema.
 * Agnóstico de React para evitar dependencias circulares.
 */
export const LABEL_MAP = {
    id: "ID",
    user_id: "User ID",
    student_id: "Student ID",
    teacher_id: "Teacher ID",
    group_id: "Group ID",
    exam_id: "Exam ID",
    exam_student_id: "Exam Student ID",
    num_control: "Num Control",
    full_name: "Name",
    first_name: "First Name",
    last_name: "Last Name",
    email: "Email",
    gender: "Gender",
    semester: "Semester",
    birthdate: "Birth Date",
    status: "Status",
    status_label: "Status",
    is_active: "Active",
    is_left: "Left",
    is_approved: "Approved",
    is_curso_nivelacion: "Leveling Course",
    score: "Score",
    attempt: "Attempt",
    final_average: "Final Average",
    promedio_habilidades: "Skills Average",
    calificacion: "Grade",
    calificacion_final: "Final Grade",
    calificacion_curso_nivelacion: "Leveling Course Grade",
    calificacion_examen: "Exam Grade",
    grade_1: "Grade 1",
    grade_2: "Grade 2",
    grade_3: "Grade 3",
    certified_level: "Certified Level",
    nivel_certificado: "Certified Level",
    nivel_asignado: "Assigned Level",
    listening: "Listening",
    reading: "Reading",
    writing: "Writing",
    speaking: "Speaking",
    created_at: "Created",
    updated_at: "Updated",
    deleted_at: "Deleted",
    created_date: "Created Date",
    updated_date: "Updated Date",
    type: "Type",
    level: "Level",
    name: "Name",
    title: "Title",
    description: "Description",
    select: "Select",
    actions: "Actions",
};

/**
 * Formatea una llave de objeto en una etiqueta legible.
 * Prioriza el diccionario LABEL_MAP.
 */
export const formatLabel = (key) => {
    if (LABEL_MAP[key]) return LABEL_MAP[key];
    return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

export const BASE_STUDENT_KEYS = [
    "id",
    "full_name",
    "num_control",
    "gender",
    "semester",
];

export const STATUS_KEYS = ["is_left", "attempt", "is_approved"];

export const FOOTER_KEYS = ["final_average", "promedio_habilidades"];

export const GRADE_COLUMNS = [
    "score",
    "final_average",
    "calificacion",
    "calificacion_final",
    "promedio",
    "listening",
    "reading",
    "writing",
    "speaking",
    "unit_",
    "a1",
    "a2",
    "b1",
    "b2",
    "c1",
    "c2",
    "grade_",
];

export const IGNORED_DYNAMIC_KEYS = new Set([
    ...EXAM_METADATA_KEYS,
    ...GROUP_METADATA_KEYS,
    ...BASE_STUDENT_KEYS,
    ...STATUS_KEYS,
    ...FOOTER_KEYS,
    "exam_student_id",
    "student_id",
    "group_id",
]);
