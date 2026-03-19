import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ResourceDashboard from "@/Components/ResourceDashboard";
import { usePermission } from "@/Utils/auth";

/**
 * Vista de Gestión de Grupo (Dashboard).
 * Muestra los alumnos inscritos y permite la captura de calificaciones.
 *
 * - La transformación y aplanado de datos ('flattening') ahora se maneja
 *   desde Laravel a través del StudentQualificationResource, siguiendo
 *   el Principio de Responsabilidad Única (SRP). El frontend solo renderiza.
 *
 * @param {Object} props
 * @param {Object} props.auth - Objeto de autenticación de Inertia.
 * @param {Object} props.grupo - El objeto del grupo cargado.
 * @param {Array} props.enrolledStudents - Colección serializada de alumnos listos para la tabla.
 */
export default function GroupView({ auth, grupo, enrolledStudents = [] }) {
    // Utilizamos el Custom Hook para el manejo de roles
    const { hasRole } = usePermission();

    // Inertia puede recibir ResourceCollection como { data: [...] } o como array plano.
    const normalizedEnrolledStudents = Array.isArray(enrolledStudents)
        ? enrolledStudents
        : Array.isArray(enrolledStudents?.data)
          ? enrolledStudents.data
          : [];

    // Verificamos si el usuario actual es docente o administrador
    const canEditQualifications = hasRole("teacher") || hasRole("admin");

    // Formateamos las opciones de vista para el ResourceDashboard
    const viewOptions = [{ value: "alumnos", label: "Alumnos Inscritos" }];

    // DataMap inyecta los alumnos que ahora vienen listos desde el API Resource de Laravel
    const dataMap = {
        alumnos: normalizedEnrolledStudents,
    };

    // Lógica de Roles: Configuramos las columnas editables dinámicamente.
    // Usamos EXACTAMENTE las keys devueltas por el StudentQualificationResource
    const editableColumns = canEditQualifications
        ? ["unit_1", "unit_2", "is_approved", "is_left"]
        : [];

    // Definimos las columnas que NO deseamos que se rendericen en TanStack Table durante modo lectura.
    // Usamos EXACTAMENTE las keys del recurso
    const restrictedColumns = [
        "matricula",
        "full_name",
        "final_average",
        "semester",
        "gender",
    ];

    return (
        <AuthenticatedLayout
            user={auth?.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Gestión de Grupo: {grupo?.name || "N/A"}
                </h2>
            }
        >
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <ResourceDashboard
                        title={`Calificaciones del Grupo: ${grupo?.name || "N/A"}`}
                        dataMap={dataMap}
                        viewOptions={viewOptions}
                        deleteRoute={route("groups.bulk-delete")}
                        editableColumns={["unit_1", "unit_2"]}
                        restrictedColumns={restrictedColumns}
                        hiddenColumns={{ qualification_id: false }}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
