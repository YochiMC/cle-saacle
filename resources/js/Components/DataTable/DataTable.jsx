import { useState, useEffect, useMemo } from "react";
import {
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    useReactTable,
} from "@tanstack/react-table";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";

import DataTableToolbar from "@/Components/DataTable/DataTableToolbar";
import DataTablePagination from "@/Components/DataTable/DataTablePagination";

/**
 * DataTable — Componente genérico y reutilizable.
 *
 * @param {Array}    columns          - Definición de columnas TanStack Table.
 * @param {Array}    data             - Datos a renderizar.
 * @param {object}   hiddenColumns    - Columnas ocultas por defecto, ej: { created_at: false }.
 * @param {string}   searchPlaceholder
 * @param {string}   noDataMessage
 * @param {React.ReactNode} buttonSpace - Espacio opcional para acciones personalizadas en toolbar.
 * @param {Function} onSelectionChange - (selectedRows: Array, visibleColIds: string[]) => void
 */
export function DataTable({
    columns,
    data,
    hiddenColumns = {},
    searchPlaceholder = "Buscar en cualquier columna...",
    noDataMessage = "No hay registros.",
    rowSelection: externalRowSelection,
    onRowSelectionChange: externalOnRowSelectionChange,
    onSelectionChange,
    onPrint,
    buttonSpace,
    onNew,
    getRowClassName,
}) {
    const [sorting, setSorting] = useState([]);
    const [columnFilters, setColumnFilters] = useState([]);
    const [columnVisibility, setColumnVisibility] = useState(hiddenColumns);
    const [internalRowSelection, setInternalRowSelection] = useState({});
    const [globalFilter, setGlobalFilter] = useState("");

    const rowSelection =
        externalRowSelection !== undefined
            ? externalRowSelection
            : internalRowSelection;
    const onRowSelectionChange =
        externalOnRowSelectionChange !== undefined
            ? externalOnRowSelectionChange
            : setInternalRowSelection;

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
        onRowSelectionChange,
        onGlobalFilterChange: setGlobalFilter,
        autoResetPageIndex: false,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter,
        },
    });

    // Estabilizamos la extracción de datos y columnas para evitar disparos descontrolados y re-renders en cascada.
    // Al usar useMemo, nos aseguramos de que las referencias solo cambien cuando el modelo de la tabla realmente lo haga.
    const selectedData = useMemo(() => {
        return table.getFilteredSelectedRowModel().rows.map((r) => r.original);
    }, [table, rowSelection, globalFilter]);

    const visibleCols = useMemo(() => {
        return table.getVisibleLeafColumns().map((c) => ({
            id: c.id,
            header:
                typeof c.columnDef.header === "string"
                    ? c.columnDef.header
                    : c.id,
        }));
    }, [table, columnVisibility]);

    // Notificamos los cambios al componente padre incluyendo todas las dependencias reales.
    // Esto estabiliza la reactividad del motor visual y cumple con las reglas de hooks de React.
    useEffect(() => {
        if (onSelectionChange) {
            onSelectionChange(selectedData, visibleCols);
        }
    }, [onSelectionChange, selectedData, visibleCols]);

    return (
        <div>
            <DataTableToolbar
                table={table}
                globalFilter={globalFilter}
                onGlobalFilterChange={setGlobalFilter}
                searchPlaceholder={searchPlaceholder}
                onPrint={onPrint}
                buttonSpace={buttonSpace}
                onNew={onNew}
            />

            <div className="overflow-hidden border bg-white border-slate-200 rounded-lg shadow-sm">
                <Table className="min-w-[860px] lg:min-w-full">
                    <TableHeader className="bg-[#17365D]">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow
                                key={headerGroup.id}
                                className="border-b border-[#224a7a] hover:bg-[#17365D]"
                            >
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className="h-12 px-3 font-semibold text-center text-white align-middle"
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef
                                                      .header,
                                                  header.getContext(),
                                              )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row, index) => (
                                <TableRow
                                    key={row.id}
                                    data-state={
                                        row.getIsSelected() && "selected"
                                    }
                                    className={`border-b border-slate-200 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-slate-50/40"} hover:bg-slate-100/70 data-[state=selected]:bg-blue-50 ${getRowClassName ? getRowClassName(row) : ""}`}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className="px-3 py-3 text-sm text-center text-slate-700 align-middle"
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
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
