import React from "react";
import { Head } from "@inertiajs/react";
import ResourceDashboard from "@/Components/ResourceDashboard";

/**
 * Test — Vista de gestión de carreras, alumnos y maestros.
 *
 * Uso del Modo Docente (Feature Toggle):
 *  - El switch "Admin / Docente" está integrado en el header del ResourceDashboard.
 *  - Desde aquí solo declaramos QUÉ columnas son editables y cuáles están restringidas.
 *
 * editableColumns   → en Modo Docente se convierten en <input type="number">
 * restrictedColumns → en Modo Docente desaparecen por completo (ni de la tabla ni del menú)
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
        <div className="min-h-screen bg-slate-50 py-12">
            <Head title="Gestión Académica" />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
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
                    // ── MODO DOCENTE: configuración de columnas ───────────────
                    // editableColumns: se vuelven <input type="number"/> cuando el
                    // docente activa el toggle. Usa los nombres exactos de tu Eloquent.
                    editableColumns={["firstName", "lastName"]}
                    // restrictedColumns: se eliminan COMPLETAMENTE en Modo Docente.
                    // No aparecen ni como columna ni en el menú "Toggle Columns".
                    restrictedColumns={["birthDate", "semester", "gender"]}
                />
            </div>
        </div>
    );
}
