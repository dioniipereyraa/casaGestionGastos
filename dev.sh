#!/bin/bash

echo "🛠️  Iniciando Casa Gastos en modo desarrollo..."
echo "🔄 Hot reload activado"
echo "📁 Código sincronizado en tiempo real"
echo ""

# Parar contenedores de producción
echo "⏹️  Parando contenedores de producción..."
docker-compose down 2>/dev/null

# Crear docker-compose para desarrollo
cat > docker-compose.dev.yml << EOF
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: casa_gastos_mysql_dev
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: root123
      MYSQL_DATABASE: casaGastos
      MYSQL_USER: casauser
      MYSQL_PASSWORD: casa123
    ports:
      - "3307:3306"
    volumes:
      - mysql_data_dev:/var/lib/mysql
      - ./init_db.sql:/docker-entrypoint-initdb.d/init_db.sql
    networks:
      - casa-network-dev

  webapp:
    build: .
    container_name: casa_gastos_app_dev
    restart: unless-stopped
    environment:
      DB_HOST: mysql
      DB_USER: root
      DB_PASSWORD: root123
      DB_NAME: casaGastos
      PORT: 3001
      NODE_ENV: development
    ports:
      - "3001:3001"
    depends_on:
      - mysql
    networks:
      - casa-network-dev
    volumes:
      - .:/usr/src/app
      - /usr/src/app/node_modules
    command: npm run dev

volumes:
  mysql_data_dev:

networks:
  casa-network-dev:
    driver: bridge
EOF

# Levantar en modo desarrollo
echo "🚀 Levantando en modo desarrollo..."
docker-compose -f docker-compose.dev.yml up --build

echo ""
echo "✅ Desarrollo iniciado!"
echo "📱 App: http://localhost:3001"
echo "🗄️  MySQL: localhost:3307"
echo ""
echo "💡 Para parar: Ctrl+C"
echo "🔄 Los cambios en el código se aplicarán automáticamente"