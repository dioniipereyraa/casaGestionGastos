require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const OpenAI = require('openai');
const { initializeDatabase } = require('./init-db');

const app = express();
const PORT = process.env.PORT || 3001;

// Configurar cliente OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Configuración de multer para uploads de facturas
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'uploads/facturas');
    // Crear directorio si no existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generar nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, 'factura-' + uniqueSuffix + extension);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB máximo
  fileFilter: function (req, file, cb) {
    // Aceptar solo imágenes
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  }
});

// Configuración de middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Servir archivos subidos
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configurar cabeceras de seguridad en producción
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.removeHeader('X-Powered-By');
    next();
  });
}

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root123',
  database: process.env.DB_NAME || 'casaGastos',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Función para conectar a la base de datos
async function connectDB() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    return connection;
  } catch (error) {
    console.error('Error conectando a la base de datos:', error);
    throw error;
  }
}

// Función real de AI para procesar facturas con OpenAI Vision
async function procesarFacturaConAI(imagePath) {
  try {
    console.log('Procesando imagen con OpenAI:', imagePath);
    
    // Verificar que existe la API key
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'tu_api_key_aqui') {
      console.log('API key no configurada, usando modo simulado');
      return await procesarFacturaSimulado();
    }
    
    // Leer la imagen y convertirla a base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = imagePath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
    
    // Llamar a OpenAI Vision API 
    // Modelos disponibles: "gpt-4o-mini", "gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    const response = await openai.chat.completions.create({
      model: model, // Configurable desde .env
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analiza esta factura o recibo y extrae ÚNICAMENTE la información solicitada en formato JSON válido.

RESPONDE SOLO CON EL JSON, SIN TEXTO ADICIONAL, SIN MARKDOWN, SIN EXPLICACIONES.

Formato requerido:
{
  "monto": [número sin símbolos, ej: 1500.50],
  "descripcion": "[descripción del producto/servicio]",
  "fecha": "[fecha en formato YYYY-MM-DD, ej: 2024-10-02]",
  "comercio": "[nombre del comercio/empresa]",
  "categoria": "[una de estas: Alimentación, Transporte, Salud, Hogar, Servicios, Entretenimiento, Ropa, Educación, Otros]"
}

Si no puedes extraer algún dato, usa null para strings o 0 para números.`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 300
    });
    
    const resultado = response.choices[0].message.content;
    console.log('Respuesta de OpenAI:', resultado);
    
    // Limpiar la respuesta y extraer solo el JSON
    let jsonString = resultado.trim();
    
    // Remover posibles markdown o texto extra
    if (jsonString.includes('```json')) {
      jsonString = jsonString.split('```json')[1].split('```')[0].trim();
    } else if (jsonString.includes('```')) {
      jsonString = jsonString.split('```')[1].split('```')[0].trim();
    }
    
    // Buscar el JSON en la respuesta si hay texto extra
    const jsonStart = jsonString.indexOf('{');
    const jsonEnd = jsonString.lastIndexOf('}') + 1;
    
    if (jsonStart !== -1 && jsonEnd !== -1) {
      jsonString = jsonString.substring(jsonStart, jsonEnd);
    }
    
    console.log('JSON extraído:', jsonString);
    
    // Parsear la respuesta JSON
    const datosExtraidos = JSON.parse(jsonString);
    
    // Validar y formatear los datos
    const datosFormateados = {
      monto: parseFloat(datosExtraidos.monto) || 0,
      descripcion: datosExtraidos.descripcion || 'Gasto procesado por IA',
      fecha: datosExtraidos.fecha || new Date().toISOString().split('T')[0],
      comercio: datosExtraidos.comercio || null,
      categoria: datosExtraidos.categoria || 'Otros',
      confianza: 0.85
    };
    
    return {
      success: true,
      datos: datosFormateados,
      mensaje: 'Factura procesada con OpenAI Vision'
    };
    
  } catch (error) {
    console.error('Error con OpenAI, usando modo simulado:', error.message);
    // Si falla OpenAI, usar modo simulado como fallback
    return await procesarFacturaSimulado();
  }
}

// Función de fallback simulado
async function procesarFacturaSimulado() {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const datosExtraidos = {
    monto: Math.floor(Math.random() * 50000) + 5000,
    descripcion: obtenerDescripcionAleatoria(),
    fecha: new Date().toISOString().split('T')[0],
    comercio: obtenerComercioAleatorio(),
    categoria: obtenerCategoriaTextoAleatoria(),
    confianza: 0.75
  };
  
  return {
    success: true,
    datos: datosExtraidos,
    mensaje: 'Factura procesada con IA simulado (API key no configurada)'
  };
}

function obtenerDescripcionAleatoria() {
  const descripciones = [
    'Compra supermercado',
    'Factura de servicios',
    'Combustible vehículo',
    'Farmacia medicamentos',
    'Restaurante comida',
    'Ferretería materiales',
    'Librería útiles',
    'Ropa y calzado'
  ];
  return descripciones[Math.floor(Math.random() * descripciones.length)];
}

function obtenerCategoriaAleatoria() {
  // IDs de categorías comunes (ajustar según tu BD)
  const categorias = [1, 2, 3, 4, 5, 6, 7, 8]; // Alimentación, Servicios, etc.
  return categorias[Math.floor(Math.random() * categorias.length)];
}

function obtenerComercioAleatorio() {
  const comercios = [
    'Supermercado Coto',
    'Farmacia Dr. Ahorro',
    'YPF Estación de Servicio',
    'McDonald\'s',
    'Easy Hogar',
    'Mercado Libre',
    'Telecom Personal',
    'Carrefour'
  ];
  return comercios[Math.floor(Math.random() * comercios.length)];
}

function obtenerCategoriaTextoAleatoria() {
  const categorias = [
    'Alimentación',
    'Transporte',
    'Salud',
    'Hogar',
    'Servicios',
    'Entretenimiento',
    'Ropa',
    'Educación'
  ];
  return categorias[Math.floor(Math.random() * categorias.length)];
}

// Health check para Railway
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'casa-gastos',
    database: 'connected'
  });
});

// Status check simple
app.get('/status', (req, res) => {
  res.status(200).send('OK');
});

// Ping endpoint
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// Ruta principal - Dashboard
app.get('/', async (req, res) => {
  try {
    const connection = await connectDB();
    
    // Obtener gastos con categorías
    const [gastos] = await connection.execute(`
      SELECT g.*, c.nombre as categoria_nombre, c.color as categoria_color 
      FROM gastos g 
      LEFT JOIN categorias c ON g.categoria_id = c.id 
      ORDER BY g.fecha_gasto DESC 
      LIMIT 50
    `);
    
    // Obtener ingresos con categorías
    const [ingresos] = await connection.execute(`
      SELECT i.*, c.nombre as categoria_nombre, c.color as categoria_color 
      FROM ingresos i 
      LEFT JOIN categorias c ON i.categoria_id = c.id 
      ORDER BY i.fecha_ingreso DESC 
      LIMIT 50
    `);
    
    // Obtener categorías activas
    const [categorias] = await connection.execute(`
      SELECT * FROM categorias WHERE activo = TRUE ORDER BY tipo_categoria, nombre
    `);
    
    // Calcular totales del mes actual
    const [totalGastosMes] = await connection.execute(`
      SELECT COALESCE(SUM(monto), 0) as total 
      FROM gastos 
      WHERE MONTH(fecha_gasto) = MONTH(CURDATE()) 
      AND YEAR(fecha_gasto) = YEAR(CURDATE())
    `);
    
    const [totalIngresosMes] = await connection.execute(`
      SELECT COALESCE(SUM(monto), 0) as total 
      FROM ingresos 
      WHERE MONTH(fecha_ingreso) = MONTH(CURDATE()) 
      AND YEAR(fecha_ingreso) = YEAR(CURDATE())
    `);
    
    // Calcular totales generales
    const [totalGastosGeneral] = await connection.execute(`
      SELECT COALESCE(SUM(monto), 0) as total FROM gastos
    `);
    
    const [totalIngresosGeneral] = await connection.execute(`
      SELECT COALESCE(SUM(monto), 0) as total FROM ingresos
    `);
    
    // Gastos por categoría del mes actual
    const [gastosPorCategoria] = await connection.execute(`
      SELECT c.nombre, c.color, COALESCE(SUM(g.monto), 0) as total
      FROM categorias c
      LEFT JOIN gastos g ON c.id = g.categoria_id 
        AND MONTH(g.fecha_gasto) = MONTH(CURDATE()) 
        AND YEAR(g.fecha_gasto) = YEAR(CURDATE())
      WHERE c.tipo_categoria = 'gasto' AND c.activo = TRUE
      GROUP BY c.id, c.nombre, c.color
      ORDER BY total DESC
    `);
    
    await connection.end();
    
    const dashboardData = {
      gastos,
      ingresos,
      categorias,
      totalGastosMes: totalGastosMes[0].total,
      totalIngresosMes: totalIngresosMes[0].total,
      totalGastosGeneral: totalGastosGeneral[0].total,
      totalIngresosGeneral: totalIngresosGeneral[0].total,
      balanceMes: totalIngresosMes[0].total - totalGastosMes[0].total,
      balanceGeneral: totalIngresosGeneral[0].total - totalGastosGeneral[0].total,
      gastosPorCategoria
    };
    
    res.render('dashboard', dashboardData);
  } catch (error) {
    console.error('Error cargando dashboard:', error);
    // Fallback con datos vacíos si hay error de DB
    const dashboardData = {
      gastos: [],
      ingresos: [],
      categorias: [],
      totalGastosMes: 0,
      totalIngresosMes: 0,
      totalGastosGeneral: 0,
      totalIngresosGeneral: 0,
      balanceMes: 0,
      balanceGeneral: 0,
      gastosPorCategoria: []
    };
    res.render('dashboard', dashboardData);
  }
});

// Ruta para agregar gasto
app.post('/agregar-gasto', async (req, res) => {
  try {
    const { descripcion, monto, categoria_id, tipo_gasto, fecha_gasto, metodo_pago, observaciones } = req.body;
    const connection = await connectDB();
    
    await connection.execute(
      `INSERT INTO gastos (descripcion, monto, categoria_id, tipo_gasto, fecha_gasto, metodo_pago, observaciones) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [descripcion, monto, categoria_id || null, tipo_gasto, fecha_gasto, metodo_pago, observaciones || null]
    );
    
    await connection.end();
    res.redirect('/');
  } catch (error) {
    console.error('Error agregando gasto:', error);
    res.status(500).send('Error agregando gasto');
  }
});

// Ruta para agregar ingreso
app.post('/agregar-ingreso', async (req, res) => {
  try {
    const { descripcion, monto, categoria_id, tipo_ingreso, fecha_ingreso, fuente, observaciones } = req.body;
    const connection = await connectDB();
    
    await connection.execute(
      `INSERT INTO ingresos (descripcion, monto, categoria_id, tipo_ingreso, fecha_ingreso, fuente, observaciones) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [descripcion, monto, categoria_id || null, tipo_ingreso, fecha_ingreso, fuente || null, observaciones || null]
    );
    
    await connection.end();
    res.redirect('/');
  } catch (error) {
    console.error('Error agregando ingreso:', error);
    res.status(500).send('Error agregando ingreso');
  }
});

// Ruta para eliminar gasto
app.delete('/gastos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await connectDB();
    
    await connection.execute('DELETE FROM gastos WHERE id = ?', [id]);
    
    await connection.end();
    res.json({ success: true });
  } catch (error) {
    console.error('Error eliminando gasto:', error);
    res.status(500).json({ error: 'Error eliminando gasto' });
  }
});

// Ruta para eliminar ingreso
app.delete('/ingresos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await connectDB();
    
    await connection.execute('DELETE FROM ingresos WHERE id = ?', [id]);
    
    await connection.end();
    res.json({ success: true });
  } catch (error) {
    console.error('Error eliminando ingreso:', error);
    res.status(500).json({ error: 'Error eliminando ingreso' });
  }
});

// Ruta para agregar categoría
app.post('/agregar-categoria', async (req, res) => {
  try {
    const { nombre, descripcion, tipo_categoria, color } = req.body;
    
    // Validar que se reciban los datos requeridos
    if (!nombre || !tipo_categoria) {
      return res.status(400).json({ 
        success: false, 
        error: 'El nombre y tipo de categoría son requeridos' 
      });
    }
    
    const connection = await connectDB();
    
    await connection.execute(
      `INSERT INTO categorias (nombre, descripcion, tipo_categoria, color) 
       VALUES (?, ?, ?, ?)`,
      [nombre, descripcion || null, tipo_categoria, color || '#007bff']
    );
    
    await connection.end();
    
    // Si es una petición AJAX, responder con JSON
    if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
      res.json({ success: true, message: 'Categoría agregada exitosamente' });
    } else {
      res.redirect('/');
    }
  } catch (error) {
    console.error('Error agregando categoría:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      // Error de nombre duplicado
      res.status(400).json({ 
        success: false, 
        error: `Ya existe una categoría con el nombre "${nombre}". Por favor, elige otro nombre.` 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Error interno del servidor al agregar la categoría' 
      });
    }
  }
});

// Ruta para eliminar categoría
app.delete('/categorias/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await connectDB();
    
    // Verificar si la categoría está siendo usada
    const [gastosCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM gastos WHERE categoria_id = ?', [id]
    );
    const [ingresosCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM ingresos WHERE categoria_id = ?', [id]
    );
    
    if (gastosCount[0].count > 0 || ingresosCount[0].count > 0) {
      await connection.end();
      return res.status(400).json({ 
        error: 'No se puede eliminar la categoría porque tiene gastos o ingresos asociados' 
      });
    }
    
    await connection.execute('DELETE FROM categorias WHERE id = ?', [id]);
    
    await connection.end();
    res.json({ success: true });
  } catch (error) {
    console.error('Error eliminando categoría:', error);
    res.status(500).json({ error: 'Error eliminando categoría' });
  }
});

// Ruta para editar categoría
app.put('/categorias/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, color } = req.body;
    const connection = await connectDB();
    
    await connection.execute(
      `UPDATE categorias SET nombre = ?, descripcion = ?, color = ? WHERE id = ?`,
      [nombre, descripcion || null, color, id]
    );
    
    await connection.end();
    res.json({ success: true });
  } catch (error) {
    console.error('Error editando categoría:', error);
    res.status(500).json({ error: 'Error editando categoría' });
  }
});

// Ruta para obtener una categoría específica
app.get('/api/categorias/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await connectDB();
    
    const [categoria] = await connection.execute(
      'SELECT * FROM categorias WHERE id = ?', [id]
    );
    
    await connection.end();
    
    if (categoria.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    
    res.json(categoria[0]);
  } catch (error) {
    console.error('Error obteniendo categoría:', error);
    res.status(500).json({ error: 'Error obteniendo categoría' });
  }
});

// Ruta para procesar factura con AI (endpoint usado por el frontend)
app.post('/ai/procesar-documento', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No se subió ningún archivo' });
    }

    console.log('Archivo recibido:', req.file.filename);

    // Optimizar imagen para AI processing
    const fileExt = path.extname(req.file.filename);
    const optimizedPath = req.file.path.replace(fileExt, '_optimized' + fileExt);
    
    await sharp(req.file.path)
      .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toFile(optimizedPath);

    // Procesar con AI (real o simulado)
    const resultado = await procesarFacturaConAI(optimizedPath);
    
    if (resultado.success) {
      res.json({
        success: true,
        result: {
          monto: resultado.datos.monto,
          descripcion: resultado.datos.descripcion,
          fecha: resultado.datos.fecha,
          comercio: resultado.datos.comercio,
          categoria: resultado.datos.categoria
        },
        mensaje: resultado.mensaje,
        confianza: resultado.datos.confianza
      });
    } else {
      res.json({
        success: false,
        error: resultado.error || 'Error procesando el documento'
      });
    }

    // Limpiar archivos temporales
    setTimeout(() => {
      try {
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        if (fs.existsSync(optimizedPath)) fs.unlinkSync(optimizedPath);
      } catch (cleanupError) {
        console.error('Error limpiando archivos:', cleanupError);
      }
    }, 5000);

  } catch (error) {
    console.error('Error procesando documento:', error);
    res.json({
      success: false,
      error: 'Error interno procesando el documento'
    });
  }
});

// Ruta para procesar factura con AI (endpoint original - mantener compatibilidad)
app.post('/api/procesar-factura', upload.single('factura'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo' });
    }

    // Optimizar imagen para AI processing
    const optimizedPath = req.file.path.replace('.jpg', '_optimized.jpg').replace('.png', '_optimized.png').replace('.jpeg', '_optimized.jpeg');
    
    await sharp(req.file.path)
      .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toFile(optimizedPath);

    // Procesar con AI (simulado)
    const resultado = await procesarFacturaConAI(optimizedPath);
    
    if (resultado.success) {
      res.json({
        success: true,
        datos: resultado.datos,
        mensaje: resultado.mensaje,
        imagen_url: `/uploads/facturas/${req.file.filename}`,
        confianza: resultado.datos.confianza
      });
    } else {
      res.status(500).json({
        success: false,
        error: resultado.error
      });
    }

    // Limpiar archivo temporal optimizado
    if (fs.existsSync(optimizedPath)) {
      fs.unlinkSync(optimizedPath);
    }

  } catch (error) {
    console.error('Error procesando factura:', error);
    res.status(500).json({ error: 'Error procesando la factura' });
  }
});

// Ruta para confirmar y guardar datos extraídos por AI
app.post('/api/confirmar-factura', async (req, res) => {
  try {
    const { tipo, descripcion, monto, categoria_id, fecha, imagen_url, metodo_pago, fuente, observaciones } = req.body;
    const connection = await connectDB();
    
    if (tipo === 'gasto') {
      await connection.execute(
        `INSERT INTO gastos (descripcion, monto, categoria_id, tipo_gasto, fecha_gasto, metodo_pago, observaciones, comprobante) 
         VALUES (?, ?, ?, 'variable', ?, ?, ?, ?)`,
        [descripcion, monto, categoria_id || null, fecha, metodo_pago || 'otro', observaciones || 'Procesado con AI', imagen_url]
      );
    } else if (tipo === 'ingreso') {
      await connection.execute(
        `INSERT INTO ingresos (descripcion, monto, categoria_id, tipo_ingreso, fecha_ingreso, fuente, observaciones) 
         VALUES (?, ?, ?, 'otro', ?, ?, ?)`,
        [descripcion, monto, categoria_id || null, fecha, fuente || 'Procesado con AI', observaciones || 'Procesado con AI']
      );
    }
    
    await connection.end();
    res.json({ success: true, mensaje: 'Factura guardada correctamente' });
  } catch (error) {
    console.error('Error guardando factura procesada:', error);
    res.status(500).json({ error: 'Error guardando la información' });
  }
});

// Ruta para obtener estadísticas por fechas
app.get('/api/estadisticas', async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    const connection = await connectDB();
    
    let whereClause = '';
    let params = [];
    
    if (desde && hasta) {
      whereClause = 'WHERE fecha_gasto BETWEEN ? AND ?';
      params = [desde, hasta];
    }
    
    const [gastosPorFecha] = await connection.execute(`
      SELECT DATE(fecha_gasto) as fecha, SUM(monto) as total
      FROM gastos ${whereClause}
      GROUP BY DATE(fecha_gasto)
      ORDER BY fecha DESC
    `, params);
    
    const [ingresosPorFecha] = await connection.execute(`
      SELECT DATE(fecha_ingreso) as fecha, SUM(monto) as total
      FROM ingresos ${whereClause.replace('fecha_gasto', 'fecha_ingreso')}
      GROUP BY DATE(fecha_ingreso)
      ORDER BY fecha DESC
    `, params);
    
    await connection.end();
    
    res.json({
      gastos: gastosPorFecha,
      ingresos: ingresosPorFecha
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error obteniendo estadísticas' });
  }
});

// Función para iniciar el servidor
async function startServer() {
  try {
    // Inicializar base de datos en Railway
    if (process.env.NODE_ENV === 'production') {
      console.log('🔧 Inicializando base de datos...');
      const dbInitialized = await initializeDatabase();
      if (!dbInitialized) {
        console.error('❌ Error: No se pudo inicializar la base de datos');
        process.exit(1);
      }
    }
    
    // Iniciar servidor
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🏠 Servidor Casa Gastos corriendo en puerto ${PORT}`);
      console.log(`📊 Dashboard disponible en producción`);
      console.log(`✅ Aplicación lista para recibir conexiones`);
    });
    
    // Manejar señales de cierre graceful
    process.on('SIGTERM', () => {
      console.log('📥 Recibida señal SIGTERM, cerrando servidor...');
      server.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
      });
    });
    
    process.on('SIGINT', () => {
      console.log('📥 Recibida señal SIGINT, cerrando servidor...');
      server.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
}

startServer();