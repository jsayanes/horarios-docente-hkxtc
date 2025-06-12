#!/bin/bash
# 🤖 SCRIPT SÚPER AUTOMÁTICO

echo "🤖 DEPLOY AUTOMÁTICO INICIADO..."

# Cambiar al directorio del proyecto
cd "C:\Cursos\Horarios Python\horarios-docente"

echo "📍 Directorio actual: $(pwd)"

echo "🔄 Verificando estado de Git..."
git status

echo "📦 Archivos listos para deploy:"
ls -la

echo "🎯 PRÓXIMOS PASOS MANUALES:"
echo "1. Ve a https://github.com/new"
echo "2. Crea repositorio: horarios-docente-hkxtc"
echo "3. Ejecuta estos comandos:"
echo ""
echo "git remote add origin https://github.com/TU_USUARIO/horarios-docente-hkxtc.git"
echo "git push -u origin main"
echo ""
echo "4. Ve a https://vercel.com"
echo "5. Import Project → Selecciona tu repo"
echo "6. ¡Deploy automático!"
echo ""
echo "🌐 Tu app estará en: https://horarios-docente-hkxtc.vercel.app"
