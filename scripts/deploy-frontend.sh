#!/bin/bash

# ============================================
# SCRIPT DE DESPLIEGUE - FRONTEND
# Deploy del frontend (frontend-rastreo) a EC2
# ============================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuración
REMOTE_USER="${REMOTE_USER:-ec2-user}"
REMOTE_HOST="${REMOTE_HOST:-tu-ec2-ip}"
REMOTE_PATH="${REMOTE_PATH:-/home/ec2-user/rastreofullcontrol}"
FRONTEND_PATH="frontend-rastreo"

echo -e "${YELLOW}🚀 Iniciando despliegue del frontend...${NC}"

# 1. Validar que estamos en el directorio correcto
if [ ! -d "$FRONTEND_PATH" ]; then
    echo -e "${RED}❌ Error: No se encuentra el directorio $FRONTEND_PATH${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Compilando aplicación React...${NC}"

# 2. Instalar dependencias y build
cd "$FRONTEND_PATH"
npm install
npm run build
cd ..

# 3. Crear tarball del dist
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
TARBALL="frontend-rastreo_dist_${TIMESTAMP}.tar.gz"
cd "$FRONTEND_PATH"
tar -czf "../${TARBALL}" dist/
cd ..
echo -e "${GREEN}✓ Tarball creado: $TARBALL${NC}"

# 4. Subir a EC2
echo -e "${YELLOW}📤 Subiendo a EC2...${NC}"
scp -i ~/.ssh/ec2-key.pem "$TARBALL" "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/" || {
    echo -e "${RED}❌ Error al subir el tarball${NC}"
    exit 1
}
echo -e "${GREEN}✓ Archivo subido exitosamente${NC}"

# 5. Ejecutar despliegue en EC2
echo -e "${YELLOW}🔧 Ejecutando despliegue en EC2...${NC}"
ssh -i ~/.ssh/ec2-key.pem "${REMOTE_USER}@${REMOTE_HOST}" << 'EOF'
    set -e
    
    echo "📦 Extrayendo código nuevo..."
    cd /home/ec2-user/rastreofullcontrol
    latesttar=$(ls -t frontend-rastreo_dist_*.tar.gz 2>/dev/null | head -1)
    if [ -n "$latesttar" ]; then
        mkdir -p /tmp/frontend_dist
        cd /tmp/frontend_dist
        tar -xzf "/home/ec2-user/rastreofullcontrol/$latesttar"
        
        echo "📁 Copiando archivos a nginx..."
        sudo cp -r dist/* /var/www/html/
        
        echo "🔄 Recargando nginx..."
        sudo systemctl reload nginx
        
        echo "✓ Frontend actualizado"
    fi
EOF

# 6. Limpiar tarball local
rm "$TARBALL"

echo -e "${GREEN}✅ Despliegue del frontend completado${NC}\n"
