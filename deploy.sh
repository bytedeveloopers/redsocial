#!/bin/bash

echo "🚀 SCRIPT DE DESPLIEGUE - SOCIALINK"
echo "=================================="

# 1. Configurar permisos
echo "📁 Configurando permisos..."
chmod -R 755 /storage
chmod -R 755 /bootstrap/cache
chmod -R 777 storage/
chmod -R 777 bootstrap/cache/

# 2. Instalar dependencias de Composer
echo "📦 Instalando dependencias de Composer..."
composer install --no-dev --optimize-autoloader

# 3. Generar key de aplicación
echo "🔐 Generando APP_KEY..."
php artisan key:generate --force

# 4. Ejecutar migraciones
echo "🗃️ Ejecutando migraciones..."
php artisan migrate --force

# 5. Limpiar y cachear configuraciones
echo "🧹 Limpiando y cacheando configuraciones..."
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

php artisan config:cache
php artisan route:cache
php artisan view:cache

# 6. Crear enlace simbólico para storage
echo "🔗 Creando enlace simbólico para storage..."
php artisan storage:link

# 7. Compilar assets para producción
echo "⚡ Compilando assets..."
npm ci
npm run build

# 8. Optimizar aplicación para producción
echo "🔧 Optimizando para producción..."
composer dump-autoload --optimize

echo "✅ ¡DESPLIEGUE COMPLETADO!"
echo "🌐 Tu aplicación está lista en: https://diversininfinita.com"