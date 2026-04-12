import React from "react";
import { Separator } from "@/Components/ui/separator";

/**
 * StudentHeader — Componente presentacional (Dumb Component)
 *
 * Renderiza la cabecera institucional y los metadatos del estudiante.
 * Adaptado para una impresión limpia (las clases `print:` aplican
 * comportamientos específicos).
 *
 * @param {Object} props
 * @param {Object} props.student - Objeto con datos del alumno
 * @param {Object} props.studentInfo - Alias de compatibilidad hacia atrás
 */
export default function StudentHeader({ student, studentInfo }) {
    const studentData = student ?? studentInfo;

    if (!studentData) return null;

    return (
        <div className="mb-6">
            {/* Cabecera institucional (Centrada) */}
            <div className="text-center mb-6 pt-6">
                <h2 className="text-2xl font-bold text-gray-900 tracking-wider">
                    Kardex de Calificaciones
                </h2>
                <p className="text-sm font-medium text-slate-500 mt-1">
                    Coordinación de Lenguas Extranjeras
                </p>
                <p className="text-sm font-semibold text-slate-800 mt-1">
                    Instituto Tecnológico de León
                </p>
            </div>

            <Separator className="my-4" />

            {/* Metadatos del Alumno */}
            <div className="bg-gray-50 p-6 rounded-t-lg border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-8">
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Número de Control
                        </p>
                        <p className="mt-1 text-base font-bold text-slate-900">
                            {studentData.controlNumber}
                        </p>
                    </div>
                    <div className="lg:col-span-2">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Nombre del Alumno
                        </p>
                        <p className="mt-1 text-base font-bold text-slate-900">
                            {studentData.name}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Carrera
                        </p>
                        <p className="mt-1 text-base font-bold text-slate-900">
                            {studentData.career}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
