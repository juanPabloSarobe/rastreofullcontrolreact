# EJEMPLO DE EJECUCIÓN DEL MONITOR

**Fecha:** 16 de Marzo 2026  
**Modo:** Desarrollo (AWS Secrets Manager)

---

## 1. EJECUCIÓN EN DESARROLLO

```bash
$ cd /Users/juanpablosarobe/Documents/rastreofullcontrolreact/backend-informes
$ NODE_ENV=development DEBUG=true node scripts/monitor-communication.mjs
```

### Output en DEBUG mode:

```
[2026-03-16T19:15:57.475Z] INFO: Iniciando Monitor de Comunicación 
{
  environment: 'development',
  nodeVersion: 'v22.22.0'
}

[2026-03-16T19:15:57.488Z] DEBUG: Usando configuración desde AWS Secrets Manager (DESARROLLO)

[2026-03-16T19:15:58.349Z] DEBUG: Configuración de BD obtenida 
{
  host: 'prod-cluster-1.c1q82mcagski.us-east-1.rds.amazonaws.com',
  database: 'isis'
}

[2026-03-16T19:15:58.349Z] DEBUG: Tabla objetivo 
{
  tableName: 'ActividadDiaria2026-03'
}

[2026-03-16T19:16:03.353Z] ERROR: Fallo crítico en monitor 
{
  message: 'Connection terminated due to connection timeout'
}
```

**Nota:** El timeout es esperado en desarrollo local (no hay conectividad a RDS desde aquí).

### Output final (siempre se genera):

```json
{
  "timestamp": "2026-03-16T19:16:03.353Z",
  "environment": "development",
  "status": "ERROR",
  "message": "Fallo en monitorización: Connection terminated due to connection timeout",
  "error": "Connection terminated due to connection timeout"
}
```

---

## 2. EJECUCIÓN EN PRODUCCIÓN (SIM)

Si ejecutamos el mismo script CON conectividad a RDS y S3, el output sería:

### Caso 1: Comunicación OK ✅

```bash
$ NODE_ENV=production node scripts/monitor-communication.mjs

# Output JSON (stdout):
{
  "timestamp": "2026-03-16T19:45:30.123Z",
  "environment": "production",
  "table": "ActividadDiaria2026-03",
  "eventCount": 47,
  "status": "OK",
  "message": "Comunicación normal (47 eventos)",
  "queryDurationMs": 42,
  "threshold": {
    "warning": "15",
    "ok": "20"
  }
}
```

**Además de stdout:**
- Se enviaría a S3: `s3://rastreofullcontrol-logs/communication-monitor/2026/03/16/19/monitor-2026-03-16T19-45-30.json`
- Se registraría en logs del cron
- Duración: ~5 segundos (timeout de query es 5seg)

### Caso 2: Comunicación WARNING ⚠️

```bash
$ NODE_ENV=production node scripts/monitor-communication.mjs

# Output JSON (stdout):
{
  "timestamp": "2026-03-16T19:50:15.456Z",
  "environment": "production",
  "table": "ActividadDiaria2026-03",
  "eventCount": 12,
  "status": "WARNING",
  "message": "Recepción baja (12 eventos)",
  "queryDurationMs": 38,
  "threshold": {
    "warning": "15",
    "ok": "20"
  }
}
```

**Además:**
- Se guardaba en S3 con mismo path
- Marcado como WARNING en metadata S3
- En Fase 2: Dispararía email/WhatsApp

### Caso 1: Comunicación OK ✅ (Horario diurno - Alto volumen)

```bash
$ NODE_ENV=production node scripts/monitor-communication.mjs

# Output JSON (stdout):
{
  "timestamp": "2026-03-16T19:45:30.123Z",
  "environment": "production",
  "table": "ActividadDiaria2026-03",
  "eventCount": 145,
  "status": "OK",
  "message": "Comunicación activa (145 eventos)",
  "queryDurationMs": 1200
}
```

### Caso 2: Comunicación OK ✅ (Horario nocturno - Bajo volumen)

```bash
$ NODE_ENV=production node scripts/monitor-communication.mjs

# Output JSON (stdout):
{
  "timestamp": "2026-03-16T22:45:30.456Z",
  "environment": "production",
  "table": "ActividadDiaria2026-03",
  "eventCount": 5,
  "status": "OK",
  "message": "Comunicación activa (5 eventos)",
  "queryDurationMs": 980
}
```

**Nota:** Aunque hay solo 5 eventos (vs 145 en el día), sigue siendo OK porque hay comunicación.

```bash
$ NODE_ENV=production node scripts/monitor-communication.mjs

# Output JSON (stdout):
{
  "timestamp": "2026-03-16T19:55:45.789Z",
  "environment": "production",
  "table": "ActividadDiaria2026-03",
  "eventCount": 0,
  "status": "CRITICAL",
  "message": "Sin comunicación - 0 eventos en últimos 10 segundos",
  "queryDurationMs": 1050
}
```

**En producción:**
- 🚨 Email crítico a alerts@company.com en <30s (Fase 2)
- 📱 WhatsApp a operador en <30s (Fase 2)
- Logged en S3 con CRITICAL en metadata
- Alert registrada en BD para auditoría (Fase 2)

### Caso 4: Error en Query ❌

```bash
$ NODE_ENV=production node scripts/monitor-communication.mjs

# Output JSON (stdout):
{
  "timestamp": "2026-03-16T20:00:00.000Z",
  "environment": "production",
  "status": "ERROR",
  "message": "Fallo en monitorización: deadline for query exceeded",
  "error": "deadline for query exceeded"
}
```

**Fallback:**
- Registrado en logs (stdout → cron)
- Enviado a S3 si credenciales AWS están OK
- En Fase 2: Alertaría también (ERROR es crítico)

---

## 3. EJECUCIÓN AUTOMÁTICA (Vía Cron)

```bash
*/5 * * * * cd /path/to/backend-informes && NODE_ENV=production node scripts/monitor-communication.mjs
```

**Cada 5 minutos, sin supervisión:**

```
[Horario diurno - Alto volumen]
[19:05]  ✅ OK      - 145 eventos
[19:10]  ✅ OK      - 152 eventos
[19:15]  ✅ OK      - 148 eventos

[Horario nocturno - Bajo volumen]
[22:05]  ✅ OK      - 8 eventos  (unidades paradas reportando)
[22:10]  ✅ OK      - 12 eventos
[22:15]  ✅ OK      - 5 eventos

[CAÍDA DEL MÓDULO]
[23:20]  🔴 CRITICAL - 0 eventos   ← ALERTAS ENVIADAS (Fase 2)
[23:25]  🔴 CRITICAL - 0 eventos   ← ALERTAS RE-ENVIADAS (dedup)
[23:30]  🔴 CRITICAL - 0 eventos
[23:35]  ✅ OK      - 1 evento    ← RESUELTO
[23:40]  ✅ OK      - 42 eventos
```

**Ventaja de esta lógica:**
- ✅ Detecto caídas independientemente del horario
- ✅ No me confunde el cambio de volumen (día vs noche)
- ✅ Simple: cualquier evento es bueno

---

## 4. VISUALIZACIÓN DE RESULTADOS

### Ver logs guardados en S3

```bash
$ node scripts/view-communication-logs.mjs today

📁 Listando logs en S3: s3://rastreofullcontrol-logs/communication-monitor/2026/03/16/

Hora 19:00
  2026-03-16T19:05:00.000Z - monitor-2026-03-16T19-05-00.json
  2026-03-16T19:10:00.000Z - monitor-2026-03-16T19-10-00.json
  2026-03-16T19:15:00.000Z - monitor-2026-03-16T19-15-00.json
  
Hora 19:20
  2026-03-16T19:20:15.456Z - monitor-2026-03-16T19-20-15.json
  2026-03-16T19:25:45.789Z - monitor-2026-03-16T19-25-45.json
  2026-03-16T19:30:00.000Z - monitor-2026-03-16T19-30-00.json
  2026-03-16T19:35:30.123Z - monitor-2026-03-16T19-35-30.json
  2026-03-16T19:40:15.456Z - monitor-2026-03-16T19-40-15.json
  2026-03-16T19:45:00.000Z - monitor-2026-03-16T19-45-00.json

✓ Total de archivos: 10
```

### Ver últimos reportes

```bash
$ node scripts/view-communication-logs.mjs today

Últimos 12 logs para today:

[19:45:00] ✅ OK - Events: 46 - Comunicación normal (46 eventos)
[19:40:00] ✅ OK - Events: 31 - Comunicación normal (31 eventos)
[19:35:30] 🔴 CRITICAL - Events: 0 - No se reciben datos (0 eventos)
[19:35:00] 🔴 CRITICAL - Events: 0 - No se reciben datos (0 eventos)
[19:30:00] 🔴 CRITICAL - Events: 0 - No se reciben datos (0 eventos)
[19:25:45] ⚠️ WARNING - Events: 8 - Recepción baja (8 eventos)
[19:20:15] ⚠️ WARNING - Events: 12 - Recepción baja (12 eventos)
[19:15:00] ✅ OK - Events: 52 - Comunicación normal (52 eventos)
[19:10:00] ✅ OK - Events: 48 - Comunicación normal (48 eventos)
[19:05:00] ✅ OK - Events: 45 - Comunicación normal (45 eventos)
```

### Ver estadísticas

```bash
$ node scripts/view-communication-logs.mjs stats today

Estadísticas de logs para today:

Total de reportes:     12
✅ OK:          7
⚠️ WARNING:     2
🔴 CRITICAL:    3
❌ ERROR:       0

Eventos por 10 segundos:
  Promedio:  31.50
  Mínimo:    0
  Máximo:    52
  Total:     378
```

---

## 5. INTERPRETACIÓN DE RESULTADOS

### Status = "OK" ✅
- **Condición:** > 0 eventos en últimos 10 segundos
- **Significado:** Comunicación activa (sin importar si es 1 o 150 eventos)
- **Acción:** Ninguna, continuar monitoreando
- **Variaciones normales:**
  - Día (dispositivos en movimiento): 100-200 eventos
  - Noche (dispositivos parados): 5-20 eventos
  - Ambas son OK si > 0
- **Confianza:** Muy alta

### Status = "CRITICAL" 🔴
- **Condición:** Exactamente 0 eventos en últimos 10 segundos
- **Significado:** Sin comunicación - módulo receptor descendió o desconectado
- **Acción:** INMEDIATA - Investigar y reiniciar módulo/conexión
- **Confirmar:** La caída es real (esperar otro reporte si quieres estar seguro)
- **Fase 2:** Alertaría por email + WhatsApp en <30 segundos
- **Confianza:** Crítica (100% indicativa de problema)

---

## 6. BASELINE ESPERADO

Para un sistema normal en producción:

```
RANGO NORMAL (sin considerar horario):
  Mínimo: 1 evento/10seg (1 móvil parado reportando)
  Máximo: 200+ eventos/10seg (múltiples móviles en movimiento)
  
CUALQUIER VALOR > 0 = OK
```

**Cambios normales esperados:**

| Horario | Evento típico | Razón | Status |
|---------|--------------|-------|--------|
| 08:00-19:00 | 80-150 eventos | Vehículos en movimiento (reportan 1/min) | ✅ OK |
| 19:00-23:00 | 40-80 eventos | Vehículos volviendo a base | ✅ OK |
| 23:00-08:00 | 5-30 eventos | Vehículos parados (reportan 1/25min) | ✅ OK |

**Indicador de problema:**
```
eventCount = 0  →  🔴 CRITICAL - Sin duda hay problema
```

No hay zona gris: o hay datos o no los hay.

---

## 7. PRÓXIMO PASO: FASE 2

Cuando Fase 2 esté implementada, cada vez que veas CRITICAL o WARNING:

1. **Automáticamente** recibirás email en <30 seg
2. **Automáticamente** recibirás WhatsApp en <30 seg
3. **Deduplicación** evitará spam (máx 1 alerta/minuto)
4. **Dashboard** en frontend mostrará en tiempo real

Ahora espera solo a que:
- Se configure S3 en servidor
- Se agregue cron/timer
- Se espere 1 semana de estabilidad
- LUEGO agregar Fase 2 (Email/WhatsApp)
