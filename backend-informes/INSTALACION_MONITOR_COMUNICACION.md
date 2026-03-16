# GUÍA DE INSTALACIÓN - Monitor de Comunicación

**Fase 1 (MVP):** Monitoreo básico + Logs

---

## 1. PRE-REQUISITOS

- Node.js >= 16.18.0 (ya instalado en producción)
- Acceso a RDS PostgreSQL
- PostgreSQL client libraries (ya disponibles via `pg` npm package)
- Credenciales de BD (AWS Secrets Manager en dev, env vars en prod)

---

## 2. INSTALACIÓN DE DEPENDENCIAS

```bash
cd /path/to/backend-informes
npm install pg dotenv @aws-sdk/client-secrets-manager @aws-sdk/client-s3
# Si ya están instaladas, verificar con: npm ls pg dotenv @aws-sdk/client-s3
```

---

## 3. CONFIGURACIÓN EN DESARROLLO

El script ya existe en: `backend-informes/scripts/monitor-communication.mjs`

**Opción A: Usar AWS Secrets Manager (recomendado para dev)**

```bash
# El script detectará automáticamente:
# - NODE_ENV=development
# - USE_AWS_SECRETS=true (en .env)
# Y obtendrá credenciales de AWS Secrets Manager

NODE_ENV=development node scripts/monitor-communication.mjs
```

**Opción B: Usar variables de entorno locales (si AWS no está disponible)**

```bash
# Crear .env local con credenciales:
NODE_ENV=development \
DB_HOST=prod-cluster-x.rds.amazonaws.com \
DB_PORT=5432 \
DB_NAME=isis \
DB_USER=tu_usuario \
DB_PASSWORD=tu_password \
USE_AWS_SECRETS=false \
node scripts/monitor-communication.mjs
```

---

## 4. CONFIGURACIÓN EN PRODUCCIÓN

### Paso 1: Preparar archivo `.env` en servidor

Copiar `.env.monitor.example` → `.env` en el servidor y completar:

```bash
# SSH a servidor de producción
ssh prod-server

# Copiar template
cp /path/to/backend-informes/.env.monitor.example /path/to/backend-informes/.env

# Editar con credenciales reales
nano /path/to/backend-informes/.env
```

**Campos obligatorios en producción:**

```env
NODE_ENV=production
DB_HOST=prod-cluster-1.c1q82mcagski.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=isis
DB_USER=isis
DB_PASSWORD=tu_password_seguro
COMMUNICATION_MONITOR_ENABLED=true
COMMUNICATION_THRESHOLD_WARNING=15
COMMUNICATION_THRESHOLD_OK=20
COMMUNICATION_LOG_FILE=/var/log/rastreofullcontrol/communication-health.log
```

### Paso 2: Crear directorio de logs (si no existe)

```bash
sudo mkdir -p /var/log/rastreofullcontrol
sudo chown app_user:app_group /var/log/rastreofullcontrol
sudo chmod 755 /var/log/rastreofullcontrol
```

### Paso 3: Probar manualmente

```bash
cd /path/to/backend-informes
NODE_ENV=production node scripts/monitor-communication.mjs
```

**Salida esperada si está OK:**

```json
{
  "timestamp": "2026-03-16T19:30:45.123Z",
  "environment": "production",
  "table": "ActividadDiaria2026-03",
  "eventCount": 47,
  "status": "OK",
  "message": "Comunicación normal (47 eventos)",
  "queryDurationMs": 42,
  ...
}
```

**Si hay CRITICAL (0 eventos):**

```json
{
  "status": "CRITICAL",
  "message": "No se reciben datos (0 eventos)",
  ...
}
```

---

## 5. INSTALACIÓN DE CRON JOB

### Opción A: Usar crontab del usuario (Simple)

```bash
# Editar crontab
crontab -e

# Agregar línea:
*/5 * * * * cd /path/to/backend-informes && NODE_ENV=production node scripts/monitor-communication.mjs >> /var/log/communication-monitor.log 2>&1
```

### Opción B: Usar systemd timer (Recomendado para producción)

Crear archivo: `/etc/systemd/system/communication-monitor.service`

```ini
[Unit]
Description=Communication Monitor
After=network.target
OnFailure=communication-monitor-failure@%n.service

[Service]
Type=oneshot
User=app_user
WorkingDirectory=/path/to/backend-informes
Environment="NODE_ENV=production"
ExecStart=/usr/bin/node /path/to/backend-informes/scripts/monitor-communication.mjs
StandardOutput=append:/var/log/rastreofullcontrol/communication-health.log
StandardError=append:/var/log/rastreofullcontrol/communication-health.log
Restart=on-failure
RestartSec=10

# Si el job falla, registrar en logs de app
OnFailure=communication-monitor-failure@%n.service
```

Crear timer: `/etc/systemd/system/communication-monitor.timer`

```ini
[Unit]
Description=Run Communication Monitor every 5 minutes
Requires=communication-monitor.service

[Timer]
OnBootSec=1min
OnUnitActiveSec=5min
Persistent=true

[Install]
WantedBy=timers.target
```

Activar:

```bash
sudo systemctl daemon-reload
sudo systemctl enable communication-monitor.timer
sudo systemctl start communication-monitor.timer
sudo systemctl status communication-monitor.timer
```

Verificar ejecución:

```bash
sudo systemctl list-timers
sudo journalctl -u communication-monitor.service -f
```

---

## 6. ALMACENAMIENTO DE LOGS

### Estrategia Recomendada: Amazon S3 (Sin llenar la instancia)

**Por defecto, el script envía los logs a S3** en lugar de la instancia EC2.

**Estructura en S3:**
```
s3://rastreofullcontrol-logs/
└─ communication-monitor/
   └─ 2026/
      └─ 03/
         └─ 16/              # Día
            ├─ 19/           # Hora
            │  ├─ monitor-2026-03-16T19-35-00.json
            │  ├─ monitor-2026-03-16T19-40-00.json
            │  └─ monitor-2026-03-16T19-45-00.json
```

### Configuración en .env

```env
# S3 - Producción (RECOMENDADO)
NODE_ENV=production
COMMUNICATION_LOG_BUCKET=rastreofullcontrol-logs
AWS_REGION=us-east-1
```

**Ventajas:**
- ✅ Sin acumulación en instancia EC2
- ✅ Queryable via AWS Athena SQL
- ✅ Retención automática (90 días por defecto)
- ✅ Seguro y auditable
- ✅ Costo negligible (~$0.04/mes para nuestro volumen)

### Configurar S3

```bash
# 1. Crear bucket
aws s3api create-bucket --bucket rastreofullcontrol-logs --region us-east-1

# 2. Asegurar permisos IAM - la instancia EC2 necesita:
# {
#   "Effect": "Allow",
#   "Action": "s3:PutObject",
#   "Resource": "arn:aws:s3:::rastreofullcontrol-logs/communication-monitor/*"
# }

# 3. Configurar ciclo de vida (eliminar logs después de 90 días)
aws s3api put-bucket-lifecycle-configuration --bucket rastreofullcontrol-logs \
  --lifecycle-configuration '{
    "Rules": [{
      "Id": "DeleteOldLogs",
      "Status": "Enabled",
      "Prefix": "communication-monitor/",
      "Expiration": {"Days": 90}
    }]
  }'
```

### Ver logs desde S3

**Opción A: Script helper**

```bash
# Ver últimos 12 reportes del día
node scripts/view-communication-logs.mjs today

# Ver estadísticas
node scripts/view-communication-logs.mjs stats today

# Ver logs de hace 3 días
node scripts/view-communication-logs.mjs 2026-03-13
```

**Opción B: AWS CLI directo**

```bash
# Ver archivos del día
aws s3 ls s3://rastreofullcontrol-logs/communication-monitor/2026/03/16/ --recursive | tail -5

# Descargar el último
aws s3 cp s3://rastreofullcontrol-logs/communication-monitor/2026/03/16/19/monitor-2026-03-16T19-45-00.json - | jq '.'
```

---

## 6. VERIFICACIÓN

## 7. VERIFICACIÓN

### Probar manualmente

```bash
cd /path/to/backend-informes
NODE_ENV=production node scripts/monitor-communication.mjs
```

**Salida esperada si está OK:**

```json
{
  "timestamp": "2026-03-16T19:30:45.123Z",
  "environment": "production",
  "table": "ActividadDiaria2026-03",
  "eventCount": 47,
  "status": "OK",
  "message": "Comunicación normal (47 eventos)",
  "queryDurationMs": 42,
  ...
}
```

### Ver logs en S3

```bash
# Último reporte
node scripts/view-communication-logs.mjs today | head -5

# Estadísticas del día
node scripts/view-communication-logs.mjs stats today
```

### Logs locales (si está configurado COMMUNICATION_LOG_FILE)

```bash
# Ver últimas líneas
tail -50 /var/log/communication-monitor.log

# Ver en tiempo real
tail -f /var/log/communication-monitor.log

# Ver solo estados WARNING/CRITICAL
grep '"status":"CRITICAL"' /var/log/communication-monitor.log
```

---

## 8. TROUBLESHOOTING

### Error: "Module not found: 'pg'"

```bash
cd backend-informes
npm install pg dotenv
```

### Error: "Connection timeout"

```bash
# Verificar conectividad a RDS
nc -zv prod-cluster-1.c1q82mcagski.us-east-1.rds.amazonaws.com 5432

# Verificar credenciales
echo "SELECT NOW();" | psql -h $DB_HOST -U $DB_USER -d $DB_NAME
```

### Secretos no se obtienen de AWS

```bash
# Verificar credenciales AWS CLI
aws sts get-caller-identity
aws secretsmanager get-secret-value --secret-id basededatosisis --region us-east-1
```

---

## 9. PRÓXIMOS PASOS (Fase 2 - Futuro)

- [ ] Agregar alertas por Email (SMTP)
- [ ] Integrar WhatsApp (Twilio)
- [ ] Deduplicación de alertas (no mandar la misma alerta 100 veces)
- [ ] Dashboard en frontend (API endpoints + React components)

---

## 10. ROLLBACK

Si el monitor causa problemas:

```bash
# Desabilitar cron/timer
crontab -e  # Comentar la línea
# O
sudo systemctl stop communication-monitor.timer
sudo systemctl disable communication-monitor.timer

# Los logs precedentes quedan en:
/var/log/rastreofullcontrol/communication-health.log
```

Para restaurar estado anterior:

```bash
# Borrar el script (volver a versión sin monitor)
rm /path/to/backend-informes/scripts/monitor-communication.mjs
```

---

## 11. VALIDACIÓN FINAL

Después de 5 minutos de que el cron está corriendo:

```bash
# Ver logs en S3
node scripts/view-communication-logs.mjs today

# Si todo está bien, deberías ver:
# [19:35:00] OK - Events: 47 - Comunicación normal (47 eventos)
# [19:40:00] OK - Events: 52 - Comunicación normal (52 eventos)
# [19:45:00] OK - Events: 48 - Comunicación normal (48 eventos)

# Verificar estadísticas
node scripts/view-communication-logs.mjs stats today
# Deberías ver que la mayoría son "OK" con evento count cerca de 27 eventos/10seg
```
