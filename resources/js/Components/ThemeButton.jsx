import * as React from "react";
import { Button } from "@/Components/ui/button";
import { cn } from "@/lib/utils";

/**
 * ThemeButton — Wrapper del Button de Shadcn UI.
 *
 *
 * Props
 * ─────
 * theme    "institutional" | "warning" | "danger" | "outline"  (default: "institutional")
 * icon     ReactNode  — componente ícono de lucide-react, renderizado a la izquierda
 * children ReactNode  — texto / contenido interno
 * ...rest  Todos los props nativos de <Button> (onClick, disabled, type, size, asChild, etc.)
 */

// ── Mapa de variantes ────────────────────────────────────────────────────────
const themeVariants = {
    institutional: cn(
        "bg-[#17365D] text-white",
        "hover:bg-[#1e4a80] active:bg-[#122a4a]",
        "shadow-sm hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-[#17365D] focus-visible:ring-offset-2",
    ),
    warning: cn(
        "bg-orange-500 text-white",
        "hover:bg-orange-600 active:bg-orange-700",
        "shadow-sm hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-orange-500 focus-visible:ring-offset-2",
    ),
    danger: cn(
        "bg-red-600 text-white",
        "hover:bg-red-700 active:bg-red-800",
        "shadow-sm hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-red-600 focus-visible:ring-offset-2",
    ),
    outline: cn(
        "bg-transparent text-[#17365D]",
        "border border-[#17365D]",
        "hover:bg-[#17365D]/10 active:bg-[#17365D]/20",
        "shadow-sm hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-[#17365D] focus-visible:ring-offset-2",
    ),
};

// ── Componente ───────────────────────────────────────────────────────────────
const ThemeButton = React.forwardRef(
    (
        { theme = "institutional", icon: Icon, children, className, ...props },
        ref,
    ) => {
        const variantClasses =
            themeVariants[theme] ?? themeVariants.institutional;

        return (
            <Button
                ref={ref}
                // "ghost" evita que Shadcn sobreescriba el fondo con sus propias variantes
                variant="ghost"
                className={cn(
                    // ── Base ──────────────────────────────────────────────────────────
                    "inline-flex items-center gap-2",
                    "rounded-md px-4 py-2 text-sm font-medium",
                    "transition-all duration-200 ease-in-out",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    // ── Variante ──────────────────────────────────────────────────────
                    variantClasses,
                    // ── Overrides del consumidor (máxima especificidad) ───────────────
                    className,
                )}
                {...props}
            >
                {Icon && (
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                )}
                {children}
            </Button>
        );
    },
);

ThemeButton.displayName = "ThemeButton";

export { ThemeButton };
export default ThemeButton;
