import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    darkMode: 'class', // Habilitar modo oscuro basado en clases

    safelist: [
        'animate-fade-in',
        'animate-slide-up', 
        'animate-scale-in',
        'animate-bounce-gentle',
        'animate-float',
        'hover-lift',
        'glass-card',
        'glass-card-strong',
        'gradient-text'
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
        },
    },

    plugins: [forms],
};
