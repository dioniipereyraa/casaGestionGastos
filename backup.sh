#!/bin/bash
# Script de backup automático para Casa Gastos

BACKUP_DIR="/home/dionipereyra/appCasaGastos/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="casa_gastos_backup_$DATE.sql"

# Crear directorio de backups si no existe
mkdir -p "$BACKUP_DIR"

echo "💾 Creando backup de Casa Gastos..."

# Hacer backup de la base de datos completa
docker exec casa_gastos_mysql mysqldump -u root -proot123 --single-transaction --routines --triggers casaGastos > "$BACKUP_DIR/$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Backup creado exitosamente: $BACKUP_FILE"
    
    # Comprimir el backup
    gzip "$BACKUP_DIR/$BACKUP_FILE"
    echo "🗜️  Backup comprimido: $BACKUP_FILE.gz"
    
    # Mostrar estadísticas
    echo "📊 Datos respaldados:"
    GASTOS=$(docker exec casa_gastos_mysql mysql -u root -proot123 -se "USE casaGastos; SELECT COUNT(*) FROM gastos;" 2>/dev/null)
    INGRESOS=$(docker exec casa_gastos_mysql mysql -u root -proot123 -se "USE casaGastos; SELECT COUNT(*) FROM ingresos;" 2>/dev/null)
    CATEGORIAS=$(docker exec casa_gastos_mysql mysql -u root -proot123 -se "USE casaGastos; SELECT COUNT(*) FROM categorias;" 2>/dev/null)
    
    echo "   💸 Gastos: $GASTOS"
    echo "   💰 Ingresos: $INGRESOS"
    echo "   🏷️  Categorías: $CATEGORIAS"
    
    # Limpiar backups antiguos (mantener solo últimos 10)
    cd "$BACKUP_DIR"
    ls -t casa_gastos_backup_*.sql.gz | tail -n +11 | xargs -r rm
    
    echo "🧹 Backups antiguos eliminados (manteniendo últimos 10)"
    echo "📁 Backups disponibles en: $BACKUP_DIR"
    
else
    echo "❌ Error creando backup"
    exit 1
fi