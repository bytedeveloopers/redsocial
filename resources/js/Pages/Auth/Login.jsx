import InputError from '@/Components/InputError';
import ThemeToggle from '@/Components/ThemeToggle';
import Logo from '@/Components/Logo';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950 flex items-center justify-center p-4 transition-colors duration-300">
            <Head title="Iniciar Sesión" />
            
            {/* Theme Toggle */}
            <div className="absolute top-4 right-4 z-10">
                <ThemeToggle />
            </div>
            
            <div className="relative w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-6">
                        <Logo size="xl" showText={true} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Bienvenido de vuelta</h1>
                    <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Inicia sesión en tu cuenta</p>
                </div>
                
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20 dark:border-gray-700/30 transition-colors duration-300">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Correo electrónico</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                placeholder="tu@email.com"
                                autoComplete="username"
                                autoFocus
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            <InputError message={errors.email} className="text-red-500 text-sm" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Contraseña</label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                placeholder=""
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            <InputError message={errors.password} className="text-red-500 text-sm" />
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 dark:from-indigo-600 dark:to-purple-600 dark:hover:from-indigo-700 dark:hover:to-purple-700 text-white py-3 px-4 rounded-xl font-medium focus:ring-4 focus:ring-violet-500/25 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            {processing ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                        </button>

                        <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-600 transition-colors duration-300">
                            <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                                No tienes cuenta?{' '}
                                <Link
                                    href={route('register')}
                                    className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 font-medium transition-colors duration-300"
                                >
                                    Regístrate aquí
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
