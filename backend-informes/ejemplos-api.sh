#!/bin/bash

# ==============================================
# EJEMPLOS DE USO - API Backend FullControl
# ==============================================

# Cambiar esto a tu localhost (o servidor)
API_URL="http://localhost:3002"

echo "🚀 FullControl Backend - Ejemplos de API"
echo "=========================================="
echo ""

# ==============================================
# 1. HEALTH CHECK
# ==============================================
echo "1️⃣ Health Check (verifica que BD está conectada)"
echo "GET $API_URL/servicio/v2/health"
echo ""
curl -s $API_URL/servicio/v2/health | jq .
echo ""
echo ""

# ==============================================
# 2. LISTAR INFORMES
# ==============================================
echo "2️⃣ Listar todos los informes"
echo "GET $API_URL/api/informes"
echo ""
curl -s $API_URL/api/informes | jq .
echo ""
echo ""

# ==============================================
# 3. CREAR INFORME
# ==============================================
echo "3️⃣ Crear un nuevo informe"
echo "POST $API_URL/api/informes"
echo ""
RESPONSE=$(curl -s -X POST $API_URL/api/informes \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Informe de Prueba - '$(date +'%Y-%m-%d %H:%M:%S')'",
    "descripcion": "Este es un informe de prueba creado desde el script de ejemplos",
    "usuario_id": 1
  }')

echo $RESPONSE | jq .
echo ""

# Extraer el ID del informe creado
INFORME_ID=$(echo $RESPONSE | jq -r '.data.id // empty')
echo "Nuevo informe creado con ID: $INFORME_ID"
echo ""
echo ""

# ==============================================
# 4. OBTENER INFORME ESPECÍFICO
# ==============================================
if [ ! -z "$INFORME_ID" ]; then
  echo "4️⃣ Obtener informe específico (ID: $INFORME_ID)"
  echo "GET $API_URL/api/informes/$INFORME_ID"
  echo ""
  curl -s $API_URL/api/informes/$INFORME_ID | jq .
  echo ""
  echo ""

  # ==============================================
  # 5. ACTUALIZAR INFORME
  # ==============================================
  echo "5️⃣ Actualizar informe (cambiar estado)"
  echo "PUT $API_URL/api/informes/$INFORME_ID"
  echo ""
  curl -s -X PUT $API_URL/api/informes/$INFORME_ID \
    -H "Content-Type: application/json" \
    -d '{
      "estado": "en_proceso",
      "descripcion": "Actualizado a las '$(date +'%H:%M:%S')'"
    }' | jq .
  echo ""
  echo ""
fi

# ==============================================
# 6. LISTAR CON FILTROS
# ==============================================
echo "6️⃣ Listar informes con filtros"
echo "GET $API_URL/api/informes?estado=en_proceso&usuario_id=1"
echo ""
curl -s "$API_URL/api/informes?estado=en_proceso&usuario_id=1" | jq .
echo ""
echo ""

# ==============================================
# RESUMEN
# ==============================================
echo "✅ Ejemplos completados"
echo ""
echo "Próximos pasos:"
echo "- Integra estos endpoints en tu frontend"
echo "- Agrega autenticación (JWT) cuando esté lista"
echo "- Implementa validación en el cliente"
echo ""
