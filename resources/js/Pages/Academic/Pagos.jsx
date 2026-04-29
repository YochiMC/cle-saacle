import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { 
    Wallet, Clock, CheckCircle, 
    ChevronRight, 
    Search, Plus, User as UserIcon
} from 'lucide-react';
import PaymentModal from '@/Components/Academic/PaymentModal';
import ReviewModal from '@/Components/Academic/ReviewModal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function Pagos({ auth, services = [], serviceTypes = [], serviceStatuses = [], reviewOptions = [] }) {
    const isAdmin = auth.user?.roles?.some(role => role.name === 'admin' || role.name === 'coordinator');

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

    return (
        <AuthenticatedLayout
            user={auth?.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-bold text-2xl text-gray-800 leading-tight flex items-center gap-2">
                        <Wallet className="w-7 h-7 text-indigo-600" />
                        {isAdmin ? 'Gestión de Pagos' : 'Mis Pagos'}
                    </h2>
                    {!isAdmin && (
                        <PrimaryButton className="bg-indigo-600 hover:bg-indigo-700 rounded-full px-6 shadow-md shadow-indigo-200" onClick={handleOpenCreate}>
                            <Plus className="w-4 h-4 mr-2" />
                            Nuevo Pago
                        </PrimaryButton>
                    )}
                </div>
            }
        >
            <Head title={isAdmin ? 'Gestión de Pagos' : 'Mis Pagos'} />

            <div className="py-8 min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">
                    
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl border border-gray-100 group">
                        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
                            <div className="relative w-full sm:w-96">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder={isAdmin ? "Buscar por alumno o referencia..." : "Buscar por referencia..."}
                                    className="block w-full pl-10 pr-4 py-3 border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm shadow-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {filteredServices.length > 0 ? filteredServices.map((pago) => (
                                <div key={pago.id} className="p-6 hover:bg-indigo-50/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer group/row" onClick={() => handleOpenPayment(pago)}>
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

                                    <div className="flex items-center justify-between md:justify-end gap-6 sm:pl-20 md:pl-0">
                                        <div className="text-right">
                                            <p className="text-xl font-extrabold text-gray-900">{formatCurrency(pago.amount)}</p>
                                            <div className="mt-1.5 flex justify-end">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wide ${getStatusStyle(pago.status)}`}>
                                                    {getStatusIcon(pago.status)}
                                                    {getStatusLabel(pago.status)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 group-hover/row:text-indigo-600 group-hover/row:bg-indigo-100 transition-all">
                                            <ChevronRight className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="px-6 py-16 text-center flex flex-col items-center justify-center">
                                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-5 border border-gray-100 shadow-sm animate-[pulse_3s_ease-in-out_infinite]">
                                        <Wallet className="w-12 h-12 text-gray-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">No hay pagos registrados</h3>
                                    <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">No se encontraron pagos en el sistema.</p>
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
                    serviceTypes={serviceTypes}
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
