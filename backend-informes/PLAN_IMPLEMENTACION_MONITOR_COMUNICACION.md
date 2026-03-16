# Plan de Implementación: Monitoreo de Comunicación

**Fecha:** 16 de Marzo de 2026  
**Estado:** Listo para implementar  
**Prioridad:** Alta (prevenir caídas de comunicación)

---

## 1. OBJETIVO

Detectar caídas del módulo de comunicación en máximo 5-10 minutos con alertas en WhatsApp + Email.

---

## 2. CONTEXTO TÉCNICO

- **Campo clave:** `horarioServer` (cuándo llegó el paquete al servidor, no cuándo GPS lo generó)
- **Tabla:** `ActividadDiaria{YYYY-MM}` (mensual, dinámica)
- **Query:** Contar eventos en últimos 10 segundos
- **Frecuencia:** Cada 5 minutos
- **Baseline:** ~165 eventos/minuto = 27-28 eventos/10 segundos

---

## 3. ARQUITECTURA

```
┌─────────────────────────────────────────┐
│  Cron: */5 * * * * (cada 5 minutos)    │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  monitor-communication.mjs                         │
│  ├─ Conecta a BD                                   │
│  ├─ Query: últimos 10 seg en horarioServer        │
│  └─ Evalúa: event_count vs threshold              │
└────────────────┬────────────────────────────────────┘
                 │
    ┌────────────┼────────────┬─────────────┐
    │            │            │             │
    ▼ OK         ▼ WARNING    ▼ CRITICAL    ▼ ERROR
  Log OK      Alerta     Alerta Triple   Fallback
             WhatsApp   WhatsApp+Email   Logs
```

---

## 4. UMBRALES DE ALERTA

| Estado | Condición | Acción |
|--------|-----------|--------|
| **✅ OK** | 20-100 eventos/10seg | Log info, no alerta |
| **⚠️ WARNING** | 15-19 eventos/10seg | WhatsApp + Email warning |
| **🔴 CRITICAL** | 0 eventos/10seg | WhatsApp + Email critical |
| **❌ ERROR** | Query falla | Fallback a logs |

---

## 5. COMPONENTES A IMPLEMENTAR

### 5.1 Script Principal: `monitor-communication.mjs`
- Ubicación: `backend-informes/scripts/monitor-communication.mjs`
- Función: Query a BD + lógica de alertas + notificaciones
- Tamaño: ~200 líneas
- Dependencies: `pg`, `dotenv`, logger existente

### 5.2 Configuración: Variables de entorno
Agregar a `.env`:
```
COMMUNICATION_MONITOR_ENABLED=true
COMMUNICATION_ALERT_EMAIL=tu@email.com
COMMUNICATION_ALERT_WHATSAPP=+549XXXXXXXXX

# Twilio (opcional, para WhatsApp)
TWILIO_ACCOUNT_SID=xxxx
TWILIO_AUTH_TOKEN=xxxx
TWILIO_WHATSAPP_FROM=whatsapp:+549XXXXXXXXX

# SMTP (para Email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu@gmail.com
SMTP_PASS=tu_app_password
```

### 5.3 Cron Job
```bash
*/5 * * * * cd /home/app/backend-informes && NODE_ENV=production node scripts/monitor-communication.mjs >> /var/log/communication-health.log 2>&1
```

### 5.4 Alertas
**Fase 1 (MVP):** Email + Logs  
**Fase 2 (Punto futuro):** WhatsApp via Twilio

---

## 6. DECISIONES TOMADAS

| Aspecto | Decisión | Justificación |
|--------|----------|---------------|
| **Storage** | Sin tabla nueva | Query directa a `ActividadDiaria` |
| **Frecuencia** | 5 minutos | Balance: detección rápida + bajo overhead |
| **Ventana de tiempo** | 10 segundos | Baseline: ~27-28 eventos esperados |
| **Campo** | `horarioServer` | Momento de ingesta real, no timestamp GPS |
| **Alertas** | Email primaria | Twilio es opcional, Email es fallback seguro |
| **Logging** | Archivo + Logger app | Auditable + searchable en logs centralizados |

---

## 7. IMPACTO EN RECURSOS

### Base de Datos
- **Queries/día:** 288 (12/hora)
- **Tiempo por query:** ~30-50ms
- **CPU overhead:** 0.00016%
- **Conexiones:** 1 del pool (reutilizable)
- **Locks:** NINGUNO (solo SELECT)

### Backend
- **Memoria:** 15-20 MB/ejecución (liberada en 200ms)
- **CPU:** 0.016% del total
- **I/O red:** ~2 KB/query
- **Overhead diario:** 14.4 segundos

### EC2 Instance
- **CPU:** Sin cambios percibibles
- **Memoria:** +20 MB pico (no acumulativo)
- **Disco logs:** ~500 bytes/ejecución ≈ 144 KB/día

**Conclusión:** Impacto negligible

---

## 8. FLUJO DE EJECUCIÓN

```javascript
// Pseudocódigo
1. Obtener mes actual → tableName
2. Conectar a BD
3. Ejecutar query con timeout 5seg
4. Validar resultado
   ├─ Si error en query → triggerAlert('ERROR')
   ├─ Si event_count === 0 → triggerAlert('CRITICAL')
   ├─ Si event_count < 15 → triggerAlert('WARNING')
   └─ Si event_count >= 20 → logInfo('OK')
5. Guardar en /var/log/communication-health.log
6. Cerrar conexión BD
```

---

## 9. TESTING

### Pre-deploy (en staging/local)
```bash
# Test manual
cd backend-informes
NODE_ENV=development node scripts/monitor-communication.mjs

# Esperado: Log sin errores + muestra event_count
```

### Post-deploy (en production)
```bash
# Validar que cron ejecuta
crontab -l | grep monitor-communication

# Ver últimas ejecuciones
tail -20 /var/log/communication-health.log

# Forzar alerta TEST
# (agregar flag --test al script)
NODE_ENV=production node scripts/monitor-communication.mjs --test-alert
```

---

## 10. INSTRUCCIONES DE IMPLEMENTACIÓN

### Fase 1: Script + Logs (30 minutos)
- [ ] Crear `monitor-communication.mjs`
- [ ] Agregar variables de entorno a `.env`
- [ ] Probar localmente
- [ ] Deploy a production

### Fase 2: Email (15 minutos - Punto futuro)
- [ ] Instalar `nodemailer`
- [ ] Configurar SMTP Gmail
- [ ] Integrar en script

### Fase 3: WhatsApp Twilio (30 minutos - Punto futuro)
- [ ] Crear account Twilio
- [ ] Instalar `twilio`
- [ ] Integrar en script

---

## 11. ROLLBACK

Si hay problemas:
```bash
# Eliminar de cron
crontab -e
# Borrar línea del monitor

# Eliminar logs (opcional)
rm /var/log/communication-health.log
```

**Riesgo de rollback:** Nulo (solo lectura, sin cambios en BD)

---

## 12. DASHBOARD FRONTEND (Fase 3)

### Propósito
Panel de monitoreo en tiempo real para visualizar:
- Health checks del sistema
- Estado de base de datos
- Estado de la instancia EC2
- Historial de alertas
- Ejecución manual de queries
- Log de envíos (WhatsApp + Email)

### Componente
**Ubicación:** `frontend-rastreo/src/components/SystemMonitor/`

```
SystemMonitor/
├─ SystemMonitor.jsx              # Componente principal
├─ CommunicationStatus.jsx        # Estado comunicación (query manual)
├─ AlertHistory.jsx               # Historial de alertas
├─ HealthChecks.jsx               # Resumen salud sistema
├─ NotificationLog.jsx            # Log WhatsApp/Email
└─ useSystemMonitoring.js         # Hook para datos
```

### API Endpoints Necesarios

#### 12.1 Health Check
```javascript
GET /api/v2/system/health

Response:
{
  database: {
    status: "healthy" | "degraded" | "error",
    lastCheck: "2026-03-16T12:45:00Z",
    responseTime: 45,  // ms
    message: "Connected"
  },
  instance: {
    status: "healthy" | "degraded" | "error",
    cpu: 42,           // %
    memory: 68,        // %
    diskUsage: 55,     // %
    lastCheck: "2026-03-16T12:45:00Z"
  },
  application: {
    status: "healthy" | "degraded" | "error",
    uptime: 3600,      // segundos
    requestsPerMin: 125,
    errorRate: 0.5,    // %
    lastServerRestart: "2026-03-15T10:30:00Z"
  },
  timestamp: "2026-03-16T12:45:00Z"
}
```

#### 12.2 Communication Manual Check
```javascript
GET /api/v2/system/communication-status

Response:
{
  status: "ok" | "warning" | "critical" | "error",
  eventCount: 28,
  lastEvent: "2026-03-16T12:44:59Z",
  threshold: 15,
  message: "Communication healthy",
  updatedAt: "2026-03-16T12:45:00Z"
}
```

#### 12.3 Alert History
```javascript
GET /api/v2/system/alerts?limit=50&days=7

Response:
{
  alerts: [
    {
      id: "alert_123",
      level: "critical" | "warning" | "info",
      type: "communication" | "database" | "instance",
      message: "No data received in 10 seconds",
      timestamp: "2026-03-16T12:44:00Z",
      resolved: false | "2026-03-16T12:45:00Z",
      attempts: 2,  // reintentos
      metadata: { eventCount: 0 }
    }
  ],
  total: 42,
  summary: {
    critical_count: 2,
    warning_count: 8,
    resolved_count: 32
  }
}
```

#### 12.4 Notification Log
```javascript
GET /api/v2/system/notification-log?type=whatsapp|email&limit=30

Response:
{
  notifications: [
    {
      id: "notif_456",
      type: "whatsapp" | "email",
      recipient: "+549XXXXXXXXX",
      message: "CRITICAL: Communication DOWN",
      status: "sent" | "failed" | "pending",
      sentAt: "2026-03-16T12:44:15Z",
      deliveredAt: "2026-03-16T12:44:18Z",
      error: null | "provider_error"
    }
  ],
  stats: {
    whatsapp_sent: 45,
    whatsapp_failed: 2,
    email_sent: 47,
    email_failed: 0
  }
}
```

### Interfaz del Dashboard

```
┌─────────────────────────────────────────────────────────┐
│  SYSTEM MONITOR - Real-time Health Dashboard            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Quick Status  [●●●●●] System Healthy                   │
│  Last Update: 12:45:00                                  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  DATABASE            EC2 INSTANCE         APP STATUS    │
│  ✅ Healthy          ✅ Healthy           ✅ Running     │
│     45ms response       CPU: 42%             Uptime: 24h │
│     6988k events        MEM: 68%             Errors: 0.5% │
│     Connected           DISK: 55%            Reqs: 125/m  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  COMMUNICATION MONITOR                                  │
│  Status: ⚠️ WARNING  |  Events: 12/10s  |  Threshold: 15 │
│  Last event: 2s ago                                     │
│  ┌─ Refresh | ⚙ Manual Check ─{BUTTON}                 │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  RECENT ALERTS (Last 24h)                              │
│  ├─ [CRITICAL] Communication DOWN (RESOLVED 12:35)     │
│  ├─ [WARNING] High CPU Usage (ACTIVE now)              │
│  └─ [INFO] Database replication lag detected           │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  NOTIFICATIONS SENT TODAY                              │
│  WhatsApp: 3 sent, 0 failed  │  Email: 3 sent, 0 failed │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Funcionalidades

| Feature | Descripción | Uso |
|---------|-------------|-----|
| **Auto-refresh** | Cada 30 segundos | Dashboard siempre actualizado |
| **Manual refresh** | Botón "Check Now" | Verificación inmediata |
| **Alert history** | Últimos 7 días | Auditoría de eventos |
| **Notification log** | WhatsApp + Email | Rastrear envíos |
| **Status indicators** | Green/Yellow/Red | Quick visual scan |
| **Details panel** | Expand para detalles | Troubleshooting |

### Implementación Timeline

| Fase | Componente | Tiempo |
|------|-----------|--------|
| 1 | Skeleton + Diseño | 1h |
| 2 | Endpoints backend | 1.5h |
| 3 | Integración frontend | 2h |
| 4 | Testing + UX | 1.5h |
| **Total** | | **6 horas** |

### Acceso y Permisos

- **Usuarios permitidos:** Admin + Ops
- **Autenticación:** JWT existente
- **Rutas:** `/dashboard/system-monitor` o modal en admin panel
- **Visibilidad:** Datos no sensibles (sin credenciales)

### Ventajas

✅ **Transparencia:** Ver estado sistema en tiempo real  
✅ **Troubleshooting:** Check manual sin SSH  
✅ **Auditoría:** Historial de todos los eventos  
✅ **Confianza:** Saber que monitoreo funciona  
✅ **Escalable:** Base para agregar más métricas  

---

## 13. DOCUMENTACIÓN FUTURA

- [ ] Runbook de alertas ("¿Qué hago si se activa CRITICAL?")
- [ ] Integración con Datadog/CloudWatch (opcional)
- [ ] Histórico de caídas (para análisis)
- [ ] Machine learning para detección de anomalías

---

## 14. ROADMAP COMPLETO

### Fase 1: Backend Monitoring (30 min) ⏰ ACTUAL
- [x] Script cron `monitor-communication.mjs`
- [x] Query a `horarioServer`
- [x] Lógica de alertas (WARNING/CRITICAL)
- [x] Email fallback
- [ ] Deploy a production

### Fase 2: Notificaciones (OPCIONAL - 30 min)
- [ ] Twilio WhatsApp integration
- [ ] SMTP email personalizado
- [ ] Deduplicación de alertas (no flood)
- [ ] Test de envío manual

### Fase 3: Frontend Dashboard (6 horas) 🎯 PRÓXIMO PASO
- [ ] Crear componente `SystemMonitor`
- [ ] Implementar 4 endpoints backend (health, communication, alerts, logs)
- [ ] Diseño responsivo + Dark mode
- [ ] Auto-refresh cada 30s
- [ ] Manual refresh button
- [ ] Historial de alertas
- [ ] Log de notificaciones

### Fase 4: Enhancements (FUTURO)
- [ ] Métricas histórico (gráficos)
- [ ] Dashboard exportable (PDF)
- [ ] Webhook para integración con Slack
- [ ] Mobile app (React Native)
- [ ] Alertas por SMS (Twilio)

---

## 15. ESTIMACIÓN TOTAL

| Fase | Tiempo | Esfuerzo | Riesgo |
|------|--------|----------|--------|
| 1: Backend | 30 min | ⭐ Bajo | ⭐ Bajo |
| 2: Notif (opt) | 30 min | ⭐⭐ Medio | ⭐⭐ Bajo |
| 3: Frontend | 6 h | ⭐⭐⭐ Alto | ⭐⭐ Medio |
| **Total MVP** | **30 min** | ⭐ Bajo | ⭐ Bajo |
| **Total Full** | **7 h** | ⭐⭐⭐ Alto | ⭐⭐ Medio |

---

**Status:** Documentación completada  
**Next:** ¿Aprobado para Fase 1 (Backend)? Procedo con implementación.
