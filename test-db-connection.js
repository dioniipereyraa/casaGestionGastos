const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
    console.log('🔍 Probando conexión a la base de datos...');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`Port: ${process.env.DB_PORT}`);
    console.log(`User: ${process.env.DB_USER}`);
    console.log(`Database: ${process.env.DB_NAME}`);
    
    try {
        // Primero intentar conectar sin especificar base de datos
        console.log('\n1️⃣ Conectando sin especificar base de datos...');
        const connection1 = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });
        
        console.log('✅ Conexión exitosa sin base de datos');
        
        // Listar bases de datos disponibles
        const [databases] = await connection1.execute('SHOW DATABASES');
        console.log('📋 Bases de datos disponibles:');
        databases.forEach(db => console.log(`   - ${db.Database}`));
        
        await connection1.end();
        
        // Ahora intentar con la base de datos específica
        console.log('\n2️⃣ Conectando a la base de datos específica...');
        const connection2 = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        
        console.log('✅ Conexión exitosa a la base de datos');
        
        // Probar consulta
        const [tables] = await connection2.execute('SHOW TABLES');
        console.log('📊 Tablas disponibles:');
        tables.forEach(table => console.log(`   - ${table[`Tables_in_${process.env.DB_NAME}`]}`));
        
        // Probar consulta de datos
        const [categorias] = await connection2.execute('SELECT COUNT(*) as total FROM categorias');
        console.log(`📈 Total de categorías: ${categorias[0].total}`);
        
        await connection2.end();
        console.log('\n🎉 ¡Todas las pruebas de conexión exitosas!');
        
    } catch (error) {
        console.error('\n❌ Error de conexión:', error.message);
        console.error('Code:', error.code);
        console.error('Errno:', error.errno);
        console.error('SqlState:', error.sqlState);
    }
}

testConnection();