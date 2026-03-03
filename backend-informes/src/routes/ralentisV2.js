/**
 * Rutas de Ralentís v2 (Fase 1)
 */

import express from 'express';
import * as ralentiV2Service from '../services/ralentiV2Service.js';
import { query } from '../db/pool.js';

export const router = express.Router();

function envNumber(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) ? value : fallback;
}

const RALENTI_V2_DEFAULTS = {
  loteConcurrency: envNumber('RALENTI_V2_LOTE_CONCURRENCY', 8),
  loteChunkSize: envNumber('RALENTI_V2_LOTE_CHUNK_SIZE', 120),
  loteLockKey: envNumber('RALENTI_V2_LOTE_LOCK_KEY', 95012026),
  onDemandConcurrency: envNumber('RALENTI_V2_ONDEMAND_CONCURRENCY', 12),
  onDemandFreshnessMinutes: envNumber('RALENTI_V2_ONDEMAND_FRESHNESS_MIN', 5),
  activosRealtimeMinutes: envNumber('RALENTI_V2_ACTIVOS_REALTIME_MIN', 5),
  activosMaxMoviles: envNumber('RALENTI_V2_ACTIVOS_MAX_MOVILES', 2500),
  activosConcurrency: envNumber('RALENTI_V2_ACTIVOS_CONCURRENCY', 12),
  activosChunkSize: envNumber('RALENTI_V2_ACTIVOS_CHUNK_SIZE', 200),
  activosLockKey: envNumber('RALENTI_V2_ACTIVOS_LOCK_KEY', 95012027),
};

function parseBoolean(value, defaultValue = false) {
  if (value === undefined || value === null) {
    return defaultValue;
  }
  return String(value).toLowerCase() === 'true';
}

async function runWithConcurrency(items, worker, concurrency) {
  const results = new Array(items.length);
  let cursor = 0;

  const runners = Array.from({ length: concurrency }, async () => {
    while (true) {
      const current = cursor;
      cursor += 1;

      if (current >= items.length) {
        break;
      }

      results[current] = await worker(items[current], current);
    }
  });

  await Promise.all(runners);
  return results;
}

function chunkArray(items, chunkSize) {
  const chunks = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }
  return chunks;
}

async function acquireBatchLock(lockKey) {
  const result = await query('SELECT pg_try_advisory_lock($1) AS acquired', [lockKey]);
  return result.rows[0]?.acquired === true;
}

async function releaseBatchLock(lockKey) {
  await query('SELECT pg_advisory_unlock($1)', [lockKey]);
}

async function getFreshCoverageMovilIds({ movilIds, fechaDesde, fechaHasta, freshnessMinutes }) {
  if (!movilIds.length || !freshnessMinutes || freshnessMinutes <= 0) {
    return new Set();
  }

  const sql = `
    SELECT movil_id
    FROM idle_intervals_v2_coverage
    WHERE movil_id = ANY($1::int[])
      AND from_ts_utc = $2::timestamptz
      AND to_ts_utc = $3::timestamptz
      AND updated_at >= (NOW() - ($4::int || ' minutes')::interval)
  `;

  const result = await query(sql, [movilIds, fechaDesde, fechaHasta, freshnessMinutes]);
  return new Set(result.rows.map((row) => Number(row.movil_id)));
}

/**
 * GET /api/ralentis-v2
 * Lectura de intervalos persistidos v2 por móviles y rango.
 */
router.get('/', async (req, res, next) => {
  try {
    const { movilIds, fechaDesde, fechaHasta } = req.query;

    if (!movilIds || !fechaDesde || !fechaHasta) {
      return res.status(400).json({
        ok: false,
        error: 'Se requiere especificar movilIds (JSON array), fechaDesde y fechaHasta',
      });
    }

    let movilIdsList = [];
    try {
      movilIdsList = typeof movilIds === 'string' ? JSON.parse(movilIds) : movilIds;
    } catch {
      return res.status(400).json({
        ok: false,
        error: 'movilIds debe ser un JSON array válido, ej: [7246, 6661]',
      });
    }

    const data = await ralentiV2Service.getPersistedRalentisPorMoviles(
      movilIdsList,
      fechaDesde,
      fechaHasta
    );

    res.json({
      ok: true,
      data,
      count: data.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/ralentis-v2/id/:id
 * Obtiene un intervalo persistido v2 por ID.
 */
router.get('/id/:id', async (req, res, next) => {
  try {
    const data = await ralentiV2Service.getPersistedRalentiById(req.params.id);
    res.json({ ok: true, data });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/ralentis-v2/all
 * Obtiene intervalos persistidos v2 con límite.
 */
router.get('/all', async (req, res, next) => {
  try {
    const limit = Number(req.query.limit || 100);
    const data = await ralentiV2Service.getAllPersistedRalentis(limit);
    res.json({ ok: true, data, count: data.length });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/ralentis-v2/reconstruir
 * Reconstruye intervalos de ralentí desde eventos históricos
 * Query params:
 *   - movilId: number
 *   - fechaDesde: string (ISO 8601)
 *   - fechaHasta: string (ISO 8601)
 *   - persist: boolean (opcional, default false)
 */
router.get('/reconstruir', async (req, res, next) => {
  try {
    const { movilId, fechaDesde, fechaHasta, persist = 'false' } = req.query;

    const v2Enabled = (process.env.RALENTI_V2_ENABLED || 'true').toLowerCase() === 'true';
    if (!v2Enabled) {
      return res.status(503).json({
        ok: false,
        error: 'RALENTI_V2 está deshabilitado por feature flag',
      });
    }

    const result = await ralentiV2Service.reconstructIdleIntervalsForRange({
      movilId: Number(movilId),
      fechaDesde,
      fechaHasta,
      persist: String(persist).toLowerCase() === 'true',
    });

    res.json({
      ok: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/ralentis-v2/reconstruir-lote
 * Reconstruye intervalos de ralentí para múltiples unidades y devuelve métricas de rendimiento.
 * Body:
 *   - movilIds: number[]
 *   - fechaDesde: string (ISO 8601)
 *   - fechaHasta: string (ISO 8601)
 *   - persist: boolean (opcional, default false)
 *   - concurrency: number (opcional, default 8, max 32)
 */
router.post('/reconstruir-lote', async (req, res, next) => {
  try {
    const v2Enabled = (process.env.RALENTI_V2_ENABLED || 'true').toLowerCase() === 'true';
    if (!v2Enabled) {
      return res.status(503).json({
        ok: false,
        error: 'RALENTI_V2 está deshabilitado por feature flag',
      });
    }

    const {
      movilIds = [],
      fechaDesde,
      fechaHasta,
      persist = false,
      concurrency = 8,
    } = req.body || {};

    if (!Array.isArray(movilIds) || movilIds.length === 0) {
      return res.status(400).json({
        ok: false,
        error: 'movilIds es requerido y debe ser un array no vacío',
      });
    }

    if (!fechaDesde || !fechaHasta) {
      return res.status(400).json({
        ok: false,
        error: 'fechaDesde y fechaHasta son requeridas',
      });
    }

    const uniqueMovilIds = [...new Set(movilIds.map((value) => Number(value)).filter(Boolean))];
    const parsedConcurrency = Math.min(32, Math.max(1, Number(concurrency) || 8));
    const persistFlag = parseBoolean(persist, false);

    const batchStartedAt = Date.now();

    const perUnit = await runWithConcurrency(
      uniqueMovilIds,
      async (movilId) => {
        const startedAt = Date.now();
        try {
          const result = await ralentiV2Service.reconstructIdleIntervalsForRange({
            movilId,
            fechaDesde,
            fechaHasta,
            persist: persistFlag,
          });

          return {
            movilId,
            ok: true,
            durationMs: Date.now() - startedAt,
            stats: result.stats,
          };
        } catch (error) {
          return {
            movilId,
            ok: false,
            durationMs: Date.now() - startedAt,
            error: error.message,
          };
        }
      },
      parsedConcurrency
    );

    const totalDurationMs = Date.now() - batchStartedAt;
    const durations = perUnit.map((item) => item.durationMs).sort((a, b) => a - b);
    const p95Index = Math.max(0, Math.ceil(durations.length * 0.95) - 1);
    const successCount = perUnit.filter((item) => item.ok).length;
    const errorCount = perUnit.length - successCount;
    const totalIntervals = perUnit.reduce(
      (acc, item) => acc + (item.stats?.intervals_built || 0),
      0
    );
    const totalEvents = perUnit.reduce(
      (acc, item) => acc + (item.stats?.input_events || 0),
      0
    );

    const throughputUnitsPerSec = Number((perUnit.length / Math.max(totalDurationMs / 1000, 0.001)).toFixed(2));

    res.json({
      ok: true,
      data: {
        fechaDesde,
        fechaHasta,
        persist: persistFlag,
        concurrency: parsedConcurrency,
        unitsRequested: movilIds.length,
        unitsProcessed: perUnit.length,
        successCount,
        errorCount,
        totalDurationMs,
        avgDurationMs: Math.round(durations.reduce((acc, value) => acc + value, 0) / Math.max(durations.length, 1)),
        p95DurationMs: durations[p95Index] || 0,
        maxDurationMs: durations[durations.length - 1] || 0,
        throughputUnitsPerSec,
        totalEvents,
        totalIntervals,
        estimateFor1Minute: {
          canRunEveryMinute: totalDurationMs < 60000,
          headroomMs: 60000 - totalDurationMs,
        },
        perUnit,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/ralentis-v2/reconstruir-lote-escalable
 * Procesa lotes grandes por chunks, con lock de ejecución para evitar solapamiento.
 * Body:
 *   - movilIds: number[]
 *   - fechaDesde: string (ISO 8601)
 *   - fechaHasta: string (ISO 8601)
 *   - persist: boolean (opcional, default true)
 *   - concurrency: number (opcional, default 8, max 32)
 *   - chunkSize: number (opcional, default 120, max 300)
 *   - lockKey: number (opcional, default 95012026)
 */
router.post('/reconstruir-lote-escalable', async (req, res, next) => {
  const {
    movilIds = [],
    fechaDesde,
    fechaHasta,
    persist = true,
      concurrency = RALENTI_V2_DEFAULTS.loteConcurrency,
      chunkSize = RALENTI_V2_DEFAULTS.loteChunkSize,
      lockKey = RALENTI_V2_DEFAULTS.loteLockKey,
  } = req.body || {};

  const v2Enabled = (process.env.RALENTI_V2_ENABLED || 'true').toLowerCase() === 'true';
  if (!v2Enabled) {
    return res.status(503).json({
      ok: false,
      error: 'RALENTI_V2 está deshabilitado por feature flag',
    });
  }

  if (!Array.isArray(movilIds) || movilIds.length === 0) {
    return res.status(400).json({
      ok: false,
      error: 'movilIds es requerido y debe ser un array no vacío',
    });
  }

  if (!fechaDesde || !fechaHasta) {
    return res.status(400).json({
      ok: false,
      error: 'fechaDesde y fechaHasta son requeridas',
    });
  }

  const uniqueMovilIds = [...new Set(movilIds.map((value) => Number(value)).filter(Boolean))];
  const parsedConcurrency = Math.min(32, Math.max(1, Number(concurrency) || 8));
  const parsedChunkSize = Math.min(300, Math.max(20, Number(chunkSize) || 120));
  const persistFlag = parseBoolean(persist, true);
  const parsedLockKey = Number(lockKey) || 95012026;

  let lockAcquired = false;

  try {
    lockAcquired = await acquireBatchLock(parsedLockKey);

    if (!lockAcquired) {
      return res.status(409).json({
        ok: false,
        error: 'Ya existe una ejecución en curso para este lockKey',
        data: {
          skipped: true,
          reason: 'batch-already-running',
          lockKey: parsedLockKey,
        },
      });
    }

    const chunks = chunkArray(uniqueMovilIds, parsedChunkSize);
    const batchStartedAt = Date.now();
    const perUnit = [];
    const chunkSummaries = [];

    for (let index = 0; index < chunks.length; index += 1) {
      const chunk = chunks[index];
      const chunkStartedAt = Date.now();

      const chunkResults = await runWithConcurrency(
        chunk,
        async (movilId) => {
          const unitStartedAt = Date.now();
          try {
            const result = await ralentiV2Service.reconstructIdleIntervalsForRange({
              movilId,
              fechaDesde,
              fechaHasta,
              persist: persistFlag,
            });

            return {
              movilId,
              ok: true,
              durationMs: Date.now() - unitStartedAt,
              stats: result.stats,
            };
          } catch (error) {
            return {
              movilId,
              ok: false,
              durationMs: Date.now() - unitStartedAt,
              error: error.message,
            };
          }
        },
        parsedConcurrency
      );

      perUnit.push(...chunkResults);

      chunkSummaries.push({
        chunkIndex: index,
        chunkSize: chunk.length,
        durationMs: Date.now() - chunkStartedAt,
        successCount: chunkResults.filter((item) => item.ok).length,
        errorCount: chunkResults.filter((item) => !item.ok).length,
      });
    }

    const totalDurationMs = Date.now() - batchStartedAt;
    const durations = perUnit.map((item) => item.durationMs).sort((a, b) => a - b);
    const p95Index = Math.max(0, Math.ceil(durations.length * 0.95) - 1);
    const successCount = perUnit.filter((item) => item.ok).length;
    const errorCount = perUnit.length - successCount;
    const totalIntervals = perUnit.reduce(
      (acc, item) => acc + (item.stats?.intervals_built || 0),
      0
    );
    const totalEvents = perUnit.reduce(
      (acc, item) => acc + (item.stats?.input_events || 0),
      0
    );
    const throughputUnitsPerSec = Number((perUnit.length / Math.max(totalDurationMs / 1000, 0.001)).toFixed(2));

    res.json({
      ok: true,
      data: {
        mode: 'scalable-chunked',
        fechaDesde,
        fechaHasta,
        persist: persistFlag,
        concurrency: parsedConcurrency,
        chunkSize: parsedChunkSize,
        chunkCount: chunks.length,
        lockKey: parsedLockKey,
        unitsRequested: movilIds.length,
        unitsProcessed: perUnit.length,
        successCount,
        errorCount,
        totalDurationMs,
        avgDurationMs: Math.round(
          durations.reduce((acc, value) => acc + value, 0) / Math.max(durations.length, 1)
        ),
        p95DurationMs: durations[p95Index] || 0,
        maxDurationMs: durations[durations.length - 1] || 0,
        throughputUnitsPerSec,
        totalEvents,
        totalIntervals,
        estimateFor1Minute: {
          canRunEveryMinute: totalDurationMs < 60000,
          headroomMs: 60000 - totalDurationMs,
        },
        chunkSummaries,
      },
    });
  } catch (error) {
    next(error);
  } finally {
    if (lockAcquired) {
      try {
        await releaseBatchLock(parsedLockKey);
      } catch {
      }
    }
  }
});

/**
 * POST /api/ralentis-v2/refrescar-demanda
 * Refresca de forma prioritaria las unidades solicitadas por el usuario.
 * Pensado para interacción de panel: si el dato está fresco, se omite reproceso.
 * Body:
 *   - movilIds: number[]
 *   - fechaDesde: string (ISO 8601)
 *   - fechaHasta: string (ISO 8601)
 *   - persist: boolean (default true)
 *   - concurrency: number (default 12, max 32)
 *   - freshnessMinutes: number (default 5)
 */
router.post('/refrescar-demanda', async (req, res, next) => {
  try {
    const v2Enabled = (process.env.RALENTI_V2_ENABLED || 'true').toLowerCase() === 'true';
    if (!v2Enabled) {
      return res.status(503).json({
        ok: false,
        error: 'RALENTI_V2 está deshabilitado por feature flag',
      });
    }

    const {
      movilIds = [],
      fechaDesde,
      fechaHasta,
      persist = true,
      concurrency = RALENTI_V2_DEFAULTS.onDemandConcurrency,
      freshnessMinutes = RALENTI_V2_DEFAULTS.onDemandFreshnessMinutes,
    } = req.body || {};

    if (!Array.isArray(movilIds) || movilIds.length === 0) {
      return res.status(400).json({
        ok: false,
        error: 'movilIds es requerido y debe ser un array no vacío',
      });
    }

    if (!fechaDesde || !fechaHasta) {
      return res.status(400).json({
        ok: false,
        error: 'fechaDesde y fechaHasta son requeridas',
      });
    }

    const uniqueMovilIds = [...new Set(movilIds.map((value) => Number(value)).filter(Boolean))];
    const parsedConcurrency = Math.min(32, Math.max(1, Number(concurrency) || 12));
    const persistFlag = parseBoolean(persist, true);
    const parsedFreshnessMinutes = Math.max(0, Number(freshnessMinutes) || 5);

    const freshMovilIds = await getFreshCoverageMovilIds({
      movilIds: uniqueMovilIds,
      fechaDesde,
      fechaHasta,
      freshnessMinutes: parsedFreshnessMinutes,
    });

    const toProcess = uniqueMovilIds.filter((movilId) => !freshMovilIds.has(movilId));
    const skippedFresh = uniqueMovilIds.length - toProcess.length;

    const startedAt = Date.now();
    const perUnit = await runWithConcurrency(
      toProcess,
      async (movilId) => {
        const unitStartedAt = Date.now();
        try {
          const result = await ralentiV2Service.reconstructIdleIntervalsForRange({
            movilId,
            fechaDesde,
            fechaHasta,
            persist: persistFlag,
          });

          return {
            movilId,
            ok: true,
            durationMs: Date.now() - unitStartedAt,
            stats: result.stats,
          };
        } catch (error) {
          return {
            movilId,
            ok: false,
            durationMs: Date.now() - unitStartedAt,
            error: error.message,
          };
        }
      },
      parsedConcurrency
    );

    const totalDurationMs = Date.now() - startedAt;
    const durations = perUnit.map((item) => item.durationMs).sort((a, b) => a - b);
    const p95Index = Math.max(0, Math.ceil(durations.length * 0.95) - 1);
    const successCount = perUnit.filter((item) => item.ok).length;
    const errorCount = perUnit.length - successCount;
    const totalEvents = perUnit.reduce((acc, item) => acc + (item.stats?.input_events || 0), 0);
    const totalIntervals = perUnit.reduce((acc, item) => acc + (item.stats?.intervals_built || 0), 0);

    res.json({
      ok: true,
      data: {
        mode: 'on-demand-priority',
        fechaDesde,
        fechaHasta,
        persist: persistFlag,
        concurrency: parsedConcurrency,
        freshnessMinutes: parsedFreshnessMinutes,
        unitsRequested: uniqueMovilIds.length,
        unitsSkippedFresh: skippedFresh,
        unitsProcessed: perUnit.length,
        successCount,
        errorCount,
        totalDurationMs,
        avgDurationMs: durations.length
          ? Math.round(durations.reduce((acc, value) => acc + value, 0) / durations.length)
          : 0,
        p95DurationMs: durations[p95Index] || 0,
        maxDurationMs: durations[durations.length - 1] || 0,
        totalEvents,
        totalIntervals,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/ralentis-v2/reconstruir-activos
 * Ejecuta la parte de fondo en modo híbrido: sólo unidades con actividad reciente.
 * Body:
 *   - fechaDesde: string (ISO 8601) opcional
 *   - fechaHasta: string (ISO 8601) opcional
 *   - realtimeMinutes: number (default 5, usado si no llegan fechas)
 *   - maxMoviles: number (default 2500)
 *   - persist: boolean (default true)
 *   - concurrency: number (default 12)
 *   - chunkSize: number (default 200)
 *   - lockKey: number (default 95012027)
 */
router.post('/reconstruir-activos', async (req, res, next) => {
  let lockAcquired = false;

  try {
    const v2Enabled = (process.env.RALENTI_V2_ENABLED || 'true').toLowerCase() === 'true';
    if (!v2Enabled) {
      return res.status(503).json({
        ok: false,
        error: 'RALENTI_V2 está deshabilitado por feature flag',
      });
    }

    const {
      fechaDesde,
      fechaHasta,
      realtimeMinutes = RALENTI_V2_DEFAULTS.activosRealtimeMinutes,
      maxMoviles = RALENTI_V2_DEFAULTS.activosMaxMoviles,
      persist = true,
      concurrency = RALENTI_V2_DEFAULTS.activosConcurrency,
      chunkSize = RALENTI_V2_DEFAULTS.activosChunkSize,
      lockKey = RALENTI_V2_DEFAULTS.activosLockKey,
    } = req.body || {};

    const now = new Date();
    const parsedRealtimeMinutes = Math.max(1, Number(realtimeMinutes) || 5);
    const resolvedHasta = fechaHasta || now.toISOString();
    const resolvedDesde =
      fechaDesde || new Date(now.getTime() - parsedRealtimeMinutes * 60 * 1000).toISOString();

    const parsedConcurrency = Math.min(32, Math.max(1, Number(concurrency) || 12));
    const parsedChunkSize = Math.min(300, Math.max(20, Number(chunkSize) || 200));
    const parsedMaxMoviles = Math.max(100, Number(maxMoviles) || 2500);
    const persistFlag = parseBoolean(persist, true);
    const parsedLockKey = Number(lockKey) || RALENTI_V2_DEFAULTS.activosLockKey;

    lockAcquired = await acquireBatchLock(parsedLockKey);
    if (!lockAcquired) {
      return res.status(409).json({
        ok: false,
        error: 'Ya existe una ejecución de activos en curso para este lockKey',
        data: {
          skipped: true,
          reason: 'active-batch-already-running',
          lockKey: parsedLockKey,
        },
      });
    }

    const activeMovilIds = await ralentiV2Service.getMovilIdsWithIdleEventsInRange({
      fechaDesde: resolvedDesde,
      fechaHasta: resolvedHasta,
      maxMoviles: parsedMaxMoviles,
    });

    const chunks = chunkArray(activeMovilIds, parsedChunkSize);
    const startedAt = Date.now();
    const perUnit = [];

    for (const chunk of chunks) {
      const chunkResults = await runWithConcurrency(
        chunk,
        async (movilId) => {
          const unitStartedAt = Date.now();
          try {
            const result = await ralentiV2Service.reconstructIdleIntervalsForRange({
              movilId,
              fechaDesde: resolvedDesde,
              fechaHasta: resolvedHasta,
              persist: persistFlag,
            });

            return {
              movilId,
              ok: true,
              durationMs: Date.now() - unitStartedAt,
              stats: result.stats,
            };
          } catch (error) {
            return {
              movilId,
              ok: false,
              durationMs: Date.now() - unitStartedAt,
              error: error.message,
            };
          }
        },
        parsedConcurrency
      );

      perUnit.push(...chunkResults);
    }

    const totalDurationMs = Date.now() - startedAt;
    const durations = perUnit.map((item) => item.durationMs).sort((a, b) => a - b);
    const p95Index = Math.max(0, Math.ceil(durations.length * 0.95) - 1);
    const successCount = perUnit.filter((item) => item.ok).length;
    const errorCount = perUnit.length - successCount;
    const totalEvents = perUnit.reduce((acc, item) => acc + (item.stats?.input_events || 0), 0);
    const totalIntervals = perUnit.reduce((acc, item) => acc + (item.stats?.intervals_built || 0), 0);

    return res.json({
      ok: true,
      data: {
        mode: 'hybrid-active-only',
        fechaDesde: resolvedDesde,
        fechaHasta: resolvedHasta,
        realtimeMinutes: parsedRealtimeMinutes,
        persist: persistFlag,
        concurrency: parsedConcurrency,
        chunkSize: parsedChunkSize,
        maxMoviles: parsedMaxMoviles,
        lockKey: parsedLockKey,
        activeUnitsFound: activeMovilIds.length,
        unitsProcessed: perUnit.length,
        successCount,
        errorCount,
        totalDurationMs,
        avgDurationMs: durations.length
          ? Math.round(durations.reduce((acc, value) => acc + value, 0) / durations.length)
          : 0,
        p95DurationMs: durations[p95Index] || 0,
        maxDurationMs: durations[durations.length - 1] || 0,
        totalEvents,
        totalIntervals,
        estimateFor1Minute: {
          canRunEveryMinute: totalDurationMs < 60000,
          headroomMs: 60000 - totalDurationMs,
        },
      },
    });
  } catch (error) {
    return next(error);
  } finally {
    if (lockAcquired) {
      try {
        await releaseBatchLock(Number(req.body?.lockKey) || RALENTI_V2_DEFAULTS.activosLockKey);
      } catch {
      }
    }
  }
});

export default router;
