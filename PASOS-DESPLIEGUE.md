# Instrucciones rápidas para despliegue

## 📋 LO QUE VAS A HACER AHORA:

### 1. Descargar desde GitHub:
- Ve a: https://github.com/bytedeveloopers/redsocial
- Click en "Code" > "Download ZIP"
- Descarga el archivo

### 2. En Hostinger File Manager:
- Ve a tu panel de Hostinger
- Abre "File Manager"
- Ve a `/public_html/`
- Sube el archivo ZIP
- Extrae todos los archivos

### 3. Configurar archivos:
```bash
# Renombrar archivos:
.env.production → .env
.htaccess.production → .htaccess
```

### 4. Configurar permisos:
```bash
# Ejecutar en Terminal SSH de Hostinger:
chmod -R 777 storage/
chmod -R 777 bootstrap/cache/
chmod +x deploy.sh
```

### 5. Ejecutar despliegue:
```bash
# En Terminal SSH:
./deploy.sh
```

## 🎯 RESULTADO ESPERADO:
✅ https://diversininfinita.com funcionando
✅ Registro/Login operativo  
✅ Posts, likes, comentarios funcionando
✅ Chat en tiempo real
✅ Velocidad 5x más rápida que desarrollo

## 🚨 Si algo falla:
1. Verificar .env tiene los datos correctos
2. Revisar permisos de carpetas
3. Ver logs: `tail -f storage/logs/laravel.log`