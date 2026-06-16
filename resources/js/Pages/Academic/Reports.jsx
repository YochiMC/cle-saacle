import { Head } from "@inertiajs/react";
import Graficas from "@/Components/Charts/Graphics";
import { useState, useRef } from "react";
import ModalAlert from "@/Components/ui/ModalAlert";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function Reports({ degrees = [], students = [], levels = [], periods = [], certificates = [], groups = [], logos = {} }) {
    const [openModal, setOpenModal] = useState(false);
    const [pageTitle, setPageTitle] = useState("Reporte de Estadísticas");
    
    // Lista dinámica de gráficas
    const [charts, setCharts] = useState([
        { id: 1, type: "genero", filterType: "todos", filterPeriod: "", customTitle: "" },
        { id: 2, type: "carrera", filterType: "todos", filterPeriod: "", customTitle: "" },
    ]);

    const handlePrint = () => {
        window.print();
    };

    const addChart = () => {
        setCharts([...charts, { id: Date.now(), type: "genero", filterType: "todos", filterPeriod: "", customTitle: "" }]);
    };

    const removeChart = (id) => {
        setCharts(charts.filter(c => c.id !== id));
    };

    const updateChart = (id, key, value) => {
        setCharts(charts.map(c => c.id === id ? { ...c, [key]: value } : c));
    };

    // FUNCIÓN PARA OBTENER LOS DATOS DE UNA GRÁFICA SEGÚN SU CONFIGURACIÓN
    const getChartData = (chartConfig) => {
        // 1. Filtrar estudiantes según la configuración de la gráfica
        let filtered = students;
        
        if (chartConfig.filterType === "egresados") {
            filtered = filtered.filter(s => s.type_student === "egresado" || s.type_student?.value === "egresado");
        } else if (chartConfig.filterType === "estudiantes") {
            filtered = filtered.filter(s => s.type_student === "vigente" || s.type_student?.value === "vigente");
        }

        if (chartConfig.filterPeriod !== "") {
            filtered = filtered.filter(s => s.period_ids && s.period_ids.some(id => String(id) === String(chartConfig.filterPeriod)));
        }

        // 2. Agrupar según el tipo de métrica
        switch (chartConfig.type) {
            case "genero":
                return [
                    { name: "Hombres", total: filtered.filter(s => s.gender === "M").length },
                    { name: "Mujeres", total: filtered.filter(s => s.gender === "F").length },
                ];
            case "carrera":
                return degrees.map(deg => ({
                    name: deg.name,
                    total: filtered.filter(s => s.degree_id === deg.id).length
                }));
            case "nivel":
                return levels.map(lvl => ({
                    name: lvl.level_tecnm,
                    total: filtered.filter(s => s.level_id === lvl.id).length
                }));
            case "semestre":
                return [1, 2, 3, 4, 5, 6, 7, 8, 9].map(sem => ({
                    name: `Semestre ${sem}`,
                    total: filtered.filter(s => s.semester === sem).length
                }));

            case "tipo":
                return [
                    { name: "Vigentes", total: filtered.filter(s => s.type_student === "vigente" || s.type_student?.value === "vigente").length },
                    { name: "Egresados", total: filtered.filter(s => s.type_student === "egresado" || s.type_student?.value === "egresado").length },
                ];
            case "aprobacion":
                // Mock de aprobación basando en el status de acreditado
                const aprobados = filtered.filter(s => s.status === "accredited" || s.status?.value === "accredited").length;
                return [
                    { name: "Acreditados", total: aprobados },
                    { name: "No Acreditados", total: filtered.length - aprobados },
                ];
            case "periodo":
                return periods.map(p => ({
                    name: p.name,
                    total: filtered.filter(s => s.period_ids && s.period_ids.some(id => String(id) === String(p.id))).length
                }));
            case "constancias": {
                // Pre-procesar: marcar cuál es la primera constancia por alumno
                // (ordenadas por created_at desde el backend)
                const seenStudents = new Set();
                const tagged = certificates.map((c) => {
                    const isFirst = !seenStudents.has(c.student_id);
                    if (c.student_id) seenStudents.add(c.student_id);
                    return { ...c, isReposicion: !isFirst };
                });
                const allPeriodNames = Array.from(new Set([
                    ...periods.map(p => p.name),
                    ...certificates.map(c => c.periodo).filter(Boolean)
                ]));
                return allPeriodNames.map(pName => {
                    const matchedPeriod = periods.find(p => p.name === pName);
                    const pIdStr = matchedPeriod ? String(matchedPeriod.id) : null;
                    return {
                        name: pName,
                        total: tagged.filter(c =>
                            !c.isReposicion &&
                            (c.periodo === pName || (pIdStr && String(c.periodo) === pIdStr))
                        ).length
                    };
                });
            }
            case "reposiciones": {
                const seenStudentsR = new Set();
                const taggedR = certificates.map((c) => {
                    const isFirst = !seenStudentsR.has(c.student_id);
                    if (c.student_id) seenStudentsR.add(c.student_id);
                    return { ...c, isReposicion: !isFirst };
                });
                const allPeriodNamesR = Array.from(new Set([
                    ...periods.map(p => p.name),
                    ...certificates.map(c => c.periodo).filter(Boolean)
                ]));
                return allPeriodNamesR.map(pName => {
                    const matchedPeriod = periods.find(p => p.name === pName);
                    const pIdStr = matchedPeriod ? String(matchedPeriod.id) : null;
                    return {
                        name: pName,
                        total: taggedR.filter(c =>
                            c.isReposicion &&
                            (c.periodo === pName || (pIdStr && String(c.periodo) === pIdStr))
                        ).length
                    };
                });
            }
            case "modalidad":
                // Contar estudiantes basándose en si están activos. Si no hay data directa en student, mock o conteo simple de grupos:
                const modalCounts = {};
                groups.forEach(g => {
                    const mod = g.mode || "Desconocida";
                    modalCounts[mod] = (modalCounts[mod] || 0) + 1;
                });
                return Object.entries(modalCounts).map(([mode, total]) => ({
                    name: `${mode} (Grupos)`,
                    total
                }));
            default:
                return [];
        }
    };

    const getChartTitle = (config) => {
        const metrica = {
            "genero": "Por Sexo",
            "carrera": "Por Carrera",
            "nivel": "Por Nivel",
            "semestre": "Por Semestre",
            "tipo": "Por Tipo de Estudiante",
            "aprobacion": "Índice de Aprobación",
            "periodo": "Por Periodo",
            "constancias": "Constancias Generadas",
            "reposiciones": "Reposiciones de Constancias",
            "modalidad": "Cursos por Modalidad"
        }[config.type] || "Gráfica";

        const filtro = config.filterType === "egresados" ? " (Egresados)" : config.filterType === "estudiantes" ? " (Vigentes)" : " (Todos)";
        
        return `${metrica}${filtro}`;
    };

    return (
        <AuthenticatedLayout>
            {/* Ocultamos estilos de fondo y padding en impresión */}
            <div className="min-h-screen bg-gray-100 py-12 print:bg-white print:py-0">
                <Head title="Reportes Dinámicos" />

                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <ModalAlert
                        isOpen={openModal}
                        onClose={() => setOpenModal(false)}
                        type="error"
                        title="Error al registrar"
                        message="Ocurrió un problema."
                    />

                    {/* ── HEADER CON LOGOS ── Visible en pantalla y al imprimir */}
                    {(logos?.logo_sep || logos?.logo_tecnm || logos?.logo_itl) && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 px-8 py-5 print:shadow-none print:border-0 print:mb-4 print:px-0">
                            <div className="flex items-center justify-between gap-6">
                                {/* Logo izquierda: SEP */}
                                <div className="flex items-center justify-start flex-1">
                                    {logos.logo_sep ? (
                                        <img
                                            src={logos.logo_sep}
                                            alt="Secretaría de Educación Pública"
                                            className="h-14 object-contain"
                                        />
                                    ) : (
                                        <div className="h-14 w-24 bg-gray-100 rounded animate-pulse" />
                                    )}
                                </div>

                                {/* Logo centro: TecNM */}
                                <div className="flex flex-col items-center text-center">
                                    {logos.logo_tecnm ? (
                                        <img
                                            src={logos.logo_tecnm}
                                            alt="Tecnológico Nacional de México"
                                            className="h-16 object-contain mb-1"
                                        />
                                    ) : (
                                        <div className="h-16 w-28 bg-gray-100 rounded animate-pulse" />
                                    )}
                                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide hidden print:block">
                                        Tecnológico Nacional de México
                                    </p>
                                </div>

                                {/* Logo derecha: ITL */}
                                <div className="flex items-center justify-end flex-1">
                                    {logos.logo_itl ? (
                                        <img
                                            src={logos.logo_itl}
                                            alt="Instituto Tecnológico de Lázaro Cárdenas"
                                            className="h-14 object-contain"
                                        />
                                    ) : (
                                        <div className="h-14 w-24 bg-gray-100 rounded animate-pulse" />
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── BARRA DE HERRAMIENTAS (No visible al imprimir) ── */}
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-white p-4 rounded-lg shadow space-y-4 sm:space-y-0 print:hidden">
                        <div className="flex items-center space-x-4 flex-1 mr-4">
                            <input
                                type="text"
                                value={pageTitle}
                                onChange={(e) => setPageTitle(e.target.value)}
                                className="text-xl font-bold text-gray-800 border-b border-transparent hover:border-gray-300 focus:border-indigo-500 focus:ring-0 bg-transparent w-full p-1 transition-colors"
                                placeholder="Título del Reporte"
                                title="Haz clic para editar el título del reporte"
                            />
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={addChart}
                                className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase hover:bg-green-700"
                            >
                                + Agregar Gráfica
                            </button>
                            <button
                                onClick={handlePrint}
                                className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700"
                            >
                                Imprimir / Descargar PDF
                            </button>
                        </div>
                    </div>

                    {/* TÍTULO VISIBLE SOLO AL IMPRIMIR */}
                    <div className="hidden print:block mb-6 text-center border-b border-gray-300 pb-4">
                        <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
                    </div>

                    {/* CONTENEDOR DE GRÁFICAS */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 print:grid-cols-1 gap-6">
                        {charts.map((chartConfig) => (
                            <div key={chartConfig.id} className="bg-white rounded-lg shadow flex flex-col print:shadow-none print:break-inside-avoid">
                                
                                {/* CONTROLES DE LA GRÁFICA (Ocultos en impresión) */}
                                <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-wrap gap-4 items-end rounded-t-lg print:hidden">
                                    <div className="flex-1 min-w-[200px]">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Métrica</label>
                                        <select
                                            value={chartConfig.type}
                                            onChange={(e) => updateChart(chartConfig.id, 'type', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        >
                                            <optgroup label="General">
                                                <option value="genero">Sexo / Género</option>
                                                <option value="carrera">Carrera</option>
                                                <option value="nivel">Nivel de Inglés</option>
                                                <option value="semestre">Semestre</option>
                                            </optgroup>
                                            <optgroup label="Demografía y Campañas">
                                                <option value="tipo">Tipo (Actual vs Egresado)</option>
                                            </optgroup>
                                            <optgroup label="Rendimiento Académico">
                                                <option value="aprobacion">Índice de Aprobación</option>
                                                <option value="modalidad">Cursos por Modalidad</option>
                                            </optgroup>
                                            <optgroup label="Administrativo y Tiempos">
                                                <option value="periodo">Alumnos por Periodo</option>
                                                <option value="constancias">Constancias Generadas</option>
                                                <option value="reposiciones">Reposiciones</option>
                                            </optgroup>
                                        </select>
                                    </div>
                                    <div className="flex-1 min-w-[200px]">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Filtro de Población</label>
                                        <select
                                            value={chartConfig.filterType}
                                            onChange={(e) => updateChart(chartConfig.id, 'filterType', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        >
                                            <option value="todos">Todos los alumnos</option>
                                            <option value="estudiantes">Solo Estudiantes Actuales</option>
                                            <option value="egresados">Solo Egresados</option>
                                        </select>
                                    </div>
                                    <div className="flex-1 min-w-[200px]">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Filtro de Periodo</label>
                                        <select
                                            value={chartConfig.filterPeriod}
                                            onChange={(e) => updateChart(chartConfig.id, 'filterPeriod', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        >
                                            <option value="">Histórico (Todos los periodos)</option>
                                            {periods.map(p => (
                                                <option key={p.id} value={p.id}>{p.name} ({p.year})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex-1 min-w-[200px]">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Título Personalizado</label>
                                        <input
                                            type="text"
                                            value={chartConfig.customTitle}
                                            onChange={(e) => updateChart(chartConfig.id, 'customTitle', e.target.value)}
                                            placeholder={getChartTitle(chartConfig)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <button 
                                            onClick={() => removeChart(chartConfig.id)}
                                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>

                                {/* ÁREA DE LA GRÁFICA */}
                                <div className="p-6 flex-1 flex flex-col justify-center">
                                    <Graficas
                                        title={chartConfig.customTitle || getChartTitle(chartConfig)}
                                        chartData={getChartData(chartConfig)}
                                        showSelector={false} // Desactivamos el selector interno
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {charts.length === 0 && (
                        <div className="text-center py-12 text-gray-500 print:hidden">
                            No hay gráficas. Haz clic en "Agregar Gráfica" para comenzar.
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
