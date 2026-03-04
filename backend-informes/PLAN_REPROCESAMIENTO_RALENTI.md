# Plan: Sistema de Reprocesamiento de Ralentís con Detección de Anomalías

## Estado Actual
✅ Backfill completado: enero-marzo 2026 + julio-diciembre 2025 (6 meses adicionales)
✅ Timestamps corregidos (UTC-aware)
✅ Coverage marcada correctamente
⚠️ Anomalía detectada: ralentís con `start_ts_utc == end_ts_utc` (duración cero)

## Problema a Resolver
- Algunos ralentís tienen duración cero (inicio = fin)
- Causa: Error no identificado en datos fuente o lógica de reconstrucción
- Necesario: Detectar automáticamente + permitir reprocesamiento

## Solución Propuesta (Opción 3 Híbrida)

### 1. **Validación Automática en Servicio** 
Archivo: `backend-informes/src/services/ralentiV2Service.js`

**Cambio:** En `computeIdleIntervalsFromEvents()`, agregar validación:
```javascript
// Detectar duración cero
if (start_ts_utc === end_ts_utc || Math.abs(new Date(end_ts_utc) - new Date(start_ts_utc)) < 1000) {
  anomaly_flags = ['duration_zero'];
  // Log warning pero no descartar el intervalo
}
```

**Almacenar:** Marcar en `idle_intervals_v2.anomaly_flags` (ya existe como JSONB)

---

### 2. **Endpoint GET: Detectar Anomalías**
Archivo: `backend-informes/src/routes/ralentisV2.js`

**Ruta:** `GET /api/ralentis-v2/anomalias`

**Query Params:**
- `fechaDesde` (string, ISO)
- `fechaHasta` (string, ISO)
- `tipoAnomalia` (string, opcional: "duration_zero", "gap_large", etc.)

**Respuesta:**
```json
{
  "ok": true,
  "anomalias": [
    {
      "movil_id": 12607,
      "count": 3,
      "tipos": ["duration_zero"],
      "ejemplos": [
        {
          "id": 123,
          "start_ts_utc": "2025-07-15T10:30:00Z",
          "end_ts_utc": "2025-07-15T10:30:00Z",
          "anomaly_flags": ["duration_zero"]
        }
      ]
    }
  ],
  "totalCount": 5
}
```

---

### 3. **Endpoint POST: Reprocesar Registros**
Archivo: `backend-informes/src/routes/ralentisV2.js`

**Ruta:** `POST /api/ralentis-v2/reprocesar`

**Body:**
```json
{
  "movilIds": [12607, 5560],          // Array o null para "todos con anomalías"
  "fechaDesde": "2025-07-01T00:00:00Z",
  "fechaHasta": "2025-07-31T23:59:59Z",
  "tipoAnomalia": "duration_zero",    // Opcional: solo reprocesar cierto tipo
  "persist": true
}
```

**Lógica:**
1. Adquirir lock (igual que backfill)
2. Para cada `movilId` en rango:
   - DELETE de `idle_intervals_v2` (ese rango)
   - DELETE de `idle_intervals_v2_coverage` (ese rango)
   - Llamar `reconstructIdleIntervalsForRange()` con `persist=true`
   - Marcar coverage nuevamente
3. Retornar resumen: cuántos reprocesados, nuevos errores detectados

**Respuesta:**
```json
{
  "ok": true,
  "unitsReprocessed": 2,
  "unitsWithErrors": 1,
  "detailedResults": [
    {
      "movilId": 12607,
      "ok": true,
      "intervalsRecalculated": 45,
      "anomaliesFound": 0
    }
  ]
}
```

---

### 4. **UI: Mostrar Anomalías**
Archivo: `frontend-rastreo/src/components/common/RalentisDetail.jsx`

**Cambios:**
1. Agregar ícono ⚠️ en ralentís con `anomaly_flags.length > 0`
2. Tooltip: "Error detectado: duración cero"
3. Botón "Reprocesar esta unidad" (llamar POST /reprocesar con movilId + rango)
4. Badge de conteo: "3 anomalías en este rango"

---

## Implementación: Orden de Tareas

### **Día 1 (Mañana):**
- [ ] Agregar validación en `ralentiV2Service.js` (5 min)
- [ ] Crear endpoint GET `/anomalias` (20 min)
- [ ] Crear endpoint POST `/reprocesar` (30 min)
- [ ] Probar endpoints con Postman/curl (15 min)
- [ ] Detectar anomalías existentes en base de datos

### **Día 2:**
- [ ] Agregar UI indicadores de anomalías (20 min)
- [ ] Botón "Reprocesar" en RalentisDetail (20 min)
- [ ] Testing en UI con datos reales

---

## SQL para Detectar Anomalías Actuales

```sql
-- Contar ralentís con duración cero
SELECT 
  movil_id,
  COUNT(*) as count_duration_zero
FROM idle_intervals_v2
WHERE (start_ts_utc = end_ts_utc OR 
       EXTRACT(EPOCH FROM (end_ts_utc - start_ts_utc)) < 1)
  AND algorithm_version = 1
GROUP BY movil_id
ORDER BY count_duration_zero DESC;

-- Ver ejemplos específicos
SELECT 
  movil_id, start_ts_utc, end_ts_utc, anomaly_flags
FROM idle_intervals_v2
WHERE (start_ts_utc = end_ts_utc OR 
       EXTRACT(EPOCH FROM (end_ts_utc - start_ts_utc)) < 1)
  AND algorithm_version = 1
LIMIT 10;
```

---

## Notas Importantes
1. **Lock management:** Usar mismo lock key (`95012026`) para evitar conflictos con backfill
2. **Idempotencia:** POST `/reprocesar` puede ejecutarse múltiples veces sin problemas
3. **Performance:** Reprocesar por móvil es más rápido que por fecha (índice en `movil_id`)
4. **Auditoría:** Considerar agregar `reprocesamiento_log` para trackear cambios

---

## Stack Completado
- ✅ Backend: Node.js + Express + PostgreSQL
- ✅ Frontend: React + Material-UI
- ✅ Validación: Timestamps UTC, coverage tracking
- ✅ Performance: Concurrency + chunking
- 🔄 **Próximo:** Anomaly detection + self-healing

---

**Estatus:** Listo para continuar mañana 💪
