import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import {
    Lock, AlertCircle, CheckCircle, Clock, BookOpen,
    User, Unlock, ChevronRight, AlertTriangle
} from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

/**
 * Vista de Autoinscripción para Estudiantes
 * 
 * Muestra:
 * 1. Estado de elegibilidad: Elegible o No Elegible
 * 2. Estado del período de inscripción: Activo o Inactivo
 * 3. Grupos disponibles agrupados por nivel
 * 4. Opción de inscribirse o cambiar de grupo
 */
export default function StudentEnrollment({
    student,
    activePeriod = null,
    isEligible = false,
    isInPeriod = false,
    availableGroups = [],
    studentStatus = '',
}) {
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [enrollmentMessage, setEnrollmentMessage] = useState('');

    const handleEnroll = (groupId) => {
        setIsSubmitting(true);
        setEnrollmentMessage('');

        // Enrolar en el nuevo grupo (y desinscrribirse de otros si aplica)
        router.post(
            route('self-enroll', { group: groupId }),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setEnrollmentMessage('✓ Inscripción exitosa. Ahora estás en espera de confirmación.');
                    setSelectedGroupId(null);
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                },
                onError: (errors) => {
                    setEnrollmentMessage('✗ No se pudo completar la inscripción. ' + Object.values(errors)[0]);
                },
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    // Determina el estado visual general
    const canEnroll = isEligible && isInPeriod;

    return (
        <AuthenticatedLayout user={null}>
            <Head title="Autoinscripción a Grupos" />

            <div className="py-12">
                <div className="max-w-6xl mx-auto sm:px-6 lg:px-8">

                    {/* Encabezado */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
                            Autoinscripción a Grupos
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Revisa tu elegibilidad y elige un grupo para inscribirte.
                        </p>
                    </div>

                    {/* Tarjetas de Estado */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

                        {/* Estado del Estudiante */}
                        <div className={`rounded-2xl border-2 p-6 shadow-sm ${isEligible ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                            <div className="flex items-start justify-between mb-4">
                                {isEligible ? (
                                    <Unlock className="w-8 h-8 text-emerald-600" />
                                ) : (
                                    <Lock className="w-8 h-8 text-red-600" />
                                )}
                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${isEligible ? 'bg-emerald-200 text-emerald-900' : 'bg-red-200 text-red-900'}`}>
                                    {isEligible ? 'ELEGIBLE' : 'NO ELEGIBLE'}
                                </span>
                            </div>
                            <h3 className={`text-lg font-bold ${isEligible ? 'text-emerald-900' : 'text-red-900'}`}>
                                Tu Elegibilidad
                            </h3>
                            <p className={`mt-2 text-sm ${isEligible ? 'text-emerald-800' : 'text-red-800'}`}>
                                {isEligible
                                    ? 'Tienes un pago aprobado y eres elegible para inscribirte.'
                                    : 'No tienes pagos aprobados. Carga un comprobante para ser elegible.'}
                            </p>
                            {!isEligible && (
                                <SecondaryButton className="mt-4 w-full text-center bg-red-100 hover:bg-red-200 border border-red-300">
                                    <a href={route('pagos')} className="block w-full">
                                        Ir a Subir Comprobante
                                    </a>
                                </SecondaryButton>
                            )}
                        </div>

                        {/* Estado del Período */}
                        <div className={`rounded-2xl border-2 p-6 shadow-sm ${isInPeriod ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="flex items-start justify-between mb-4">
                                {isInPeriod ? (
                                    <Clock className="w-8 h-8 text-blue-600" />
                                ) : (
                                    <AlertCircle className="w-8 h-8 text-gray-600" />
                                )}
                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${isInPeriod ? 'bg-blue-200 text-blue-900' : 'bg-gray-200 text-gray-900'}`}>
                                    {isInPeriod ? 'ABIERTO' : 'CERRADO'}
                                </span>
                            </div>
                            <h3 className={`text-lg font-bold ${isInPeriod ? 'text-blue-900' : 'text-gray-900'}`}>
                                Período de Inscripción
                            </h3>
                            {activePeriod ? (
                                <p className={`mt-2 text-sm ${isInPeriod ? 'text-blue-800' : 'text-gray-700'}`}>
                                    {isInPeriod
                                        ? `Período activo: ${activePeriod.name}`
                                        : `Período: ${activePeriod.name} (fuera de fechas)`}
                                </p>
                            ) : (
                                <p className="mt-2 text-sm text-gray-700">
                                    No hay período activo en este momento.
                                </p>
                            )}
                        </div>

                        {/* Resumen General */}
                        <div className={`rounded-2xl border-2 p-6 shadow-sm ${canEnroll ? 'bg-indigo-50 border-indigo-200' : 'bg-yellow-50 border-yellow-200'}`}>
                            <div className="flex items-start justify-between mb-4">
                                {canEnroll ? (
                                    <CheckCircle className="w-8 h-8 text-indigo-600" />
                                ) : (
                                    <AlertTriangle className="w-8 h-8 text-yellow-600" />
                                )}
                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${canEnroll ? 'bg-indigo-200 text-indigo-900' : 'bg-yellow-200 text-yellow-900'}`}>
                                    {canEnroll ? 'LISTO' : 'EN ESPERA'}
                                </span>
                            </div>
                            <h3 className={`text-lg font-bold ${canEnroll ? 'text-indigo-900' : 'text-yellow-900'}`}>
                                Puedes Inscribirte
                            </h3>
                            <p className={`mt-2 text-sm ${canEnroll ? 'text-indigo-800' : 'text-yellow-800'}`}>
                                {canEnroll
                                    ? 'Todo está listo. Elige un grupo a continuación.'
                                    : 'Completa los requisitos de elegibilidad y período.'}
                            </p>
                        </div>

                    </div>

                    {/* Grupos Disponibles */}
                    {canEnroll && availableGroups.length > 0 ? (
                        <div className="space-y-8">
                            {availableGroups.map((levelGroup) => (
                                <div key={levelGroup.level.id}>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <BookOpen className="w-6 h-6 text-indigo-600" />
                                        {levelGroup.level.level_tecnm || levelGroup.level.name}
                                    </h2>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {levelGroup.groups.map((group) => {
                                            const isSelected = selectedGroupId === group.id;
                                            const capacityPercent = (group.enrolled / group.capacity) * 100;
                                            const availableSeats = group.available;

                                            return (
                                                <div
                                                    key={group.id}
                                                    className={`rounded-2xl border-2 p-6 transition-all cursor-pointer ${isSelected
                                                        ? 'bg-indigo-50 border-indigo-500 shadow-lg'
                                                        : 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-md'
                                                    }`}
                                                    onClick={() => setSelectedGroupId(isSelected ? null : group.id)}
                                                >
                                                    {/* Encabezado del Grupo */}
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <h3 className="text-xl font-bold text-gray-900">{group.name}</h3>
                                                            {group.teacher && (
                                                                <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                                                                    <User className="w-4 h-4" />
                                                                    {group.teacher.name}
                                                                </p>
                                                            )}
                                                        </div>
                                                        {availableSeats > 0 ? (
                                                            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
                                                                {availableSeats} {availableSeats === 1 ? 'lugar' : 'lugares'}
                                                            </span>
                                                        ) : (
                                                            <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full">
                                                                Lleno
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Detalles del Grupo */}
                                                    <div className="space-y-3 mb-5">
                                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                                            <div>
                                                                <p className="text-gray-500 font-semibold">Horario</p>
                                                                <p className="text-gray-900">{group.schedule || 'N/A'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-500 font-semibold">Aula</p>
                                                                <p className="text-gray-900">{group.classroom || 'N/A'}</p>
                                                            </div>
                                                        </div>

                                                        {/* Barra de Capacidad */}
                                                        <div>
                                                            <div className="flex justify-between items-center mb-2">
                                                                <p className="text-gray-500 text-sm font-semibold">Capacidad</p>
                                                                <p className="text-gray-900 text-sm font-bold">
                                                                    {group.enrolled}/{group.capacity}
                                                                </p>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                                <div
                                                                    className={`h-full transition-all ${capacityPercent >= 100 ? 'bg-red-600' : 'bg-emerald-600'}`}
                                                                    style={{ width: `${Math.min(capacityPercent, 100)}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Botón de Inscripción (Condicional) */}
                                                    {isSelected && availableSeats > 0 && (
                                                        <div className="pt-4 border-t border-gray-200">
                                                            {enrollmentMessage && (
                                                                <div className={`mb-4 p-3 rounded-lg text-sm font-semibold ${
                                                                    enrollmentMessage.startsWith('✓')
                                                                        ? 'bg-emerald-100 text-emerald-800'
                                                                        : 'bg-red-100 text-red-800'
                                                                }`}>
                                                                    {enrollmentMessage}
                                                                </div>
                                                            )}
                                                            <PrimaryButton
                                                                onClick={() => handleEnroll(group.id)}
                                                                disabled={isSubmitting}
                                                                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                                                            >
                                                                {isSubmitting ? 'Procesando...' : 'Inscribirme'}
                                                            </PrimaryButton>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : canEnroll ? (
                        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-8 text-center">
                            <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-yellow-900 mb-2">No hay grupos disponibles</h3>
                            <p className="text-yellow-800">
                                En este momento no hay grupos disponibles dentro de tu nivel académico en el período de inscripción.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
                            <Lock className="w-12 h-12 text-red-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-red-900 mb-2">Inscripción no disponible</h3>
                            <p className="text-red-800 mb-6">
                                {!isEligible
                                    ? 'Necesitas ser elegible para inscribirte. Sube un comprobante de pago aprobado.'
                                    : 'El período de inscripción no está activo en este momento.'}
                            </p>
                            {!isEligible && (
                                <PrimaryButton className="bg-red-600 hover:bg-red-700">
                                    <a href={route('pagos')} className="block">
                                        Subir Comprobante
                                    </a>
                                </PrimaryButton>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
