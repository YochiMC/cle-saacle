import React from "react";
import { ExternalLink } from "lucide-react";
import DataViewModal, { DataLabel } from "@/Components/DataTable/DataViewModal";

/** Badge de color según el status del grupo. */
const StatusBadge = ({ status, status_label }) => {
    const map = {
        active: { label: "Activo", cls: "bg-green-100 text-green-800" },
        pending: { label: "En espera", cls: "bg-yellow-100 text-yellow-800" },
        waiting: { label: "En espera", cls: "bg-yellow-100 text-yellow-800" },
        closed: { label: "Cerrado", cls: "bg-red-100 text-red-800" },
        inactive: { label: "Cerrado", cls: "bg-red-100 text-red-800" },
    };
    const { label, cls } = map[status?.toLowerCase()] ?? {
        label: status ?? "Sin estado",
        cls: "bg-gray-100 text-gray-500",
    };
    return (
        <span
            className={`inline-block text-sm font-semibold px-3 py-1 rounded-full ${cls}`}
        >
            {status_label || label}
        </span>
    );
};

/**
 * Modal de detalles completos de un grupo académico.
 * Desacoplado de la estructura visual repetitiva mediante DataViewModal.
 */
export default function GroupDetailsModal({ grupo, onClose }) {
    if (!grupo) return null;

    const nombreDocente = grupo.teacher_name ?? null;

    const TitleHeader = (
        <>
            {grupo.level?.level_tecnm && (
                <span className="inline-block mb-1 bg-[#1B396A] text-white text-xs font-bold px-3 py-0.5 rounded-full">
                    {grupo.level?.level_tecnm}
                </span>
            )}
            <h2 className="text-xl font-bold text-gray-900 leading-tight">
                {grupo.name ?? `Grupo #${grupo.id}`}
            </h2>
            {nombreDocente ? (
                <p className="text-sm font-semibold text-[#1B396A]">
                    {nombreDocente}
                </p>
            ) : (
                <p className="text-sm italic text-gray-400">
                    Docente por asignar
                </p>
            )}
        </>
    );

    return (
        <DataViewModal isOpen={!!grupo} onClose={onClose} title={TitleHeader}>
            <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                    Estado
                </span>
                <StatusBadge status={grupo.status} status_label={grupo.status_label} />
            </div>

            <DataLabel label="Tipo de curso" value={grupo.type} />
            <DataLabel label="Cupo" value={`${grupo.capacity} alumnos`} />
            
            <DataLabel 
                label="Período" 
                value={grupo.period_name} 
                fallback="Sin período asignado" 
            />

            <DataLabel 
                label="Nivel (TECNM)" 
                value={grupo.level?.level_tecnm} 
                fallback="Sin nivel asignado" 
            />

            <DataLabel 
                label="Nivel (MCER)" 
                value={grupo.level?.level_mcer} 
                fallback="—" 
            />

            <DataLabel 
                label="Horas del nivel" 
                value={grupo.level?.hours ? `${grupo.level?.hours} hrs` : null} 
                fallback="—" 
            />

            <DataLabel label="Horario" value={grupo.schedule} />

            <div className="col-span-2">
                <DataLabel label="Modalidad" value={grupo.mode} pill />
            </div>

            <div className="col-span-2 flex flex-col gap-3">
                {grupo.classroom && (
                    <DataLabel label="Aula" value={grupo.classroom} />
                )}

                {grupo.meeting_link && (
                    <DataLabel label="Enlace de clase">
                        <a
                            href={grupo.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1B396A] underline underline-offset-2 hover:text-[#142952] transition-colors"
                        >
                            <ExternalLink size={14} />
                            Enlace de clase
                        </a>
                    </DataLabel>
                )}

                {(!grupo.classroom && !grupo.meeting_link) && (
                    <DataLabel 
                        label="Sede / Ubicación" 
                        value={null}
                        fallback="Sede por asignar" 
                    />
                )}
            </div>
        </DataViewModal>
    );
}
