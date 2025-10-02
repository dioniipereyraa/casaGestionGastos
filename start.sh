#!/bin/bash

echo "🏠 Iniciando Casa Gastos - Gestión del Hogar..."
echo "📊 Dashboard: http://localhost:3001"
echo "🗄️  MySQL: localhost:3307"
echo ""

# Parar contenedores existentes si los hay
echo "⏹️  Parando contenedores previos..."
docker-compose down 2>/dev/null

# Levantar servicios
echo "🚀 Levantando servicios..."
docker-compose up --build -d

# Esperar a que MySQL esté listo
echo "⏳ Esperando que MySQL esté listo..."
until docker exec casa_gastos_mysql mysqladmin ping -h "localhost" --silent 2>/dev/null; do
    printf "."
    sleep 2
done
echo ""
echo "✅ MySQL está listo"

# Verificar datos
echo "📊 Verificando integridad de datos..."
GASTOS=$(docker exec casa_gastos_mysql mysql -u root -proot123 -se "USE casaGastos; SELECT COUNT(*) FROM gastos;" 2>/dev/null || echo "0")
INGRESOS=$(docker exec casa_gastos_mysql mysql -u root -proot123 -se "USE casaGastos; SELECT COUNT(*) FROM ingresos;" 2>/dev/null || echo "0")
CATEGORIAS=$(docker exec casa_gastos_mysql mysql -u root -proot123 -se "USE casaGastos; SELECT COUNT(*) FROM categorias;" 2>/dev/null || echo "0")

echo "   💸 Gastos registrados: $GASTOS"
echo "   💰 Ingresos registrados: $INGRESOS"
echo "   🏷️  Categorías disponibles: $CATEGORIAS"

if [ "$GASTOS" -eq 0 ] && [ "$INGRESOS" -eq 0 ] && [ "$CATEGORIAS" -eq 0 ]; then
    echo "⚠️  No se encontraron datos. Ejecutando script de inicialización..."
    docker exec -i casa_gastos_mysql mysql -u root -proot123 < init_db.sql
fi

echo ""
echo "✅ Casa Gastos está funcionando!"
echo "📱 Accede en: http://localhost:3001"
echo ""
echo "💡 Comandos útiles:"
echo "   🛑 Para parar: docker-compose down"
echo "   💾 Para backup: ./backup.sh"
echo "   📋 Para logs: docker logs casa_gastos_app"
echo ""