import React from "react";
import { Head } from "@inertiajs/react";
import ResourceDashboard from "@/Components/ResourceDashboard";

/**
 * Test — Vista de gestión de carreras, alumnos y maestros.
 */
export default function Test({ degrees, students, teachers }) {
    const VIEW_OPTIONS = [
        { value: "carreras", label: "Carreras" },
        { value: "alumnos", label: "Alumnos" },
        { value: "maestros", label: "Maestros" },
    ];

    // Función para crear un nuevo registro
    const handleCreateNuevo = () => {
        alert("Navegando a la pantalla de creación...");
    };

    return (
        <div className="min-h-screen py-12 bg-slate-50">
            <Head title="Gestión Académica" />

            <ResourceDashboard
                title="Gestión Académica"
                dataMap={{
                    carreras: degrees,
                    alumnos: students,
                    maestros: teachers,
                }}
                viewOptions={VIEW_OPTIONS}
                deleteRoute="/carreras/eliminar-masivo"
                onNew={handleCreateNuevo}
            />
        </div>
    );
}
