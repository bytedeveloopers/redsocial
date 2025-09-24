import { useState, useEffect } from 'react';
import useTheme from '@/Hooks/useTheme';

export default function Logo({ className = '', showText = true, size = 'md' }) {
    const { isDark, mounted } = useTheme();
    const [imageError, setImageError] = useState(false);

    // Reset error state cuando cambie el tema
    useEffect(() => {
        setImageError(false);
    }, [isDark]);

    // Tamaños predefinidos
    const sizes = {
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16'
    };

    // Mientras no esté montado, mostrar placeholder
    if (!mounted) {
        return (
            <div className={`flex items-center gap-3 ${className}`}>
                <div className={`${sizes[size]} bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl animate-pulse shadow-lg`} />
                {showText && (
                    <span className="font-bold text-xl bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent animate-pulse">
                        SociaLink
                    </span>
                )}
            </div>
        );
    }

    // Si hay error de imagen o no están disponibles, mostrar fallback
    if (imageError) {
        return (
            <div className={`flex items-center gap-3 ${className}`}>
                <div className={`${sizes[size]} bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center`}>
                    <span className="text-white font-bold text-lg">S</span>
                </div>
                {showText && (
                    <span className="font-bold text-xl bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent transition-colors duration-300">
                        SociaLink
                    </span>
                )}
            </div>
        );
    }

    const logoSrc = isDark ? '/images/logo-light.jpg' : '/images/logo-dark.jpg';

    return (
        <div className={`flex items-center gap-3 ${className} animate-fadeIn`}>
            <img 
                src={logoSrc}
                alt="SociaLink Logo"
                className={`${sizes[size]} object-contain transition-all duration-300 hover:scale-105 shadow-lg rounded-xl`}
                onError={() => setImageError(true)}
                onLoad={() => setImageError(false)}
            />
            {showText && (
                <span className="font-bold text-xl bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent transition-all duration-300 hover:from-purple-600 hover:to-pink-600 dark:hover:from-purple-400 dark:hover:to-pink-400">
                    SociaLink
                </span>
            )}
        </div>
    );
}