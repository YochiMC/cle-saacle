import { useMemo } from "react";
import { Button } from "@/Components/ui/button";
import { Checkbox } from "@/Components/ui/checkbox";
import {
    Edit,
    Trash2,
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
    Check,
    X,
} from "lucide-react";
import { formatLabel } from "@/Constants/tableDictionary";
import DynamicCellRenderer from "@/Components/DataTable/DynamicCellRenderer";

const SortIcon = ({ column }) => {
    const sorted = column.getIsSorted();
    if (sorted === "asc") return <ArrowUp className="w-4 h-4 ml-2" />;
    if (sorted === "desc") return <ArrowDown className="w-4 h-4 ml-2" />;
    return <ArrowUpDown className="w-4 h-4 ml-2 opacity-40" />;
};

/**
 * Optimización O(1): Extrae las llaves únicamente del primer objeto del arreglo.
 * Soporta arrays directos o estructuras paginadas de Laravel (data.data).
 */
const collectRowKeys = (data) => {
    if (!data) return [];
    const rows = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);
    if (rows.length === 0) return [];
    return Object.keys(rows[0] || {});
};

/**
 * Hook factorizado para la generación de columnas TanStack Table.
 * Orquesta la estructura, filtrado y ordenación determinista de columnas.
 */
export function useDynamicColumns(
    data,
    onEditRow,
    onDeleteRow,
    {
        editableColumns = [],
        restrictedColumns = [],
        forcedKeys = [], // OCP: Permite extender columnas sin presencia en el dataset inicial
        selectOptions = {},
        onCellChange,
        editingRowId = null,
        editAllRows = false,
        onSaveRow,
        onCancelRow,
        customRowActions,
        columnConfig = {
            baseKeys: [],
            statusKeys: [],
            footerKeys: [],
            ignoredKeys: new Set(),
            customOrder: null,
        },
    } = {},
) {
    const rowKeys = useMemo(() => {
        const extracted = collectRowKeys(data);
        return [...new Set([...extracted, ...forcedKeys])];
    }, [data, forcedKeys]);

    return useMemo(() => {
        const editableSet = new Set(editableColumns);
        const restrictedSet = new Set(restrictedColumns);

        const {
            baseKeys = [],
            statusKeys = [],
            footerKeys = [],
            ignoredKeys = new Set(),
            customOrder,
        } = columnConfig;

        const visibleBaseKeys = baseKeys.filter(
            (key) => rowKeys.includes(key) && !restrictedSet.has(key),
        );

        const visibleStatusKeys = statusKeys.filter(
            (key) => rowKeys.includes(key) && !restrictedSet.has(key),
        );

        const visibleFooterKeys = footerKeys.filter(
            (key) => rowKeys.includes(key) && !restrictedSet.has(key),
        );

        const dynamicKeys = rowKeys.filter(
            (key) => !ignoredKeys.has(key) && !restrictedSet.has(key),
        );

        const orderedDynamicKeys = customOrder
            ? customOrder(dynamicKeys)
            : dynamicKeys;

        const buildColumn = (key) => ({
            accessorKey: key,
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                    className="hover:bg-white/10 hover:text-white"
                >
                    {formatLabel(key)}
                    <SortIcon column={column} />
                </Button>
            ),
            cell: ({ row }) => (
                <DynamicCellRenderer
                    row={row}
                    fieldKey={key}
                    isRowEditing={
                        editAllRows || row.original.id === editingRowId
                    }
                    isEditable={editableSet.has(key)}
                    onCellChange={onCellChange}
                    selectOptions={selectOptions}
                />
            ),
        });

        const selectionColumn = {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
                    className="border-white data-[state=checked]:bg-white data-[state=checked]:text-[#17365D]"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(v) => row.toggleSelected(!!v)}
                />
            ),
            enableSorting: false,
            enableHiding: false,
        };

        const actionsColumn = {
            id: "actions",
            header: "Acciones",
            enableHiding: false,
            cell: ({ row }) => {
                const item = row.original;
                const isRowEditing = editAllRows || item.id === editingRowId;

                if (customRowActions) return customRowActions(item);

                if (isRowEditing) {
                    return (
                        <div className="flex items-center justify-center gap-2">
                            <Button
                                onClick={() => onSaveRow?.(item)}
                                className="w-8 h-8 p-0 text-white bg-green-600 rounded-md hover:bg-green-700"
                                title="Guardar"
                            >
                                <Check className="w-4 h-4" />
                            </Button>
                            <Button
                                onClick={() => onCancelRow?.()}
                                className="w-8 h-8 p-0 text-white bg-gray-500 rounded-md hover:bg-gray-600"
                                title="Cancelar"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    );
                }

                return (
                    <div className="flex items-center justify-center gap-2">
                        <Button
                            onClick={() => onEditRow?.(item)}
                            className="w-8 h-8 p-0 text-white bg-orange-500 rounded-md hover:bg-orange-600"
                            title="Editar"
                        >
                            <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                            onClick={() => onDeleteRow?.(item)}
                            className="w-8 h-8 p-0 text-white bg-red-600 rounded-md hover:bg-red-700"
                            title="Eliminar"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                );
            },
        };

        return [
            selectionColumn,
            ...visibleBaseKeys.map(buildColumn),
            ...visibleStatusKeys.map(buildColumn),
            ...orderedDynamicKeys.map(buildColumn),
            ...visibleFooterKeys.map(buildColumn),
            actionsColumn,
        ];
    }, [
        rowKeys,
        onEditRow,
        onDeleteRow,
        editableColumns,
        restrictedColumns,
        onCellChange,
        editingRowId,
        editAllRows,
        onSaveRow,
        onCancelRow,
        customRowActions,
        selectOptions,
        columnConfig,
    ]);
}

