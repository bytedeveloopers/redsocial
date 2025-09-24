import Logo from '@/Components/Logo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import ThemeToggle from '@/Components/ThemeToggle';
import { Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import { useNotifications } from '@/Hooks/useNotifications';
import { useChat } from '@/Hooks/useChat';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const { unreadCount } = useNotifications();
    const { unreadChatCount } = useChat();

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.get('/search/users', { q: searchQuery });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:from-slate-900 dark:via-gray-900 dark:to-indigo-950/30 transition-colors duration-300">
            {/* Navigation */}
            <nav className="border-b border-white/20 dark:border-gray-700/30 bg-white/70 dark:bg-gray-900/70 sticky top-0 z-40 backdrop-blur-xl shadow-lg shadow-violet-500/5 dark:shadow-indigo-500/10 transition-colors duration-300">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/">
                                    <Logo size="md" showText={true} />
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink
                                    href="/"
                                    active={route().current('feed.index')}
                                >
                                    Inicio
                                </NavLink>
                                <NavLink
                                    href="/search/users"
                                    active={route().current('search.users')}
                                >
                                    Buscar
                                </NavLink>
                                <NavLink
                                    href="/chat"
                                    active={route().current('chat.*')}
                                    className="relative"
                                >
                                    Mensajes
                                    {unreadChatCount > 0 && (
                                        <span className="absolute -top-1 -right-1 z-50 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-green-500 border-2 border-white rounded-full min-w-[1.5rem] h-6 shadow-lg animate-pulse">
                                            {unreadChatCount > 99 ? '99+' : unreadChatCount}
                                        </span>
                                    )}
                                </NavLink>
                                <NavLink
                                    href="/notifications"
                                    active={route().current('notifications.index')}
                                    className="relative"
                                >
                                    Notificaciones
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 z-50 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 border-2 border-white rounded-full min-w-[1.5rem] h-6 shadow-lg animate-pulse">
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </span>
                                    )}
                                </NavLink>
                            </div>
                        </div>

                        {/* Barra de búsqueda central - Solo en desktop */}
                        <div className="hidden lg:flex flex-1 max-w-lg mx-8">
                            <form onSubmit={handleSearch} className="w-full">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Buscar usuarios..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full rounded-full border border-violet-200 bg-white/50 backdrop-blur-sm px-4 py-2 pl-10 text-sm focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-300/30 transition-all duration-200"
                                    />
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <svg className="h-4 w-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center sm:space-x-4">
                            {/* Theme Toggle */}
                            <ThemeToggle className="mr-2" />
                            
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-xl border border-transparent bg-white/50 backdrop-blur-sm px-4 py-2 text-sm font-medium leading-4 text-gray-700 transition-all duration-200 ease-in-out hover:text-violet-600 hover:bg-white/80 focus:outline-none shadow-sm hover:shadow-md"
                                            >
                                                {user.name}

                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link href="/">
                                            Inicio
                                        </Dropdown.Link>
                                        <Dropdown.Link href={`/user/${user.id}`}>
                                            Mi Perfil
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('profile.edit')}
                                        >
                                            Configuración
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                        >
                                            Cerrar Sesión
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >
                    {/* Barra de búsqueda móvil */}
                    <div className="border-b border-gray-200 px-4 py-3">
                        <form onSubmit={handleSearch}>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Buscar usuarios..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full rounded-full border border-gray-300 bg-gray-50 px-4 py-2 pl-10 text-sm focus:border-indigo-500 focus:bg-white focus:ring-indigo-500"
                                />
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href="/"
                            active={route().current('feed.index')}
                        >
                            Inicio
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href="/search/users"
                            active={route().current('search.users')}
                        >
                            Buscar
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href="/chat"
                            active={route().current('chat.*')}
                            className="relative"
                        >
                            <div className="flex items-center justify-between">
                                <span>Mensajes</span>
                                {unreadChatCount > 0 && (
                                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-green-500 border border-white rounded-full min-w-[1.5rem] h-6 shadow-md animate-pulse">
                                        {unreadChatCount > 99 ? '99+' : unreadChatCount}
                                    </span>
                                )}
                            </div>
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href="/notifications"
                            active={route().current('notifications.index')}
                            className="relative"
                        >
                            <div className="flex items-center justify-between">
                                <span>Notificaciones</span>
                                {unreadCount > 0 && (
                                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 border border-white rounded-full min-w-[1.5rem] h-6 shadow-md animate-pulse">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </div>
                        </ResponsiveNavLink>
                    </div>

                    <div className="border-t border-gray-200 pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-gray-800">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-gray-500">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href="/">
                                Inicio
                            </ResponsiveNavLink>
                            <ResponsiveNavLink href={`/user/${user.id}`}>
                                Mi Perfil
                            </ResponsiveNavLink>
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Configuración
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Cerrar Sesión
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main className="pb-16 sm:pb-0">{children}</main>

            {/* Bottom Navigation - Solo móvil */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-violet-200/50 sm:hidden shadow-lg shadow-violet-500/10">
                <div className="grid grid-cols-4 h-16">
                    <Link
                        href="/"
                        className={`flex flex-col items-center justify-center space-y-1 transition-all duration-200 ${
                            route().current('feed.index') 
                                ? 'text-violet-600 bg-gradient-to-t from-violet-100/80 to-transparent' 
                                : 'text-gray-600 hover:text-violet-600 hover:bg-violet-50/50 active:bg-violet-100/50'
                        }`}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span className="text-xs font-medium">Inicio</span>
                    </Link>

                    <Link
                        href="/search/users"
                        className={`flex flex-col items-center justify-center space-y-1 transition-all duration-200 ${
                            route().current('search.users') 
                                ? 'text-violet-600 bg-gradient-to-t from-violet-100/80 to-transparent' 
                                : 'text-gray-600 hover:text-violet-600 hover:bg-violet-50/50 active:bg-violet-100/50'
                        }`}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span className="text-xs font-medium">Buscar</span>
                    </Link>

                    <Link
                        href="/chat"
                        className={`flex flex-col items-center justify-center space-y-1 transition-all duration-200 relative ${
                            route().current('chat.*') 
                                ? 'text-emerald-600 bg-gradient-to-t from-emerald-100/80 to-transparent' 
                                : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50/50 active:bg-emerald-100/50'
                        }`}
                    >
                        <div className="relative">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            {unreadChatCount > 0 && (
                                <span className="absolute -top-2 -right-2 z-10 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full min-w-[1.2rem] h-5 shadow-lg animate-pulse">
                                    {unreadChatCount > 9 ? '9+' : unreadChatCount}
                                </span>
                            )}
                        </div>
                        <span className="text-xs font-medium">Chat</span>
                    </Link>

                    <Link
                        href="/notifications"
                        className={`flex flex-col items-center justify-center space-y-1 transition-all duration-200 relative ${
                            route().current('notifications.index') 
                                ? 'text-pink-600 bg-gradient-to-t from-pink-100/80 to-transparent' 
                                : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50/50 active:bg-pink-100/50'
                        }`}
                    >
                        <div className="relative">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            {unreadCount > 0 && (
                                <span className="absolute -top-2 -right-2 z-10 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-gradient-to-r from-pink-500 to-red-500 rounded-full min-w-[1.2rem] h-5 animate-pulse shadow-lg">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </div>
                        <span className="text-xs font-medium">Alertas</span>
                    </Link>
                </div>
            </nav>
        </div>
    );
}
