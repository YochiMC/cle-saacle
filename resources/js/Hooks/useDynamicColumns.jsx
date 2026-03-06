import { useMemo } from 'react';
import { Button } from '@/Components/ui/button';
import { Checkbox } from '@/Components/ui/checkbox';
import { Edit, Trash2, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

const formatLabel = (key) =>
    key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const SortIcon = ({ column }) => {
    const sorted = column.getIsSorted();
    if (sorted === 'asc') return <ArrowUp className="ml-2 h-4 w-4" />;
    if (sorted === 'desc') return <ArrowDown className="ml-2 h-4 w-4" />;
    return <ArrowUpDown className="ml-2 h-4 w-4 opacity-40" />;
};

/**
 * useDynamicColumns
 *
 * Genera columnas TanStack Table a partir de las claves del primer registro.
 * Incluye columna de selección, columnas de datos con sort y columna de acciones.
 *
 * @param {Array}    data      - Array de registros del que se extraen las claves.
 * @param {Function} onEditRow - Callback opcional al pulsar Editar: (item) => void.
 * @returns {Array} Definición de columnas lista para pasar a <DataTable />.
 */
export function useDynamicColumns(data, onEditRow) {
    return useMemo(() => {
        if (!data || data.length === 0) return [];

        const keys = Object.keys(data[0]);

        const baseColumns = keys.map((key) => ({
            accessorKey: key,
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="hover:bg-white/10 hover:text-white"
                >
                    {formatLabel(key)}
                    <SortIcon column={column} />
                </Button>
            ),
        }));

        return [
            // Columna de selección con checkbox
            {
                id: 'select',
                header: ({ table }) => (
                    <Checkbox
                        checked={table.getIsAllPageRowsSelected()}
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label="Seleccionar todos"
                        className="border-white data-[state=checked]:bg-white data-[state=checked]:text-[#17365D]"
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Seleccionar fila"
                    />
                ),
                enableSorting: false,
                enableHiding: false,
            },

            // Columnas de datos generadas dinámicamente
            ...baseColumns,

            // Columna de acciones (Editar / Eliminar)
            {
                id: 'actions',
                header: 'Acciones',
                enableHiding: false,
                cell: ({ row }) => {
                    const item = row.original;
                    const itemName = item.name || item.nombre || item.matricula || item.id;
                    return (
                        <div className="flex items-center justify-center gap-2">
                            <Button
                                onClick={() => (onEditRow ? onEditRow(item) : alert(`Editar: ${itemName}`))}
                                className="h-8 w-8 bg-orange-500 hover:bg-orange-600 text-white rounded-md p-0"
                                title="Editar"
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                                onClick={() => alert(`Eliminar: ${itemName}`)}
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
    }, [data, onEditRow]);
}
