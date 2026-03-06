import React, { useState } from "react";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend,
} from "recharts";

const EnrollmentCharts = ({
    // TODO: Estos datos ahora deben venir a través de props (por ejemplo desde el server o del componente padre)
    careerData = {
        Sistemas: {
            enrollmentData: [
                { month: "Ene", alumnos: 120 },
                { month: "Feb", alumnos: 210 },
                { month: "Mar", alumnos: 180 },
                { month: "Abr", alumnos: 290 },
                { month: "May", alumnos: 350 },
                { month: "Jun", alumnos: 480 },
                { month: "Jul", alumnos: 520 },
            ],
            categoryData: [
                { category: "Programación", inscritos: 850 },
                { category: "Bases de Datos", inscritos: 420 },
                { category: "Redes", inscritos: 310 },
                { category: "Ciberseguridad", inscritos: 650 },
            ],
        },
        Industrial: {
            enrollmentData: [
                { month: "Ene", alumnos: 95 },
                { month: "Feb", alumnos: 180 },
                { month: "Mar", alumnos: 150 },
                { month: "Abr", alumnos: 240 },
                { month: "May", alumnos: 310 },
                { month: "Jun", alumnos: 420 },
                { month: "Jul", alumnos: 460 },
            ],
            categoryData: [
                { category: "Gestión Industrial", inscritos: 720 },
                { category: "Calidad", inscritos: 380 },
                { category: "Logística", inscritos: 290 },
                { category: "Producción", inscritos: 580 },
            ],
        },
        Gestión: {
            enrollmentData: [
                { month: "Ene", alumnos: 85 },
                { month: "Feb", alumnos: 160 },
                { month: "Mar", alumnos: 140 },
                { month: "Abr", alumnos: 220 },
                { month: "May", alumnos: 280 },
                { month: "Jun", alumnos: 380 },
                { month: "Jul", alumnos: 420 },
            ],
            categoryData: [
                { category: "Administración", inscritos: 680 },
                { category: "Finanzas", inscritos: 350 },
                { category: "Recursos Humanos", inscritos: 270 },
                { category: "Marketing", inscritos: 520 },
            ],
        },
        Electrónica: {
            enrollmentData: [
                { month: "Ene", alumnos: 75 },
                { month: "Feb", alumnos: 140 },
                { month: "Mar", alumnos: 120 },
                { month: "Abr", alumnos: 190 },
                { month: "May", alumnos: 250 },
                { month: "Jun", alumnos: 340 },
                { month: "Jul", alumnos: 380 },
            ],
            categoryData: [
                { category: "Circuitos", inscritos: 620 },
                { category: "Sistemas Embebidos", inscritos: 320 },
                { category: "Automatización", inscritos: 240 },
                { category: "IoT", inscritos: 480 },
            ],
        },
        Mecatrónica: {
            enrollmentData: [
                { month: "Ene", alumnos: 110 },
                { month: "Feb", alumnos: 200 },
                { month: "Mar", alumnos: 170 },
                { month: "Abr", alumnos: 270 },
                { month: "May", alumnos: 330 },
                { month: "Jun", alumnos: 450 },
                { month: "Jul", alumnos: 490 },
            ],
            categoryData: [
                { category: "Robótica", inscritos: 780 },
                { category: "Control", inscritos: 410 },
                { category: "Mecánica", inscritos: 300 },
                { category: "PLC", inscritos: 610 },
            ],
        },
    }
}) => {
    const [selectedCareer, setSelectedCareer] = useState(
        Object.keys(careerData).length > 0 ? Object.keys(careerData)[0] : "Sistemas"
    );

    const currentData = careerData[selectedCareer] || null;
    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Título de la sección */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900">
                            Métricas de Alumnos
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Monitorea la tasa de inscripciones y el rendimiento
                            de tus cursos por carrera.
                        </p>
                    </div>
                    {/* Selector global compacto */}
                    <div className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                        <span className="text-sm font-semibold text-[#1B396A] ml-2">Carrera:</span>
                        <select
                            value={selectedCareer}
                            onChange={(e) => setSelectedCareer(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-[#1B396A] focus:border-[#1B396A] p-2 outline-none cursor-pointer"
                        >
                            {Object.keys(careerData).map((career) => (
                                <option key={career} value={career}>
                                    {career}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Contenedor de las Gráficas */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Tarjeta: Gráfica de Área */}
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                        <h3 className="text-lg font-bold text-[#1B396A] mb-6">
                            Inscripciones - {selectedCareer}
                        </h3>
                        <div className="h-72">
                            {currentData ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={currentData.enrollmentData}
                                        margin={{
                                            top: 10,
                                            right: 10,
                                            left: -20,
                                            bottom: 0,
                                        }}
                                    >
                                        <defs>
                                            <linearGradient
                                                id="colorAlumnos"
                                                x1="100"
                                                y1="80"
                                                x2="20"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="5%"
                                                    stopColor="#1B396A"
                                                    stopOpacity={0.8}
                                                />
                                                <stop
                                                    offset="5%"
                                                    stopColor="#1B396A"
                                                    stopOpacity={0}
                                                />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            vertical={false}
                                            stroke="#E5E7EB"
                                        />
                                        <XAxis
                                            dataKey="month"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: "#6B7280", fontSize: 12 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: "#6B7280", fontSize: 12 }}
                                            yAxisId="left"
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: "8px",
                                                border: "none",
                                                boxShadow:
                                                    "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="alumnos"
                                            stroke="#1B396A"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorAlumnos)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    No hay datos disponibles
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tarjeta: Gráfica de Barras */}
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                        <h3 className="text-lg font-bold text-[#1B396A] mb-6">
                            Categorías - {selectedCareer}
                        </h3>
                        <div className="h-72">
                            {currentData ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={currentData.categoryData}
                                        margin={{
                                            top: 10,
                                            right: 10,
                                            left: -20,
                                            bottom: 0,
                                        }}
                                        barSize={40}
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            vertical={false}
                                            stroke="#E5E7EB"
                                        />
                                        <XAxis
                                            dataKey="category"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: "#6B7280", fontSize: 11 }}
                                            dy={10}
                                            interval={0}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: "#6B7280", fontSize: 12 }}
                                        />
                                        <Tooltip
                                            cursor={{ fill: "#F3F4F6" }}
                                            contentStyle={{
                                                borderRadius: "8px",
                                                border: "none",
                                                boxShadow:
                                                    "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                            }}
                                        />
                                        <Bar
                                            dataKey="inscritos"
                                            fill="#1B396A"
                                            radius={[6, 6, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    No hay datos disponibles
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default EnrollmentCharts;
