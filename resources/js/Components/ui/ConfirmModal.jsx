import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirmar acción',
    message = '¿Estás seguro de que deseas continuar?',
    confirmText = 'Confirmar',
    confirmColor,
    variant = 'danger'
}) {
    const variantStyles = {
        danger: {
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            confirmButton: 'bg-red-600 hover:bg-red-700',
        },
        warning: {
            iconBg: 'bg-orangeTec/20',
            iconColor: 'text-orangeTec',
            confirmButton: 'bg-orangeTec hover:bg-orangeTec/90',
        },
        institutional: {
            iconBg: 'bg-blueTec/15',
            iconColor: 'text-blueTec',
            confirmButton: 'bg-blueTec hover:bg-blueTec/90',
        },
    };

    const style = variantStyles[variant] ?? variantStyles.danger;
    const confirmButtonClass = confirmColor ? `${confirmColor} hover:brightness-110` : style.confirmButton;

    return (
        <Transition appear show={!!isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 leading-6 text-left align-middle shadow-2xl transition-all border border-gray-100">
                                <div className="flex flex-col items-center">
                                    <div className={`flex rounded-full p-3 items-center justify-center mb-4 ${style.iconBg}`}>
                                        <AlertTriangle className={`h-8 w-8 ${style.iconColor}`} aria-hidden="true" />
                                    </div>
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-bold leading-6 text-gray-900 mb-2"
                                    >
                                        {title}
                                    </Dialog.Title>
                                    <div className="mt-1 text-center">
                                        <p className="text-sm text-gray-500">
                                            {message}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3 sm:justify-center">
                                    <button
                                        type="button"
                                        className="inline-flex justify-center w-full sm:w-auto rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
                                        onClick={onClose}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        className={`inline-flex justify-center w-full sm:w-auto rounded-xl border border-transparent px-4 py-2 text-sm font-semibold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${confirmButtonClass}`}
                                        onClick={onConfirm}
                                    >
                                        {confirmText}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
