# Estrategia de Almacenamiento de Logs - S3

**Implementación:** 16 de Marzo 2026  
**Objetivo:** Evitar llenar la instancia con logs, usar S3 como store centralizado

---

## 1. ARQUITECTURA

### SIN S3 (Problema)
```
Instancia EC2
├─ /var/log/communication-health.log
│  ├─ 1 línea JSON cada 5 minutos
│  ├─ ~288 líneas/día = ~80 KB/día
│  ├─ ~2.4 MB/mes
│  └─ ⚠️ Después de 1 año = ~29 MB + rotación requerida
└─ Problema: Acumulación, necesita logrotate, mantenimiento
```

### CON S3 (Solución)
```
Instancia EC2
├─  Script ejecuta cada 5 min
│
└─→ Envía JSON a S3 con estructura particionada
    s3://bucket/communication-monitor/
    ├─ 2026/
    │  ├─ 03/
    │  │  ├─ 16/
    │  │  │  ├─ 19/
    │  │  │  │  ├─ monitor-2026-03-16T19-35-00.json
    │  │  │  │  ├─ monitor-2026-03-16T19-40-00.json
    │  │  │  │  └─ monitor-2026-03-16T19-45-00.json
    │  │  │  ├─ 20/
    │  │  │  │  └─ ...
    │  │  ├─ 17/
    │  │  │  └─ ...

Ventajas:
✅ Sin acumulación en instancia
✅ Queryable via AWS Athena
✅ Searchable via S3 Select
✅ Retención configurable (Lifecycle rules)
✅ Auditable y archivable
```

---

## 2. CONFIGURACIÓN EN PRODUCCIÓN

### Paso 1: Habilitar S3

En el servidor, editar `.env`:

```env
# Producción con S3
NODE_ENV=production
COMMUNICATION_LOG_BUCKET=rastreofullcontrol-logs
AWS_REGION=us-east-1

# Optional: si quiere también guardar localmente para debugging:
# COMMUNICATION_LOG_FILE=/var/log/communication-health-local.log
```

### Paso 2: Crear bucket S3

```bash
aws s3api create-bucket \
  --bucket rastreofullcontrol-logs \
  --region us-east-1

# Asegurar acceso solo a app role
aws s3api put-bucket-policy --bucket rastreofullcontrol-logs --policy '{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"AWS": "arn:aws:iam::ACCOUNT_ID:role/fullcontrol-app"},
    "Action": "s3:PutObject",
    "Resource": "arn:aws:s3:::rastreofullcontrol-logs/communication-monitor/*"
  }]
}'

# Lifecycle rule: eliminar logs después de 90 días
aws s3api put-bucket-lifecycle-configuration --bucket rastreofullcontrol-logs --lifecycle-configuration '{
  "Rules": [{
    "Id": "DeleteOldMonitorLogs",
    "Status": "Enabled",
    "Prefix": "communication-monitor/",
    "Expiration": {"Days": 90}
  }]
}'

# Bloquear acceso público
aws s3api put-public-access-block --bucket rastreofullcontrol-logs --public-access-block-configuration '{
  "BlockPublicAcls": true,
  "IgnorePublicAcls": true,
  "BlockPublicPolicy": true,
  "RestrictPublicBuckets": true
}'
```

### Paso 3: Permisos IAM para la instancia

La instancia necesita permiso `PutObject` en S3:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": "s3:PutObject",
    "Resource": "arn:aws:s3:::rastreofullcontrol-logs/communication-monitor/*"
  }]
}
```

Asignar este policy al role de la instancia EC2.

---

## 3. CAMBIO DE COMPORTAMIENTO EN SCRIPT

### Antes (Solo archivo local)
```bash
EOF
*/5 * * * * node scripts/monitor-communication.mjs >> /var/log/communication-health.log 2>&1
# Resultado: 1 línea JSON guardada en archivo local
```

### Después (S3 + opcional local)
```bash
*/5 * * * * node scripts/monitor-communication.mjs
# Resultado: 
#   1. JSON enviado a S3: s3://rastreofullcontrol-logs/communication-monitor/2026/03/16/19/monitor-2026-03-16T19-35-00.json
#   2. JSON impreso en stdout (capturado por cron)
#   3. Si COMMUNICATION_LOG_FILE está configurado, TAMBIÉN guarda localmente (para debugging)
```

---

## 4. CÓMO LEER LOS LOGS

### Opción A: Ver desde terminal (Rápido)

```bash
# Ver último reporte del día
aws s3 ls s3://rastreofullcontrol-logs/communication-monitor/2026/03/16/ --recursive | tail -5

# Descargar el último
aws s3 cp s3://rastreofullcontrol-logs/communication-monitor/2026/03/16/19/monitor-2026-03-16T19-45-00.json - | jq '.'

# Ver todos los del día (descargar + parsear)
aws s3 cp s3://rastreofullcontrol-logs/communication-monitor/2026/03/16/ . --recursive
cat 19/*.json | jq '.status' | sort | uniq -c
```

### Opción B: Consultar en Athena (Recomendado para análisis)

Crear tabla Athena sobre S3:

```sql
CREATE EXTERNAL TABLE communication_monitor (
  timestamp string,
  environment string,
  table string,
  eventCount int,
  status string,
  message string,
  queryDurationMs int,
  threshold struct<warning: int, ok: int>
)
STORED AS JSON
LOCATION 's3://rastreofullcontrol-logs/communication-monitor/'
TBLPROPERTIES (
  'classification' = 'json',
  'skip.header.line.count'='0'
);

-- Query: Ver últimas alertas CRITICAL
SELECT timestamp, eventCount, message 
FROM communication_monitor 
WHERE status = 'CRITICAL' 
ORDER BY timestamp DESC 
LIMIT 10;

-- Query: Contar eventos OK vs WARNING vs CRITICAL hoy
SELECT status, COUNT(*) as occurrences
FROM communication_monitor
WHERE date(from_iso8601_timestamp(timestamp)) = current_date
GROUP BY status
ORDER BY occurrences DESC;

-- Query: Eventos promedio por hora
SELECT 
  date_format(from_iso8601_timestamp(timestamp), '%Y-%m-%d %H:00') as hour,
  AVG(eventCount) as avg_events,
  MIN(eventCount) as min_events,
  MAX(eventCount) as max_events
FROM communication_monitor
WHERE date(from_iso8601_timestamp(timestamp)) = current_date
GROUP BY date_format(from_iso8601_timestamp(timestamp), '%Y-%m-%d %H:00')
ORDER BY hour;
```

### Opción C: S3 Select (Rápido sin Athena)

```bash
# Buscar todos lo reportes WARNING/CRITICAL del archivo
aws s3api select-object-content \
  --bucket rastreofullcontrol-logs \
  --key communication-monitor/2026/03/16/19/monitor-2026-03-16T19-45-00.json \
  --expression-type SQL \
  --expression "SELECT * FROM s3object WHERE status != 'OK'" \
  --input-serialization '{"JSON": {}}' \
  --output-serialization '{"JSON": {}}' \
  output.json

cat output.json | jq '.'
```

---

## 5. MONITOREO EN TIEMPO REAL (Dashboard alternativo)

### Script para monitorear últimos reportes

```bash
#!/bin/bash
# watch-communication-monitor.sh

while true; do
  # Descargar últimas 3 horas
  TODAY=$(date +%Y/%m/%d)
  HOUR=$(date +%H)
  PREV_HOUR=$((HOUR - 1))
  
  echo "=== Monitor de Comunicación - Últimas 3 horas ==="
  echo "Hora actual: $(date '+%Y-%m-%d %H:%M:%S')"
  echo ""
  
  for file in $(aws s3 ls s3://rastreofullcontrol-logs/communication-monitor/$TODAY/$HOUR/ --recursive | awk '{print $4}' | tail -6); do
    aws s3 cp "s3://rastreofullcontrol-logs/$file" - | jq -c '{timestamp: .timestamp, status: .status, eventCount: .eventCount}' 2>/dev/null
  done
  
  echo ""
  echo "Próxima actualización en 30 segundos..."
  sleep 30
  clear
done
```

Usar:
```bash
chmod +x watch-communication-monitor.sh
./watch-communication-monitor.sh
```

---

## 6. COSTOS S3

### Estimado

```
Logs por ejecución:  ~500 bytes (1 JSON)
Ejecuciones/día:     288 (cada 5 minutos)
Datos/día:           144 KB
Datos/mes:           ~4.3 MB
Datos/año:           ~51.6 MB

Costos AWS (1 millón de PutObject = $5.00):
  Nuestro: 288 * 30 = 8,640 PutObjects/mes >= $0.04/mes

Pero si TAMBIÉN están guardando otros logs en S3...
Lo mejor es meter TODO en el mismo bucket con prefixes diferentes.
```

**Conclusión:** Para nuestro volumen, el costo es casi cero (~$0.04-0.08/mes).

---

## 7. FALLBACK LOCAL

Si S3 falla (credenciales, sin conectividad, cuenta limitada), el script automáticamente:

1. Registra que falló S3
2. Continúa imprimiendo en stdout (será capturado por cron)
3. Si `COMMUNICATION_LOG_FILE` está configurado, también guarda localmente

**Ejemplo de fallback:**
```json
{"timestamp":"2026-03-16T19:40:00Z","environment":"production","status":"OK",...}
```

El output siempre llega a algún lado.

---

## 8. CONFIGURACIÓN RECOMENDADA POR ENTORNO

### Desarrollo (Local)
```env
COMMUNICATION_LOG_FILE=/tmp/communication-health.log
# S3_BUCKET no configurado (usa fallback local)
```

### Testing (Pre-prod)
```env
COMMUNICATION_LOG_BUCKET=rastreofullcontrol-logs-test
COMMUNICATION_LOG_FILE=/var/log/communication-health.log  # backup local
```

### Producción
```env
COMMUNICATION_LOG_BUCKET=rastreofullcontrol-logs
# NO configurar COMMUNICATION_LOG_FILE (evitar saturar /var/log)
```

---

## 9. MIGRACIÓN DESDE ARCHIVO LOCAL A S3

Si ya tiene logs antiguos:

```bash
# Subir archivos históricos a S3
aws s3 sync /var/log/rastreofullcontrol/ s3://rastreofullcontrol-logs/communication-monitor/archived/

# Después, limpiar locales
# rm /var/log/rastreofullcontrol/communication-health.log*
```

---

## 10. ALERTAS + DASHBOARDS EN FASE 2

Cuando agregues alertas por email/WhatsApp, puedes usar Athena para:

```sql
-- Trigger alertas solo si hay 3+ eventos CRITICAL en última hora
SELECT COUNT(*) as critical_count, MIN(timestamp) as first_alert
FROM communication_monitor
WHERE status = 'CRITICAL' 
  AND from_iso8601_timestamp(timestamp) > now() - interval '1 hour'
HAVING COUNT(*) >= 3;
```

---

**Próximo paso:** ¿Quieres que configure el boto3 script que se conecte a Athena y te muestre las alertas directamente del dashboard frontend?
