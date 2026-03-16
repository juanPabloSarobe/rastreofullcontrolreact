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

## 12. DOCUMENTACIÓN FUTURA

- [ ] Runbook de alertas ("¿Qué hago si se activa CRITICAL?")
- [ ] Dashboard/visor de logs
- [ ] Integración con Datadog/CloudWatch (opcional)
- [ ] Histórico de caídas (para análisis)

---

**Next Step:** ¿Aprobado? Procedo a implementación.
