/**
 * Servicio Ralentí v2 (Fase 1)
 * Reconstrucción canónica de intervalos de ralentí desde eventos
 */

import crypto from 'crypto';
import { query } from '../db/pool.js';
import { logger } from '../utils/logger.js';

const ALGORITHM_VERSION = 1;
const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

function normalizeDateForLocalTimestamp(dateValue) {
  if (!dateValue || typeof dateValue !== 'string') {
    return dateValue;
  }

  return dateValue.trim().replace(/([zZ]|[+-]\d{2}:?\d{2})$/, '');
}

function cleanEstadoValue(estado) {
  return String(estado || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
}

function classifyByTipoRegla(tipoRegla) {
  const value = cleanEstadoValue(tipoRegla);

  if (!value) {
    return null;
  }

  if (value === 'IDLE_START' || value === 'INICIO_RALENTI' || value === 'RALENTI_START') {
    return 'IDLE_START';
  }

  if (value === 'IDLE_REPORT' || value === 'REPORTE_RALENTI' || value === 'RALENTI_REPORT') {
    return 'IDLE_REPORT';
  }

  if (value === 'IDLE_END' || value === 'FIN_RALENTI' || value === 'RALENTI_END') {
    return 'IDLE_END';
  }

  return null;
}

function classifyIdleEventType({ tipoRegla }) {
  return classifyByTipoRegla(tipoRegla);
}

function toLegacyMinus3Iso(dateValue) {
  const date = new Date(dateValue);
  const localDate = new Date(date.getTime() - THREE_HOURS_MS);
  return localDate.toISOString().replace('Z', '-03:00');
}

function getMonthKey(dateStr) {
  return normalizeDateForLocalTimestamp(dateStr).slice(0, 7);
}

function buildMonthKeysBetween(fechaDesde, fechaHasta) {
  const start = new Date(`${getMonthKey(fechaDesde)}-01T00:00:00Z`);
  const end = new Date(`${getMonthKey(fechaHasta)}-01T00:00:00Z`);
  const keys = [];

  const cursor = new Date(start);
  while (cursor <= end) {
    const year = cursor.getUTCFullYear();
    const month = String(cursor.getUTCMonth() + 1).padStart(2, '0');
    keys.push(`${year}-${month}`);
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }

  return keys;
}

/**
 * Obtiene IDs de móviles que tuvieron eventos de ralentí en el rango solicitado.
 * Usa tipoRegla canónico para evitar parseo por texto.
 */
export async function getMovilIdsWithIdleEventsInRange({
  fechaDesde,
  fechaHasta,
  maxMoviles = 0,
}) {
  if (!fechaDesde || !fechaHasta) {
    const error = new Error('fechaDesde y fechaHasta son requeridas');
    error.status = 400;
    throw error;
  }

  const fechaDesdeNormalized = normalizeDateForLocalTimestamp(fechaDesde);
  const fechaHastaNormalized = normalizeDateForLocalTimestamp(fechaHasta);

  const monthKeys = buildMonthKeysBetween(fechaDesdeNormalized, fechaHastaNormalized);
  const movilIdSet = new Set();

  for (const monthKey of monthKeys) {
    const tableName = `ActividadDiaria${monthKey}`;

    if (!(await tableExists(tableName))) {
      continue;
    }

    const sql = `
      SELECT DISTINCT "act"."movil_Movil_ID_OID"::int AS movil_id
      FROM public."${tableName}" AS "act"
      INNER JOIN public."EstadosGpsVirlock" AS "est"
        ON "est"."codigo" = "act"."estadoGPSVirlock_codigo_OID"
      WHERE ("act"."diaHora" - interval '3 hour') >= $1::timestamp
        AND ("act"."diaHora" - interval '3 hour') <= $2::timestamp
        AND UPPER(COALESCE("est"."tipoRegla", '')) IN ('IDLE_START', 'IDLE_REPORT', 'IDLE_END')
    `;

    const result = await query(sql, [fechaDesdeNormalized, fechaHastaNormalized]);
    for (const row of result.rows) {
      movilIdSet.add(Number(row.movil_id));
      if (maxMoviles > 0 && movilIdSet.size >= maxMoviles) {
        return [...movilIdSet];
      }
    }
  }

  return [...movilIdSet];
}

async function tableExists(tableName) {
  const sql = 'SELECT to_regclass($1) AS regclass';
  const result = await query(sql, [`public."${tableName}"`]);
  return Boolean(result.rows[0]?.regclass);
}

function makeSourceHash(input) {
  return crypto.createHash('sha256').update(JSON.stringify(input)).digest('hex');
}

function buildInterval({
  movilId,
  startEvent,
  endEvent,
  buildMode,
  anomalies = [],
}) {
  const startTs = new Date(startEvent.event_ts_utc);
  const endTs = new Date(endEvent.event_ts_utc);
  const durationSec = Math.max(0, Math.floor((endTs.getTime() - startTs.getTime()) / 1000));

  const qualityPenalty = anomalies.length * 20 + (buildMode === 'explicit' ? 0 : 10);
  const qualityScore = Math.max(0, 100 - qualityPenalty);

  const sourceHash = makeSourceHash({
    movilId,
    start: startTs.toISOString(),
    end: endTs.toISOString(),
    buildMode,
    anomalies,
    algorithmVersion: ALGORITHM_VERSION,
  });

  return {
    movil_id: movilId,
    equipo_id: startEvent.equipo_id || endEvent.equipo_id || null,
    persona_id: startEvent.persona_id || endEvent.persona_id || null,
    start_ts_utc: startTs.toISOString(),
    end_ts_utc: endTs.toISOString(),
    start_ts_local: toLegacyMinus3Iso(startTs),
    end_ts_local: toLegacyMinus3Iso(endTs),
    duration_sec: durationSec,
    start_lat: startEvent.latitud,
    start_lng: startEvent.longitud,
    end_lat: endEvent.latitud,
    end_lng: endEvent.longitud,
    build_mode: buildMode,
    quality_score: qualityScore,
    anomaly_flags: anomalies,
    algorithm_version: ALGORITHM_VERSION,
    source_hash: sourceHash,
  };
}

export function computeIdleIntervalsFromEvents(events, { movilId, fechaHasta }) {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.event_ts_utc).getTime() - new Date(b.event_ts_utc).getTime()
  );

  let idleState = 'IDLE_OFF';
  let openStartEvent = null;

  const intervals = [];
  const anomalies = [];

  for (const event of sortedEvents) {
    if (idleState === 'IDLE_OFF') {
      if (event.event_type === 'IDLE_START') {
        openStartEvent = event;
        idleState = 'IDLE_ON';
      } else if (event.event_type === 'IDLE_REPORT') {
        openStartEvent = event;
        idleState = 'IDLE_ON';
      } else if (event.event_type === 'IDLE_END') {
        anomalies.push({ type: 'orphan_end', event });
      }
      continue;
    }

    if (event.event_type === 'IDLE_REPORT') {
      continue;
    }

    if (event.event_type === 'IDLE_END') {
      const buildMode = openStartEvent.event_type === 'IDLE_REPORT' ? 'synthetic_report' : 'explicit';
      const anomalyFlags = openStartEvent.event_type === 'IDLE_REPORT' ? ['report_without_start'] : [];

      intervals.push(
        buildInterval({
          movilId,
          startEvent: openStartEvent,
          endEvent: event,
          buildMode,
          anomalies: anomalyFlags,
        })
      );

      openStartEvent = null;
      idleState = 'IDLE_OFF';
      continue;
    }

    if (event.event_type === 'IDLE_START') {
      intervals.push(
        buildInterval({
          movilId,
          startEvent: openStartEvent,
          endEvent: event,
          buildMode: 'implicit_close_next_start',
          anomalies: ['missing_end'],
        })
      );

      openStartEvent = event;
      idleState = 'IDLE_ON';
    }
  }

  if (idleState === 'IDLE_ON' && openStartEvent) {
    const endWindowEvent = {
      ...openStartEvent,
      event_ts_utc: new Date(fechaHasta).toISOString(),
    };

    intervals.push(
      buildInterval({
        movilId,
        startEvent: openStartEvent,
        endEvent: endWindowEvent,
        buildMode: 'window_close',
        anomalies: ['missing_end'],
      })
    );
  }

  return {
    intervals,
    anomalies,
    stats: {
      input_events: sortedEvents.length,
      intervals_built: intervals.length,
      orphan_end_count: anomalies.length,
    },
  };
}

async function extractRawIdleEventsFromLegacy(movilId, fechaDesde, fechaHasta) {
  const fechaDesdeNormalized = normalizeDateForLocalTimestamp(fechaDesde);
  const fechaHastaNormalized = normalizeDateForLocalTimestamp(fechaHasta);

  const monthKeys = buildMonthKeysBetween(fechaDesdeNormalized, fechaHastaNormalized);
  const rawEvents = [];

  for (const monthKey of monthKeys) {
    const tableName = `ActividadDiaria${monthKey}`;

    if (!(await tableExists(tableName))) {
      logger.warn('Tabla mensual no encontrada para reconstrucción v2', { tableName, movilId });
      continue;
    }

    const sql = `
      SELECT
        "act"."movil_Movil_ID_OID" AS movil_id,
        "act"."conductor_identificacion_OID" AS persona_id,
        "act"."diaHora" AS event_ts_utc,
        "act".latitude AS latitud,
        "act".longitude AS longitud,
        "est"."codigo" AS estado_codigo,
        "est"."tipoRegla" AS tipo_regla
      FROM public."${tableName}" AS "act"
      INNER JOIN public."EstadosGpsVirlock" AS "est"
        ON "est"."codigo" = "act"."estadoGPSVirlock_codigo_OID"
      WHERE "act"."movil_Movil_ID_OID" = $1
        AND ("act"."diaHora" - interval '3 hour') >= $2::timestamp
        AND ("act"."diaHora" - interval '3 hour') <= $3::timestamp
        AND UPPER(COALESCE("est"."tipoRegla", '')) IN ('IDLE_START', 'IDLE_REPORT', 'IDLE_END')
      ORDER BY "act"."diaHora" ASC
    `;

    const result = await query(sql, [movilId, fechaDesdeNormalized, fechaHastaNormalized]);

    for (const row of result.rows) {
      const eventType = classifyIdleEventType({
        tipoRegla: row.tipo_regla,
      });
      if (!eventType) {
        continue;
      }

      const sourceHash = makeSourceHash({
        movil_id: row.movil_id,
        event_ts_utc: new Date(row.event_ts_utc).toISOString(),
        event_type: eventType,
        latitud: row.latitud,
        longitud: row.longitud,
        estado_codigo: row.estado_codigo,
        tipo_regla: row.tipo_regla,
      });

      rawEvents.push({
        movil_id: row.movil_id,
        equipo_id: null,
        persona_id: row.persona_id ? Number(row.persona_id) : null,
        event_ts_utc: row.event_ts_utc,
        event_type: eventType,
        latitud: row.latitud,
        longitud: row.longitud,
        payload: {
          estado_codigo: row.estado_codigo,
          tipo_regla: row.tipo_regla,
          source_table: tableName,
        },
        source_hash: sourceHash,
      });
    }
  }

  return rawEvents;
}

async function persistRawEvents(events) {
  for (const event of events) {
    await query(
      `
      INSERT INTO idle_events_v2_raw (
        movil_id,
        equipo_id,
        persona_id,
        event_ts_utc,
        event_type,
        latitud,
        longitud,
        payload,
        source_hash
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      ON CONFLICT (source_hash) DO NOTHING
      `,
      [
        event.movil_id,
        event.equipo_id,
        event.persona_id,
        event.event_ts_utc,
        event.event_type,
        event.latitud,
        event.longitud,
        JSON.stringify(event.payload || {}),
        event.source_hash,
      ]
    );
  }
}

async function persistIntervals(intervals) {
  for (const interval of intervals) {
    await query(
      `
      INSERT INTO idle_intervals_v2 (
        movil_id,
        equipo_id,
        persona_id,
        start_ts_utc,
        end_ts_utc,
        duration_sec,
        start_lat,
        start_lng,
        end_lat,
        end_lng,
        build_mode,
        quality_score,
        anomaly_flags,
        algorithm_version,
        source_hash,
        updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::jsonb,$14,$15,NOW())
      ON CONFLICT (source_hash) DO UPDATE
      SET
        duration_sec = EXCLUDED.duration_sec,
        quality_score = EXCLUDED.quality_score,
        anomaly_flags = EXCLUDED.anomaly_flags,
        updated_at = NOW()
      `,
      [
        interval.movil_id,
        interval.equipo_id,
        interval.persona_id,
        interval.start_ts_utc,
        interval.end_ts_utc,
        interval.duration_sec,
        interval.start_lat,
        interval.start_lng,
        interval.end_lat,
        interval.end_lng,
        interval.build_mode,
        interval.quality_score,
        JSON.stringify(interval.anomaly_flags || []),
        interval.algorithm_version,
        interval.source_hash,
      ]
    );
  }
}

async function persistCoverage({ movilId, fechaDesde, fechaHasta }) {
  await query(
    `
    INSERT INTO idle_intervals_v2_coverage (
      movil_id,
      from_ts_utc,
      to_ts_utc,
      algorithm_version,
      status,
      updated_at
    ) VALUES ($1,$2,$3,$4,'ok',NOW())
    ON CONFLICT (movil_id, from_ts_utc, to_ts_utc, algorithm_version)
    DO UPDATE SET
      status = EXCLUDED.status,
      updated_at = NOW()
    `,
    [movilId, fechaDesde, fechaHasta, ALGORITHM_VERSION]
  );
}

export async function reconstructIdleIntervalsForRange({ movilId, fechaDesde, fechaHasta, persist = false }) {
  if (!movilId) {
    const error = new Error('movilId es requerido');
    error.status = 400;
    throw error;
  }

  if (!fechaDesde || !fechaHasta) {
    const error = new Error('fechaDesde y fechaHasta son requeridas');
    error.status = 400;
    throw error;
  }

  const rawEvents = await extractRawIdleEventsFromLegacy(movilId, fechaDesde, fechaHasta);
  const computeResult = computeIdleIntervalsFromEvents(rawEvents, {
    movilId,
    fechaHasta,
  });

  if (persist) {
    await persistRawEvents(rawEvents);
    await persistIntervals(computeResult.intervals);
    await persistCoverage({ movilId, fechaDesde, fechaHasta });
  }

  logger.info('reconstructIdleIntervalsForRange completado', {
    movilId,
    fechaDesde,
    fechaHasta,
    persist,
    inputEvents: computeResult.stats.input_events,
    intervalsBuilt: computeResult.stats.intervals_built,
  });

  return {
    movilId,
    fechaDesde,
    fechaHasta,
    persist,
    algorithmVersion: ALGORITHM_VERSION,
    ...computeResult,
  };
}

/**
 * Lectura persistida v2 (reemplazo de informesRalentis legacy)
 */
export async function getPersistedRalentisPorMoviles(movilIds, fechaDesde, fechaHasta) {
  if (!Array.isArray(movilIds) || movilIds.length === 0) {
    const error = new Error('movilIds es requerida y debe ser un array no vacío');
    error.status = 400;
    throw error;
  }

  if (!fechaDesde || !fechaHasta) {
    const error = new Error('fechaDesde y fechaHasta son requeridas');
    error.status = 400;
    throw error;
  }

  const fechaDesdeNormalized = normalizeDateForLocalTimestamp(fechaDesde);
  const fechaHastaNormalized = normalizeDateForLocalTimestamp(fechaHasta);
  const placeholders = movilIds.map((_, idx) => `$${idx + 1}`).join(',');

  const sql = `
    SELECT
      id AS "idRalenti",
      movil_id AS "IdMovil",
      to_char((start_ts_utc - interval '3 hour'), 'YYYY-MM-DD"T"HH24:MI:SS.MS') || '-03:00' AS "fechaHoraInicio",
      to_char((end_ts_utc - interval '3 hour'), 'YYYY-MM-DD"T"HH24:MI:SS.MS') || '-03:00' AS "fechahoraFin",
      duration_sec AS "tiempoRalenti",
      start_lat AS latitud,
      start_lng AS longitud,
      persona_id AS "idPersona",
      equipo_id AS "idEquipo"
    FROM idle_intervals_v2
    WHERE movil_id IN (${placeholders})
      AND (start_ts_utc - interval '3 hour') >= $${movilIds.length + 1}::timestamp
      AND (start_ts_utc - interval '3 hour') <= $${movilIds.length + 2}::timestamp
    ORDER BY start_ts_utc DESC
  `;

  const params = [...movilIds, fechaDesdeNormalized, fechaHastaNormalized];
  const result = await query(sql, params);

  logger.info('getPersistedRalentisPorMoviles: lectura v2', {
    movilIds: movilIds.length,
    rows: result.rows.length,
    fechaDesde: fechaDesdeNormalized,
    fechaHasta: fechaHastaNormalized,
  });

  return result.rows;
}

export async function getAllPersistedRalentis(limit = 100) {
  const sql = `
    SELECT
      id AS "idRalenti",
      movil_id AS "IdMovil",
      to_char((start_ts_utc - interval '3 hour'), 'YYYY-MM-DD"T"HH24:MI:SS.MS') || '-03:00' AS "fechaHoraInicio",
      to_char((end_ts_utc - interval '3 hour'), 'YYYY-MM-DD"T"HH24:MI:SS.MS') || '-03:00' AS "fechahoraFin",
      duration_sec AS "tiempoRalenti",
      start_lat AS latitud,
      start_lng AS longitud,
      persona_id AS "idPersona",
      equipo_id AS "idEquipo"
    FROM idle_intervals_v2
    ORDER BY start_ts_utc DESC
    LIMIT $1
  `;

  const result = await query(sql, [limit]);
  return result.rows;
}

export async function getPersistedRalentiById(idRalenti) {
  const sql = `
    SELECT
      id AS "idRalenti",
      movil_id AS "IdMovil",
      to_char((start_ts_utc - interval '3 hour'), 'YYYY-MM-DD"T"HH24:MI:SS.MS') || '-03:00' AS "fechaHoraInicio",
      to_char((end_ts_utc - interval '3 hour'), 'YYYY-MM-DD"T"HH24:MI:SS.MS') || '-03:00' AS "fechahoraFin",
      duration_sec AS "tiempoRalenti",
      start_lat AS latitud,
      start_lng AS longitud,
      persona_id AS "idPersona",
      equipo_id AS "idEquipo"
    FROM idle_intervals_v2
    WHERE id = $1
  `;

  const result = await query(sql, [idRalenti]);
  if (!result.rows.length) {
    const error = new Error('Ralentí no encontrado');
    error.status = 404;
    throw error;
  }

  return result.rows[0];
}
