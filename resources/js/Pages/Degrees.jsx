import React from 'react';

// El prop 'degrees' llega directamente desde tu controlador de Laravel
export default function Index({ degrees }) {
    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">
                    Catálogo de Carreras 🤔🐱‍🐉🐱‍🏍😜👏🤷‍♀️🤷‍♂️👍👀
                </h1>

                {/* Tabla para mostrar las carreras del sistema académico */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100 border-b">
                                <th className="p-3 bg-blue-600 font-semibold text-gray-700">ID</th>
                                <th className="p-3 font-semibold text-gray-700">Nombre de la Carrera</th>
                                <th className="p-3 font-semibold text-gray-700">Plan de Estudios (Curriculum)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Verificamos si hay carreras y las iteramos */}
                            {degrees.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="p-4 text-center text-gray-500">
                                        No hay carreras registradas aún.
                                    </td>
                                </tr>
                            ) : (
                                degrees.map((degree) => (
                                    <tr key={degree.id} className="border-b hover:bg-gray-50">
                                        <td className="p-16 text-ellipsis bg-red-500">{degree.id}</td>
                                        <td className="p-3 text-gray-800 font-medium">{degree.name}</td>
                                        <td className="p-3 text-gray-600">{degree.curriculum}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
