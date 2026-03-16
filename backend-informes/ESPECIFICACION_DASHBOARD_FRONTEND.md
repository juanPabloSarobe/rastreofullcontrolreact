# Dashboard de Monitoreo del Sistema - Especificación Técnica

**Fase:** 3 (Implementación post-MVP)  
**Prioridad:** Media  
**Tiempo:** 6 horas  
**Estado:** Planificación

---

## 1. PROPÓSITO

Componente visual interactivo en el frontend para:
- ✅ Ver estado de salud del sistema en tiempo real
- ✅ Ejecutar verificaciones manuales de comunicación
- ✅ Revisar historial de alertas
- ✅ Auditar envíos de notificaciones (WhatsApp + Email)

---

## 2. UBICACIÓN Y ACCESO

### Ubicación Frontend
```
frontend-rastreo/src/components/
├─ SystemMonitor/
│  ├─ SystemMonitor.jsx           # Componente principal
│  ├─ CommunicationStatus.jsx     # Widget comunicación
│  ├─ HealthChecks.jsx            # Widget health
│  ├─ AlertHistory.jsx            # Lista alertas
│  ├─ NotificationLog.jsx         # Log de envíos
│  ├─ useSystemMonitoring.js      # Hook personalizado
│  └─ SystemMonitor.module.css    # Estilos
```

### Rutas
```javascript
// Opción A: Página separada
/dashboard/system-monitor

// Opción B: Modal en admin
/admin → click "System Monitor"

// Opción C: Sidebar (recomendado)
Left sidebar → Sistema → Monitoreo
```

### Permisos
```
Roles permitidos:
├─ admin (acceso total + escritura)
├─ ops (acceso lectura + manual check)
└─ soporte (acceso lectura)
```

---

## 3. ENDPOINTS BACKEND REQUERIDOS

### 3.1 GET `/api/v2/system/health`

**Propósito:** Check de salud general del sistema

**Query params:**
- `?includeMetrics=true` - Agregar métricas detalladas

**Response 200:**
```json
{
  "status": "healthy|degraded|error",
  "lastCheck": "2026-03-16T12:45:00Z",
  "components": {
    "database": {
      "status": "healthy|degraded|error",
      "responseTime": 45,
      "connections": 12,
      "uptime": "15d 3h 22m",
      "message": "Connected"
    },
    "instance": {
      "status": "healthy|degraded|error",
      "cpu": 42,
      "memory": 68,
      "diskUsage": 55,
      "loadAverage": "2.3 2.1 2.0",
      "uptime": "7d 14h"
    },
    "application": {
      "status": "healthy|degraded|error",
      "uptime": 86400,
      "requestsPerMin": 125,
      "errorRate": 0.5,
      "activeConnections": 23,
      "lastRestart": "2026-03-15T10:30:00Z"
    },
    "communication": {
      "status": "healthy|degraded|error",
      "eventCountLast10s": 28,
      "lastEvent": "2026-03-16T12:44:59Z",
      "threshold": 15,
      "message": "Communication healthy"
    }
  },
  "timestamp": "2026-03-16T12:45:00Z"
}
```

**Tiempo de respuesta:** < 500ms

---

### 3.2 GET `/api/v2/system/communication-status`

**Propósito:** Estado específico de comunicación (ejecutable manualmente)

**Query params:**
- `?force=true` - Ejecutar query fresh (no caché)

**Response 200:**
```json
{
  "status": "ok|warning|critical",
  "eventCount": 28,
  "eventCountLast": [28, 25, 30, 26, 29],  // últimos 5 checks
  "lastEvent": "2026-03-16T12:44:59Z",
  "secsSinceLastEvent": 2,
  "threshold": 15,
  "message": "Communication healthy",
  "suggestions": [],
  "queryDuration": 45,  // ms
  "updatedAt": "2026-03-16T12:45:00Z"
}
```

**Response 503 (si query falla):**
```json
{
  "status": "error",
  "message": "Unable to query database",
  "error": "Connection timeout",
  "suggestion": "Check database connection"
}
```

---

### 3.3 GET `/api/v2/system/alerts`

**Propósito:** Historial de alertas

**Query params:**
- `?limit=50` - Cantidad (default 50, max 500)
- `?days=7` - Rango días (default 7)
- `?status=active|resolved|all` - Filtro
- `?type=communication|database|instance|all` - Tipo

**Response 200:**
```json
{
  "alerts": [
    {
      "id": "alert_20260316_001",
      "timestamp": "2026-03-16T12:44:00Z",
      "level": "critical|warning|info",
      "type": "communication",
      "title": "Communication Loss",
      "message": "No data received in 10 seconds",
      "status": "active|resolved",
      "resolvedAt": null,
      "metadata": {
        "eventCount": 0,
        "threshold": 15,
        "attempts": 2
      },
      "notificationsTriggered": {
        "whatsapp": { "sent": true, "timestamp": "2026-03-16T12:44:15Z" },
        "email": { "sent": true, "timestamp": "2026-03-16T12:44:20Z" }
      }
    }
  ],
  "summary": {
    "total": 42,
    "active": 1,
    "critical": 2,
    "warning": 8,
    "resolved": 31
  },
  "stats": {
    "avgResponseTime": 450,
    "mostCommonType": "communication",
    "lastAlert": "2026-03-16T12:44:00Z"
  }
}
```

---

### 3.4 GET `/api/v2/system/notifications`

**Propósito:** Log de notificaciones enviadas

**Query params:**
- `?limit=30` - Cantidad
- `?type=whatsapp|email|all` - Filtro tipo
- `?status=sent|failed|pending|all` - Filtro estado
- `?hours=24` - Rango horas

**Response 200:**
```json
{
  "notifications": [
    {
      "id": "notif_20260316_001",
      "alertId": "alert_20260316_001",
      "type": "whatsapp|email",
      "recipient": "+549XXXXXXXXX|email@example.com",
      "message": "🚨 CRITICAL: Communication DOWN - 0 events in 10s",
      "status": "sent|failed|pending",
      "sentAt": "2026-03-16T12:44:15Z",
      "deliveredAt": "2026-03-16T12:44:18Z",
      "readAt": null,
      "error": null,
      "provider": "twilio|smtp",
      "providerReference": "SM123456789"
    }
  ],
  "stats": {
    "whatsapp": {
      "sent": 45,
      "failed": 2,
      "pending": 0,
      "deliveryRate": 95.7
    },
    "email": {
      "sent": 47,
      "failed": 0,
      "pending": 1,
      "deliveryRate": 98.0
    },
    "totalToday": 92
  }
}
```

---

## 4. COMPONENTES FRONTEND

### 4.1 SystemMonitor.jsx (Contenedor principal)

```jsx
import React, { useEffect, useState } from 'react';
import HealthChecks from './HealthChecks';
import CommunicationStatus from './CommunicationStatus';
import AlertHistory from './AlertHistory';
import NotificationLog from './NotificationLog';
import useSystemMonitoring from './useSystemMonitoring';

export default function SystemMonitor() {
  const {
    health,
    communication,
    alerts,
    notifications,
    loading,
    error,
    refresh,
    refreshCommunication,
    lastUpdate,
  } = useSystemMonitoring();

  useEffect(() => {
    // Auto-refresh cada 30 segundos
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1>🖥️ System Monitor</h1>
        <div className={styles.headerControls}>
          <span className={styles.lastUpdate}>
            Last update: {lastUpdate?.toLocaleTimeString()}
          </span>
          <button onClick={refresh} disabled={loading}>
            {loading ? 'Refreshing...' : '🔄 Refresh'}
          </button>
        </div>
      </header>

      {error && (
        <div className={styles.errorBanner}>
          ⚠️ {error}
        </div>
      )}

      <section className={styles.mainGrid}>
        <HealthChecks data={health} loading={loading} />
        <CommunicationStatus 
          data={communication} 
          loading={loading}
          onManualCheck={refreshCommunication}
        />
      </section>

      <section className={styles.historyGrid}>
        <AlertHistory data={alerts} loading={loading} />
        <NotificationLog data={notifications} loading={loading} />
      </section>
    </div>
  );
}
```

### 4.2 CommunicationStatus.jsx

```jsx
// Widget específico con:
// - Status indicator (verde/amarillo/rojo)
// - Event count actual
// - Threshold visual
// - Botón "Manual Check"
// - Gráfico mini (últimos 5 checks)
// - Datos: lastEvent, secsSinceLastEvent
```

### 4.3 HealthChecks.jsx

```jsx
// 3 cards:
// 1. Database
//    ├─ Status + response time
//    ├─ Connection count
//    └─ Uptime

// 2. Instance
//    ├─ CPU / Memory gauge
//    ├─ Disk usage progress
//    └─ Load average

// 3. Application
//    ├─ Status + uptime
//    ├─ Requests/min counter
//    └─ Error rate %
```

### 4.4 AlertHistory.jsx

```jsx
// Lista con:
// - Timestamp
// - Badge de severidad (CRITICAL/WARNING/INFO)
// - Tipo de alerta (icon)
// - Título + mensaje
// - Status (Active/Resolved)
// - Timeline de resolución
```

### 4.5 NotificationLog.jsx

```jsx
// Tabla con:
// - Tipo (WhatsApp icon / Email icon)
// - Recipient (número/email)
// - Mensaje (truncated)
// - Status badge (Sent/Failed/Pending)
// - Sent time
// - Delivery time
// - Stats summary
```

### 4.6 useSystemMonitoring.js (Hook)

```javascript
export function useSystemMonitoring() {
  const [health, setHealth] = useState(null);
  const [communication, setCommunication] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const [healthRes, commRes, alertsRes, notifRes] = await Promise.all([
        fetch('/api/v2/system/health'),
        fetch('/api/v2/system/communication-status'),
        fetch('/api/v2/system/alerts?limit=20'),
        fetch('/api/v2/system/notifications?limit=20'),
      ]);
      
      setHealth(await healthRes.json());
      setCommunication(await commRes.json());
      setAlerts(await alertsRes.json());
      setNotifications(await notifRes.json());
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    health,
    communication,
    alerts,
    notifications,
    loading,
    error,
    refresh,
    lastUpdate,
  };
}
```

---

## 5. DISEÑO VISUAL

### Color Scheme
```css
--color-ok: #10b981      /* green */
--color-warning: #f59e0b  /* amber */
--color-critical: #ef4444 /* red */
--color-info: #3b82f6     /* blue */
--color-bg-dark: #1f2937
--color-text-light: #f3f4f6
```

### Responsividad
```
Mobile:   1 columna
Tablet:   2 columnas
Desktop:  3+ columnas (grid auto)
```

---

## 6. FUNCIONALIDADES

### Auto-refresh
- Cada 30 segundos
- Mostrar timestamp del último refresh
- Spinner durante carga

### Manual Check Communication
- Botón "Check Now"
- Ejecuta query fresca (sin caché)
- Muestra tiempo de respuesta

### Historial de Alertas
- Últimas 24 horas visible por defecto
- Filtrar por tipo/severidad
- Expandir para detalles
- Ver qué notificaciones se enviaron
- Autolink a logs si es necesario

### Exportar
- (Futuro) Descargar PDF con historial
- (Futuro) Integración Slack

---

## 7. SEGURIDAD

### Autenticación
- JWT token requerido
- Roles: admin, ops, soporte

### Autorización
- Admin: lectura + escritura (restart, etc)
- Ops: lectura + manual checks
- Soporte: lectura only

### Data Masking
- No mostrar contraseñas/credentials
- Mostrar solo primeros 3 dígitos de números teléfono
- Email medio oculto (a***@example.com)

---

## 8. PERFORMANCE

| Métrica | Target | Notas |
|---------|--------|-------|
| Initial load | < 2s | Lazy load componentes si es necesario |
| Auto-refresh | < 500ms | API targets |
| Manual check | < 1s | Query fresh a BD |
| Memory footprint | < 10 MB | Component unmount al navegar away |

---

## 9. TESTING

### Unit Tests
- Hook `useSystemMonitoring`
- Cada componente aislado

### E2E Tests
- Login → Acceder dashboard
- Auto-refresh funciona
- Manual check funciona
- Filtros en alertas

---

## 10. DEPLOYMENT

**Pre-deployment:**
- [ ] Build sin warnings
- [ ] All tests pass
- [ ] Performance check (Lighthouse)

**Post-deployment:**
- [ ] Verificar endpoints accesibles
- [ ] Test en navegador en desktop + mobile
- [ ] Validar permisos por rol

---

**Status:** Especificación completada  
**Next:** Implementación (Fase 3)
