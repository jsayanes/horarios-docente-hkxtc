# 🚀 INSTRUCCIONES PARA SUBIR A VERCEL

## Paso 1: Subir a GitHub
1. Ve a https://github.com y crea un nuevo repositorio
2. Nombra tu repositorio (ej: "horarios-docente")
3. Ejecuta estos comandos en tu terminal:

```bash
cd horarios-docente
git init
git add .
git commit -m "Primera versión de horarios"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/horarios-docente.git
git push -u origin main
```

## Paso 2: Conectar con Vercel
1. Ve a https://vercel.com
2. Registrate con tu cuenta de GitHub
3. Click en "Import Project"
4. Selecciona tu repositorio "horarios-docente"
5. ¡Vercel detectará automáticamente la configuración!

## Paso 3: Deploy automático
- Vercel construirá y desplegará tu aplicación automáticamente
- Te dará una URL como: https://horarios-docente.vercel.app
- Cada vez que hagas cambios en GitHub, se actualizará automáticamente

## 🎯 URL de tu aplicación:
Tu aplicación estará disponible en una URL como:
https://tu-proyecto.vercel.app

## ✅ Características que tendrás:
- ✅ Frontend Angular funcionando
- ✅ Backend Node.js funcionando  
- ✅ Sincronización entre navegadores
- ✅ HTTPS automático
- ✅ Dominio personalizado (opcional)
- ✅ Deploy automático desde GitHub

## 🔧 Si tienes problemas:
1. Revisa los logs en el dashboard de Vercel
2. Asegúrate de que todos los archivos estén en GitHub
3. Verifica que vercel.json esté en la raíz del proyecto
