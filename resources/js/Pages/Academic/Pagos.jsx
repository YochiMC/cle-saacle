import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import {
    Wallet, Clock, CheckCircle, AlertCircle,
    ChevronRight, CreditCard,
    Search, Plus, User as UserIcon
} from 'lucide-react';
import PaymentModal from '@/Components/domain/Academic/PaymentModal';
import ReviewModal from '@/Components/domain/Academic/ReviewModal';
import PrimaryButton from '@/Components/ui/PrimaryButton';
import SecondaryButton from '@/Components/ui/SecondaryButton';

export default function Pagos({ auth, services = [], serviceTypes = [], serviceStatuses = [], reviewOptions = [] }) {
    const isAdmin = auth.user?.roles?.some(role => role.name === 'admin' || role.name === 'coordinator');
    const paymentConceptOptions = serviceTypes;

    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Form para crear pago (Estudiante)
    const { data: formData, setData: setFormData, post, processing: isPosting, errors, reset, clearErrors, setError } = useForm({
        type: '',
        amount: '',
        reference_number: '',
        description: '',
        file: null,
    });

    // Form para revisar pago (Admin)
    const { data: reviewData, setData: setReviewData, put, processing: isReviewing, errors: reviewErrors, reset: resetReview } = useForm({
        status: '',
        comments: '',
    });

    const handleFileChange = (event) => {
        const selectedFile = event.target.files?.[0] ?? null;
        setFormData('file', selectedFile);
        if (selectedFile) clearErrors('file');
    };

    const handleFileValidationError = (message) => {
        if (!message) {
            clearErrors('file');
            return;
        }
        setFormData('file', null);
        setError('file', message);
    };

    const handleOpenCreate = () => {
        reset();
        clearErrors();
        setSelectedPayment(null);
        setIsPaymentModalOpen(true);
    };

    const handleOpenPayment = (pago) => {
        setSelectedPayment(pago);
        if (isAdmin) {
            setReviewData({
                status: pago.status === 'pending' ? '' : pago.status,
                comments: pago.comments || '',
            });
            setIsReviewModalOpen(true);
        } else {
            setIsPaymentModalOpen(true);
        }
    };

    const submitPayment = (e) => {
        e.preventDefault();
        post(route('services.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsPaymentModalOpen(false);
                reset();
            }
        });
    };

    const submitReview = (e) => {
        e.preventDefault();
        put(route('services.update', selectedPayment.id), {
            preserveScroll: true,
            onSuccess: () => {
                setIsReviewModalOpen(false);
                resetReview();
            }
        });
    };

    const handleDelete = (id) => {
        if (confirm("¿Estás seguro de eliminar este pago?")) {
            router.delete(route('services.destroy', id), { preserveScroll: true });
            setIsPaymentModalOpen(false);
            setIsReviewModalOpen(false);
        }
    };

    const handleDownload = (id) => {
        window.location.href = route('services.download', id);
    };

    const getStatusStyle = (status) => {
        switch(status) {
            case 'approved': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'rejected': return 'bg-rose-100 text-rose-800 border-rose-200';
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'approved': return <CheckCircle className="w-4 h-4 mr-1.5" />;
            case 'rejected': return <AlertCircle className="w-4 h-4 mr-1.5" />;
            case 'pending': return <Clock className="w-4 h-4 mr-1.5" />;
            default: return null;
        }
    };

    const getStatusLabel = (status) => {
        const found = serviceStatuses.find(s => s.value === status);
        return found ? found.label : status;
    };

    const getTypeLabel = (type) => {
        const found = serviceTypes.find(t => t.value === type);
        return found ? found.label : type;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
    };

    const filteredServices = services.filter(p => {
        const term = searchTerm.toLowerCase();
        return (p.type && p.type.toLowerCase().includes(term)) ||
               (p.reference_number && p.reference_number.toLowerCase().includes(term)) ||
               (isAdmin && p.student?.user?.name?.toLowerCase().includes(term));
    });

    const displayedServices = isAdmin
        ? [...filteredServices].sort((a, b) => {
            if (a.status === 'pending' && b.status !== 'pending') return -1;
            if (a.status !== 'pending' && b.status === 'pending') return 1;
            return new Date(b.created_at) - new Date(a.created_at);
        })
        : filteredServices;

    return (
        <AuthenticatedLayout
            user={auth?.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-2xl font-bold leading-tight text-gray-800">
                        <Wallet className="text-indigo-600 w-7 h-7" />
                        {isAdmin ? 'Aprobación de Pagos' : 'Mis Pagos'}
                    </h2>
                    {!isAdmin && (
                        <PrimaryButton className="px-6 bg-indigo-600 rounded-full shadow-md hover:bg-indigo-700 shadow-indigo-200" onClick={handleOpenCreate}>
                            <Plus className="w-4 h-4 mr-2" />
                            Subir Comprobante
                        </PrimaryButton>
                    )}
                </div>
            }
        >
            <Head title={isAdmin ? 'Aprobación de Pagos' : 'Mis Pagos'} />

            <div className="min-h-screen py-8">
                <div className="mx-auto space-y-8 max-w-7xl sm:px-6 lg:px-8">

                    <div className="overflow-hidden bg-white border border-gray-100 shadow-sm sm:rounded-2xl group">
                        <div className="flex flex-col items-center justify-between gap-4 p-6 border-b border-gray-100 sm:flex-row bg-gray-50/50">
                            {isAdmin && (
                                <div className="w-full px-4 py-3 text-sm text-gray-600 border border-indigo-100 sm:w-auto bg-indigo-50 rounded-xl">
                                    Revisa primero los pagos pendientes y aprueba o rechaza cada comprobante.
                                </div>
                            )}
                            <div className="relative w-full sm:w-96">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                    <Search className="w-4 h-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder={isAdmin ? "Buscar por alumno o referencia..." : "Buscar por referencia..."}
                                    className="block w-full py-3 pl-10 pr-4 leading-5 placeholder-gray-400 bg-white border-gray-200 shadow-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {displayedServices.length > 0 ? displayedServices.map((pago) => (
                                <div key={pago.id} className="flex flex-col justify-between gap-4 p-6 transition-colors cursor-pointer hover:bg-indigo-50/30 md:flex-row md:items-center group/row" onClick={() => handleOpenPayment(pago)}>
                                    <div className="flex items-center gap-5">
                                        <div className={`p-4 rounded-xl flex-shrink-0 shadow-sm border ${pago.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-white text-indigo-600 border-indigo-100'}`}>
                                            {pago.status === 'approved' ? <CheckCircle className="w-6 h-6" /> : <CreditCard className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-gray-900 group-hover/row:text-indigo-600">{getTypeLabel(pago.type)}</h4>
                                            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                                                {isAdmin && pago.student && (
                                                    <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md border border-gray-100 text-gray-700">
                                                        <UserIcon className="w-3.5 h-3.5 text-gray-400" />
                                                        {pago.student.user?.name}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1.5 text-gray-500">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {new Date(pago.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-6 md:justify-end sm:pl-20 md:pl-0">
                                        <div className="text-right">
                                            <p className="text-xl font-extrabold text-gray-900">{formatCurrency(pago.amount)}</p>
                                            <div className="mt-1.5 flex justify-end">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wide ${getStatusStyle(pago.status)}`}>
                                                    {getStatusIcon(pago.status)}
                                                    {getStatusLabel(pago.status)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-center w-10 h-10 text-gray-400 transition-all rounded-full group-hover/row:text-indigo-600 group-hover/row:bg-indigo-100">
                                            <ChevronRight className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-5 border border-gray-100 shadow-sm animate-[pulse_3s_ease-in-out_infinite]">
                                        <Wallet className="w-12 h-12 text-gray-300" />
                                    </div>
                                    <h3 className="mb-2 text-xl font-bold text-gray-900">No hay pagos registrados</h3>
                                    <p className="max-w-sm mx-auto leading-relaxed text-gray-500">No se encontraron pagos en el sistema.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL PARA ESTUDIANTE: DETALLE / SUBIR PAGO */}
            {!isAdmin && (
                <PaymentModal
                    show={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    selectedPayment={selectedPayment}
                    serviceTypes={paymentConceptOptions}
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    onSubmit={submitPayment}
                    isProcessing={isPosting}
                    onFileChange={handleFileChange}
                    onDelete={handleDelete}
                    onDownload={handleDownload}
                    getStatusStyle={getStatusStyle}
                    getStatusIcon={getStatusIcon}
                    getStatusLabel={getStatusLabel}
                    getTypeLabel={getTypeLabel}
                    formatCurrency={formatCurrency}
                />
            )}

            {/* MODAL PARA ADMIN: REVISAR PAGO */}
            {isAdmin && (
                <ReviewModal
                    show={isReviewModalOpen}
                    onClose={() => setIsReviewModalOpen(false)}
                    selectedPayment={selectedPayment}
                    reviewOptions={reviewOptions}
                    reviewData={reviewData}
                    setReviewData={setReviewData}
                    reviewErrors={reviewErrors}
                    onSubmit={submitReview}
                    isProcessing={isReviewing}
                    onDelete={handleDelete}
                    onDownload={handleDownload}
                    getStatusStyle={getStatusStyle}
                    getStatusIcon={getStatusIcon}
                    getStatusLabel={getStatusLabel}
                    getTypeLabel={getTypeLabel}
                    formatCurrency={formatCurrency}
                />
            )}

        </AuthenticatedLayout>
    );
}

