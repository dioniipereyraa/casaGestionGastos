# 🤖 Integración con OpenAI para Procesamiento de Facturas

## 📋 Estado Actual

La aplicación **Casa Gastos** ahora incluye:

✅ **Interfaz completa** para subir facturas/recibos  
✅ **Backend preparado** para procesamiento con AI  
✅ **Simulador de AI** funcionando (datos ficticios)  
✅ **Flujo completo** de confirmación y edición  

## 🔧 Para Conectar con OpenAI Real

### 1. **Obtener API Key de OpenAI**
```bash
# Regístrate en https://platform.openai.com
# Genera una API Key en tu dashboard
# Guarda la key de forma segura
```

### 2. **Configurar Variables de Entorno**
```bash
# Crear archivo .env en la raíz del proyecto
echo "OPENAI_API_KEY=tu_api_key_aqui" > .env
```

### 3. **Reemplazar la Función Simulada**

En `app.js`, reemplaza la función `procesarFacturaConAI` con:

```javascript
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function procesarFacturaConAI(imagePath) {
  try {
    // Leer imagen como base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analiza esta factura/recibo y extrae la siguiente información en formato JSON:
              {
                "monto": [número sin símbolos],
                "descripcion": [descripción del producto/servicio],
                "fecha": [fecha en formato YYYY-MM-DD],
                "categoria_sugerida": [número del 1-16 según estas categorías:
                  1-Alimentación, 2-Servicios, 3-Transporte, 4-Hogar, 5-Salud, 
                  6-Entretenimiento, 7-Educación, 8-Ropa, 9-Mascotas, 10-Otros,
                  11-Salario Principal, 12-Salario Secundario, 13-Freelance, 
                  14-Ventas, 15-Inversiones, 16-Otros Ingresos],
                "confianza": [0.0 a 1.0]
              }
              
              Si es un comprobante de ingreso, usar categorías 11-16.
              Si es un gasto, usar categorías 1-10.`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 500
    });

    const contenido = response.choices[0].message.content;
    const datos = JSON.parse(contenido);

    return {
      success: true,
      datos: datos,
      mensaje: 'Factura procesada con GPT-4 Vision'
    };

  } catch (error) {
    console.error('Error con OpenAI:', error);
    return {
      success: false,
      error: 'Error procesando con OpenAI: ' + error.message,
      datos: null
    };
  }
}
```

### 4. **Actualizar docker-compose.yml**
```yaml
webapp:
  build: .
  environment:
    - OPENAI_API_KEY=${OPENAI_API_KEY}
    # ... otras variables
```

## 🎯 Funcionalidades Implementadas

### 📸 **Upload de Facturas**
- **Botón AI**: En gastos e ingresos
- **Validación**: Solo imágenes, máximo 10MB
- **Optimización**: Redimensiona automáticamente para AI

### 🤖 **Procesamiento Inteligente**
- **Extracción automática**: Monto, fecha, descripción
- **Categorización**: Sugiere categoría apropiada
- **Confianza**: Indica certeza del análisis

### ✅ **Confirmación Flexible**
- **Guardar directo**: Si confías en el AI
- **Editar primero**: Corregir datos antes de guardar
- **Vista previa**: Imagen y datos extraídos

## 🔄 Flujo de Usuario

### Para Gastos:
1. **Click "Subir Factura con AI"**
2. **Seleccionar imagen** del recibo/factura
3. **Esperar procesamiento** (2-5 segundos)
4. **Revisar datos extraídos**:
   - Monto: $15.750
   - Descripción: "Compra supermercado"
   - Categoría: Alimentación
5. **Confirmar** o **Editar** antes de guardar

### Para Ingresos:
1. **Click "Subir Comprobante con AI"**
2. **Imagen de recibo de sueldo/factura**
3. **AI extrae datos automáticamente**
4. **Confirmación** y guardado

## 💰 Costos de OpenAI

### **GPT-4 Vision**:
- **$0.01** por 1K tokens de texto
- **$0.00765** por imagen (1024x1024)
- **Estimado**: ~$0.02 por factura procesada

### **Optimización de Costos**:
- Imágenes redimensionadas automáticamente
- Cache de resultados para evitar reprocesamiento
- Fallback a entrada manual si falla AI

## 🔒 Seguridad

- **Variables de entorno** para API keys
- **Archivos temporales** eliminados automáticamente
- **Validación** de tipos de archivo
- **Límites de tamaño** para prevenir abuso

## 🚀 Estado de Producción

**Listo para usar** con:
- ✅ Simulador funcionando (para pruebas)
- ✅ Interfaz completa implementada
- ✅ Backend preparado para OpenAI
- ✅ Manejo de errores y fallbacks

**Para activar AI real**:
1. Agregar API key de OpenAI
2. Reemplazar función simulada
3. ¡Listo para procesar facturas reales!

---

**🎉 Tu aplicación ahora puede procesar facturas automáticamente, haciendo que agregar gastos e ingresos sea tan fácil como tomar una foto!**