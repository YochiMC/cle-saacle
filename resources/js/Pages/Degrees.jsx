import ResourceDashboard from "@/Components/ResourceDashboard";

const VIEW_OPTIONS = [
    { value: "carreras", label: "Carreras" },
    { value: "alumnos", label: "Alumnos" },
    { value: "maestros", label: "Maestros" },
];

export default function Degrees({ degrees, students, teachers }) {
    // Función para imprimir (Por ahora usaremos el diálogo de impresión nativo)
    const handlePrintGeneral = () => {
        window.print();
    };

    // Función para crear un nuevo registro
    const handleCreateNuevo = () => {
        // Aquí le decimos a Laravel que nos lleve a la pantalla de creación
        // Por ejemplo: router.get('/carreras/crear');
        alert("Navegando a la pantalla de creación...");
    };
    return (
        <>
            {/* ── TUS TABLAS INTACTAS ── */}
            <ResourceDashboard
                title="Carreras"
                dataMap={{
                    carreras: degrees,
                    alumnos: students,
                    maestros: teachers,
                }}
                viewOptions={VIEW_OPTIONS}
                deleteRoute="/carreras/eliminar-masivo"
                onPrint={handlePrintGeneral}
                onNew={handleCreateNuevo}
            />

            <ResourceDashboard
                title="Alumnos"
                dataMap={{ alumnos: students }}
                viewOptions={[{ value: "alumnos", label: "Alumnos" }]}
                deleteRoute="/alumnos/eliminar-masivo"
                onPrint={handlePrintGeneral}
                onNew={handleCreateNuevo}
            />

            <ResourceDashboard
                title="Maestros"
                dataMap={{ maestros: teachers }}
                viewOptions={[{ value: "maestros", label: "Maestros" }]}
                deleteRoute="/maestros/eliminar-masivo"
                onPrint={handlePrintGeneral}
                onNew={handleCreateNuevo}
            />
        </>
    );
}
