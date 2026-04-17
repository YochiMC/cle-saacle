// ── React ──────────────────────────────────────────────────────────────────
import { useState } from 'react';

// ── Lógica de exportación (Custom Hook) ────────────────────────────────────
import { useTableExport } from '@/Hooks/useTableExport';

// ── Componentes de UI propios ───────────────────────────────────────────────
import { ThemeButton } from '@/Components/ui/ThemeButton';
import { ThemeInput } from '@/Components/ui/ThemeInput';
import ReportPreviewModal from '@/Components/DataTable/ReportPreviewModal';

// ── Íconos de lucide-react ──────────────────────────────────────────────────
import {
    Search,
    Plus,
    Download,
    FileText,
    FileSpreadsheet,
    FileCode,
} from 'lucide-react';

// ── Primitivos de Radix UI (envueltos por Shadcn) ───────────────────────────
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';

/**
 * @component DataTableToolbar
 *
 * Barra superior de control de la DataTable. Actúa como orquestrador:
 * delega la lógica de datos a `useTableExport` y la lógica de presentación
 * del PDF a `ReportPreviewModal`. El componente en sí solo maneja estado de UI.
 *
 * Responsabilidades de este componente:
 *  - Búsqueda global (controlada: `globalFilter` / `onGlobalFilterChange`).
 *  - Espacio de acciones personalizadas (`buttonSpace`) para inyectar acciones extra.
 *  - Compatibilidad hacia atrás: `onNew` se mantiene y puede convivir con `buttonSpace`.
 *  - Menú de exportación: PDF (modal), Excel (.xlsx), CSV.
 *  - Menú de visibilidad de columnas.
 *  - Estado local `isPreviewOpen` para el modal de vista previa.
 *
 * @param {import('@tanstack/react-table').Table} table               - Instancia de la tabla.
 * @param {string}   globalFilter         - Valor actual del filtro global.
 * @param {Function} onGlobalFilterChange - Setter del filtro global (controlled input).
 * @param {string}   searchPlaceholder    - Placeholder del buscador.
 * @param {React.ReactNode} buttonSpace   - Contenido opcional de acciones personalizadas.
 * @param {Function} onNew                - Handler para registrar un nuevo elemento.
 */
export default function DataTableToolbar({
    table,
    globalFilter,
    onGlobalFilterChange,
    searchPlaceholder = 'Buscar en cualquier columna...',
    buttonSpace,
    onNew,
}) {
    /*
     * Separación de capas (Clean Architecture):
     * `useTableExport` encapsula TODA la lógica de datos/exportación.
     * Este componente no sabe CÓMO se exporta, solo CUÁNDO dispararlo.
     */
    const { exportToCSV, exportToExcel, getPrintableData } = useTableExport(table);

    /*
     * Estado de UI local: controla si el modal de vista previa está abierto.
     * Es local porque ningún otro componente necesita saber si el modal está visible.
     * Si fuera necesario en múltiples lugares, se elevaría al componente padre.
     */
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const hasCustomButtons = Boolean(buttonSpace);
    const showLegacyNewButton = Boolean(onNew);

    return (
        <div className="flex items-end py-4 gap-2">

            {/* ── BUSCADOR GLOBAL ──────────────────────────────────────────── */}
            {/*
             * Input controlado: `value` y `onChange` sincronizan el estado
             * del filtro con TanStack Table vía `onGlobalFilterChange`.
             * El `?? ''` previene el warning de React sobre "uncontrolled input".
             */}
            <ThemeInput
                leftIcon={Search}
                placeholder={searchPlaceholder}
                value={globalFilter ?? ''}
                onChange={(e) => onGlobalFilterChange(e.target.value)}
                wrapperClassName="max-w-sm"
            />

            {/* ── ACCIONES (lado derecho) ───────────────────────────────────── */}
            <div className="ml-auto flex items-end gap-2">

                {/* Acciones personalizadas: se muestran como extensión del toolbar */}
                {hasCustomButtons && buttonSpace}

                {/* Compatibilidad hacia atrás: onNew convive con buttonSpace */}
                {showLegacyNewButton && (
                    <ThemeButton
                        theme="institutional"
                        icon={Plus}
                        size="sm"
                        onClick={onNew}
                    >
                        Registrar Nuevo
                    </ThemeButton>
                )}

                {/* ── MENÚ DE EXPORTACIÓN ────────────────────────────────────── */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        {/*
                         * `asChild` hace que DropdownMenuTrigger no renderice un
                         * botón propio, sino que use el <ThemeButton> como trigger.
                         * Evita el anti-pattern de botón dentro de botón (<button><button>).
                         */}
                        <ThemeButton theme="outline" icon={Download} size="sm">
                            Exportar
                        </ThemeButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">

                        {/*
                         * PDF — abre el modal de vista previa en lugar de descargar
                         * directamente. El usuario puede revisar antes de imprimir.
                         * `onSelect` (no `onClick`) es el evento correcto de Radix
                         * para DropdownMenuItem: se dispara al seleccionar y cierra el menú.
                         */}
                        <DropdownMenuItem
                            className="flex items-center gap-2 cursor-pointer"
                            onSelect={() => setIsPreviewOpen(true)}
                        >
                            <FileText className="h-4 w-4 text-[#17365D]" />
                            <span>Descargar PDF (Plantilla)</span>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {/* Excel — descarga directa vía SheetJS */}
                        <DropdownMenuItem
                            className="flex items-center gap-2 cursor-pointer"
                            onSelect={exportToExcel}
                        >
                            <FileSpreadsheet className="h-4 w-4 text-[#17365D]" />
                            <span>Descargar Excel (.xlsx)</span>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {/* CSV — descarga directa con anchor fantasma */}
                        <DropdownMenuItem
                            className="flex items-center gap-2 cursor-pointer"
                            onSelect={exportToCSV}
                        >
                            <FileCode className="h-4 w-4 text-[#17365D]" />
                            <span>Descargar CSV plano</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* ── MENÚ DE VISIBILIDAD DE COLUMNAS ──────────────────────── */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <ThemeButton theme="outline" size="sm">
                            Columnas
                        </ThemeButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {/*
                         * `getCanHide()` filtra las columnas que tienen `enableHiding: false`
                         * (como 'actions'). Solo mostramos las que el usuario puede ocultar.
                         * `toggleVisibility(!!value)` garantiza que el valor sea booleano estricto.
                         */}
                        {table
                            .getAllColumns()
                            .filter((col) => col.getCanHide())
                            .map((col) => (
                                <DropdownMenuCheckboxItem
                                    key={col.id}
                                    className="capitalize"
                                    checked={col.getIsVisible()}
                                    onCheckedChange={(value) =>
                                        col.toggleVisibility(!!value)
                                    }
                                >
                                    {col.id}
                                </DropdownMenuCheckboxItem>
                            ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/*
             * ── MODAL DE VISTA PREVIA PDF ─────────────────────────────────────
             * Se renderiza siempre en el árbol pero retorna null si !isOpen.
             * `getPrintableData()` se llama aquí (no en el onSelect) para que
             * los datos estén frescos en el momento en que el modal se abre.
             */}
            <ReportPreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                tableData={getPrintableData()}
                title="Reporte General"
            />
        </div>
    );
}
