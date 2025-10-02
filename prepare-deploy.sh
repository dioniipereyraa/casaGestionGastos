#!/bin/bash

echo "🚀 Preparando Casa Gastos para deployment..."

# Construir archivos minificados
echo "📦 Construyendo archivos optimizados..."
npm run build

# Crear directorio de uploads si no existe
echo "📁 Creando directorio de uploads..."
mkdir -p uploads/facturas

# Verificar archivos necesarios
echo "✅ Verificando archivos..."
files=("package.json" "app.js" "views/dashboard.ejs" "public/js/casa-gastos.min.js" "public/css/casa-gastos.min.css")

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ❌ $file - FALTANTE"
    fi
done

echo ""
echo "🎯 Tu aplicación está lista para deployment!"
echo ""
echo "🤖 IA Configurada: GPT-4o-mini (rápido y económico - 85% más barato)"
echo ""
echo "📋 Variables de entorno necesarias:"
echo "   NODE_ENV=production"
echo "   PORT=3000"
echo "   DB_HOST=<host-mysql>"
echo "   DB_PORT=3306"
echo "   DB_USER=<usuario>"
echo "   DB_PASSWORD=<contraseña>"
echo "   DB_NAME=casaGastos"
echo "   OPENAI_API_KEY=<tu-api-key>"
echo ""
echo "🌐 Opciones recomendadas para familias:"
echo "   1. Railway.app (GRATIS, fácil)"
echo "   2. Heroku (gratis limitado)"
echo "   3. Vercel + PlanetScale"
echo ""
echo "📖 Lee deploy.md para instrucciones detalladas!"