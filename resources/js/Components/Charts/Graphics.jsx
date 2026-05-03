import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts";

export default function Graficas({ 
    title, 
    chartData = [], 
    showSelector = false, 
    chartType, 
    setChartType 
}) {
    // Colores para las barras
    const colors = [
        "#3b82f6", "#10b981", "#f59e0b", "#ef4444", 
        "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"
    ];

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 w-full flex flex-col h-full"> 
            {/* ENCABEZADO Y SELECTOR */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h3 className="text-lg font-bold text-gray-800">{title}</h3>

                {showSelector && setChartType && (
                    <select
                        value={chartType}
                        onChange={(e) => setChartType(e.target.value)}
                        className="block w-full md:w-64 pl-3 pr-10 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md shadow-sm bg-gray-50 text-gray-700"
                    >
                        <optgroup label="Demografía y Campañas">
                            <option value="genero">Por Género</option>
                            <option value="carrera">Por Carrera</option>
                            <option value="semestre">Por Semestre</option>
                            <option value="estatus_alumno">Egresados vs Vigentes</option>
                        </optgroup>
                        
                        <optgroup label="Rendimiento Académico">
                            <option value="aprobacion">Aprobados vs No Acreditados</option>
                            <option value="modalidad">Por Modalidad</option>
                        </optgroup>

                        <optgroup label="Administrativo y Tiempos (Gráfica Principal)">
                            <option value="periodo">Por Periodo</option>
                            <option value="constancias">Constancias Generadas</option>
                            <option value="reposiciones">Reposiciones por Periodo</option>
                            <option value="historico">Histórico General</option>
                        </optgroup>
                    </select>
                )}
            </div>

            {/* CONTENEDOR DE LA GRÁFICA */}
            <div style={{ width: '100%', height: 400 }}>
                {chartData && chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{
                                top: 20,
                                right: 20,
                                left: 0,
                                bottom: 90 // Espacio para los textos inclinados
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            
                            <XAxis
                                dataKey="name"
                                angle={-90} 
                                textAnchor="end" 
                                interval={0} 
                                tick={{ fill: "#4b5563", fontSize: 12 }}
                                tickMargin={15} 
                            />    
                            <YAxis
                                tick={{ fill: "#4b5563", fontSize: 12 }}
                                tickMargin={10} 
                                allowDecimals={false}
                            />                        
                            <Tooltip
                                cursor={{ fill: "#f3f4f6" }}
                                contentStyle={{ 
                                    borderRadius: "8px", 
                                    border: "none", 
                                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" 
                                }}
                            />                       
                            <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell 
                                        key={`cell-${index}`} 
                                        fill={colors[index % colors.length]} 
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex h-full items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        Selecciona una opción para ver los datos
                    </div>
                )}              
            </div>
        </div>
    );
}