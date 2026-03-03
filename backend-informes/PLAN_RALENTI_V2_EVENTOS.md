# Plan Ralentí v2 basado en eventos del equipo

Fecha: 2026-03-03
Estado: Definido para implementación (pendiente codificación)

## 1) Contexto actual

- El cálculo histórico de ralentí no debe depender de `informesRalentis` como fuente confiable final.
- Ya se detectó y corrigió un problema de timezone en el endpoint nuevo para que coincida con el minuto a minuto en casos reales (ejemplo `movil=5021`, `idRalenti=1379335`).
- El sistema legacy (`historico.php`) aplica `- interval '3 hour'` para presentación/filtro.

## 2) Dato clave de negocio (nuevo)

Los equipos **ya calculan** eventos de ralentí, por lo tanto la lógica canónica debe construirse desde eventos:

- Inicio de ralentí
- Reporta en ralentí (mientras continúa)
- Fin de ralentí

### Excepciones observadas

1. Puede faltar `Reporta en ralentí` entre Inicio y Fin.
2. Puede llegar `Fin` antes que `Inicio` (desorden/latencia).
3. Puede haber `Inicio` sin `Fin`.
4. Puede haber `Fin` sin `Inicio`.

## 3) Decisión de arquitectura

Se adopta estrategia híbrida, pero con motor canónico por eventos:

- **Fuente lógica principal:** eventos del histórico del equipo.
- **Materialización async:** tabla nueva `idle_intervals_v2`.
- **Fallback controlado:** reconstrucción on-demand desde eventos ante huecos.

## 4) Modelo propuesto

## 4.1 Tabla de eventos normalizados (raw)

`idle_events_v2_raw`

Campos sugeridos:

- `id` (bigserial PK)
- `movil_id` (int)
- `equipo_id` (text)
- `persona_id` (int null)
- `event_ts_utc` (timestamptz)
- `event_type` (enum/text: `IDLE_START`, `IDLE_REPORT`, `IDLE_END`)
- `latitud`, `longitud` (numeric null)
- `payload` (jsonb)
- `source_hash` (text unique)  ← dedupe/idempotencia
- `created_at`

Índices:

- `(movil_id, event_ts_utc)`
- `(event_type, event_ts_utc)`
- `unique(source_hash)`

## 4.2 Tabla de intervalos construidos

`idle_intervals_v2`

Campos sugeridos:

- `id` (bigserial PK)
- `movil_id` (int)
- `equipo_id` (text)
- `persona_id` (int null)
- `start_ts_utc` (timestamptz)
- `end_ts_utc` (timestamptz)
- `duration_sec` (int)
- `start_lat`, `start_lng` (numeric null)
- `end_lat`, `end_lng` (numeric null)
- `build_mode` (`explicit`, `synthetic_report`, `implicit_close_next_start`, `window_close`)
- `quality_score` (int 0..100)
- `anomaly_flags` (jsonb/text[])
- `algorithm_version` (smallint)
- `source_hash` (text unique)
- `created_at`, `updated_at`

Índices:

- `(movil_id, start_ts_utc)`
- `(start_ts_utc, end_ts_utc)`
- `unique(source_hash)`

## 4.3 Cobertura procesada

`idle_intervals_v2_coverage`

- `movil_id`
- `from_ts_utc`
- `to_ts_utc`
- `algorithm_version`
- `status`
- `updated_at`

## 5) Máquina de estados (reglas canónicas)

Estado inicial: `IDLE_OFF`

### En `IDLE_OFF`

- Si llega `IDLE_START` → abrir intervalo.
- Si llega `IDLE_REPORT` sin inicio → abrir intervalo sintético (`synthetic_report`).
- Si llega `IDLE_END` sin inicio → registrar anomalía `orphan_end`.

### En `IDLE_ON`

- `IDLE_REPORT` → actualizar `last_seen`.
- `IDLE_END` → cerrar intervalo normal (`explicit`).
- `IDLE_START` nuevo sin cierre previo → cerrar anterior como `implicit_close_next_start` y abrir nuevo.

### Cierre por ventana/timeout

- Si queda abierto al final de ventana:
  - cerrar como `window_close` o `open_timeout`.

## 6) Tratamiento de anomalías

- `missing_report`: inicio-fin sin reportes intermedios (válido).
- `orphan_end`: fin sin inicio.
- `missing_end`: inicio sin fin.
- `out_of_order`: eventos fuera de orden tolerable.
- `duplicate_event`: dedupe por hash y/o ventana corta.

## 7) Timezone (acordado)

- Internamente trabajar en UTC.
- Para responder al frontend, exponer formato consistente con comportamiento legacy (`-03`) donde aplique.
- Mantener consistencia entre filtro y serialización.

## 8) Estrategia de implementación por fases

## Fase 1 (mañana)

1. Crear DDL de `idle_events_v2_raw`, `idle_intervals_v2`, `coverage`.
2. Implementar extractor de eventos relevantes del histórico.
3. Implementar motor de reconstrucción (máquina de estados) en servicio puro testeable.

## Fase 2

1. Job incremental (cada 5 min) por ventana deslizante.
2. Upsert idempotente en `idle_intervals_v2`.
3. Endpoint híbrido: leer `v2` + fallback on-demand ante huecos.

## Fase 3

1. Reconciliación nocturna D-1.
2. Métricas y alertas de calidad/anomalías.
3. Backfill histórico completo por lotes.

## 9) Criterios de aceptación

- Caso `movil=5021` y eventos comparados con minuto a minuto coinciden en hora local esperada.
- Para rangos cortos (hoy/3 días), latencia endpoint estable.
- Intervalos con anomalía quedan etiquetados y trazables.
- Algoritmo idempotente (reprocesar no duplica).

## 10) Checklist de arranque para mañana

- [ ] Escribir SQL DDL v2.
- [ ] Definir catálogo exacto de nombres de eventos legacy -> `IDLE_START/REPORT/END`.
- [ ] Implementar `computeIdleIntervalsFromEvents()` con tests de anomalías.
- [ ] Exponer endpoint de prueba por `movilId + rango` sólo con motor nuevo.
- [ ] Comparar 5 móviles reales contra minuto a minuto.

---

## Notas operativas

- Durante transición, no eliminar lógica existente.
- Habilitar por feature flag (`RALENTI_V2_ENABLED`).
- Registrar `algorithm_version` desde día 1 para evolución controlada.

## Requisito de catalogación (obligatorio)

- El extractor v2 usa **exclusivamente** `EstadosGpsVirlock.tipoRegla` para clasificar eventos.
- Valores soportados canónicos: `IDLE_START`, `IDLE_REPORT`, `IDLE_END`.
- Si un código de estado no tiene `tipoRegla` o tiene otro valor, **no** participa en reconstrucción v2.
- El texto `estado` queda solo como descriptor funcional en catálogo, no como criterio de cómputo.
