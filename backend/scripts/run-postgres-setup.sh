#!/bin/bash
# ============================================================================
# ECG Digital City - PostgreSQL Setup Runner
# ============================================================================
# Este script ejecuta la configuración completa de PostgreSQL
# Uso: ./run-postgres-setup.sh [reset|seed|all]
# ============================================================================

set -e  # Exit on error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración de base de datos
DB_NAME="ecg_digital_city"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"

# Función para imprimir mensajes
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar que PostgreSQL está corriendo
check_postgres() {
    print_info "Verificando conexión a PostgreSQL..."
    if ! pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER > /dev/null 2>&1; then
        print_error "PostgreSQL no está corriendo o no es accesible"
        print_info "Intenta iniciar PostgreSQL con: sudo service postgresql start"
        exit 1
    fi
    print_success "PostgreSQL está corriendo"
}

# Crear base de datos si no existe
create_database() {
    print_info "Verificando base de datos $DB_NAME..."
    if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
        print_success "Base de datos $DB_NAME ya existe"
    else
        print_info "Creando base de datos $DB_NAME..."
        psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME;"
        print_success "Base de datos $DB_NAME creada"
    fi
}

# Ejecutar script de setup
run_setup() {
    print_info "Ejecutando script de configuración..."
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$(dirname "$0")/setup-database.sql"
    print_success "Configuración completada"
}

# Ejecutar script de reset
run_reset() {
    print_warning "⚠️  ADVERTENCIA: Esto eliminará todas las tablas del sistema de interacciones"
    read -p "¿Estás seguro? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Ejecutando reset de base de datos..."
        psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$(dirname "$0")/reset-database.sql"
        print_success "Reset completado"
    else
        print_info "Reset cancelado"
        exit 0
    fi
}

# Ejecutar script de seed
run_seed() {
    print_info "Insertando datos de prueba..."
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$(dirname "$0")/seed-interactions.sql"
    print_success "Datos de prueba insertados"
}

# Ejecutar migraciones de Sequelize
run_migrations() {
    print_info "Ejecutando migraciones de Sequelize..."
    cd "$(dirname "$0")/.."
    npm run migrate
    print_success "Migraciones completadas"
}

# Main
main() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║   ECG Digital City - PostgreSQL Setup                     ║"
    echo "║   Sistema de Interacciones Avanzadas                      ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""

    check_postgres
    create_database

    case "${1:-all}" in
        reset)
            run_reset
            ;;
        seed)
            run_seed
            ;;
        migrate)
            run_migrations
            ;;
        all)
            run_setup
            run_seed
            ;;
        *)
            print_error "Opción inválida: $1"
            echo "Uso: $0 [reset|seed|migrate|all]"
            echo "  reset   - Elimina todas las tablas del sistema de interacciones"
            echo "  seed    - Inserta datos de prueba"
            echo "  migrate - Ejecuta migraciones de Sequelize"
            echo "  all     - Ejecuta setup completo + seed (default)"
            exit 1
            ;;
    esac

    echo ""
    print_success "🎉 Proceso completado exitosamente"
    echo ""
}

main "$@"
