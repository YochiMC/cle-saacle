/**
 * Users
 *
 * Vista de administración de usuarios. Permite alternar entre alumnos
 * y maestros, mostrar sus listados y abrir el modal de alta según
 * la vista seleccionada.
 *
 * @param {Object} props
 * @param {Array<Object>} props.degrees Carreras disponibles para el formulario de alumno.
 * @param {Array<Object>} props.students Listado de alumnos registrados.
 * @param {Array<Object>} props.teachers Listado de maestros registrados.
 * @param {Array<Object>} props.levels Niveles académicos disponibles.
 * @param {Array<Object>} props.typeStudents Tipos de estudiante (por ejemplo, Regular o Egresado).
 * @param {Array<Object>} [props.studentStatuses] Catálogo de estados del backend para UI.
 * @returns {JSX.Element}
 */

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ResourceDashboard from "@/Components/ResourceDashboard";
import { useState } from "react";
import StudentModal from "@/Components/domain/Users/StudentModal";
import TeacherModal from "@/Components/domain/Users/TeacherModal";
import ModalAlert from "@/Components/ui/ModalAlert";
import { Head, router } from "@inertiajs/react";
import useFlashAlert from "@/Hooks/useFlashAlert";
import ConfirmModal from "@/Components/ui/ConfirmModal";
import { USERS_HIDDEN_COLUMNS } from "@/Constants/tableColumns";
import {
    BASE_STUDENT_KEYS,
    STATUS_KEYS,
    FOOTER_KEYS,
    IGNORED_DYNAMIC_KEYS,
} from "@/Constants/tableDictionary";
import { useMemo } from "react";

// Definidas fuera del componente para mantener referencia estable entre renders.
const VIEW_OPTIONS = [
    { value: "alumnos", label: "Alumnos" },
    { value: "maestros", label: "Maestros" },
];

export default function Users({
    degrees,
    students,
    teachers,
    levels,
    typeStudents,
}) {
    // Centraliza el estado del modal de alertas de feedback (flash messages).
    const { flashModal, closeFlashModal } = useFlashAlert();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentView, setCurrentView] = useState("alumnos");

    const [itemToDelete, setItemToDelete] = useState(null);

    // La tabla muestra etiqueta humana y conserva el valor técnico para lógica interna.
    const studentsForTable = students.map((student) => ({
        ...student,
        status: student.status_label ?? student.status,
    }));

    // Configuración de columnas para el dominio académico (Patrón ISP)
    const academicColumnConfig = useMemo(() => ({
        // Definimos las llaves base para asegurar que el Nombre y Control siempre vayan al inicio.
        baseKeys: ["full_name", "num_control"],

        // Priorizamos el sello de estado (Etiqueta legible) y el estatus de deserción.
        statusKeys: ["status_label", "is_left"],

        footerKeys: FOOTER_KEYS,

        // Reducción de ruido visual: ignoramos IDs técnicos y campos redundantes.
        ignoredKeys: new Set([
            ...IGNORED_DYNAMIC_KEYS,
            "id",
            "user_id",
            "first_name",
            "last_name",
            "birthdate",
            "degree_id",
            "level_id",
            "type",
            "type_student",
            "status",
            "gender",
            "email",
        ]),

        customOrder: (dynamicKeys) => {
            // 1. Declaración de preferencias ideales para el negocio.
            const businessPreferences = [
                "age",
                "semester",
                "degree",
                "level",
                "type_student_label",
            ];

            // 2. Intercepción y Validación: Solo incluimos llaves que existen en el payload actual.
            const validPreferredOrder = businessPreferences.filter(key => 
                dynamicKeys.includes(key)
            );
            
            // 3. Unión determinista: Preferencias validadas + resto de llaves dinámicas.
            return [...new Set([...validPreferredOrder, ...dynamicKeys])];
        }
    }), []);

    /**
     * Navega al perfil del registro seleccionado.
     *
     * @param {Object} item
     * @param {number|string} item.user_id Identificador del usuario asociado al registro.
     * @returns {void}
     */

    const handleEditRow = (item) => {
        const userId = item?.user_id;
        if (!userId) return;
        router.get(route("profiles", userId));
    };

    const openDeleteModal = (item) => {
        setItemToDelete(item);
    };

    const handleDeleteRow = () => {
        if (!itemToDelete) return;

        const itemId = itemToDelete?.id;
        if (!itemId) return;

        switch (currentView) {
            case "alumnos":
                router.delete(route("students.delete", itemId), {
                    onSuccess: () => setItemToDelete(null),
                });
                break;
            case "maestros":
                router.delete(route("teachers.delete", itemId), {
                    onSuccess: () => setItemToDelete(null),
                });
                break;
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Usuarios
                </h2>
            }
        >
            <Head title="Usuarios" />
            <ResourceDashboard
                title="Gestión de usuarios"
                columnConfig={academicColumnConfig}
                dataMap={{ alumnos: studentsForTable, maestros: teachers }}
                viewOptions={VIEW_OPTIONS}
                deleteRoute={{
                    alumnos: route("students.bulk-delete"),
                    maestros: route("teachers.bulk-delete"),
                }}
                bulkDeleteMethod="delete"
                onNew={() => setIsModalOpen(true)}
                onEditRow={handleEditRow}
                onDeleteRow={openDeleteModal}
                onViewChange={(view) => setCurrentView(view)}
                restrictedColumns={["attempt"]}
                hiddenColumns={USERS_HIDDEN_COLUMNS}
            />

            {/* Modales — se monta únicamente el correspondiente a la vista activa */}
            {currentView === "alumnos" && (
                <StudentModal
                    title="Añadir alumno"
                    show={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    degrees={degrees}
                    levels={levels}
                    typeStudents={typeStudents}
                />
            )}

            {currentView === "maestros" && (
                <TeacherModal
                    title="Añadir maestro"
                    show={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            )}

            <ConfirmModal
                isOpen={itemToDelete != null}
                onClose={() => setItemToDelete(null)}
                onConfirm={handleDeleteRow}
                title="Eliminar usuario"
                // Opcional: Puedes usar el nombre del usuario en el mensaje para darle más contexto
                message={`¿Estás seguro de que deseas eliminar a ${itemToDelete?.first_name || itemToDelete?.full_name || "este usuario"}? Esta acción no se puede deshacer.`}
                confirmText="Sí, eliminar"
                variant="warning"
            />

            <ModalAlert
                isOpen={flashModal.isOpen}
                onClose={closeFlashModal}
                type={flashModal.type}
                title={flashModal.title}
                message={flashModal.message}
            />
        </AuthenticatedLayout>
    );
}


