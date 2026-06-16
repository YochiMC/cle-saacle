import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    LabelList
} from "recharts";

/**
 * Componente de gráfica de barras reutilizable.
 * Acepta un `children` opcional que se renderiza en el encabezado
 * junto al título (úsalo para pasar selectores personalizados).
 */
export default function Graficas({
    title,
    chartData = [],
    children,
}) {
    const colors = [
        "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
        "#8b5cf6", "#ec4899", "#14b8a6", "#f97316",
        "#6366f1", "#84cc16",
    ];

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 w-full flex flex-col h-full">
            {/* ENCABEZADO Y SELECTOR OPCIONAL */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h3 className="text-lg font-bold text-gray-800 shrink-0">{title}</h3>
                {children && (
                    <div className="shrink-0 w-full md:w-auto">
                        {children}
                    </div>
                )}
            </div>

            {/* CONTENEDOR DE LA GRÁFICA */}
            <div style={{ width: "100%", height: 400 }}>
                {chartData && chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{ top: 20, right: 20, left: 0, bottom: 90 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis
                                dataKey="name"
                                angle={-45}
                                textAnchor="end"
                                interval={0}
                                tick={{ fill: "#4b5563", fontSize: 11 }}
                                tickMargin={10}
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
                                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                }}
                                formatter={(value) => [value, "Total"]}
                            />
                            <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                                <LabelList
                                    dataKey="total"
                                    position="top"
                                    fill="#374151"
                                    fontSize={12}
                                    fontWeight="bold"
                                />
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={colors[index % colors.length]}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : null}
            </div>
        </div>
    );
}