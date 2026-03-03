# Configuración final - Ralentí v2 híbrido

Fecha: 2026-03-03

## Objetivo operativo

Evitar cola infinita y mantener UX cercana a tiempo real combinando:

1. Fondo frecuente sobre unidades activas recientes.
2. Refresco on-demand cuando el usuario abre panel de ralentí.
3. Reconciliación retroactiva para capturar descargas tardías (sin señal).

## Endpoints operativos

### 1) Fondo activo-only (recomendado cada 3-4 min)

`POST /api/ralentis-v2/reconstruir-activos`

Body sugerido:

```json
{
  "realtimeMinutes": 5,
  "persist": true,
  "concurrency": 12,
  "chunkSize": 200,
  "maxMoviles": 2500,
  "lockKey": 95012027
}
```

- Procesa solo móviles con eventos de ralentí en la ventana.
- Si ya hay ejecución activa (mismo `lockKey`), responde 409 y no solapa.

### 2) On-demand prioritario (cuando usuario abre panel)

`POST /api/ralentis-v2/refrescar-demanda`

Body sugerido:

```json
{
  "movilIds": [5021, 5020, 5558],
  "fechaDesde": "2026-03-03T00:00:00-03:00",
  "fechaHasta": "2026-03-03T23:59:59-03:00",
  "persist": true,
  "concurrency": 12,
  "freshnessMinutes": 5
}
```

- Refresca inmediatamente las unidades visibles.
- Omite unidades con cobertura fresca para la misma ventana.

### 3) Reconciliación retroactiva (descargas tardías)

`POST /api/ralentis-v2/reconstruir-activos` con ventana amplia explícita

Body sugerido (cada 30-60 min):

```json
{
  "fechaDesde": "2026-03-01T00:00:00-03:00",
  "fechaHasta": "2026-03-03T23:59:59-03:00",
  "persist": true,
  "concurrency": 8,
  "chunkSize": 120,
  "maxMoviles": 4000,
  "lockKey": 95012028
}
```

- Captura datos que llegaron tarde a BD.
- Usar `lockKey` distinto del job de fondo para no bloquear mutuamente si así se desea.

## Frecuencia recomendada

- Horario diurno (alta carga):
  - Fondo activo-only: cada 4 min.
  - On-demand: siempre que usuario abre/actualiza panel.
  - Retroactiva: cada 60 min.

- Horario nocturno (baja carga):
  - Fondo activo-only: cada 3 min.
  - Retroactiva: cada 30 min.
  - Reconciliación extendida (72h): 1 vez por noche.

## Variables de entorno

Usar las variables agregadas en `.env.example`:

- `RALENTI_V2_LOTE_CONCURRENCY`
- `RALENTI_V2_LOTE_CHUNK_SIZE`
- `RALENTI_V2_LOTE_LOCK_KEY`
- `RALENTI_V2_ONDEMAND_CONCURRENCY`
- `RALENTI_V2_ONDEMAND_FRESHNESS_MIN`
- `RALENTI_V2_ACTIVOS_REALTIME_MIN`
- `RALENTI_V2_ACTIVOS_MAX_MOVILES`
- `RALENTI_V2_ACTIVOS_CONCURRENCY`
- `RALENTI_V2_ACTIVOS_CHUNK_SIZE`
- `RALENTI_V2_ACTIVOS_LOCK_KEY`

## Validaciones clave a monitorear

- `totalDurationMs` del job activo-only vs intervalo del cron.
- `unitsSkippedFresh` en on-demand (mide eficiencia de frescura).
- Tendencia de `activeUnitsFound` (picos de carga por horario).
- Reconciliación retroactiva: que mantenga baja la divergencia por descargas tardías.
