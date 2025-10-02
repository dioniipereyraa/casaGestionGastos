# 🚀 Guía de Deployment - Casa Gastos

## Opciones para Subir tu Aplicación

### 1. 🆓 **Railway (RECOMENDADO - Gratis)**
Railway es perfecto para aplicaciones familiares.

**Pasos:**
1. Ve a [railway.app](https://railway.app)
2. Conéctate con GitHub
3. Haz fork de tu repositorio o súbelo a GitHub
4. En Railway: "Deploy from GitHub repo"
5. Agrega las variables de entorno (se configuran automáticamente)

**Ventajas:**
- ✅ Gratis hasta 500 horas/mes
- ✅ Base de datos MySQL incluida
- ✅ HTTPS automático
- ✅ Muy fácil de usar

### 2. 🔵 **Heroku (Gratis limitado)**
**Pasos:**
1. Instala Heroku CLI
2. `heroku create tu-app-gastos`
3. `heroku addons:create cleardb:ignite` (MySQL)
4. `git push heroku main`

### 3. 🟢 **Vercel + PlanetScale**
**Para aplicaciones más avanzadas:**
- Vercel para el frontend
- PlanetScale para la base de datos (gratis)

### 4. 🔴 **VPS Propio (DigitalOcean, Linode)**
**Para máximo control:**
- $5-10/mes
- Control total
- Requiere más configuración

## 📋 Preparación para Deployment

### Variables de Entorno Necesarias:
```
NODE_ENV=production
PORT=3000
DB_HOST=<host-de-base-de-datos>
DB_PORT=3306
DB_USER=<usuario>
DB_PASSWORD=<contraseña>
DB_NAME=casaGastos
OPENAI_API_KEY=<tu-api-key>
```

### Archivos Necesarios:
- ✅ package.json (listo)
- ✅ Dockerfile (lo crearemos)
- ✅ .dockerignore (lo crearemos)
- ✅ Scripts de producción (listos)

## 🎯 Recomendación para Familias

**Railway** es la mejor opción porque:
1. **Gratis** para uso familiar
2. **Fácil de configurar** (5 minutos)
3. **Base de datos incluida**
4. **URL personalizable**
5. **Actualizaciones automáticas** desde GitHub

¿Quieres que te ayude a configurar Railway paso a paso?