import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LabelList,
} from "recharts";

export default function Graficas({
    chartData = [],
    title = "Gráfica",
    showSelector = false,
    chartType,
    setChartType,
}) {
    const totalAlumnos = chartData.reduce(
        (sum, item) => sum + (item.total || 0),
        0,
    );

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#1B396A] text-white p-3 rounded-lg border border-[#0d1e38]">
                    <p className="font-semibold">{payload[0].payload.name}</p>
                    <p className="text-sm">
                        Alumnos: {payload[0].payload.total}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
            {/* TITULO Y SELECTOR */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-[#1B396A]">{title}</h3>

                {showSelector && (
                    <select
                        value={chartType}
                        onChange={(e) => setChartType(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                        <option value="carrera">Carreras</option>
                        <option value="genero">Género</option>
                        <option value="semestre">Semestres</option>
                        <option value="grupos">Grupos</option>
                    </select>
                )}
            </div>

            {/* TARJETA TOTAL */}

            <div className="mb-6 p-4 bg-gradient-to-r from-[#1B396A] to-[#142952] text-white rounded-lg shadow">
                <p className="text-sm font-medium opacity-90">
                    Total de alumnos
                </p>
                <p className="text-3xl font-bold">{totalAlumnos}</p>
            </div>

            <ResponsiveContainer width="100%" height={420}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis
                        dataKey="name"
                        tick={{
                            fontSize: 14,
                            fontWeight: "bold",
                            fill: "#333",
                        }}
                    />

                    <YAxis />

                    <Tooltip content={<CustomTooltip />} />

                    <Legend />

                    <Bar dataKey="total" fill="#1B396A" radius={[6, 6, 0, 0]}>
                        <LabelList
                            dataKey="total"
                            position="insideTop"
                            fill="white"
                            fontSize={14}
                            fontWeight="bold"
                        />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
