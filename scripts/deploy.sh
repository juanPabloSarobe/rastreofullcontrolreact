#!/bin/bash

# ============================================
# SCRIPT MAESTRO DE DESPLIEGUE
# Despliega frontend y backend a producción (EC2)
# ============================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración (ajustar según sea necesario)
export REMOTE_USER="${1:-ec2-user}"
export REMOTE_HOST="${2:-}"
export REMOTE_PATH="${3:-/home/ec2-user/rastreofullcontrol}"

# Validar argumentos
if [ -z "$REMOTE_HOST" ]; then
    echo -e "${RED}❌ Uso: ./deploy.sh <usuario> <host> [ruta]${NC}"
    echo ""
    echo -e "${BLUE}Ejemplo:${NC}"
    echo "  ./deploy.sh ec2-user 1.2.3.4 /home/ec2-user/rastreofullcontrol"
    echo ""
    echo -e "${BLUE}Configuración:${NC}"
    echo "  - Usuario SSH: $REMOTE_USER"
    echo "  - Host: (requerido)"
    echo "  - Ruta remota: $REMOTE_PATH"
    exit 1
fi

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  DESPLIEGUE FULLCONTROL A PRODUCCIÓN  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}\n"

echo -e "${YELLOW}Configuración:${NC}"
echo "  Usuario: $REMOTE_USER"
echo "  Host: $REMOTE_HOST"
echo "  Ruta remota: $REMOTE_PATH"
echo ""

# Confirmar antes de desplegar
read -p "¿Continuar con el despliegue? (s/n): " confirm
if [[ "$confirm" != "s" && "$confirm" != "S" ]]; then
    echo -e "${RED}Despliegue cancelado${NC}"
    exit 1
fi

echo ""

# Cambiar a directorio del script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR/.."

# Ejecutar despliegues
echo -e "${YELLOW}▶ Iniciando despliegue del backend...${NC}"
./scripts/deploy-backend.sh
echo ""

echo -e "${YELLOW}▶ Iniciando despliegue del frontend...${NC}"
./scripts/deploy-frontend.sh
echo ""

echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ DESPLIEGUE COMPLETADO             ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}Próximos pasos:${NC}"
echo "1. Verificar que el frontend está accesible en http://$REMOTE_HOST"
echo "2. Verificar que el backend está respondiendo en http://$REMOTE_HOST:3001/servicio/v2/health"
echo "3. Revisar logs en la instancia EC2 si hay problemas"
echo ""
