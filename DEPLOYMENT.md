# 📋 GUÍA DE DESPLIEGUE - SOCIALINK EN HOSTINGER

## 🔧 PREPARACIÓN PREVIA

### 1. En tu panel de Hostinger:
- Ve a **Bases de datos MySQL**
- Crea una nueva base de datos
- Anota: `nombre_bd`, `usuario`, `contraseña`

### 2. Configuración de dominio:
- Asegúrate que `diversininfinita.com` apunte a tu hosting
- SSL debe estar activado (HTTPS)

## 🚀 PASOS DE DESPLIEGUE

### OPCIÓN A: Subir via File Manager (Recomendado)

1. **Comprimir el proyecto:**
   ```bash
   # En tu PC, comprimir todo excepto:
   - node_modules/
   - .git/
   - storage/logs/*
   ```

2. **Subir archivos:**
   - Ve al File Manager de Hostinger
   - Sube el .zip a `/public_html/`
   - Extrae los archivos
   - Mueve todo el contenido de la carpeta del proyecto directamente a `/public_html/`

3. **Configurar .env:**
   - Renombra `.env.production` a `.env`
   - Edita `.env` con los datos de tu base de datos:
     ```
     DB_DATABASE=tu_nombre_bd_hostinger
     DB_USERNAME=tu_usuario_hostinger  
     DB_PASSWORD=tu_password_hostinger
     ```

4. **Configurar .htaccess:**
   - Renombra `.htaccess.production` a `.htaccess`

5. **Ejecutar comandos via Terminal SSH:**
   ```bash
   # Conectar por SSH y ejecutar:
   cd public_html
   chmod +x deploy.sh
   ./deploy.sh
   ```

### OPCIÓN B: Git (Si tienes acceso SSH)

1. **Clonar repositorio:**
   ```bash
   cd public_html
   git clone https://github.com/bytedeveloopers/redsocial.git .
   ```

2. **Ejecutar despliegue:**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

## 🎯 CONFIGURACIONES ESPECÍFICAS DE HOSTINGER

### PHP Version:
- Configura PHP 8.2 o superior en el panel

### Composer:
```bash
# Si no está instalado, instalar:
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer
```

### Node.js:
```bash
# Si no está disponible, usar en tu PC:
npm run build
# Luego subir la carpeta public/build/
```

## 🔍 VERIFICACIÓN

1. **Visita:** https://diversininfinita.com
2. **Verifica:**
   - Página de inicio carga
   - Registro/Login funciona
   - Subir posts funciona
   - CSS/JS cargan correctamente

## 🐛 SOLUCIÓN DE PROBLEMAS

### Error 500:
- Verificar permisos: `chmod -R 777 storage bootstrap/cache`
- Verificar .env tiene datos correctos
- Ver logs: `tail -f storage/logs/laravel.log`

### CSS/JS no cargan:
- Ejecutar: `php artisan storage:link`
- Verificar: `npm run build` ejecutado

### Base de datos:
- Verificar conexión en .env
- Ejecutar: `php artisan migrate:fresh`

## 📞 SOPORTE

Si algo no funciona:
1. Revisar logs de error en Hostinger
2. Verificar configuración .env
3. Revisar permisos de archivos