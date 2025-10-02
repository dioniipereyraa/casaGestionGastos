# 🤖 Configuración del AI Scanner - Casa Gastos

## ¿Por qué dice "error procesando imagen"?

El AI Scanner necesita una **API key de OpenAI** para funcionar. Sin ella, el sistema usa un modo simulado, pero si hay algún error en el proceso, puede mostrar ese mensaje.

## 🔧 Configuración de OpenAI API

### Paso 1: Obtener tu API Key de OpenAI

1. Ve a [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Inicia sesión o crea una cuenta
3. Crea una nueva API key
4. **COPIA la key inmediatamente** (no la podrás ver después)

### Paso 2: Configurar la API Key

1. Abre el archivo `.env` en la carpeta del proyecto
2. Reemplaza `tu_api_key_aqui` con tu API key real:

```bash
# Configuración de OpenAI
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Paso 3: Reiniciar el servidor

```bash
# Detener el servidor actual (Ctrl+C)
# Luego reiniciar:
cd /home/dionipereyra/appCasaGastos
node app.js
```

## 💰 Costos de OpenAI

- **GPT-4 Vision**: ~$0.01 por imagen procesada
- **Uso moderado**: $5-10/mes para uso doméstico típico
- **Control de gastos**: Puedes establecer límites en tu cuenta de OpenAI

## 🔄 Modo Fallback (Sin API Key)

Si no configuras la API key, el sistema funciona en **modo simulado**:
- ✅ Genera datos de prueba realistas
- ✅ Permite probar la funcionalidad
- ❌ No analiza realmente las imágenes
- ❌ Los datos son aleatorios

## 🎯 Cómo funciona con API Key configurada

1. **Subes una factura/recibo** (JPG, PNG, PDF)
2. **OpenAI Vision analiza** la imagen automáticamente
3. **Extrae datos reales**:
   - Monto exacto
   - Fecha de la factura
   - Descripción del producto/servicio
   - Nombre del comercio
   - Categoría sugerida
4. **Confirmas y guarda** el gasto automáticamente

## 🚨 Solución de Problemas

### Error: "API key no configurada"
- Verifica que hayas puesto tu API key real en el archivo `.env`
- Asegúrate de que no tenga espacios extra al inicio o final

### Error: "Invalid API key"
- Verifica que la API key sea correcta
- Asegúrate de que tu cuenta de OpenAI tenga créditos disponibles

### Error: "Error procesando imagen"
- Verifica el formato del archivo (solo JPG, PNG, PDF)
- Asegúrate de que el archivo no sea muy grande (máx. 5MB)

## 📧 Soporte

Si tienes problemas:
1. Revisa el archivo `.env`
2. Verifica los logs del servidor en la terminal
3. Prueba con una imagen más pequeña y clara

---

**¡Con la API configurada, podrás procesar facturas reales automáticamente!** 🎉