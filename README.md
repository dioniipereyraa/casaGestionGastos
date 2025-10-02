# 🏠 Casa Gastos - Gestión de Finanzas del Hogar

Una aplicación web completa para gestionar gastos e ingresos de tu hogar de manera inteligente.

## 🚀 ¿Qué es esto?

Casa Gastos es una aplicación web que te permite:
- ✅ **Dashboard intuitivo** con estadísticas en tiempo real
- ✅ **Gestión de gastos** con categorías personalizables
- ✅ **Control de ingresos** familiares
- ✅ **Categorización automática** de gastos e ingresos
- ✅ **Balance mensual y total** calculado automáticamente
- ✅ **Gastos fijos y variables** diferenciados
- ✅ **Métodos de pago** clasificados
- ✅ **Interfaz moderna** con Bootstrap

## 📊 Características Principales

### Dashboard Inteligente
- **Estadísticas del mes**: Gastos, ingresos y balance
- **Balance general**: Saldo acumulado total
- **Gastos por categoría**: Visualización con gráficos de progreso
- **Últimos movimientos**: Historial combinado de gastos e ingresos

### Gestión de Gastos
- Categorías predefinidas (Alimentación, Servicios, Transporte, etc.)
- Gastos fijos vs variables
- Métodos de pago (Efectivo, Tarjeta, Transferencia)
- Observaciones y comprobantes

### Control de Ingresos
- Tipos de ingreso (Salario, Freelance, Ventas, Inversiones)
- Fuentes de ingreso
- Categorización personalizada

### Categorías Personalizables
- Crear categorías propias
- Colores personalizados
- Separación entre gastos e ingresos

## 🔧 Tecnologías

- **Backend**: Node.js + Express
- **Base de datos**: MySQL 8.0
- **Frontend**: Bootstrap 5 + EJS
- **Containerización**: Docker + Docker Compose
- **Iconografía**: Bootstrap Icons

## 🚀 Instalación y Uso

### Requisitos Previos
- Docker
- Docker Compose

### Inicio Rápido

1. **Clonar el proyecto**:
```bash
git clone <tu-repo>
cd appCasaGastos
```

2. **Levantar la aplicación**:
```bash
# Modo desarrollo (recomendado)
./start.sh

# O manualmente
docker-compose up --build -d
```

3. **Acceder a la aplicación**:
- **Web**: http://localhost:3001
- **MySQL**: localhost:3307

### Scripts Disponibles

```bash
# Iniciar aplicación
./start.sh

# Modo desarrollo con hot reload
./dev.sh

# Modo producción
./prod.sh

# Backup de datos
./backup.sh

# Parar servicios
docker-compose down
```

## 📁 Estructura del Proyecto

```
appCasaGastos/
├── app.js                 # Servidor principal de Node.js
├── package.json           # Dependencias npm
├── Dockerfile            # Configuración para containerizar
├── docker-compose.yml    # Orquestación de servicios
├── init_db.sql          # Script de inicialización de BD
├── views/
│   └── dashboard.ejs    # Interfaz web principal
├── scripts/             # Scripts de utilidad
└── README.md           # Esta documentación
```

## 🗄️ Base de Datos

### Tablas Principales

**categorias**: Categorías de gastos e ingresos
- Tipos: 'gasto' o 'ingreso'
- Colores personalizables
- Activo/Inactivo

**gastos**: Registro de gastos del hogar
- Categorización
- Tipos: 'fijo' o 'variable'
- Métodos de pago
- Observaciones

**ingresos**: Registro de ingresos familiares
- Tipos: salario, freelance, ventas, inversiones
- Fuentes de ingreso
- Categorización

**presupuestos**: Presupuestos mensuales por categoría
- Control de gastos planificados
- Comparación real vs presupuestado

### Datos de Ejemplo

La aplicación viene con:
- 10 categorías de gastos predefinidas
- 6 categorías de ingresos
- Ejemplos de gastos e ingresos para pruebas

## 💡 Flujo de Trabajo

### Para agregar un gasto:
1. Ir a la pestaña "Gastos"
2. Completar formulario (descripción, monto, categoría, etc.)
3. Elegir si es gasto fijo o variable
4. Seleccionar método de pago
5. Guardar - se actualiza automáticamente en el dashboard

### Para agregar un ingreso:
1. Ir a la pestaña "Ingresos"
2. Completar descripción y monto
3. Seleccionar tipo y categoría
4. Especificar fuente (opcional)
5. Guardar - se suma al balance total

### Para crear categorías:
1. Ir a la pestaña "Categorías"
2. Crear nueva categoría con nombre y color
3. Especificar si es para gastos o ingresos
4. Usar inmediatamente en nuevos registros

## 🔥 Características Avanzadas

### Cálculos Automáticos
- **Balance mensual**: Ingresos - Gastos del mes actual
- **Balance total**: Saldo acumulado histórico
- **Gastos por categoría**: Porcentajes y totales
- **Últimos movimientos**: Timeline combinado

### Responsive Design
- Funciona perfectamente en móvil y desktop
- Formularios optimizados para touch
- Tablas responsivas con scroll horizontal

### Persistencia de Datos
- Datos guardados en volumen Docker
- Backup automático disponible
- No se pierden datos al reiniciar

## 🛠️ Personalización

### Agregar nuevas categorías:
- Usar la interfaz web en "Categorías"
- Personalizar colores para mejor organización

### Modificar campos:
- Editar `init_db.sql` para nuevos campos
- Actualizar formularios en `dashboard.ejs`
- Agregar rutas en `app.js`

### Cambiar puerto:
- Modificar `docker-compose.yml`
- Actualizar variable `PORT` en el servicio webapp

## 🔐 Seguridad

- **Queries preparados**: Prevención de SQL injection
- **Contenedores aislados**: Aplicación y BD separadas
- **Variables de entorno**: Configuración segura
- **Volúmenes persistentes**: Datos protegidos

## 📊 Monitoreo

### Verificar estado:
```bash
# Ver contenedores activos
docker ps

# Ver logs de la aplicación
docker logs casa_gastos_app

# Ver logs de MySQL
docker logs casa_gastos_mysql

# Conectar a MySQL directamente
docker exec -it casa_gastos_mysql mysql -u root -proot123 casaGastos
```

### Estadísticas de datos:
```sql
-- Desde MySQL
SELECT 'GASTOS' as tipo, COUNT(*) as cantidad FROM gastos 
UNION SELECT 'INGRESOS', COUNT(*) FROM ingresos
UNION SELECT 'CATEGORIAS', COUNT(*) FROM categorias;
```

## 🚨 Solución de Problemas

### La aplicación no carga:
```bash
# Verificar que MySQL esté listo
docker exec casa_gastos_mysql mysqladmin ping

# Reiniciar servicios
docker-compose restart
```

### Error de conexión a BD:
```bash
# Verificar variables de entorno
docker exec casa_gastos_app env | grep DB_

# Verificar red Docker
docker network ls | grep casa
```

### Pérdida de datos:
```bash
# Verificar volumen de datos
docker volume ls | grep mysql_data

# Restaurar desde backup
./restore.sh backup_file.sql
```

## 🎯 Próximas Mejoras

1. **Reportes PDF**: Exportar estadísticas mensuales
2. **Gráficos avanzados**: Charts.js para visualizaciones
3. **Presupuestos activos**: Alertas de límites
4. **Filtros por fecha**: Análisis por períodos
5. **Import/Export**: CSV para datos externos
6. **Notificaciones**: Recordatorios de gastos fijos
7. **App móvil**: PWA para uso offline

## 🤝 Comparación con PPGarage

Casa Gastos está basada en la arquitectura exitosa de PPGarage pero adaptada para uso doméstico:

**Similitudes**:
- Misma tecnología (Node.js + MySQL + Docker)
- Dashboard con estadísticas en tiempo real
- Interfaz Bootstrap moderna
- CRUD completo para entidades

**Diferencias**:
- **Enfoque**: Hogar vs Negocio automotriz
- **Categorías**: Gastos familiares vs Productos químicos
- **Tipos**: Gastos fijos/variables vs Productos/Servicios
- **Métricas**: Balance familiar vs Rentabilidad negocio

## 📞 Soporte

Si encuentras problemas:
1. Verificar logs con `docker logs casa_gastos_app`
2. Revisar la sección "Solución de Problemas"
3. Hacer backup antes de cambios importantes
4. Los datos están en el volumen `mysql_data`

---

**¡Tu sistema de gestión financiera doméstica está listo! 🏠💰**

Desarrollado con la experiencia exitosa de PPGarage, adaptado para el hogar moderno.# casaGestionGastos
