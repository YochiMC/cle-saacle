import React, { useMemo } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { DataTable } from '@/Components/DataTable/DataTable'; // Adjust the import path as needed

export default function Kardex() {
    // Columnas para la tabla de calificaciones
    const columns = useMemo(() => [
        {
            accessorKey: 'course',
            header: 'Curso',
        },
        {
            accessorKey: 'period',
            header: 'Periodo',
        },
        {
            accessorKey: 'grade',
            header: 'Calificación',
        },
        {
            accessorKey: 'status',
            header: 'Estatus',
            cell: ({ row }) => {
                const status = row.original.status;
                const color = status === 'Aprobado' ? 'text-green-600 font-bold' : 'text-red-600 font-bold';
                return <span className={color}>{status}</span>;
            }
        }
    ], []);
    // Datos simulados (mock data) de las calificaciones del alumno
    const data = useMemo(() => [
        { id: 1, course: 'Basico 1', period: '2023-1', grade: 90, status: 'Aprobado' },
        { id: 2, course: 'Basico 2', period: '2023-2', grade: 85, status: 'Aprobado' },
        { id: 3, course: 'Basico 3', period: '2024-1', grade: 95, status: 'Aprobado' },
        { id: 4, course: 'Basico 4', period: '2024-2', grade: 60, status: 'Reprobado' },
        { id: 5, course: 'Basico 5', period: '2025-1', grade: 60, status: 'Reprobado' },
        { id: 6, course: 'Intermedio 1', period: '2025-2', grade: 88, status: 'Aprobado' },
    ], []);
    return (
        <AuthenticatedLayout>
            <Head title="Kardex de Calificaciones" />
            <div className="min-h-screen bg-gray-100 py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-4">
                            Mi Kardex de Calificaciones
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Aquí puedes consultar el historial de calificaciones de los cursos que has llevado.
                        </p>
                        <DataTable 
                            columns={columns} 
                            data={data} 
                            searchPlaceholder="Buscar curso o periodo..."
                            noDataMessage="No hay calificaciones registradas."
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
