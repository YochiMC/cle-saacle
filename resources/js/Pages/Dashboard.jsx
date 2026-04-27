import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import Graficas from "@/Components/Charts/Graphics";
import { useState } from "react";
import { Mail, ShieldCheck, Activity, Users } from "lucide-react";

export default function Dashboard({ auth, degrees = [], students = [], levels = [], groups = [], exams = [] }) {
    // SELECTORES DE LAS 4 GRAFICAS
    const [chartType1, setChartType1] = useState("carrera");
    const [chartType2, setChartType2] = useState("genero");
    const [chartType3, setChartType3] = useState("semestre");
    const [chartType4, setChartType4] = useState("level");

    // TOTAL GENERAL DE ALUMNOS
    const totalStudentsData = [
        {
            name: "Alumnos Inscritos",
            total: students.length,
        },
    ];

    // OBTENER ESTUDIANTES BASE POR CATEGORÍA DE GRÁFICA
    const getBaseStudentsForCategory = (category) => {
        let targetIds = new Set();
        if (category === "Cursos ordinarios" && groups) {
            groups.forEach(g => (g.students || []).forEach(s => targetIds.add(s.id)));
        } else if (category === "Examen 4 Habilidades" && exams) {
            exams.filter(e => e.exam_type === '4 habilidades').forEach(e => (e.students || []).forEach(s => targetIds.add(s.id)));
        } else if (category === "Examen de Validación" && exams) {
            exams.filter(e => e.exam_type === 'Convalidación').forEach(e => (e.students || []).forEach(s => targetIds.add(s.id)));
        } else if (category === "Egresados próximos a egresar") {
            students.filter(s => s.semester >= 8).forEach(s => targetIds.add(s.id));
        } else {
            return students;
        }
        return students.filter(s => targetIds.has(s.id));
    };

    // FUNCION PARA CAMBIAR DATOS
    const getChartData = (metricType, categoryTitle) => {
        const targetStudents = getBaseStudentsForCategory(categoryTitle);

        if (metricType === "carrera") {
            return degrees.map((degree) => ({
                name: degree.name,
                total: targetStudents.filter((s) => s.degree_id === degree.id).length,
            }));
        }
        if (metricType === "genero") {
            return [
                { name: "Hombres", total: targetStudents.filter((s) => s.gender === "M").length },
                { name: "Mujeres", total: targetStudents.filter((s) => s.gender === "F").length },
            ];
        }
        if (metricType === "semestre") {
            return [1, 2, 3, 4, 5, 6, 7, 8, 9].map((sem) => ({
                name: `Sem ${sem}`,
                total: targetStudents.filter((s) => s.semester === sem).length,
            }));
        }
        if (metricType === "level") {
            return levels.map((lvl) => ({
                name: lvl.level_tecnm,
                total: targetStudents.filter((s) => s.level_id === lvl.id).length,
            }));
        }
        return [
            { name: "Total", total: targetStudents.length }
        ];
    };

    return (
        <AuthenticatedLayout
            user={auth?.user}
            header={
                <h2 className="font-bold text-2xl text-gray-800 leading-tight flex items-center gap-2">
                    <Activity className="w-7 h-7 text-indigo-600" />
                    Panel Principal
                </h2>
            }
        >
            <Head title="Panel Principal" />

            <div className="py-8 min-h-screen bg-gray-50/50">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-10">
                    
                    {/* SECCIÓN DE USUARIO */}
                    <div className="bg-white overflow-hidden shadow-lg shadow-indigo-100/50 sm:rounded-3xl border border-indigo-50 relative group transition-all duration-300 hover:shadow-xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 group-hover:scale-110 transition-transform duration-700 pointer-events-none"></div>
                        <div className="p-8 md:p-10 relative z-10 flex flex-col md:flex-row items-center gap-8">
                            <div className="w-28 h-28 rounded-full ring-4 ring-indigo-50 bg-gradient-to-tr from-indigo-600 to-purple-600 flex justify-center items-center text-white text-4xl font-extrabold shadow-xl shrink-0">
                                {auth?.user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="text-center md:text-left flex-1">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 mb-3 uppercase tracking-wide">
                                    <ShieldCheck className="w-4 h-4" /> Activo
                                </span>
                                <h3 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-2">¡Hola, {auth.user.name}!</h3>
                                <p className="text-gray-500 text-lg flex items-center justify-center md:justify-start gap-2">
                                    <Mail className="w-5 h-5" /> 
                                    {auth.user.email}
                                </p>
                            </div>
                            <div className="flex gap-4 w-full md:w-auto mt-4 md:mt-0 shadow-sm rounded-2xl">
                                <div className="bg-white px-6 py-4 rounded-2xl border border-gray-100 text-center flex-1 shadow-sm">
                                    <p className="text-sm font-medium text-gray-500 mb-1">Rol</p>
                                    <p className="text-lg font-bold text-gray-900 capitalize">{auth.user.roles?.[0]?.name || 'Miembro'}</p>
                                </div>
                                <div className="bg-indigo-50 px-6 py-4 rounded-2xl border border-indigo-100 text-center flex-1 shadow-sm shrink-0">
                                    <p className="text-sm font-medium text-indigo-500 mb-1">Estado</p>
                                    <p className="text-lg font-bold text-indigo-900 flex items-center justify-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                        En línea
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* GRÁFICAS */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 px-2 border-b border-gray-200 pb-4">
                            <Users className="w-7 h-7 text-indigo-500" />
                            <h3 className="text-2xl font-bold text-gray-800 tracking-tight">Estadísticas Generales</h3>
                        </div>

                        {/* GRAFICA GRANDE ARRIBA */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
                            <Graficas
                                title="Total de alumnos inscritos"
                                chartData={totalStudentsData}
                            />
                        </div>

                        {/* 4 GRAFICAS CON SELECTOR */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
                                <Graficas
                                    title="Cursos ordinarios"
                                    chartData={getChartData(chartType1, "Cursos ordinarios")}
                                    showSelector={true}
                                    chartType={chartType1}
                                    setChartType={setChartType1}
                                />
                            </div>
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
                                <Graficas
                                    title="Egresados próximos a egresar"
                                    chartData={getChartData(chartType2, "Egresados próximos a egresar")}
                                    showSelector={true}
                                    chartType={chartType2}
                                    setChartType={setChartType2}
                                />
                            </div>
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
                                <Graficas
                                    title="Examen 4 Habilidades"
                                    chartData={getChartData(chartType3, "Examen 4 Habilidades")}
                                    showSelector={true}
                                    chartType={chartType3}
                                    setChartType={setChartType3}
                                />
                            </div>
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
                                <Graficas
                                    title="Examen de Validación"
                                    chartData={getChartData(chartType4, "Examen de Validación")}
                                    showSelector={true}
                                    chartType={chartType4}
                                    setChartType={setChartType4}
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
