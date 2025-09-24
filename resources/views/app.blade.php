<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <meta name="description" content="SociaLink - Conecta, comparte y descubre. La red social moderna para conectar con personas de todo el mundo.">
        <meta name="keywords" content="red social, social media, compartir, conectar, posts, mensajes, chat">
        <meta name="author" content="SociaLink">

        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="website">
        <meta property="og:title" content="SociaLink - Tu Red Social Moderna">
        <meta property="og:description" content="Conecta, comparte y descubre. La red social moderna para conectar con personas de todo el mundo.">
        <meta property="og:image" content="{{ asset('images/logo-dark.jpg') }}">

        <!-- Twitter -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="SociaLink - Tu Red Social Moderna">
        <meta name="twitter:description" content="Conecta, comparte y descubre. La red social moderna para conectar con personas de todo el mundo.">
        <meta name="twitter:image" content="{{ asset('images/logo-dark.jpg') }}">

        <title inertia>SociaLink</title>

        <!-- Meta tags for mobile -->
        <meta name="theme-color" content="#4f46e5">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="default">
        <meta name="apple-mobile-web-app-title" content="{{ config('app.name') }}">
        <meta name="mobile-web-app-capable" content="yes">
        
        <!-- Performance hints -->
        <link rel="dns-prefetch" href="//fonts.bunny.net">
        <link rel="preconnect" href="https://fonts.bunny.net" crossorigin>

        <!-- Fonts -->
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- PWA Icons -->
        <link rel="icon" type="image/jpeg" href="/images/logo-dark.jpg">
        <link rel="apple-touch-icon" href="/images/logo-dark.jpg">
        <link rel="shortcut icon" href="/images/logo-dark.jpg">

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased overscroll-behavior-none">
        @inertia
    </body>
</html>
