import { Head } from "@inertiajs/react";
import Graficas from "@/Components/Charts/Graphics";
import { useState } from "react";
import ModalAlert from "@/Components/UI/ModalAlert";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";


export default function Reports({ degrees = [], students = [], levels = [] }) {
    const [openModal, setOpenModal] = useState(false);

    // SELECTORES DE LAS 4 GRAFICAS
    const [chartType1, setChartType1] = useState("carrera");
    const [chartType2, setChartType2] = useState("genero");
    const [chartType3, setChartType3] = useState("semestre");
    const [chartType4, setChartType4] = useState("level");

    // -------------------
    // DATOS DE GRAFICAS
    // -------------------

    // TOTAL GENERAL DE ALUMNOS
    const totalStudentsData = [
        {
            name: "Alumnos Inscritos",
            total: students.length,
        },
    ];
    //NIVEL
    const levelData = levels.map((lvl) => {
        const total = students.filter((s) => s.level_id === lvl.id); 
        console.log(total);
        const total2 = total.filter((s) => s.gender === "M").length; 
        console.log("total2: "+total2);

        return {
            name: lvl.level_tecnm,
            total2,
            
        };
    });
    

    const carreraData = degrees.map((degree) => {
        const total = students.filter((s) => s.degree_id === degree.id).length;

        return {
            name: degree.name,
            total,
        };
    });

    // GENERO
    const generoData = [
        {
            name: "Hombres",
            total: students.filter((s) => s.gender === "M").length,
        },
        {
            name: "Mujeres",
            total: students.filter((s) => s.gender === "F").length,
        },
    ];

    // SEMESTRE
    const semestreData = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((sem) => {
        const total = students.filter((s) => s.semester === sem).length;

        return {
            name: `Sem ${sem}`,
            total,
        };
    });

    // FUNCION PARA CAMBIAR DATOS
    const getChartData = (type) => {
        if (type === "carrera") return carreraData;
        if (type === "genero") return generoData;
        if (type === "semestre") return semestreData;
        if (type === "level") return levelData;

        return [];
    };
    return (
        <AuthenticatedLayout>
            <div className="min-h-screen bg-gray-100 py-12">
                <Head title="Estadísticas" />

                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <ModalAlert
                        isOpen={openModal}
                        onClose={() => setOpenModal(false)}
                        type="error"
                        title="Error al registrar"
                        message="No se pudo inscribir al estudiante."
                    />
                    {/* GRAFICA GRANDE ARRIBA */}

                    <Graficas
                        title="Total de alumnos inscritos"
                        chartData={totalStudentsData}
                    />
                    {/* 4 GRAFICAS CON SELECTOR */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <Graficas
                            title="Cursos ordinarios"
                            chartData={getChartData(chartType1)}
                            showSelector={true}
                            chartType={chartType1}
                            setChartType={setChartType1}
                        />
                        <Graficas
                            title="Egresados próximos a egresar"
                            chartData={getChartData(chartType2)}
                            showSelector={true}
                            chartType={chartType2}
                            setChartType={setChartType2}
                        />

                        <Graficas
                            title="Examen 4 Habilidades"
                            chartData={getChartData(chartType3)}
                            showSelector={true}
                            chartType={chartType3}
                            setChartType={setChartType3}
                        />

                        <Graficas
                            title="Examen de Validación"
                            chartData={getChartData(chartType4)}
                            showSelector={true}
                            chartType={chartType4}
                            setChartType={setChartType4}
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}