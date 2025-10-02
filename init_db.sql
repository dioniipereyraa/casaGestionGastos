-- Base de datos para gestión de gastos e ingresos del hogar
CREATE DATABASE IF NOT EXISTS casaGastos;
USE casaGastos;

-- Tabla de categorías de gastos
CREATE TABLE IF NOT EXISTS categorias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    tipo_categoria ENUM('gasto', 'ingreso') NOT NULL DEFAULT 'gasto',
    color VARCHAR(7) DEFAULT '#007bff',
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de gastos del hogar
CREATE TABLE IF NOT EXISTS gastos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    descripcion VARCHAR(200) NOT NULL,
    monto DECIMAL(12,2) NOT NULL,
    categoria_id INT,
    tipo_gasto ENUM('fijo', 'variable') NOT NULL DEFAULT 'variable',
    fecha_gasto DATE NOT NULL,
    metodo_pago ENUM('efectivo', 'tarjeta_debito', 'tarjeta_credito', 'transferencia', 'otro') DEFAULT 'efectivo',
    comprobante VARCHAR(255),
    observaciones TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL
);

-- Tabla de ingresos del hogar
CREATE TABLE IF NOT EXISTS ingresos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    descripcion VARCHAR(200) NOT NULL,
    monto DECIMAL(12,2) NOT NULL,
    categoria_id INT,
    tipo_ingreso ENUM('salario', 'freelance', 'venta', 'inversion', 'otro') NOT NULL DEFAULT 'otro',
    fecha_ingreso DATE NOT NULL,
    fuente VARCHAR(100),
    observaciones TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL
);

-- Tabla de presupuestos mensuales
CREATE TABLE IF NOT EXISTS presupuestos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    categoria_id INT,
    monto_presupuestado DECIMAL(12,2) NOT NULL,
    mes INT NOT NULL,
    año INT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE,
    UNIQUE KEY unique_presupuesto (categoria_id, mes, año)
);

-- Insertar categorías por defecto para gastos
INSERT INTO categorias (nombre, descripcion, tipo_categoria, color) VALUES
('Alimentación', 'Comida, supermercado, restaurantes', 'gasto', '#28a745'),
('Servicios', 'Luz, gas, agua, internet, teléfono', 'gasto', '#dc3545'),
('Transporte', 'Combustible, mantenimiento vehículo, transporte público', 'gasto', '#ffc107'),
('Hogar', 'Alquiler, expensas, mantenimiento, decoración', 'gasto', '#17a2b8'),
('Salud', 'Medicamentos, consultas médicas, obras sociales', 'gasto', '#e83e8c'),
('Entretenimiento', 'Salidas, streaming, deportes, hobbies', 'gasto', '#6f42c1'),
('Educación', 'Cursos, libros, materiales de estudio', 'gasto', '#fd7e14'),
('Ropa y Calzado', 'Vestimenta y calzado para la familia', 'gasto', '#20c997'),
('Mascotas', 'Comida, veterinaria, accesorios para mascotas', 'gasto', '#6c757d'),
('Otros Gastos', 'Gastos varios no categorizados', 'gasto', '#343a40');

-- Insertar categorías por defecto para ingresos
INSERT INTO categorias (nombre, descripcion, tipo_categoria, color) VALUES
('Salario Principal', 'Sueldo principal del hogar', 'ingreso', '#28a745'),
('Salario Secundario', 'Segundo sueldo o trabajo de medio tiempo', 'ingreso', '#20c997'),
('Freelance', 'Trabajos independientes y proyectos', 'ingreso', '#17a2b8'),
('Ventas', 'Ventas de productos o servicios', 'ingreso', '#ffc107'),
('Inversiones', 'Rendimientos de inversiones, dividendos', 'ingreso', '#6f42c1'),
('Otros Ingresos', 'Ingresos varios no categorizados', 'ingreso', '#fd7e14');

-- Insertar algunos gastos de ejemplo
INSERT INTO gastos (descripcion, monto, categoria_id, tipo_gasto, fecha_gasto, metodo_pago) VALUES
('Compra supermercado', 15000.00, 1, 'variable', CURDATE(), 'tarjeta_debito'),
('Factura de luz', 8500.00, 2, 'fijo', CURDATE(), 'transferencia'),
('Combustible auto', 12000.00, 3, 'variable', CURDATE(), 'efectivo'),
('Alquiler mensual', 85000.00, 4, 'fijo', CURDATE(), 'transferencia');

-- Insertar algunos ingresos de ejemplo
INSERT INTO ingresos (descripcion, monto, categoria_id, tipo_ingreso, fecha_ingreso, fuente) VALUES
('Sueldo principal', 180000.00, 11, 'salario', CURDATE(), 'Empresa XYZ'),
('Proyecto freelance', 25000.00, 13, 'freelance', CURDATE(), 'Cliente ABC');