import React, { useState } from "react";
import { useForm } from "@inertiajs/react";
import { Head } from "@inertiajs/react";
import { PlusCircle, Pencil, Trash2, EllipsisVertical } from "lucide-react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import StudentHeader from "@/Components/domain/Academic/StudentHeader";
import KardexTable from "@/Components/domain/Academic/KardexTable";
import LegacyQualificationModal from "@/Components/domain/Academic/LegacyQualificationModal";
import ConfirmModal from "@/Components/ui/ConfirmModal";
import ThemeButton from "@/Components/ui/ThemeButton";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import useFlashAlert from "@/Hooks/useFlashAlert";
import ModalAlert from "@/Components/ui/ModalAlert";
import { usePermission } from "@/Utils/auth";

// ── Constantes de estilo compartidas con KardexTable ─────────────────────────
// Fuente de verdad: KardexTable.jsx → TableHeader className + TableHead className
// Al modificar KardexTable, actualizar estos tokens para mantener consistencia.
const TABLE_HEADER_BG  = "bg-gray-50/50";
const TABLE_TH_BASE    = "text-xs uppercase tracking-wider text-gray-500 px-6 py-3";
const TABLE_TH_LEFT    = `${TABLE_TH_BASE} text-left`;
const TABLE_TH_CENTER  = `${TABLE_TH_BASE} text-center`;

export default function Kardex({
    auth,
    studentInfo,
    kardexData,
    legacyQualifications = [],
    levels = [],
    userId,
}) {
    // ── Verificación de permisos ────────────────────────────────────────────
    const { hasRole } = usePermission();
    const isAdmin = hasRole("admin") || hasRole("coordinator");

    // ── Estado modal CRUD ────────────────────────────────────────────────────
    const [modalOpen, setModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null); // null = crear

    // ── Estado modal de confirmación de eliminación ──────────────────────────
    const [deleteTarget, setDeleteTarget] = useState(null); // registro a eliminar

    const { delete: destroy, processing: deleting } = useForm();

    // ── Sistema de alertas flash ─────────────────────────────────────────────
    const { flashModal, closeFlashModal } = useFlashAlert();

    // ── Handlers ─────────────────────────────────────────────────────────────
    const openCreate = () => {
        setEditingRecord(null);
        setModalOpen(true);
    };

    const openEdit = (record) => {
        setEditingRecord(record);
        setModalOpen(true);
    };

    const handleDeleteConfirmed = () => {
        if (!deleteTarget) return;
        destroy(
            route("legacy-qualifications.destroy", [userId, deleteTarget.id]),
            { onSuccess: () => setDeleteTarget(null) }
        );
    };

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

            <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

                {/* ── Reporte oficial (intacto) ── */}
                <div className="bg-white shadow-sm sm:rounded-lg border border-gray-200">
                    <StudentHeader studentInfo={studentInfo} />
                    <KardexTable kardexData={kardexData} />
                </div>

                {/* ── Sección de Calificaciones Históricas (OG) ── */}
                <div className="bg-white shadow-sm sm:rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h3 className="text-base font-semibold text-[#17365D]">
                            Calificaciones Históricas (OG)
                        </h3>
                        {isAdmin && userId && (
                            <ThemeButton
                                theme="institutional"
                                icon={PlusCircle}
                                onClick={openCreate}
                            >
                                Añadir Histórico
                            </ThemeButton>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        {legacyQualifications.length === 0 ? (
                            <p className="px-6 py-8 text-sm text-center text-slate-400">
                                No hay calificaciones históricas registradas para este alumno.
                            </p>
                        ) : (
                            <table className="w-full text-sm text-left text-gray-700">
                                <thead className={TABLE_HEADER_BG}>
                                    <tr>
                                        <th className={TABLE_TH_CENTER}>#</th>
                                        <th className={TABLE_TH_LEFT}>Nivel</th>
                                        <th className={TABLE_TH_LEFT}>Periodo</th>
                                        <th className={TABLE_TH_LEFT}>Calificación</th>
                                        {isAdmin && <th className={TABLE_TH_CENTER}>Acciones</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {legacyQualifications.map((lq, idx) => (
                                        <tr key={lq.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-3 text-gray-400">{idx + 1}</td>
                                            <td className="px-6 py-3 font-medium">{lq.level_name}</td>
                                            <td className="px-6 py-3">{lq.period}</td>
                                            <td className="px-6 py-3">
                                                <span
                                                    className={`font-semibold ${
                                                        lq.final_grade >= 70
                                                            ? "text-green-600"
                                                            : "text-red-500"
                                                    }`}
                                                >
                                                    {lq.final_grade}
                                                </span>
                                            </td>
                                            {isAdmin && (
                                                <td className="px-6 py-3">
                                                    <div className="flex justify-center">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <button
                                                                    className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-[#17365D] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#17365D]/10"
                                                                    title="Acciones"
                                                                >
                                                                    <EllipsisVertical className="w-5 h-5" />
                                                                </button>
                                                            </DropdownMenuTrigger>

                                                            <DropdownMenuContent
                                                                align="end"
                                                                className="w-48 p-1.5 bg-white rounded-xl shadow-xl border border-gray-100"
                                                            >
                                                                <DropdownMenuItem
                                                                    onClick={() => openEdit(lq)}
                                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 rounded-lg cursor-pointer transition-colors duration-150 hover:bg-gray-50 focus:bg-gray-50 outline-none"
                                                                >
                                                                    <Pencil className="w-4 h-4 text-slate-400" />
                                                                    Editar registro
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => setDeleteTarget(lq)}
                                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 rounded-lg cursor-pointer transition-colors duration-150 hover:bg-red-50/50 focus:bg-red-50/50 outline-none"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                    Eliminar registro
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Modal CRUD (crear / editar) ── */}
            {isAdmin && userId && (
                <LegacyQualificationModal
                    show={modalOpen}
                    onClose={() => setModalOpen(false)}
                    userId={userId}
                    levels={levels}
                    qualification={editingRecord}
                />
            )}

            {/* ── Modal de confirmación de eliminación ── */}
            {isAdmin && (
                <ConfirmModal
                    isOpen={deleteTarget !== null}
                    onClose={() => setDeleteTarget(null)}
                    onConfirm={handleDeleteConfirmed}
                    title="Eliminar calificación histórica"
                    message={`¿Estás seguro de que deseas eliminar la calificación de "${deleteTarget?.level_name} – ${deleteTarget?.period}"? Esta acción no se puede deshacer.`}
                    confirmText={deleting ? "Eliminando..." : "Sí, eliminar"}
                    variant="danger"
                />
            )}

            {/* ── Alertas Flash (feedback de operación) ── */}
            <ModalAlert
                isOpen={flashModal.isOpen}
                onClose={closeFlashModal}
                type={flashModal.type}
                title={flashModal.title}
                message={flashModal.message}
            />
        </AuthenticatedLayout>
    );
}


