import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';

export default function useFlashAlert() {
    const { flash = {} } = usePage().props;
    
    const [flashModal, setFlashModal] = useState({ isOpen: false, type: 'info', title: '', message: '' });

    useEffect(() => {
        if (flash?.success) {
            setFlashModal({ isOpen: true, type: 'success', title: '¡Operación exitosa!', message: flash.success });
        } else if (flash?.error) {
            setFlashModal({ isOpen: true, type: 'error', title: '¡Ups! Algo salió mal', message: flash.error });
        }
    }, [flash]);

    const closeFlashModal = () => setFlashModal(prev => ({ ...prev, isOpen: false }));

    return { flashModal, closeFlashModal };
}