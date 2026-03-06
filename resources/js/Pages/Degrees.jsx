import { Head } from "@inertiajs/react";
import CardGroup from "@/Components/Charts/CardGroup";
import { useState } from "react";
import ModalAlert from "@/Components/UI/ModalAlert";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

export default function Degrees({ 
    degrees = [], 
    students = [],

    chartData = [
        { name: "Sistemas", total: 120, meta: 150 },
        { name: "Industrial", total: 90, meta: 130 },
        { name: "Gestión", total: 70, meta: 100 },
        { name: "Electrónica", total: 60, meta: 80 },
        { name: "Mecatrónica", total: 110, meta: 140 },
    ],
    groups = [
        {
            id: 1,
            title: "Basic 1",
            instructor: "",
            Id_Grupo: "Grupo: 1",
            Periodo: "Ene - 25",
            Horario: "Lunes y Miércoles 10:00 - 11:30",
            Modalidad: "Presencial"
        },
        {
            id: 2,
            title: "Basic 2",
            instructor: "Profesor: Laura",
            Id_Grupo: "Grupo: 2",
            Periodo: "Feb - 25",
            Horario: "Martes y Jueves 12:00 - 1:30",
            Modalidad: "En línea"
        }
    ]
}) {
    // Hook SIEMPRE arriba
    const [openModal, setOpenModal] = useState(false);

    // Ya no es necesario useState para chartData y radarData si vienen directamente de base de datos
    // a menos que necesites modificarlos en tiempo real sin recargar la página.
    // Usaremos directamente las props (chartData) proporcionadas por Inertia.

    return (
        <div className="min-h-screen bg-gray-100 py-12">
            <Head title="Carreras" />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                {/* BOTÓN PARA ABRIR MODAL */}
                <div className="mb-6">
                    <button
                        onClick={() => setOpenModal(true)}
                        className="bg-[#1B396A] text-white px-4 py-2 rounded-lg hover:bg-[#142952] transition"
                    >
                        Mostrar Alerta
                    </button>
                </div>

                {/* ALERTA MODAL */}
                <ModalAlert
                    isOpen={openModal}
                    onClose={() => setOpenModal(false)}
                    type="error"
                    title="Error al registrar"
                    message="No se pudo inscribir al estudiante."
                />

                {/* GRÁFICA */}
                <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
                    <h3 className="text-2xl font-bold text-[#1B396A] mb-6">
                        Estudiantes por Carrera
                    </h3>

                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar
                                dataKey="total"
                                fill="#1B396A"
                                radius={[6, 6, 0, 0]}
                            />
                            <Bar
                                dataKey="meta"
                                fill="#FF9500"
                                radius={[6, 6, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

            </div>

            {/* CARDS */}
            <div className="p-6 flex flex-wrap gap-6 justify-center">
                {groups && groups.length > 0 ? (
                    groups.map((group) => (
                        <CardGroup
                            key={group.id}
                            title={group.title}
                            instructor={group.instructor}
                            Id_Grupo={group.Id_Grupo}
                            Periodo={group.Periodo}
                            Horario={group.Horario}
                            Modalidad={group.Modalidad}
                        />
                    ))
                ) : (
                    <div className="text-gray-500 font-medium py-8">
                        No hay grupos registrados en este momento.
                    </div>
                )}
                
            </div>
            
<div>
                {students.map((student) => (
                    <div key={student.id}>
                        <p>{student.firstName}</p>
                        <p>{student.lastName}</p>
                        <p>{student.numControl}</p>
                        <p>{student.gender}</p>
                        <p>{student.birthDate}</p>
                        <p>{student.semester}</p>
                        <p>{student.degree_id}</p>
                        <p>{student.type_student_id}</p>
                        <p>{student.level_id}</p>
                    </div>
                ))}
            </div>
            
        </div>
    );
}
