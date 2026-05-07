import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    AlertTriangle,
    BookOpen,
    CheckCircle,
    Clock,
    FileText,
    Lock,
    Plus,
    School,
    User,
    Unlock,
} from 'lucide-react';
import { Trash } from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

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
    studentStatus = '',
    studentStatusValue = '',
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
            (options) => router.post(route('exams.enroll', { exam: examId }), {
                student_ids: [student.id],
            }, options),
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

    const renderCardStatus = (enabled) => (
        <span
            className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${enabled
                ? 'bg-emerald-200 text-emerald-900'
                : 'bg-red-200 text-red-900'
            }`}
        >
            {enabled ? 'Disponible' : 'Bloqueado'}
        </span>
    );

    return (
        <AuthenticatedLayout>
            <Head title="Autoinscripción" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Módulo de inscripciones</p>
                        <h1 className="mt-2 text-4xl font-black text-gray-900">Autoinscripción a grupos y exámenes</h1>
                        <p className="mt-3 max-w-3xl text-gray-600">
                            El sistema mostrará solo los conceptos que ya pagaste y que están abiertos dentro del período actual.
                            En los cursos regulares se mantiene la restricción por nivel.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        <section className={`rounded-3xl border-2 p-6 shadow-sm ${isEligible ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
                            <div className="mb-4 flex items-start justify-between">
                                {isEligible ? <Unlock className="h-8 w-8 text-emerald-600" /> : <Lock className="h-8 w-8 text-red-600" />}
                                {renderCardStatus(isEligible)}
                            </div>
                            <h2 className={`text-lg font-bold ${isEligible ? 'text-emerald-900' : 'text-red-900'}`}>Elegibilidad</h2>
                            <p className={`mt-2 text-sm ${isEligible ? 'text-emerald-800' : 'text-red-800'}`}>
                                {isEligible
                                    ? 'Tu pago fue aprobado y ya puedes ver las opciones correspondientes.'
                                    : 'Debes tener al menos un pago aprobado para activar tu proceso de inscripción.'}
                            </p>
                        </section>

                        <section className={`rounded-3xl border-2 p-6 shadow-sm ${isInPeriod ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                            <div className="mb-4 flex items-start justify-between">
                                {isInPeriod ? <Clock className="h-8 w-8 text-blue-600" /> : <AlertCircle className="h-8 w-8 text-gray-600" />}
                                {renderCardStatus(isInPeriod)}
                            </div>
                            <h2 className={`text-lg font-bold ${isInPeriod ? 'text-blue-900' : 'text-gray-900'}`}>Período actual</h2>
                            <p className={`mt-2 text-sm ${isInPeriod ? 'text-blue-800' : 'text-gray-700'}`}>
                                {activePeriod
                                    ? isInPeriod
                                        ? `Período activo: ${activePeriod.name}`
                                        : `Fuera de fecha: ${activePeriod.name}`
                                    : 'No hay un período activo configurado.'}
                            </p>
                        </section>

                        <section className={`rounded-3xl border-2 p-6 shadow-sm ${canEnroll ? 'border-indigo-200 bg-indigo-50' : 'border-yellow-200 bg-yellow-50'}`}>
                            <div className="mb-4 flex items-start justify-between">
                                {canEnroll ? <CheckCircle className="h-8 w-8 text-indigo-600" /> : <AlertTriangle className="h-8 w-8 text-yellow-600" />}
                                {renderCardStatus(canEnroll)}
                            </div>
                            <h2 className={`text-lg font-bold ${canEnroll ? 'text-indigo-900' : 'text-yellow-900'}`}>Estado general</h2>
                            <p className={`mt-2 text-sm ${canEnroll ? 'text-indigo-800' : 'text-yellow-800'}`}>
                                {canEnroll
                                    ? 'Puedes elegir un grupo o un examen que coincida con tu pago aprobado.'
                                    : 'Primero debe activarse tu elegibilidad y el período de inscripción.'}
                            </p>
                            {studentStatus && <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Estatus actual: {studentStatus}</p>}
                            {studentStatusValue && <p className="mt-1 text-xs text-gray-500">Valor técnico: {studentStatusValue}</p>}
                        </section>
                    </div>

                    {feedbackMessage && (
                        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-900">
                            {feedbackMessage}
                        </div>
                    )}

                    {!canEnrollCatalog && (
                        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
                            <Lock className="mx-auto mb-4 h-12 w-12 text-red-600" />
                            <h2 className="text-2xl font-bold text-red-900">Inscripción no disponible</h2>
                            <p className="mx-auto mt-3 max-w-2xl text-red-800">
                                {!isEligible
                                    ? 'Necesitas un pago aprobado para desbloquear tu inscripción.'
                                    : 'Tu período de inscripción aún no está activo o ya expiró.'}
                            </p>
                            {!isEligible && (
                                <SecondaryButton className="mt-6 border border-red-300 bg-red-100 hover:bg-red-200">
                                    <a href={route('pagos')} className="inline-flex items-center gap-2">
                                        <Plus className="h-4 w-4" />
                                        Ir a pagos
                                    </a>
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
                                <div className="grid gap-6 lg:grid-cols-2">
                                    {enrolledGroups.map((g) => {
                                        const isSubmittingThisUnenroll = submittingTarget === `group-unenroll-${g.id}`;

                                        return (
                                            <article key={g.id} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h4 className="text-xl font-bold text-gray-900">{g.name}</h4>
                                                            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-indigo-900">{g.type}</span>
                                                        </div>
                                                        {g.teacher && (
                                                            <p className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                                                                <User className="h-4 w-4" />
                                                                {g.teacher.full_name || g.teacher.name}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${g.available > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                                        {g.available > 0 ? `${g.available} cupos` : 'Lleno'}
                                                    </span>
                                                </div>

                                                <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                                                    <div className="rounded-2xl bg-gray-50 p-4">
                                                        <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Horario</p>
                                                        <p className="mt-1 text-gray-900">{g.schedule || 'N/A'}</p>
                                                    </div>
                                                    <div className="rounded-2xl bg-gray-50 p-4">
                                                        <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Aula</p>
                                                        <p className="mt-1 text-gray-900">{g.classroom || 'N/A'}</p>
                                                    </div>
                                                </div>

                                                <SecondaryButton
                                                    className="mt-6 w-full border border-red-300 bg-red-50 hover:bg-red-100"
                                                    disabled={isSubmittingThisUnenroll}
                                                    onClick={() => handleGroupUnenroll(g.id)}
                                                >
                                                    {isSubmittingThisUnenroll ? 'Procesando...' : (
                                                        <span className="inline-flex items-center gap-2"><Trash className="h-4 w-4" /> Desinscribirme</span>
                                                    )}
                                                </SecondaryButton>
                                            </article>
                                        );
                                    })}
                                </div>
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
                                <h2 className="text-2xl font-bold text-gray-900">Mis cursos disponibles</h2>
                            </div>

                            {canEnrollCatalog ? (
                                availableGroups.length > 0 ? (
                                    availableGroups.map((levelGroup) => (
                                        <div key={levelGroup.level.id} className="space-y-4">
                                            <h3 className="text-lg font-semibold text-gray-800">
                                                {levelGroup.level.level_tecnm || levelGroup.level.name}
                                            </h3>

                                            <div className="grid gap-6 lg:grid-cols-2">
                                                {levelGroup.groups.map((group) => {
                                                    const isSubmittingThisGroup = submittingTarget === `group-${group.id}`;
                                                    const isRegularCourse = group.type === 'Regular';

                                                    return (
                                                        <article key={group.id} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                                                            <div className="flex items-start justify-between gap-4">
                                                                <div>
                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                        <h4 className="text-xl font-bold text-gray-900">{group.name}</h4>
                                                                        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-indigo-900">
                                                                            {group.type}
                                                                        </span>
                                                                    </div>
                                                                    {group.teacher && (
                                                                        <p className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                                                                            <User className="h-4 w-4" />
                                                                            {group.teacher.name}
                                                                        </p>
                                                                    )}
                                                                </div>

                                                                <span className={`rounded-full px-3 py-1 text-xs font-bold ${group.available > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                                                    {group.available > 0 ? `${group.available} cupos` : 'Lleno'}
                                                                </span>
                                                            </div>

                                                            <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                                                                <div className="rounded-2xl bg-gray-50 p-4">
                                                                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Horario</p>
                                                                    <p className="mt-1 text-gray-900">{group.schedule || 'N/A'}</p>
                                                                </div>
                                                                <div className="rounded-2xl bg-gray-50 p-4">
                                                                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Aula</p>
                                                                    <p className="mt-1 text-gray-900">{group.classroom || 'N/A'}</p>
                                                                </div>
                                                                <div className="rounded-2xl bg-gray-50 p-4">
                                                                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Capacidad</p>
                                                                    <p className="mt-1 text-gray-900">{group.enrolled}/{group.capacity}</p>
                                                                </div>
                                                                <div className="rounded-2xl bg-gray-50 p-4">
                                                                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Regla</p>
                                                                    <p className="mt-1 text-gray-900">{isRegularCourse ? 'Respeta tu nivel actual' : 'Sin restricción por nivel'}</p>
                                                                </div>
                                                            </div>

                                                            <PrimaryButton
                                                                className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                                                                disabled={isSubmittingThisGroup || group.available <= 0}
                                                                onClick={() => handleGroupEnroll(group.id)}
                                                            >
                                                                {isSubmittingThisGroup ? 'Procesando...' : 'Inscribirme al curso'}
                                                            </PrimaryButton>
                                                        </article>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-8 text-center text-yellow-900">
                                        <BookOpen className="mx-auto mb-4 h-12 w-12 text-yellow-600" />
                                        No hay cursos disponibles para el concepto que pagaste.
                                    </div>
                                )
                            ) : (
                                <div className="rounded-3xl border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
                                    Aún no puedes ver cursos disponibles porque tu estatus o el período de inscripción no están activos.
                                </div>
                            )}
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center gap-2">
                                <FileText className="h-6 w-6 text-indigo-600" />
                                <h2 className="text-2xl font-bold text-gray-900">Mis exámenes inscritos</h2>
                            </div>

                            {enrolledExams.length > 0 ? (
                                <div className="grid gap-6 lg:grid-cols-2">
                                    {enrolledExams.map((exam) => {
                                        const isSubmittingThisExamUnenroll = submittingTarget === `exam-unenroll-${exam.id}`;

                                        return (
                                            <article key={exam.id} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h4 className="text-xl font-bold text-gray-900">{exam.name}</h4>
                                                            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-indigo-900">
                                                                {exam.exam_type?.value || exam.exam_type}
                                                            </span>
                                                        </div>
                                                        {exam.teacher && (
                                                            <p className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                                                                <User className="h-4 w-4" />
                                                                {exam.teacher.full_name || exam.teacher.name}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${exam.available > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                                        {exam.available > 0 ? `${exam.available} cupos` : 'Lleno'}
                                                    </span>
                                                </div>

                                                <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                                                    <div className="rounded-2xl bg-gray-50 p-4">
                                                        <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Aplicación</p>
                                                        <p className="mt-1 text-gray-900">{exam.application_time || 'N/A'}</p>
                                                    </div>
                                                    <div className="rounded-2xl bg-gray-50 p-4">
                                                        <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Modalidad</p>
                                                        <p className="mt-1 text-gray-900">{exam.mode || 'N/A'}</p>
                                                    </div>
                                                    <div className="rounded-2xl bg-gray-50 p-4">
                                                        <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Aula</p>
                                                        <p className="mt-1 text-gray-900">{exam.site || 'N/A'}</p>
                                                    </div>
                                                    <div className="rounded-2xl bg-gray-50 p-4">
                                                        <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Capacidad</p>
                                                        <p className="mt-1 text-gray-900">{exam.enrolled}/{exam.capacity}</p>
                                                    </div>
                                                </div>

                                                <SecondaryButton
                                                    className="mt-6 w-full border border-red-300 bg-red-50 hover:bg-red-100"
                                                    disabled={isSubmittingThisExamUnenroll}
                                                    onClick={() => handleExamUnenroll(exam.id)}
                                                >
                                                    {isSubmittingThisExamUnenroll ? 'Procesando...' : (
                                                        <span className="inline-flex items-center gap-2"><Trash className="h-4 w-4" /> Desinscribirme del examen</span>
                                                    )}
                                                </SecondaryButton>
                                            </article>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-8 text-center text-yellow-900">
                                    <FileText className="mx-auto mb-4 h-12 w-12 text-yellow-600" />
                                    No estás inscrito en ningún examen actualmente.
                                </div>
                            )}
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center gap-2">
                                <FileText className="h-6 w-6 text-indigo-600" />
                                <h2 className="text-2xl font-bold text-gray-900">Exámenes disponibles</h2>
                            </div>

                            {canEnrollCatalog ? (
                                availableExams.length > 0 ? (
                                    <div className="grid gap-6 lg:grid-cols-2">
                                        {availableExams.map((exam) => {
                                            const isSubmittingThisExam = submittingTarget === `exam-${exam.id}`;

                                            return (
                                                <article key={exam.id} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div>
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <h4 className="text-xl font-bold text-gray-900">{exam.name}</h4>
                                                                <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-indigo-900">
                                                                    {exam.exam_type}
                                                                </span>
                                                            </div>
                                                            {exam.teacher && (
                                                                <p className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                                                                    <User className="h-4 w-4" />
                                                                    {exam.teacher.name}
                                                                </p>
                                                            )}
                                                        </div>

                                                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${exam.available > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                                            {exam.available > 0 ? `${exam.available} cupos` : 'Lleno'}
                                                        </span>
                                                    </div>

                                                    <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                                                        <div className="rounded-2xl bg-gray-50 p-4">
                                                            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Aplicación</p>
                                                            <p className="mt-1 text-gray-900">{exam.application_time || 'N/A'}</p>
                                                        </div>
                                                        <div className="rounded-2xl bg-gray-50 p-4">
                                                            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Modalidad</p>
                                                            <p className="mt-1 text-gray-900">{exam.mode || 'N/A'}</p>
                                                        </div>
                                                        <div className="rounded-2xl bg-gray-50 p-4">
                                                            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Aula</p>
                                                            <p className="mt-1 text-gray-900">{exam.site || 'N/A'}</p>
                                                        </div>
                                                        <div className="rounded-2xl bg-gray-50 p-4">
                                                            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Capacidad</p>
                                                            <p className="mt-1 text-gray-900">{exam.enrolled}/{exam.capacity}</p>
                                                        </div>
                                                    </div>

                                                    <PrimaryButton
                                                        className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                                                        disabled={isSubmittingThisExam || exam.available <= 0}
                                                        onClick={() => handleExamEnroll(exam.id)}
                                                    >
                                                        {isSubmittingThisExam ? 'Procesando...' : 'Inscribirme al examen'}
                                                    </PrimaryButton>
                                                </article>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-8 text-center text-yellow-900">
                                        <FileText className="mx-auto mb-4 h-12 w-12 text-yellow-600" />
                                        No hay exámenes disponibles para el concepto que pagaste.
                                    </div>
                                )
                            ) : (
                                <div className="rounded-3xl border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
                                    Aún no puedes ver exámenes disponibles porque tu estatus o el período de inscripción no están activos.
                                </div>
                            )}
                        </section>

                        <div className="rounded-3xl border border-gray-200 bg-white p-5 text-sm text-gray-600 shadow-sm">
                            <div className="flex items-start gap-3">
                                <School className="mt-0.5 h-5 w-5 text-indigo-600" />
                                <p>
                                    Si tu pago corresponde a <strong>Regular</strong>, el sistema seguirá respetando tu nivel.
                                    Para los demás conceptos, solo verás los grupos o exámenes que coinciden con el pago aprobado.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}