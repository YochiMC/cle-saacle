import { useState } from 'react';
import Sidebar from '@/components/Menus/Sidebar';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function SessionLayout({ children, header }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const menuLinks = [
        {
            title: 'Panel de Control',
            url: route('dashboard'),
            active: route().current('dashboard')
        },
        {
            title: 'Perfil',
            url: route('profile.edit'),
            active: route().current('profile.edit')
        },
    ];

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Sidebar */}
            <Sidebar links={menuLinks} isOpen={sidebarOpen} onToggle={setSidebarOpen} />

            {/* Contenido Principal */}
            <div className="flex-1 flex flex-col md:ml-64">
                {/* Header (opcional) */}
                {header && (
                    <header className="bg-white shadow relative z-20">
                        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex items-center justify-between md:justify-start">
                            {/* Toggle button (solo móviles) */}
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="md:hidden p-2 -ml-2 text-blueTec hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                                    />
                                </svg>
                            </button>
                            <div>
                                {header}
                            </div>
                        </div>
                    </header>
                )}

                {/* Main Content */}
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}