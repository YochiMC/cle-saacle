import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { 
    CreditCard, Wallet, Clock, CheckCircle, 
    AlertCircle, Download, ChevronRight, 
    Search, Filter, Plus, FileText 
} from 'lucide-react';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function Pagos({ auth, pagos = [] }) {
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Mock data in case 'pagos' prop is empty
    const mockPagos = pagos.length > 0 ? pagos : [
        { id: 1, concepto: "Inscripción Semestre 2026-1", monto: 1500, fecha_vencimiento: "2026-01-15", estado: "pagado", fecha_pago: "2026-01-10", metodo: "Transferencia" },
        { id: 2, concepto: "Mensualidad Febrero", monto: 800, fecha_vencimiento: "2026-02-10", estado: "pagado", fecha_pago: "2026-02-08", metodo: "Tarjeta de Crédito" },
        { id: 3, concepto: "Mensualidad Marzo", monto: 800, fecha_vencimiento: "2026-03-10", estado: "pendiente", fecha_pago: null, metodo: null },
        { id: 4, concepto: "Examen de Certificación", monto: 1200, fecha_vencimiento: "2026-04-05", estado: "proximo", fecha_pago: null, metodo: null },
    ];

    const stats = {
        total_pagado: mockPagos.filter(p => p.estado === 'pagado').reduce((acc, curr) => acc + curr.monto, 0),
        pendiente: mockPagos.filter(p => p.estado === 'pendiente').reduce((acc, curr) => acc + curr.monto, 0),
        proximo: mockPagos.filter(p => p.estado === 'proximo').reduce((acc, curr) => acc + curr.monto, 0),
    };

    const getStatusStyle = (status) => {
        switch(status) {
            case 'pagado':
                return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'pendiente':
                return 'bg-rose-100 text-rose-800 border-rose-200';
            case 'proximo':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'pagado': return <CheckCircle className="w-4 h-4 mr-1.5" />;
            case 'pendiente': return <AlertCircle className="w-4 h-4 mr-1.5" />;
            case 'proximo': return <Clock className="w-4 h-4 mr-1.5" />;
            default: return null;
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
    };

    const handleOpenPayment = (pago) => {
        setSelectedPayment(pago);
        setIsPaymentModalOpen(true);
    };

    return (
        <AuthenticatedLayout
            user={auth?.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-bold text-2xl text-gray-800 leading-tight flex items-center gap-2">
                        <Wallet className="w-7 h-7 text-indigo-600" />
                        Mis Pagos
                    </h2>
                    <PrimaryButton className="bg-indigo-600 hover:bg-indigo-700 rounded-full px-6 shadow-md shadow-indigo-200 transition-all hover:-translate-y-0.5" onClick={() => handleOpenPayment(null)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Pago
                    </PrimaryButton>
                </div>
            }
        >
            <Head title="Mis Pagos" />

            <div className="py-8 min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">
                    
                    {/* STATS CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Total Pagado */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md hover:border-emerald-200 transition-all duration-300">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Total Pagado</p>
                                <h3 className="text-3xl font-bold text-gray-900">{formatCurrency(stats.total_pagado)}</h3>
                            </div>
                            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-100 transition-transform duration-300">
                                <CheckCircle className="w-7 h-7 text-emerald-600" />
                            </div>
                        </div>

                        {/* Saldo Pendiente */}
                        <div className="bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl p-6 shadow-lg shadow-rose-200/50 flex items-center justify-between text-white relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                            <div className="relative z-10">
                                <p className="text-rose-100 text-sm font-medium mb-1">Saldo Vencido</p>
                                <h3 className="text-3xl font-bold">{formatCurrency(stats.pendiente)}</h3>
                            </div>
                            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm shadow-inner flex items-center justify-center relative z-10 group-hover:rotate-12 transition-transform duration-300">
                                <AlertCircle className="w-7 h-7 text-white" />
                            </div>
                        </div>

                        {/* Próximo Pago */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md hover:border-blue-200 transition-all duration-300">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Próximo Pago</p>
                                <h3 className="text-3xl font-bold text-gray-900">{formatCurrency(stats.proximo)}</h3>
                            </div>
                            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-100 transition-transform duration-300">
                                <Clock className="w-7 h-7 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    {/* MAIN CONTENT AREA */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl border border-gray-100 group">
                        
                        {/* Toolbar */}
                        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
                            <div className="relative w-full sm:w-96">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Buscar concepto o ID de pago..."
                                    className="block w-full pl-10 pr-4 py-3 border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all shadow-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-3 w-full sm:w-auto">
                                <button className="flex items-center gap-2 px-5 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm w-full sm:w-auto justify-center">
                                    <Filter className="w-4 h-4 text-gray-500" />
                                    Filtrar
                                </button>
                                <button className="flex items-center gap-2 px-5 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm w-full sm:w-auto justify-center">
                                    <Download className="w-4 h-4 text-gray-500" />
                                    Exportar
                                </button>
                            </div>
                        </div>

                        {/* Lista de Pagos */}
                        <div className="divide-y divide-gray-100">
                            {mockPagos.length > 0 ? mockPagos.map((pago) => (
                                <div key={pago.id} className="p-6 hover:bg-indigo-50/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer group/row" onClick={() => handleOpenPayment(pago)}>
                                    <div className="flex items-center gap-5">
                                        <div className={`p-4 rounded-xl flex-shrink-0 shadow-sm border ${pago.estado === 'pagado' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover/row:scale-110' : 'bg-white text-indigo-600 border-indigo-100 group-hover/row:scale-110'} transition-transform duration-300`}>
                                            {pago.estado === 'pagado' ? <FileText className="w-6 h-6" /> : <CreditCard className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-gray-900 group-hover/row:text-indigo-600 transition-colors">{pago.concepto}</h4>
                                            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                                                <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                    Vence: <span className="font-medium text-gray-700">{pago.fecha_vencimiento}</span>
                                                </span>
                                                {pago.fecha_pago && (
                                                    <span className="flex items-center gap-1.5 bg-emerald-50/50 px-2 py-1 rounded-md border border-emerald-50">
                                                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                                        Pagado: <span className="font-medium text-emerald-700">{pago.fecha_pago}</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end gap-6 sm:pl-20 md:pl-0">
                                        <div className="text-right">
                                            <p className="text-xl font-extrabold text-gray-900">{formatCurrency(pago.monto)}</p>
                                            <div className="mt-1.5 flex justify-end">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wide ${getStatusStyle(pago.estado)}`}>
                                                    {getStatusIcon(pago.estado)}
                                                    {pago.estado}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 group-hover/row:text-indigo-600 group-hover/row:bg-indigo-100 transition-all">
                                            <ChevronRight className="w-5 h-5 group-hover/row:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="px-6 py-16 text-center flex flex-col items-center justify-center">
                                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-5 border border-gray-100 shadow-sm animate-[pulse_3s_ease-in-out_infinite]">
                                        <Wallet className="w-12 h-12 text-gray-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">No hay pagos registrados</h3>
                                    <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">Actualmente no tienes historial de pagos ni adeudos pendientes en el sistema. ¡Estás al día!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL DE DETALLE / PAGO */}
            <Modal show={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} maxWidth="md">
                <div className="p-0 bg-white shadow-xl overflow-hidden rounded-2xl">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            {selectedPayment?.estado === 'pagado' ? <FileText className="w-5 h-5 text-emerald-500"/> : <CreditCard className="w-5 h-5 text-indigo-500"/>}
                            {selectedPayment?.estado === 'pagado' ? 'Recibo de Pago' : 'Detalles de Pago'}
                        </h2>
                        {selectedPayment?.estado && (
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusStyle(selectedPayment.estado)}`}>
                                {getStatusIcon(selectedPayment.estado)}
                                {selectedPayment.estado}
                            </span>
                        )}
                    </div>

                    <div className="p-6 space-y-6">
                        {selectedPayment ? (
                            <>
                                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full blur-2xl -mr-10 -mt-10"></div>
                                    
                                    <div className="text-center mb-6 relative z-10">
                                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                            Total {selectedPayment.estado === 'pagado' ? 'Pagado' : 'a Pagar'}
                                        </p>
                                        <p className="text-5xl font-black text-gray-900 tracking-tight">{formatCurrency(selectedPayment.monto)}</p>
                                    </div>
                                    
                                    <div className="space-y-4 relative z-10 pt-4 border-t border-dashed border-gray-200">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500 font-medium">Concepto</span>
                                            <span className="font-bold text-gray-900 text-right max-w-[60%]">{selectedPayment.concepto}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500 font-medium">Vencimiento</span>
                                            <span className="font-bold text-gray-900">{selectedPayment.fecha_vencimiento}</span>
                                        </div>
                                        {selectedPayment.metodo && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500 font-medium">Método</span>
                                                <span className="font-bold text-gray-900">{selectedPayment.metodo}</span>
                                            </div>
                                        )}
                                        {selectedPayment.fecha_pago && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500 font-medium">Fecha de Pago</span>
                                                <span className="font-bold text-gray-900">{selectedPayment.fecha_pago}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {selectedPayment.estado !== 'pagado' && (
                                    <div className="space-y-3 pt-2">
                                        <label className="block text-sm font-bold text-gray-900">Método de Pago Preferido</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button className="border-2 border-indigo-600 bg-indigo-50 text-indigo-700 rounded-xl p-4 flex flex-col items-center justify-center gap-3 hover:bg-indigo-100 hover:shadow-md transition-all">
                                                <CreditCard className="w-8 h-8" />
                                                <span className="text-sm font-bold">Tarjeta</span>
                                            </button>
                                            <button className="border-2 border-gray-200 bg-white text-gray-600 rounded-xl p-4 flex flex-col items-center justify-center gap-3 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all">
                                                <Wallet className="w-8 h-8" />
                                                <span className="text-sm font-bold">Transferencia</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-10">
                                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-5">
                                    <Plus className="w-10 h-10 text-indigo-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Nuevo Pago Externo</h3>
                                <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
                                    Registra un pago realizado por transferencia bancaria o en ventanilla subiendo tu comprobante.
                                </p>
                            </div>
                        )}

                        <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                            <SecondaryButton className="font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border-gray-200" onClick={() => setIsPaymentModalOpen(false)}>
                                Cancelar
                            </SecondaryButton>
                            
                            {selectedPayment?.estado !== 'pagado' && (
                                <PrimaryButton className="bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 px-6 py-2">
                                    {selectedPayment ? 'Proceder al Pago' : 'Continuar'}
                                </PrimaryButton>
                            )}
                            
                            {selectedPayment?.estado === 'pagado' && (
                                <PrimaryButton className="bg-gray-900 hover:bg-black shadow-md shadow-gray-300 px-6 py-2">
                                    <Download className="w-4 h-4 mr-2" />
                                    Descargar Recibo HTTP
                                </PrimaryButton>
                            )}
                        </div>
                    </div>
                </div>
            </Modal>
            
        </AuthenticatedLayout>
    );
}
