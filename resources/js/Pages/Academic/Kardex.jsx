import React from "react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import StudentHeader from "@/Components/Academic/StudentHeader";
import KardexTable from "@/Components/Academic/KardexTable";

// 1. Agregamos studentInfo y kardexData a las props para recibirlos del Backend
export default function Kardex({ auth, studentInfo, kardexData }) {
    // ¡Los datos falsos de "JOSÉ EDUARDO MARTÍNEZ" fueron eliminados de aquí!

    return (
        <AuthenticatedLayout
            user={auth?.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Historial Académico
                </h2>
            }
        >
            <Head title="Kardex del Alumno" />

            <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white shadow-sm sm:rounded-lg border border-gray-200">
                    {/* 2. Inyectamos los datos reales a los componentes visuales */}
                    <StudentHeader studentInfo={studentInfo} />
                    <KardexTable kardexData={kardexData} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
