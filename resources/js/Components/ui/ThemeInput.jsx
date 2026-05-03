import * as React from "react";
import { Input } from "@/Components/ui/input";
import { cn } from "@/lib/utils";

/**
 * ThemeInput — Wrapper del Input de Shadcn UI.
 *
 *
 * Props
 * ─────
 * leftIcon  ReactNode  — componente ícono de lucide-react mostrado dentro del input (lado izquierdo)
 * className string     — clases Tailwind extra para el <input> interno
 * wrapperClassName string — clases extra para el contenedor externo (útil para márgenes, ancho, etc.)
 * ...rest   Todos los props nativos de <input> (type, placeholder, value, onChange, disabled, etc.)
 *
 */

const ThemeInput = React.forwardRef(
    ({ leftIcon: LeftIcon, className, wrapperClassName, ...props }, ref) => {
        return (
            <div
                className={cn(
                    "relative flex items-center w-full",
                    wrapperClassName,
                )}
            >
                {/* ── Ícono izquierdo ── */}
                {LeftIcon && (
                    <span
                        className={cn(
                            "pointer-events-none absolute left-3",
                            "text-[#17365D]/60",
                            "transition-colors duration-200",
                        )}
                        aria-hidden="true"
                    >
                        <LeftIcon className="h-4 w-4" />
                    </span>
                )}

                {/* ── Input de Shadcn ────────────────────────────────────────────── */}
                <Input
                    ref={ref}
                    className={cn(
                        // ── Layout ────────────────────────────────────────────────────
                        "w-full rounded-md text-sm",
                        // ── Tipografía y espaciado ─────────────────────────────────────
                        "placeholder:text-slate-400",
                        // ── Colores de fondo y borde ───────────────────────────────────
                        "border border-slate-200 bg-white",
                        "hover:border-[#17365D]/50",
                        // ── Transiciones ───────────────────────────────────────────────
                        "transition-all duration-200 ease-in-out",
                        // ── Focus ring institucional (sutil, no saturado) ──────────────
                        "focus-visible:outline-none",
                        "focus-visible:ring-1 focus-visible:ring-[#17365D]/30",
                        "focus-visible:border-[#17365D]",
                        // ── Sombra sutil — refuerza el resplandor en focus ─────────────
                        "shadow-sm focus-visible:shadow-[0_0_0_3px_rgba(23,54,93,0.12)]",
                        // ── Si hay ícono, desplaza el texto para que no se solape ──────
                        LeftIcon ? "pl-10" : "pl-3",
                        // ── Disabled ──────────────────────────────────────────────────
                        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50",
                        // ── Overrides del consumidor ───────────────────────────────────
                        className,
                    )}
                    {...props}
                />
            </div>
        );
    },
);

ThemeInput.displayName = "ThemeInput";

export { ThemeInput };
export default ThemeInput;
