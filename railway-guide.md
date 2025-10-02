# 🚂 Guía Paso a Paso: Railway Deployment

## ✨ Railway es PERFECTO para familias porque:
- ✅ **GRATIS** hasta 500 horas/mes (suficiente para uso familiar)
- ✅ **Súper fácil** de configurar (5 minutos)
- ✅ **Base de datos MySQL incluida**
- ✅ **URL bonita** tipo: `tu-familia-gastos.up.railway.app`
- ✅ **HTTPS automático** (seguro)
- ✅ **Actualizaciones automáticas** desde GitHub

## 🚀 Pasos Detallados

### 1. Preparar GitHub
```bash
# En tu computadora
git add .
git commit -m "Preparar para deployment"
git push origin main
```

### 2. Configurar Railway
1. Ve a → [railway.app](https://railway.app)
2. Click "Login with GitHub"
3. Click "New Project"
4. Click "Deploy from GitHub repo"
5. Selecciona tu repositorio `casaGestionGastos`

### 3. Agregar Base de Datos
1. En tu proyecto Railway, click "+" 
2. Click "Database"
3. Click "Add MySQL"
4. ¡Listo! Railway configurará todo automáticamente

### 4. Configurar Variables de Entorno
1. Click en tu aplicación (no la base de datos)
2. Ve a "Variables"
3. Agrega estas variables:

```
NODE_ENV=production
OPENAI_API_KEY=tu_api_key_aqui
```

**¡Las variables de base de datos se configuran automáticamente!**

### 5. Deploy
1. Railway desplegará automáticamente
2. Click "View Logs" para ver el progreso
3. Cuando termine, click "View App"
4. ¡Tu familia ya puede usar la app!

## 🌐 URL Final
Tu familia accederá con algo como:
`https://casagastos-production.up.railway.app`

## 💡 Tips
- **Dominio personalizado**: En Railway puedes usar tu propio dominio
- **Backups**: Railway hace backups automáticos de la BD
- **Logs**: Puedes ver errores en tiempo real
- **Escalado**: Si crece tu familia, Railway escala automáticamente

## 🆘 Si algo falla
1. Revisa los logs en Railway
2. Verifica que todas las variables de entorno estén configuradas
3. Asegúrate que la base de datos esté conectada

¡En 5 minutos tu familia tendrá su propia app de gastos en internet! 🎉