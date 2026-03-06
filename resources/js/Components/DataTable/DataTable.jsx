import { useState, useEffect } from 'react';
import {
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    useReactTable,
} from '@tanstack/react-table';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';

import DataTableToolbar from '@/Components/DataTable/DataTableToolbar';
import DataTablePagination from '@/Components/DataTable/DataTablePagination';

/**
 * DataTable — Componente genérico y reutilizable.
 *
 * @param {Array}    columns          - Definición de columnas TanStack Table.
 * @param {Array}    data             - Datos a renderizar.
 * @param {object}   hiddenColumns    - Columnas ocultas por defecto, ej: { created_at: false }.
 * @param {string}   searchPlaceholder
 * @param {string}   noDataMessage
 * @param {Function} onSelectionChange - (selectedRows: Array, visibleColIds: string[]) => void
 */
export function DataTable({
    columns,
    data,
    hiddenColumns = {},
    searchPlaceholder = 'Buscar en cualquier columna...',
    noDataMessage = 'No hay registros.',
    onSelectionChange,
    onPrint,
    onNew,
}) {
    const [sorting, setSorting] = useState([]);
    const [columnFilters, setColumnFilters] = useState([]);
    const [columnVisibility, setColumnVisibility] = useState(hiddenColumns);
    const [rowSelection, setRowSelection] = useState({});
    const [globalFilter, setGlobalFilter] = useState('');

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: { sorting, columnFilters, columnVisibility, rowSelection, globalFilter },
    });

    // Solo se dispara cuando cambia la selección, visibilidad o búsqueda.
    // `table` y `onSelectionChange` quedan fuera para evitar bucles de re-render.
    useEffect(() => {
        if (onSelectionChange) {
            const selectedData = table.getFilteredSelectedRowModel().rows.map((r) => r.original);
            const visibleCols = table.getVisibleLeafColumns().map((c) => c.id);
            onSelectionChange(selectedData, visibleCols);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rowSelection, columnVisibility, globalFilter]);

    return (
        <div>
            <DataTableToolbar
                table={table}
                globalFilter={globalFilter}
                onGlobalFilterChange={setGlobalFilter}
                searchPlaceholder={searchPlaceholder}
                onPrint={onPrint}
                onNew={onNew}
            />

            <div className="rounded-sm border border-slate-300 bg-white overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-[#17365D]">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow
                                key={headerGroup.id}
                                className="hover:bg-[#17365D] border-b-slate-300"
                            >
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className="text-white font-bold text-center align-middle h-12"
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                    className="border-b-slate-200 hover:bg-slate-50"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className="text-center align-middle py-3"
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center text-slate-500"
                                >
                                    {noDataMessage}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <DataTablePagination table={table} />
        </div>
    );
}
