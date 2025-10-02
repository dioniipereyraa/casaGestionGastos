const mysql = require('mysql2/promise');
require('dotenv').config();

async function verifyDatabase() {
    const dbConfig = {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: 'casaGastos'
    };

    try {
        console.log('🔍 Verificando base de datos...');
        console.log('Config:', {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            database: 'casaGastos'
        });
        
        const connection = await mysql.createConnection(dbConfig);
        
        // Verificar tablas
        const [tables] = await connection.execute('SHOW TABLES');
        console.log('📋 Tablas encontradas:', tables);
        
        // Verificar categorías
        const [categorias] = await connection.execute('SELECT * FROM categorias');
        console.log('🎨 Categorías encontradas:', categorias.length);
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        
        // Intentar sin especificar base de datos
        try {
            const dbConfigRoot = {
                host: process.env.DB_HOST,
                port: process.env.DB_PORT || 3306,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD
            };
            
            const connection = await mysql.createConnection(dbConfigRoot);
            const [databases] = await connection.execute('SHOW DATABASES');
            console.log('🗄️ Bases de datos disponibles:', databases);
            await connection.end();
            
        } catch (error2) {
            console.error('❌ Error conectando:', error2.message);
        }
    }
}

verifyDatabase();