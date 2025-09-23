import { useState, useEffect } from 'react';

export default function useTheme() {
    // Estado para controlar si el componente está montado en el cliente
    const [mounted, setMounted] = useState(false);
    
    // Detectar preferencia inicial del sistema o localStorage
    const getInitialTheme = () => {
        // Solo acceder a localStorage en el cliente
        if (typeof window === 'undefined') return 'light';
        
        // Comprobar localStorage primero
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme;
        }
        
        // Si no hay preferencia guardada, usar la del sistema
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        
        return 'light';
    };

    const [theme, setTheme] = useState('light'); // Iniciar siempre en light para SSR

    // Configurar el tema real después del montaje en el cliente
    useEffect(() => {
        setMounted(true);
        setTheme(getInitialTheme());
    }, []);

    // Aplicar el tema al DOM
    useEffect(() => {
        if (!mounted) return;
        
        const root = document.documentElement;
        
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        
        // Guardar preferencia en localStorage
        localStorage.setItem('theme', theme);
    }, [theme, mounted]);

    // Escuchar cambios en la preferencia del sistema
    useEffect(() => {
        if (!mounted) return;
        
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const handleChange = (e) => {
            // Solo cambiar automáticamente si no hay preferencia guardada
            if (!localStorage.getItem('theme')) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        };
        
        mediaQuery.addEventListener('change', handleChange);
        
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [mounted]);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    };

    const setLightTheme = () => setTheme('light');
    const setDarkTheme = () => setTheme('dark');

    return {
        theme,
        toggleTheme,
        setLightTheme,
        setDarkTheme,
        isDark: theme === 'dark',
        isLight: theme === 'light',
        mounted // Exponer el estado de montaje
    };
}