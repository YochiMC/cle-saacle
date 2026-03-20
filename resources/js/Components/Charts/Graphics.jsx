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
    filter = [],
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h3 className="text-lg font-bold text-gray-800">{title}</h3>

                {showSelector && (
                    <select
                        value={chartType}
                        onChange={(e) => setChartType(e.target.value)}
                        className="block w-full sm:w-48 pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md shadow-sm"
                    >
                        <option value="carrera">Por Carrera</option>
                        <option value="genero">Por Género</option>
                        <option value="semestre">Por Semestre</option>
                        <option value="level">Por Nivel</option>
                    </select>
                )}
            </div>
            {/* CONTENEDOR DE LA GRÁFICA */}
            <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{
                            top: 20,
                            right: 20,
                            left: 0,
                            bottom: 90 // Magia 1: Da espacio abajo para que no se corten los nombres
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        
                        <XAxis
                            dataKey="name"
                            angle={-90} // Magia 2: Inclina el texto
                            textAnchor="end" // Magia 3: Alinea la punta del texto con la barra
                            interval={0} // Muestra todas las etiquetas sin saltarse ninguna
                            tick={{ fill: "#4b5563", fontSize: 12 }}
                            tickMargin={15} // Magia 4: Separa los textos de la línea
                        />     
                        <YAxis
                            tick={{ fill: "#4b5563", fontSize: 12 }}
                            tickMargin={10} // Magia 5: Evita que el 0 choque con los nombres
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
            </div>
        </div>
    );
}