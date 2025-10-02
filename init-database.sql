-- Crear base de datos casaGastos
CREATE DATABASE IF NOT EXISTS casaGastos;
USE casaGastos;

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS `categorias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text,
  `tipo_categoria` enum('gasto','ingreso') NOT NULL DEFAULT 'gasto',
  `color` varchar(7) DEFAULT '#007bff',
  `activo` tinyint(1) DEFAULT '1',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla de gastos
CREATE TABLE IF NOT EXISTS `gastos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(200) NOT NULL,
  `monto` decimal(12,2) NOT NULL,
  `categoria_id` int DEFAULT NULL,
  `tipo_gasto` enum('fijo','variable') NOT NULL DEFAULT 'variable',
  `fecha_gasto` date NOT NULL,
  `metodo_pago` enum('efectivo','tarjeta_debito','tarjeta_credito','transferencia','otro') DEFAULT 'efectivo',
  `comprobante` varchar(255) DEFAULT NULL,
  `observaciones` text,
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `categoria_id` (`categoria_id`),
  CONSTRAINT `gastos_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla de ingresos
CREATE TABLE IF NOT EXISTS `ingresos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(200) NOT NULL,
  `monto` decimal(12,2) NOT NULL,
  `categoria_id` int DEFAULT NULL,
  `tipo_ingreso` enum('salario','freelance','venta','inversion','otro') NOT NULL DEFAULT 'otro',
  `fecha_ingreso` date NOT NULL,
  `fuente` varchar(100) DEFAULT NULL,
  `observaciones` text,
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `categoria_id` (`categoria_id`),
  CONSTRAINT `ingresos_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla de presupuestos
CREATE TABLE IF NOT EXISTS `presupuestos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `categoria_id` int DEFAULT NULL,
  `monto_presupuestado` decimal(12,2) NOT NULL,
  `mes` int NOT NULL,
  `ano` int NOT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_presupuesto` (`categoria_id`,`mes`,`ano`),
  CONSTRAINT `presupuestos_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insertar categorías básicas
INSERT IGNORE INTO `categorias` (`nombre`, `descripcion`, `tipo_categoria`, `color`) VALUES
('Alimentación', 'Gastos en comida y bebidas', 'gasto', '#FF6B6B'),
('Transporte', 'Gastos en movilidad y combustible', 'gasto', '#4ECDC4'),
('Salud', 'Gastos médicos y farmacia', 'gasto', '#45B7D1'),
('Entretenimiento', 'Gastos en ocio y diversión', 'gasto', '#96CEB4'),
('Servicios', 'Servicios básicos del hogar', 'gasto', '#FFEAA7'),
('Salario', 'Ingresos por trabajo', 'ingreso', '#00B894'),
('Freelance', 'Ingresos por trabajos independientes', 'ingreso', '#00CECA'),
('Otros Ingresos', 'Otros tipos de ingresos', 'ingreso', '#6C5CE7');