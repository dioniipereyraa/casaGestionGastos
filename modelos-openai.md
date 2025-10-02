# 🤖 Guía de Modelos OpenAI

## 🎯 **Cómo Cambiar el Modelo**

### 📝 **Método 1: Variable de Entorno (RECOMENDADO)**
En tu archivo `.env`, agrega o cambia:
```
OPENAI_MODEL=gpt-4o-mini
```

### 🔧 **Método 2: Editar Código**
En `app.js`, línea ~110, cambia:
```javascript
model: "gpt-4o-mini",
```

## 📊 **Comparación de Modelos**

| Modelo | Costo | Velocidad | Capacidad Visual | Recomendado Para |
|--------|-------|-----------|------------------|------------------|
| **gpt-4o-mini** ⭐ | 💰 Muy barato | ⚡ Muy rápido | ✅ Excelente | **Uso familiar** |
| gpt-4o | 💰💰💰💰💰 Caro | ⚡ Rápido | ✅ Superior | Uso profesional |
| gpt-4-turbo | 💰💰💰 Medio | ⚡ Medio | ✅ Buena | Balanceado |
| gpt-3.5-turbo | 💰 Barato | ⚡⚡ Muy rápido | ❌ Sin visión | Solo texto |

## 💡 **Recomendaciones**

### 👨‍👩‍👧‍👦 **Para Familias:**
```
OPENAI_MODEL=gpt-4o-mini
```
✅ Perfecto para facturas domésticas
✅ 85% más barato
✅ Súper rápido

### 🏢 **Para Empresas:**
```
OPENAI_MODEL=gpt-4o
```
✅ Máxima precisión
✅ Mejor para documentos complejos

### 🧪 **Para Pruebas:**
```
OPENAI_MODEL=gpt-3.5-turbo
```
✅ Muy barato para testing
❌ No analiza imágenes

## 🔄 **Cambiar en Producción**

### Railway/Heroku:
1. Ve a Variables de entorno
2. Agrega: `OPENAI_MODEL=gpt-4o-mini`
3. Redeploy automático

### Docker:
```bash
docker run -e OPENAI_MODEL=gpt-4o-mini tu-app
```

## 🧪 **Probar Cambios**

```bash
npm run test-openai
```

Verás qué modelo está usando y si funciona correctamente.

## 💰 **Estimación de Costos Familiares**

Con **gpt-4o-mini** y uso familiar típico:
- ~100 facturas/mes = ~$0.50 USD
- ~500 facturas/mes = ~$2.50 USD

¡Súper económico para familias! 🎉