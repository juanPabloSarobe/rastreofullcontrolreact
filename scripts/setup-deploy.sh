#!/bin/bash

# ============================================
# SCRIPT DE CONFIGURACIÓN PARA DESPLIEGUE
# Rellena los datos necesarios para desplegar a producción
# ============================================

set -e

# Colores
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  CONFIGURAR DESPLIEGUE A PRODUCCIÓN (EC2)     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}\n"

# Obtener datos del usuario
read -p "Usuario SSH en EC2 [ec2-user]: " SSH_USER
SSH_USER=${SSH_USER:-ec2-user}

read -p "IP o DNS de la instancia EC2: " EC2_HOST
if [ -z "$EC2_HOST" ]; then
    echo "Error: Se requiere un host"
    exit 1
fi

read -p "Ruta remota [/home/ec2-user/rastreofullcontrol]: " REMOTE_PATH
REMOTE_PATH=${REMOTE_PATH:-/home/ec2-user/rastreofullcontrol}

read -p "Path de la llave SSH [~/.ssh/ec2-key.pem]: " KEY_PATH
KEY_PATH=${KEY_PATH:-~/.ssh/ec2-key.pem}

# Expandir ruta de la llave
KEY_PATH="${KEY_PATH/#\~/$HOME}"

echo ""
echo -e "${YELLOW}Configuración a usar:${NC}"
echo "  Usuario SSH: $SSH_USER"
echo "  Host EC2: $EC2_HOST"
echo "  Ruta remota: $REMOTE_PATH"
echo "  Llave SSH: $KEY_PATH"
echo ""

# Validar que la llave existe
if [ ! -f "$KEY_PATH" ]; then
    echo "Error: No se encuentra la llave SSH en $KEY_PATH"
    exit 1
fi

# Guardar configuración
CONFIG_FILE="scripts/.deploy.conf"
cat > "$CONFIG_FILE" << EOF
#!/bin/bash
# Configuración de despliegue generada automáticamente

export REMOTE_USER="$SSH_USER"
export REMOTE_HOST="$EC2_HOST"
export REMOTE_PATH="$REMOTE_PATH"
export SSH_KEY_PATH="$KEY_PATH"
EOF

chmod +x "$CONFIG_FILE"

echo -e "${GREEN}✓ Configuración guardada en $CONFIG_FILE${NC}"
echo ""
echo -e "${YELLOW}Para desplegar, ejecutar:${NC}"
echo -e "  ${GREEN}./deploy.sh${NC}"
echo ""
