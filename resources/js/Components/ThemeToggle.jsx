import useTheme from '@/Hooks/useTheme';

export default function ThemeToggle({ className = '' }) {
    const { theme, toggleTheme, isDark, mounted } = useTheme();

    // Mostrar placeholder mientras se monta
    if (!mounted) {
        return (
            <div className={`w-12 h-6 bg-gray-300 rounded-full p-1 ${className}`}>
                <div className="w-4 h-4 bg-white rounded-full shadow-md"></div>
            </div>
        );
    }

    return (
        <button
            onClick={toggleTheme}
            className={`
                relative inline-flex items-center w-12 h-6 rounded-full transition-all duration-300 
                focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2
                ${isDark ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-gradient-to-r from-orange-400 to-yellow-400'}
                ${className}
            `}
            aria-label={`Cambiar a modo ${isDark ? 'claro' : 'oscuro'}`}
            title={`Cambiar a modo ${isDark ? 'claro' : 'oscuro'}`}
        >
            {/* Toggle circle */}
            <div
                className={`
                    absolute w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 ease-in-out
                    flex items-center justify-center
                    ${isDark ? 'translate-x-6' : 'translate-x-0.5'}
                `}
            >
                {/* Icon */}
                <div className="w-3 h-3 flex items-center justify-center">
                    {isDark ? (
                        // Moon icon
                        <svg 
                            className="w-3 h-3 text-indigo-600" 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                        >
                            <path 
                                fillRule="evenodd" 
                                d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" 
                                clipRule="evenodd" 
                            />
                        </svg>
                    ) : (
                        // Sun icon
                        <svg 
                            className="w-3 h-3 text-orange-500" 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                        >
                            <path 
                                fillRule="evenodd" 
                                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" 
                                clipRule="evenodd" 
                            />
                        </svg>
                    )}
                </div>
            </div>
        </button>
    );
}