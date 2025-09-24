import Logo from '@/Components/Logo';
import { Link } from '@inertiajs/react';
import ThemeToggle from '@/Components/ThemeToggle';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 transition-colors duration-300">
            {/* Navegación superior */}
            <nav className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/30 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center">
                            <Link href="/" className="flex items-center">
                                <Logo size="md" showText={true} />
                            </Link>
                        </div>

                        {/* Navegación y toggle tema */}
                        <div className="flex items-center gap-4">
                            <ThemeToggle />
                            <Link
                                href="/login"
                                className="text-gray-700 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 px-3 py-2 rounded-lg font-medium transition-colors duration-300"
                            >
                                Iniciar Sesión
                            </Link>
                            <Link
                                href="/register"
                                className="bg-gradient-to-r from-violet-600 to-purple-700 text-white px-4 py-2 rounded-lg font-medium hover:from-violet-700 hover:to-purple-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
                            >
                                Registrarse
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Contenido principal */}
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}
