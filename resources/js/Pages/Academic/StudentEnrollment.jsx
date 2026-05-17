import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { BookOpen, Lock, Plus, User } from 'lucide-react';
import PrimaryButton from '@/Components/ui/PrimaryButton';
import SecondaryButton from '@/Components/ui/SecondaryButton';

export default function StudentEnrollment({
    student,
    activePeriod = null,
    isEligible = false,
    isInPeriod = false,
    canEnroll = false,
    availableGroups = [],
    availableExams = [],
    enrolledGroups = [],
    enrolledExams = [],
}) {
    const [submittingTarget, setSubmittingTarget] = useState(null);
    const [feedbackMessage, setFeedbackMessage] = useState('');

    const canEnrollCatalog = canEnroll || (isEligible && isInPeriod);

    const startMutation = (targetKey, action, successMessage, fallbackMessage) => {
        setSubmittingTarget(targetKey);
        setFeedbackMessage('');

        action({
            preserveScroll: true,
            onSuccess: () => {
                setFeedbackMessage(successMessage);
                setTimeout(() => router.reload({ preserveScroll: true, preserveState: true }), 900);
            },
            onError: (errors) => {
                const firstError = Object.values(errors || {})[0];
                setFeedbackMessage(firstError ? String(firstError) : fallbackMessage);
            },
            onFinish: () => setSubmittingTarget(null),
        });
    };

    const handleGroupEnroll = (groupId) => {
        startMutation(
            `group-${groupId}`,
            (options) => router.post(route('self-enroll', { group: groupId }), {}, options),
            'Tu solicitud de inscripción al grupo se envió correctamente.',
            'No se pudo completar la inscripción al grupo.'
        );
    };

    const handleExamEnroll = (examId) => {
        startMutation(
            `exam-${examId}`,
            (options) => router.post(route('exams.enroll', { exam: examId }), { student_ids: [student.id] }, options),
            'Tu solicitud de inscripción al examen se envió correctamente.',
            'No se pudo completar la inscripción al examen.'
        );
    };

    const handleGroupUnenroll = (groupId) => {
        startMutation(
            `group-unenroll-${groupId}`,
            (options) => router.delete(route('groups.unenroll', { group: groupId, student: student.id }), options),
            'Te has desinscrito correctamente del grupo.',
            'No se pudo completar la desinscripción del grupo.'
        );
    };

    const handleExamUnenroll = (examId) => {
        startMutation(
            `exam-unenroll-${examId}`,
            (options) => router.delete(route('exams.unenroll', { exam: examId, student: student.id }), options),
            'Te has desinscrito correctamente del examen.',
            'No se pudo completar la desinscripción del examen.'
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Autoinscripción" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Módulo de inscripciones</p>
                        <h1 className="mt-2 text-4xl font-black text-gray-900">Autoinscripción a grupos y exámenes</h1>
                        <p className="mt-3 max-w-3xl text-gray-600">El sistema mostrará solo los conceptos que ya pagaste y que están abiertos dentro del período actual.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${isEligible ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                {isEligible ? 'Elegible' : 'No elegible'}
                            </div>
                            <div className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${isInPeriod ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'}`}>
                                {activePeriod ? (isInPeriod ? `Período: ${activePeriod.name}` : `Fuera: ${activePeriod.name}`) : 'Sin período'}
                            </div>
                            <div className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${canEnroll ? 'bg-indigo-100 text-indigo-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {canEnroll ? 'Inscripción disponible' : 'Inscripción bloqueada'}
                            </div>
                        </div>

                        <div className="sm:text-right">
                            {!canEnrollCatalog && !isEligible && (
                                <SecondaryButton className="border border-red-300 bg-red-100 hover:bg-red-200">
                                    <a href={route('pagos')} className="inline-flex items-center gap-2"><Plus className="h-4 w-4" /> Ir a pagos</a>
                                </SecondaryButton>
                            )}
                        </div>
                    </div>

                    {feedbackMessage && (
                        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-900">{feedbackMessage}</div>
                    )}

                    {!canEnrollCatalog && (
                        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
                            <Lock className="mx-auto mb-4 h-12 w-12 text-red-600" />
                            <h2 className="text-2xl font-bold text-red-900">Inscripción no disponible</h2>
                            <p className="mx-auto mt-3 max-w-2xl text-red-800">{!isEligible ? 'Necesitas un pago aprobado para desbloquear tu inscripción.' : 'Tu período de inscripción aún no está activo o ya expiró.'}</p>
                            {!isEligible && (
                                <SecondaryButton className="mt-6 border border-red-300 bg-red-100 hover:bg-red-200">
                                    <a href={route('pagos')} className="inline-flex items-center gap-2"><Plus className="h-4 w-4" /> Ir a pagos</a>
                                </SecondaryButton>
                            )}
                        </div>
                    )}

                    <div className="space-y-10">
                        <section className="space-y-4">
                            <div className="flex items-center gap-2">
                                <User className="h-6 w-6 text-indigo-600" />
                                <h2 className="text-2xl font-bold text-gray-900">Mis inscripciones en grupos</h2>
                            </div>

                            {enrolledGroups.length > 0 ? (
                                <ul className="space-y-3">
                                    {enrolledGroups.map((g) => (
                                        <li key={g.id} className="flex items-center justify-between bg-white border rounded-xl p-3">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-gray-900">{g.name}</h4>
                                                    <span className="text-xs text-gray-500">{g.type}</span>
                                                </div>
                                                {g.teacher && <p className="text-sm text-gray-500">{g.teacher.full_name || g.teacher.name}</p>}
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <span className={`text-sm font-semibold ${g.available > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{g.available > 0 ? `${g.available} cupos` : 'Lleno'}</span>
                                                <SecondaryButton onClick={() => handleGroupUnenroll(g.id)}>Desinscribirme</SecondaryButton>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-8 text-center text-yellow-900">
                                    <User className="mx-auto mb-4 h-12 w-12 text-yellow-600" />
                                    No estás inscrito en ningún grupo actualmente.
                                </div>
                            )}
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center gap-2">
                                <BookOpen className="h-6 w-6 text-indigo-600" />
                                <h2 className="text-2xl font-bold text-gray-900">Cursos y Exámenes</h2>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Cursos disponibles</h3>
                                    {canEnrollCatalog ? (
                                        availableGroups.length > 0 ? (
                                            <ul className="space-y-3">
                                                {availableGroups.flatMap(lg => lg.groups).map((group) => (
                                                    <li key={group.id} className="flex items-center justify-between bg-white border rounded-xl p-3">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="font-bold text-gray-900">{group.name}</h4>
                                                                <span className="text-xs text-gray-500">{group.type}</span>
                                                            </div>
                                                            {group.teacher && <p className="text-sm text-gray-500">{group.teacher.name}</p>}
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className={`text-sm font-semibold ${group.available > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{group.available > 0 ? `${group.available} cupos` : 'Lleno'}</span>
                                                            <PrimaryButton disabled={group.available <= 0} onClick={() => handleGroupEnroll(group.id)}>Inscribirme</PrimaryButton>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-gray-500">No hay cursos disponibles para tu pago.</p>
                                        )
                                    ) : (
                                        <p className="text-sm text-gray-500">Inscripción aún no disponible.</p>
                                    )}
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Exámenes</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Inscritos</h4>
                                            {enrolledExams.length > 0 ? (
                                                <ul className="space-y-2">
                                                    {enrolledExams.map(e => (
                                                        <li key={e.id} className="flex items-center justify-between bg-white border rounded-xl p-3">
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-bold text-gray-900">{e.name}</span>
                                                                    <span className="text-xs text-gray-500">{e.exam_type}</span>
                                                                </div>
                                                                {e.teacher && <p className="text-sm text-gray-500">{e.teacher.full_name || e.teacher.name}</p>}
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <span className={`text-sm font-semibold ${e.available > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{e.available > 0 ? `${e.available} cupos` : 'Lleno'}</span>
                                                                <SecondaryButton onClick={() => handleExamUnenroll(e.id)}>Desinscribirme</SecondaryButton>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-sm text-gray-500">No estás inscrito en ningún examen.</p>
                                            )}
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Disponibles</h4>
                                            {canEnrollCatalog ? (
                                                availableExams.length > 0 ? (
                                                    <ul className="space-y-2">
                                                        {availableExams.map(exam => (
                                                            <li key={exam.id} className="flex items-center justify-between bg-white border rounded-xl p-3">
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-bold text-gray-900">{exam.name}</span>
                                                                        <span className="text-xs text-gray-500">{exam.exam_type}</span>
                                                                    </div>
                                                                    {exam.teacher && <p className="text-sm text-gray-500">{exam.teacher.name}</p>}
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <span className={`text-sm font-semibold ${exam.available > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{exam.available > 0 ? `${exam.available} cupos` : 'Lleno'}</span>
                                                                    <PrimaryButton disabled={exam.available <= 0} onClick={() => handleExamEnroll(exam.id)}>Inscribirme</PrimaryButton>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p className="text-sm text-gray-500">No hay exámenes disponibles para tu pago.</p>
                                                )
                                            ) : (
                                                <p className="text-sm text-gray-500">Inscripción aún no disponible.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-gray-100 bg-white p-4 text-sm text-gray-600">
                                    <p>Si tu pago corresponde a <strong>Regular</strong>, el sistema respetará tu nivel; de lo contrario verás solo los conceptos que coinciden con tu pago aprobado.</p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
