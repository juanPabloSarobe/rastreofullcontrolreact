# SISTEMA DE ALERTAS WHATSAPP

## 📋 RESUMEN EJECUTIVO

Sistema de comunicación directa con conductores mediante WhatsApp para alertas de infracciones, ralentí y cualquier evento crítico detectado por el sistema GPS. Incluye jerarquía de usuarios, escalamiento automático y confirmación de recepción.

---

## 🎯 OBJETIVO

Implementar un sistema de comunicación eficiente y en tiempo real que permita:

- Notificar inmediatamente a conductores sobre infracciones/alertas
- Reducir tiempos de respuesta ante eventos críticos
- Facilitar la comunicación operador-conductor
- Establecer un flujo de escalamiento según jerarquías

---

## 🚀 ALCANCE FUNCIONAL

### **Módulos que integrarán el sistema:**

- ✅ **Alertas de Ralentí** (IdleUnitsAlert)
- ✅ **Alertas de Infracciones** (InfractionAlert)
- 🔄 **Futuras alertas** (cualquier nuevo módulo de alertas)

### **Tipos de alertas a gestionar:**

- 🚨 Infracciones de velocidad
- ⏱️ Exceso de tiempo en ralentí
- 📍 Entrada/salida de geo-cercas
- 🛑 Paradas no autorizadas
- ⚠️ Eventos de pánico/emergencia
- 🔧 Alertas de mantenimiento

---

## 🏗️ ARQUITECTURA TÉCNICA

### **FASE 1: Quick Win (WhatsApp Web - Solo Manual)**

```javascript
// FRONTEND: Solo para envío manual por operador
const sendWhatsAppAlert = (phoneNumber, message) => {
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    message
  )}`;
  window.open(url, "_blank");

  // Registrar acción manual en backend
  logManualAlert(unit.Movil_ID, "whatsapp_manual", message);
};
```

### **FASE 2: Automatización Backend (Evita duplicación)**

```javascript
// BACKEND: Sistema centralizado de alertas automáticas
const AlertEngine = {
  // Procesamiento centralizado en servidor
  processAlert: async (unitData, alertType) => {
    // 1. Verificar si ya se envió alerta para este evento
    const isDuplicate = await checkDuplicateAlert(
      unitData.Movil_ID,
      alertType,
      Date.now()
    );

    if (isDuplicate) {
      console.log(`Alert already sent for unit ${unitData.Movil_ID}`);
      return { status: "duplicate", sent: false };
    }

    // 2. Enviar WhatsApp automático
    const result = await WhatsAppService.sendAlert(
      unitData.conductorPhone,
      getTemplateId(alertType),
      formatAlertParams(unitData, alertType)
    );

    // 3. Registrar envío para evitar duplicados
    await registerAlertSent(unitData.Movil_ID, alertType, result.messageId);

    return result;
  },

  // Control de duplicados por tiempo y tipo
  checkDuplicateAlert: async (unitId, alertType, timestamp) => {
    const timeWindow = getTimeWindow(alertType); // 5min para infracciones, 30min para ralentí
    return await db.query(
      `
      SELECT * FROM alert_logs 
      WHERE unit_id = ? 
      AND alert_type = ? 
      AND timestamp > ?
    `,
      [unitId, alertType, timestamp - timeWindow]
    );
  },
};

// FRONTEND: Solo recibe notificaciones y actualiza UI
const AlertSubscription = {
  // WebSocket para recibir notificaciones de alerts enviadas
  onAlertSent: (alertData) => {
    updateAlertStatus(alertData.unitId, "whatsapp_sent");
    showNotification(`WhatsApp enviado a ${alertData.patente}`);
  },

  onAlertConfirmed: (alertData) => {
    updateAlertStatus(alertData.unitId, "confirmed");
    showNotification(`${alertData.patente} confirmó recepción`);
  },
};
```

### **ARQUITECTURA DE CONTROL DE DUPLICADOS:**

```javascript
// BACKEND: Tabla de control de alertas
CREATE TABLE alert_control (
  id PRIMARY KEY,
  unit_id VARCHAR(50),
  alert_type ENUM('infraction', 'idle', 'geofence', 'panic'),
  event_hash VARCHAR(64), // Hash único del evento
  sent_timestamp DATETIME,
  confirmed_timestamp DATETIME,
  escalated BOOLEAN DEFAULT FALSE,
  created_by_user_id INT,
  INDEX(unit_id, alert_type, sent_timestamp)
);

// Sistema de deduplicación inteligente
const generateEventHash = (unitId, alertType, location, timestamp) => {
  // Para infracciones: unit + tipo + ubicación aproximada + ventana de tiempo
  // Para ralentí: unit + ubicación + tiempo inicio ralentí
  return crypto.createHash('sha256')
    .update(`${unitId}-${alertType}-${roundLocation(location)}-${roundTime(timestamp, 300)}`)
    .digest('hex');
};
```

---

## 📱 TEMPLATES DE MENSAJES

### **1. Infracción de Velocidad**

```
🚨 *ALERTA FULLCONTROL GPS*

Conductor: *{CONDUCTOR_NOMBRE}*
Unidad: *{PATENTE}*
Infracción: *Exceso de velocidad*
Velocidad: *{VELOCIDAD_ACTUAL} km/h* (Límite: {VELOCIDAD_LIMITE} km/h)
Ubicación: *{UBICACION}*
Hora: *{HORA}*

⚠️ Por favor, reduzca la velocidad inmediatamente y respete los límites de tránsito.

✅ Responda "OK" para confirmar recepción.
```

### **2. Ralentí Prolongado**

```
⏰ *ALERTA RALENTÍ - FULLCONTROL GPS*

Conductor: *{CONDUCTOR_NOMBRE}*
Unidad: *{PATENTE}*
Tiempo en ralentí: *{TIEMPO_RALENTI}*
Ubicación: *{UBICACION}*
Hora inicio: *{HORA_INICIO}*

🛑 Verifique si es necesario mantener el motor encendido.
Para mayor eficiencia, considere apagar el motor si la parada es prolongada.

✅ Responda "OK" para confirmar recepción.
```

### **3. Geo-cerca**

```
📍 *ALERTA ZONA - FULLCONTROL GPS*

Conductor: *{CONDUCTOR_NOMBRE}*
Unidad: *{PATENTE}*
Evento: *{ENTRADA/SALIDA}* zona *{NOMBRE_ZONA}*
Ubicación: *{UBICACION}*
Hora: *{HORA}*

ℹ️ Confirme si su presencia en esta zona está autorizada.

✅ Responda "OK" para confirmar recepción.
```

---

## 👥 JERARQUÍA DE USUARIOS

### **NIVEL 1: OPERADOR**

**Permisos:**

- ✅ Ver alertas activas
- ✅ Enviar WhatsApp (manual - Fase 1)
- ✅ Marcar como "En proceso"
- ✅ Agregar notas básicas
- ✅ Llamar conductor

**Limitaciones:**

- ❌ No puede configurar alertas automáticas
- ❌ No tiene acceso a estadísticas históricas completas

### **NIVEL 2: SUPERVISOR**

**Permisos:** Todo lo del operador +

- ✅ Ver histórico completo de alertas
- ✅ Configurar alertas automáticas
- ✅ Escalar a gerencia
- ✅ Acceso a dashboard de estadísticas
- ✅ Configurar templates de mensajes
- ✅ Ver métricas de respuesta de conductores

### **NIVEL 3: GERENTE**

**Permisos:** Todo lo anterior +

- ✅ Configurar políticas de escalamiento
- ✅ Dashboard ejecutivo con KPIs
- ✅ Exportar reportes detallados
- ✅ Configurar jerarquías y permisos
- ✅ Configurar integración WhatsApp Business API
- ✅ Ver costos y estadísticas de comunicación

---

## 🔄 FLUJOS DE TRABAJO

### **FLUJO BÁSICO (Operador)**

```
1. Sistema detecta infracción/alerta
   ↓
2. Aparece en vista de alerta correspondiente
   ↓
3. Operador hace clic en "💬 WhatsApp"
   ↓
4. Se abre WhatsApp Web con mensaje pre-cargado
   ↓
5. Operador envía mensaje
   ↓
6. Sistema marca como "Notificado"
   ↓
7. Conductor responde "OK"
   ↓
8. Sistema marca como "Confirmado"
```

### **FLUJO CON ESCALAMIENTO**

```
1. Alerta enviada a conductor
   ↓
2. ¿Respuesta en 5 minutos?
   ├─ SÍ → Marcar como "Resuelta"
   └─ NO → Notificar a Supervisor
           ↓
3. ¿Supervisor toma acción en 10 minutos?
   ├─ SÍ → Seguir flujo supervisor
   └─ NO → Escalar a Gerente
```

### **FLUJO AUTOMATIZADO (Fase 2) - SIN DUPLICACIÓN**

```
1. Sistema backend detecta evento crítico (único punto de procesamiento)
   ↓
2. Genera hash único del evento para evitar duplicados
   ↓
3. Verifica en BD si ya se procesó este evento en ventana de tiempo
   ├─ YA EXISTE → Descarta y loguea como duplicado
   └─ NO EXISTE → Continúa procesamiento
   ↓
4. Evalúa nivel de criticidad según configuración
   ↓
5. Envío automático según política:
   ├─ CRÍTICO → WhatsApp + SMS + Llamada + Notifica supervisor inmediato
   ├─ ALTO → WhatsApp + Notificación supervisor (5 min delay)
   └─ MEDIO → WhatsApp solamente
   ↓
6. Registra envío en BD con timestamp y messageId
   ↓
7. Notifica a TODOS los frontends conectados vía WebSocket
   ↓
8. Frontend actualiza UI mostrando "Enviado automáticamente"
   ↓
9. Tracking automático de respuestas y escalamiento
```

### **FLUJO DE COORDINACIÓN MULTI-FRONTEND:**

```
Backend (Único procesador)     Frontend 1 (Operador A)    Frontend 2 (Supervisor)
        |                              |                           |
   Detecta infracción                   |                           |
        |                              |                           |
   Procesa y envía WhatsApp             |                           |
        |                              |                           |
   Broadcast via WebSocket ─────────────┼─────► "✅ Enviado"       |
        |                              |              ↓            |
   Espera confirmación                  |       Marca como "Sent"   |
        |                              |                           |
   Conductor confirma ──────────────────┼─────────────────────────► |
        |                              |                     "✅ Confirmado"
   Marca como resuelto                  |                           |
        |                              |                           |
   Notifica resolución ─────────────────┼─────► UI se actualiza    |
                                        |              ↓            |
                                 "✅ Resuelto"                      |
```

---

## 🛠️ COMPONENTES A DESARROLLAR

### **1. WhatsAppButton (Componente reutilizable - Solo manual)**

```jsx
const WhatsAppButton = ({
  phone,
  unit,
  alertType,
  onSent,
  disabled = false,
  isAutoSent = false, // Nueva prop para mostrar si ya se envió automáticamente
}) => {
  const handleManualSend = () => {
    const message = generateAlertMessage(unit, alertType);
    sendWhatsAppAlert(phone, message);

    // Registrar como envío manual
    logManualAlert(unit.Movil_ID, alertType, "manual");
    onSent?.();
  };

  if (isAutoSent) {
    return (
      <Chip
        icon={<CheckCircleIcon />}
        label="WhatsApp enviado"
        color="success"
        size="small"
      />
    );
  }

  return (
    <IconButton onClick={handleManualSend} disabled={disabled}>
      <WhatsAppIcon />
    </IconButton>
  );
};
```

### **2. AlertStatusIndicator (Nuevo componente)**

```jsx
const AlertStatusIndicator = ({
  status, // 'pending', 'auto_sent', 'manual_sent', 'confirmed', 'escalated'
  timestamp,
  messageId,
}) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case "auto_sent":
        return {
          color: "info",
          icon: <AutomationIcon />,
          text: "Enviado automáticamente",
        };
      case "manual_sent":
        return {
          color: "primary",
          icon: <TouchAppIcon />,
          text: "Enviado manualmente",
        };
      case "confirmed":
        return {
          color: "success",
          icon: <CheckCircleIcon />,
          text: "Confirmado por conductor",
        };
      case "escalated":
        return {
          color: "warning",
          icon: <TrendingUpIcon />,
          text: "Escalado a supervisor",
        };
      default:
        return { color: "grey", icon: <PendingIcon />, text: "Pendiente" };
    }
  };

  // Componente para mostrar estado y timestamp
};
```

### **3. AlertSynchronizer (Servicio de sincronización)**

```jsx
const AlertSynchronizer = {
  // WebSocket para sincronización en tiempo real
  connect: () => {
    const ws = new WebSocket(process.env.REACT_APP_WS_URL);

    ws.onmessage = (event) => {
      const alertUpdate = JSON.parse(event.data);

      switch (alertUpdate.type) {
        case "alert_sent":
          updateAlertStatus(
            alertUpdate.unitId,
            "auto_sent",
            alertUpdate.timestamp
          );
          break;
        case "alert_confirmed":
          updateAlertStatus(
            alertUpdate.unitId,
            "confirmed",
            alertUpdate.timestamp
          );
          break;
        case "alert_escalated":
          updateAlertStatus(
            alertUpdate.unitId,
            "escalated",
            alertUpdate.timestamp
          );
          break;
      }
    };

    return ws;
  },

  // Función para actualizar estado en todos los componentes
  updateAlertStatus: (unitId, status, timestamp) => {
    // Usar context o state management para actualizar UI
    useAlertStore.getState().updateUnitStatus(unitId, { status, timestamp });
  },
};
```

### **4. DuplicationPrevention (Sistema anti-duplicación)**

```jsx
const DuplicationPrevention = {
  // Frontend: Prevenir clicks múltiples
  preventDoubleClick: (action, delay = 2000) => {
    let isExecuting = false;

    return async (...args) => {
      if (isExecuting) {
        console.warn("Action already in progress, preventing duplicate");
        return;
      }

      isExecuting = true;
      try {
        await action(...args);
      } finally {
        setTimeout(() => {
          isExecuting = false;
        }, delay);
      }
    };
  },

  // Verificar estado antes de permitir acción
  canSendAlert: (unitId, alertType) => {
    const unitState = useAlertStore.getState().getUnitState(unitId);
    const lastSent = unitState?.lastAlertSent?.[alertType];

    if (!lastSent) return true;

    const timeWindow =
      alertType === "infraction" ? 5 * 60 * 1000 : 30 * 60 * 1000; // 5min o 30min
    return Date.now() - lastSent > timeWindow;
  },
};
```

---

## 📊 MÉTRICAS Y KPIs

### **Métricas Operativas:**

- ⏱️ Tiempo promedio de respuesta a alertas
- 📞 Tasa de confirmación de conductores
- 🔄 Número de escalamientos por día/semana
- 📱 Efectividad de WhatsApp vs otros canales

### **Métricas de Gestión:**

- 📈 Reducción de infracciones post-implementación
- 💰 ROI del sistema de alertas
- 👥 Satisfacción de operadores y supervisores
- 🎯 Cumplimiento de SLAs de respuesta

---

## 💡 FUNCIONALIDADES FUTURAS

### **Integración con IA:**

- 🤖 Detección automática de patrones de infracciones
- 📊 Predicción de comportamiento de conductores
- 🎯 Personalización de mensajes según historial

### **Comunicación Bidireccional:**

- 💬 Chat completo operador-conductor
- 📸 Envío de fotos de evidencia
- 📍 Compartir ubicación en tiempo real
- 🎙️ Mensajes de voz para situaciones complejas

### **Gamificación:**

- 🏆 Sistema de puntos por buen comportamiento
- 🎖️ Rankings de conductores
- 🎁 Incentivos por mejoras en conducción

---

## 🔒 CONSIDERACIONES DE SEGURIDAD Y ARQUITECTURA

### **Prevención de Duplicación:**

- ✅ **Procesamiento centralizado** en backend único
- ✅ **Hash de eventos** para identificar duplicados
- ✅ **Ventanas de tiempo** configurables por tipo de alerta
- ✅ **Logs de auditoría** para trazabilidad completa
- ✅ **WebSockets** para sincronización en tiempo real entre frontends

### **Control de Concurrencia:**

- ✅ **Locks a nivel BD** para evitar race conditions
- ✅ **Timeouts** en procesamiento de alertas
- ✅ **Retry logic** para fallos de comunicación
- ✅ **Circuit breaker** para proteger APIs externas

### **Privacidad:**

- ✅ Números de teléfono encriptados en base de datos
- ✅ Logs de comunicación con retention policy
- ✅ Compliance con GDPR/LOPD

### **Autenticación:**

- ✅ Verificación de números de conductor
- ✅ Sistema de roles y permisos
- ✅ Audit trail de todas las comunicaciones

---

## 📈 PLAN DE IMPLEMENTACIÓN (ACTUALIZADO)

### **MILESTONE 1: Infraestructura backend anti-duplicación (3 semanas)**

- ✅ Sistema centralizado de procesamiento de alertas en backend
- ✅ Base de datos para control de duplicados con hash de eventos
- ✅ WebSocket server para sincronización multi-frontend
- ✅ API endpoints para registro manual de alertas
- ✅ Templates de mensajes y sistema de configuración

### **MILESTONE 2: Frontend sincronizado (2 semanas)**

- ✅ Componentes reutilizables con indicadores de estado
- ✅ Cliente WebSocket para recibir actualizaciones en tiempo real
- ✅ Sistema de prevención de double-clicks y acciones concurrentes
- ✅ Integración con alertas existentes (BaseExpandableAlert)
- ✅ UI para mostrar estado: "Enviado automáticamente" vs "Envío manual"

### **MILESTONE 3: WhatsApp Business API y automatización (4 semanas)**

- ✅ Integración completa con WhatsApp Business API
- ✅ Sistema de templates aprobados por Meta
- ✅ Envío automático basado en reglas de negocio
- ✅ Tracking de delivery y read receipts
- ✅ Dashboard de métricas y KPIs
- ✅ Testing exhaustivo con múltiples frontends conectados

### **🔍 TESTING ESPECÍFICO ANTI-DUPLICACIÓN:**

- ✅ **Test 1:** Abrir 3 frontends simultáneos, verificar un solo envío por alerta
- ✅ **Test 2:** Simular desconexión de red en un frontend durante envío
- ✅ **Test 3:** Verificar sincronización de estados entre todos los clientes
- ✅ **Test 4:** Stress test con 100+ alertas simultáneas
- ✅ **Test 5:** Verificar ventanas de tiempo para diferentes tipos de alertas

---

## 💻 INTEGRACIÓN CON ALERTAS EXISTENTES

### **BaseExpandableAlert - Nuevas props:**

```jsx
const BaseExpandableAlert = ({
  // ... props existentes
  showWhatsAppButton = false,
  onWhatsAppAction,
  userRole = "operador",
  escalationConfig,
}) => {
  // Integración del botón WhatsApp en header
};
```

### **Modificaciones en InfractionAlert:**

```jsx
const InfractionAlert = ({ markersData, onUnitSelect }) => {
  const handleWhatsAppAlert = (unit) => {
    const message = generateInfractionMessage(unit);
    sendWhatsAppAlert(unit.conductorPhone, message);
    markAsNotified(unit.Movil_ID);
  };

  return (
    <BaseExpandableAlert
      showWhatsAppButton={true}
      onWhatsAppAction={handleWhatsAppAlert}
      // ... resto de props
    />
  );
};
```

---

## 🎯 VALOR AGREGADO

### **Para Operadores:**

- ⚡ Comunicación instantánea con conductores
- 📱 Interfaz familiar (WhatsApp)
- 🎯 Mensajes pre-formateados y contextuales
- ⏱️ Reducción significativa de tiempo de gestión

### **Para Supervisores:**

- 📊 Visibilidad completa del flujo de comunicación
- 🔄 Escalamiento automático configurable
- 📈 Métricas para toma de decisiones
- 🎯 Control de SLAs de respuesta

### **Para la Empresa:**

- 💰 Reducción de costos operativos
- 🛡️ Mejor gestión de riesgo y compliance
- 📊 Data para optimización de operaciones
- 🚀 Diferenciación competitiva en el mercado

---

## ✅ CRITERIOS DE ÉXITO

1. **90%** de los conductores confirman recepción de alertas
2. **50%** reducción en tiempo promedio de respuesta a infracciones
3. **30%** reducción en infracciones recurrentes
4. **95%** satisfacción de operadores con la nueva herramienta
5. **ROI positivo** en los primeros 6 meses

---

_Documento creado: 27 de julio de 2025_  
_Versión: 1.0_  
_Estado: Propuesta - Pendiente de aprobación_
