import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen bg-layout-bg bg-cover bg-center flex flex-col">
            {/* Header con logos institucionales */}
            <header className="bg-white shadow-md">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center gap-8">
                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3PfbPcIFmEwzHvTVvEyoqo1Pz5JFeq5T4xg&s" alt="ITL" className="h-20" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/1/17/Tecnologico_Nacional_de_Mexico.svg" alt="TECNM" className="h-20" />
                        <img src="https://siged.sep.gob.mx/SIGED/images/logos/logo_sep_c.png" alt="SEP" className="h-20" />
                    </div>
                </div>
            </header>
                            
            {/* Contenido principal */}
            <div className="flex flex-1 flex-col items-center justify-center pt-6 sm:pt-0">
                <div className="mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg">
                    {children}
                </div>
            </div>
        </div>
    );
}
