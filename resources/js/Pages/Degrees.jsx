import { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import { DataTable } from '@/Components/DataTable';
import { Checkbox } from "@/Components/ui/checkbox";
import { Button } from "@/Components/ui/button";
import { Edit, Trash2, Copy, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

export default function Degrees({ degrees, students }) {
    const [vistaActual, setVistaActual] = useState('carreras');
    const [filasSeleccionadas, setFilasSeleccionadas] = useState([]);
    const [columnasVisibles, setColumnasVisibles] = useState([]);

    const currentData = vistaActual === 'carreras' ? (degrees || []) : (students || []);

    const columns = useMemo(() => {
        if (!currentData || currentData.length === 0) return [];

        const keys = Object.keys(currentData[0]);

        const formatLabel = (key) =>
            key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

        const SortIcon = ({ column }) => {
            const sorted = column.getIsSorted();
            if (sorted === 'asc') return <ArrowUp className="ml-2 h-4 w-4" />;
            if (sorted === 'desc') return <ArrowDown className="ml-2 h-4 w-4" />;
            return <ArrowUpDown className="ml-2 h-4 w-4 opacity-40" />;
        };

        const baseColumns = keys.map(key => ({
            accessorKey: key,
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="hover:bg-white/10 hover:text-white"
                >
                    {formatLabel(key)}
                    <SortIcon column={column} />
                </Button>
            ),
        }));

        return [
            {
                id: "select",
                header: ({ table }) => (
                    <Checkbox
                        checked={table.getIsAllPageRowsSelected()}
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label="Select all"
                        className="border-white data-[state=checked]:bg-white data-[state=checked]:text-[#17365D]"
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                    />
                ),
                enableSorting: false,
                enableHiding: false,
            },
            ...baseColumns,
            {
                id: "actions",
                header: "Acciones",
                enableHiding: false,
                cell: ({ row }) => {
                    const item = row.original;
                    const itemName = item.name || item.nombre || item.id || item.matricula;

                    return (
                        <div className="flex items-center justify-center gap-2">
                            <Button
                                onClick={() => alert(`Vamos a editar: ${itemName}`)}
                                className="h-8 w-8 bg-orange-500 hover:bg-orange-600 text-white rounded-md p-0"
                                title="Editar"
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                                onClick={() => alert(`Vamos a eliminar: ${itemName}`)}
                                className="h-8 w-8 bg-red-600 hover:bg-red-700 text-white rounded-md p-0"
                                title="Eliminar"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    );
                },
            },
        ];
    }, [currentData]);

    const handleBulkCopy = () => {
        if (filasSeleccionadas.length === 0) return;
        const EXCLUDED = ['select', 'actions'];
        const visibleDataCols = columnasVisibles.filter(id => !EXCLUDED.includes(id));
        const headerRow = visibleDataCols.join('\t');
        const dataRows = filasSeleccionadas
            .map(row => visibleDataCols.map(key => row[key] ?? '').join('\t'))
            .join('\n');
        navigator.clipboard.writeText(`${headerRow}\n${dataRows}`);
        alert('Copiado al portapapeles (solo columnas visibles)');
    };

    const handleBulkDelete = () => {
        if (filasSeleccionadas.length === 0) return;
        if (confirm(`¿Estás seguro de eliminar ${filasSeleccionadas.length} registros?`)) {
            const ids = filasSeleccionadas.map(row => row.id || row.matricula);
            router.post('/ruta-eliminar-masiva', { ids, tipo: vistaActual });
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-12">
            <Head title={vistaActual === 'carreras' ? "Carreras" : "Alumnos"} />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-extrabold text-[#17365D]">
                            {vistaActual === 'carreras' ? 'Catálogo de Carreras' : 'Gestión de Alumnos'}
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Administración general de los registros del sistema.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 bg-white p-2 rounded-md shadow-sm border border-slate-200">
                        <label className="text-sm font-medium text-[#17365D] whitespace-nowrap">
                            Tabla a mostrar:
                        </label>
                        <select
                            className="border border-slate-300 rounded-md px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#17365D] bg-slate-50 min-w-[150px]"
                            value={vistaActual}
                            onChange={(e) => {
                                setVistaActual(e.target.value);
                                setFilasSeleccionadas([]);
                                setColumnasVisibles([]);
                            }}
                        >
                            <option value="carreras">Carreras</option>
                            <option value="alumnos">Alumnos</option>
                        </select>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow-sm rounded-sm p-6">
                    {filasSeleccionadas.length > 0 && (
                        <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700">
                                {filasSeleccionadas.length} fila(s) seleccionada(s)
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleBulkCopy}
                                    variant="outline"
                                    className="bg-white hover:bg-slate-100 text-[#17365D] border-[#17365D]"
                                    size="sm"
                                >
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copiar a Excel
                                </Button>
                                <Button
                                    onClick={handleBulkDelete}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                    size="sm"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Eliminar Seleccionados
                                </Button>
                            </div>
                        </div>
                    )}

                    {currentData && currentData.length > 0 ? (
                        <DataTable
                            columns={columns}
                            data={currentData}
                            onSelectionChange={(datos, columnas) => {
                                setFilasSeleccionadas(datos);
                                setColumnasVisibles(columnas);
                            }}
                            searchPlaceholder={vistaActual === 'alumnos' ? "Buscar por nombre, apellido o matrícula" : "Buscar en cualquier columna..."}
                        />
                    ) : (
                        <div className="text-center py-10 text-slate-500">
                            No hay registros almacenados.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
