import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";

/**
 * KardexTable — Componente presentacional (Dumb Component)
 *
 * Renderiza el historial de calificaciones utilizando los primitivos
 * de Shadcn UI y adapta su visualización para pantalla y para impresión.
 *
 * @param {Object} props
 * @param {Array} props.kardexData - Lista de materias y resultados
 * @param {Array} props.records - Alias de compatibilidad hacia atrás
 */
export default function KardexTable({ kardexData = [], records = [] }) {
    const rows = kardexData.length > 0 ? kardexData : records;

    const getPeriod = (record) => record.period ?? record.periodo ?? "N/A";
    const getSubject = (record) => record.subject ?? record.materia ?? "N/A";
    const getGroup = (record) => record.group ?? record.grupo ?? "N/A";
    const getGrade = (record) => record.grade ?? record.calificacion ?? "NA";

    return (
        <div className="w-full">
            <Table className="w-full">
                <TableHeader className="bg-gray-50/50">
                    <TableRow>
                        <TableHead className="w-[60px] text-xs uppercase tracking-wider text-gray-500 text-center">
                            No.
                        </TableHead>
                        <TableHead className="w-[150px] text-xs uppercase tracking-wider text-gray-500 text-center">
                            Periodo
                        </TableHead>
                        <TableHead className="text-xs uppercase tracking-wider text-gray-500 text-left">
                            Asignatura
                        </TableHead>
                        <TableHead className="text-xs uppercase tracking-wider text-gray-500 text-left">
                            Grupo / Examen
                        </TableHead>
                        <TableHead className="w-[150px] text-xs uppercase tracking-wider text-gray-500 text-center">
                            Calificación
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.length > 0 ? (
                        rows.map((record, index) => (
                            <TableRow
                                key={index}
                                className="hover:bg-gray-50 transition-colors"
                            >
                                <TableCell className="font-medium text-slate-600 text-center">
                                    {index + 1}
                                </TableCell>
                                <TableCell className="font-medium text-slate-600 text-center">
                                    {getPeriod(record)}
                                </TableCell>
                                <TableCell className="font-semibold text-slate-900 text-left">
                                    {getSubject(record)}
                                </TableCell>
                                <TableCell className="font-medium text-slate-700 text-left">
                                    {getGroup(record)}
                                </TableCell>
                                <TableCell className="text-center font-bold text-slate-800">
                                    {getGrade(record)}
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={5}
                                className="h-24 text-center text-slate-500"
                            >
                                Sin registros académicos encontrados.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
