#!/bin/bash

# ============================================
# SCRIPT DE DESPLIEGUE - NUEVO BACKEND
# Deploy del nuevo backend (backend-informes) a EC2
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
BACKEND_PATH="backend-informes"

echo -e "${YELLOW}🚀 Iniciando despliegue del nuevo backend...${NC}"

# 1. Validar que estamos en el directorio correcto
if [ ! -d "$BACKEND_PATH" ]; then
    echo -e "${RED}❌ Error: No se encuentra el directorio $BACKEND_PATH${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Compilando y preparando código...${NC}"

# 2. Instalar dependencias
cd "$BACKEND_PATH"
npm install --production
cd ..

# 3. Crear tarball
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
TARBALL="backend-informes_${TIMESTAMP}.tar.gz"
tar -czf "$TARBALL" "$BACKEND_PATH"
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
    
    echo "🔄 Deteniendo backend anterior..."
    pm2 stop "backend-informes" 2>/dev/null || true
    
    echo "📦 Extrayendo código nuevo..."
    cd /home/ec2-user/rastreofullcontrol
    latesttar=$(ls -t backend-informes_*.tar.gz 2>/dev/null | head -1)
    if [ -n "$latesttar" ]; then
        tar -xzf "$latesttar"
    fi
    
    echo "📥 Instalando dependencias..."
    cd backend-informes
    npm install --production
    
    echo "🚀 Iniciando backend con PM2..."
    pm2 start src/index.js --name "backend-informes" || pm2 restart "backend-informes"
    pm2 save
    
    echo "✓ Despliegue completado"
    pm2 list
EOF

# 6. Validar que el backend está corriendo
echo -e "${YELLOW}✅ Validando Backend...${NC}"
sleep 2
if curl -f "http://${REMOTE_HOST}:3001/servicio/v2/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend está corriendo correctamente${NC}"
else
    echo -e "${YELLOW}⚠️  Advertencia: No se puede alcanzar el health check${NC}"
fi

# 7. Limpiar tarball local
rm "$TARBALL"

echo -e "${GREEN}✅ Despliegue del backend completado${NC}\n"
