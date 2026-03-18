import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import UsersTable from '@/Components/UsersTable';

/**
 * Vista profunda de gestión del grupo.
 * Muestra el dashboard específico de un grupo seleccionado,
 * incluyendo información detallada del grupo y la tabla de alumnos inscritos.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {Object} props.auth - Objeto de autenticación con información del usuario.
 * @param {Object} props.grupo - Objeto con los detalles del grupo y sus relaciones.
 * @returns {JSX.Element} El componente de dashboard del grupo.
 */
export default function GroupDashboard({ auth, grupo }) {
    return (
        <AuthenticatedLayout
            user={auth?.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Grupo: {grupo?.name || 'Cargando...'}
                    </h2>
                    <Link
                        href={route('groups.index')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors shadow-sm"
                    >
                        Volver a Grupos
                    </Link>
                </div>
            }
        >
            <Head title={`Dashboard - ${grupo?.name || 'Grupo'}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Encabezado limpio y profesional con Tailwind */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-xl p-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Nombre del Grupo</p>
                                <p className="mt-1 text-lg font-semibold text-gray-900">{grupo?.name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Nivel</p>
                                <p className="mt-1 text-lg font-semibold text-gray-900">
                                    {grupo?.level?.level_tecnm || grupo?.level?.name || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Periodo</p>
                                <p className="mt-1 text-lg font-semibold text-gray-900">
                                    {grupo?.period?.period_name || grupo?.period?.name || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Docente</p>
                                <p className="mt-1 text-lg font-semibold text-gray-900">
                                    {grupo?.teacher ? `${grupo?.teacher?.name} ${grupo?.teacher?.last_name || ''}`.trim() : 'Sin Asignar'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Contenedor de Tabla (Slot) */}
                    <div className="bg-white rounded-xl shadow-sm p-6 mt-6 min-h-[400px]">
                        
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Alumnos Inscritos</h3>
                            <p className="text-sm text-gray-500">Listado de estudiantes y sus calificaciones.</p>
                        </div>

                        {/* Rendering UsersTable with qualifications relation students */}
                        <UsersTable 
                            data={grupo?.qualifications?.map(q => ({
                                ...q.student,
                                // Add additional useful properties if needed
                                _qualification_id: q.id
                            })) || []} 
                        />
                        
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
