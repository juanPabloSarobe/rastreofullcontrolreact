import { initializePool, closePool, query } from '../src/db/pool.js';
import { reconstructIdleIntervalsForRange } from '../src/services/ralentiV2Service.js';
import fs from 'fs/promises';

function parseArgs(argv) {
  const options = {
    month: null,
    fechaDesde: null,
    fechaHasta: null,
    concurrency: 4,
    chunkSize: 80,
    lockKey: Number(process.env.RALENTI_V2_LOTE_LOCK_KEY || 95012026),
    persist: true,
    maxMoviles: 0,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--month') options.month = argv[++i];
    else if (arg === '--from') options.fechaDesde = argv[++i];
    else if (arg === '--to') options.fechaHasta = argv[++i];
    else if (arg === '--concurrency') options.concurrency = Number(argv[++i]);
    else if (arg === '--chunk-size') options.chunkSize = Number(argv[++i]);
    else if (arg === '--lock-key') options.lockKey = Number(argv[++i]);
    else if (arg === '--persist') options.persist = String(argv[++i]).toLowerCase() === 'true';
    else if (arg === '--max-moviles') options.maxMoviles = Number(argv[++i]);
  }

  return options;
}

function isValidMonth(month) {
  return /^\d{4}-\d{2}$/.test(String(month || ''));
}

function getMonthRange(month) {
  const [year, monthNum] = month.split('-').map(Number);
  const start = `${year}-${String(monthNum).padStart(2, '0')}-01T00:00:00Z`;
  const endDate = new Date(year, monthNum, 0);
  const end = `${year}-${String(monthNum).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}T23:59:59Z`;
  return { start, end };
}

function normalizeDateForLocalTimestamp(dateValue) {
  if (!dateValue || typeof dateValue !== 'string') return dateValue;
  return dateValue.trim().replace(/([zZ]|[+-]\d{2}:?\d{2})$/, '');
}

function buildMonthKeysBetween(fechaDesde, fechaHasta) {
  const from = normalizeDateForLocalTimestamp(fechaDesde).slice(0, 7);
  const to = normalizeDateForLocalTimestamp(fechaHasta).slice(0, 7);
  const [fy, fm] = from.split('-').map(Number);
  const [ty, tm] = to.split('-').map(Number);
  const keys = [];

  const cursor = new Date(Date.UTC(fy, fm - 1, 1));
  const end = new Date(Date.UTC(ty, tm - 1, 1));

  while (cursor <= end) {
    keys.push(`${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, '0')}`);
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }

  return keys;
}

function chunkArray(items, chunkSize) {
  const chunks = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }
  return chunks;
}

async function runWithConcurrency(items, worker, concurrency) {
  const results = new Array(items.length);
  let cursor = 0;

  const runners = Array.from({ length: concurrency }, async () => {
    while (true) {
      const current = cursor;
      cursor += 1;

      if (current >= items.length) break;
      results[current] = await worker(items[current], current);
    }
  });

  await Promise.all(runners);
  return results;
}

async function tableExists(tableName) {
  const result = await query('SELECT to_regclass($1) AS regclass', [`public."${tableName}"`]);
  return Boolean(result.rows[0]?.regclass);
}

async function getMovilIdsWithAnyEventsInRange({ fechaDesde, fechaHasta, maxMoviles = 0 }) {
  const monthKeys = buildMonthKeysBetween(fechaDesde, fechaHasta);
  const movilSet = new Set();

  for (const monthKey of monthKeys) {
    const tableName = `ActividadDiaria${monthKey}`;
    if (!(await tableExists(tableName))) continue;

    const result = await query(
      `SELECT DISTINCT "movil_Movil_ID_OID"::int AS movil_id
       FROM public."${tableName}"
       WHERE ("diaHora" - interval '3 hour') >= $1::timestamp
         AND ("diaHora" - interval '3 hour') <= $2::timestamp`,
      [fechaDesde, fechaHasta]
    );

    for (const row of result.rows) {
      movilSet.add(Number(row.movil_id));
      if (maxMoviles > 0 && movilSet.size >= maxMoviles) {
        return [...movilSet];
      }
    }
  }

  return [...movilSet];
}

async function acquireLock(lockKey) {
  const result = await query('SELECT pg_try_advisory_lock($1) AS acquired', [lockKey]);
  return result.rows[0]?.acquired === true;
}

async function releaseLock(lockKey) {
  await query('SELECT pg_advisory_unlock($1)', [lockKey]);
}

function pct(value, total) {
  if (!total) return '0.00';
  return ((value / total) * 100).toFixed(2);
}

async function main() {
  const opts = parseArgs(process.argv);

  if (opts.month && !isValidMonth(opts.month)) {
    throw new Error('Formato inválido para --month. Usar YYYY-MM');
  }

  if (!opts.month && (!opts.fechaDesde || !opts.fechaHasta)) {
    throw new Error('Debes indicar --month YYYY-MM o ambos --from y --to');
  }

  if (opts.month) {
    const range = getMonthRange(opts.month);
    opts.fechaDesde = range.start;
    opts.fechaHasta = range.end;
  }

  opts.fechaDesde = normalizeDateForLocalTimestamp(opts.fechaDesde);
  opts.fechaHasta = normalizeDateForLocalTimestamp(opts.fechaHasta);
  opts.concurrency = Math.min(32, Math.max(1, Number(opts.concurrency) || 4));
  opts.chunkSize = Math.min(300, Math.max(20, Number(opts.chunkSize) || 80));
  opts.maxMoviles = Math.max(0, Number(opts.maxMoviles) || 0);

  let lockAcquired = false;
  const startedAt = Date.now();

  try {
    await initializePool();

    lockAcquired = await acquireLock(opts.lockKey);
    if (!lockAcquired) {
      throw new Error(`No se pudo adquirir lock ${opts.lockKey}. Ya hay otro backfill en ejecución.`);
    }

    console.log('[BACKFILL] Inicio');
    console.log(
      JSON.stringify(
        {
          fechaDesde: opts.fechaDesde,
          fechaHasta: opts.fechaHasta,
          concurrency: opts.concurrency,
          chunkSize: opts.chunkSize,
          persist: opts.persist,
          lockKey: opts.lockKey,
          maxMoviles: opts.maxMoviles,
        },
        null,
        2
      )
    );

    const movilIds = await getMovilIdsWithAnyEventsInRange({
      fechaDesde: opts.fechaDesde,
      fechaHasta: opts.fechaHasta,
      maxMoviles: opts.maxMoviles,
    });

    console.log(`[BACKFILL] Móviles detectados con actividad: ${movilIds.length}`);

    const chunks = chunkArray(movilIds, opts.chunkSize);
    const perUnit = [];

    for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex += 1) {
      const chunk = chunks[chunkIndex];
      const chunkStartedAt = Date.now();

      const chunkResults = await runWithConcurrency(
        chunk,
        async (movilId) => {
          const unitStarted = Date.now();
          try {
            const result = await reconstructIdleIntervalsForRange({
              movilId,
              fechaDesde: opts.fechaDesde,
              fechaHasta: opts.fechaHasta,
              persist: opts.persist,
            });

            return {
              movilId,
              ok: true,
              durationMs: Date.now() - unitStarted,
              inputEvents: result.stats?.input_events || 0,
              intervalsBuilt: result.stats?.intervals_built || 0,
            };
          } catch (error) {
            return {
              movilId,
              ok: false,
              durationMs: Date.now() - unitStarted,
              error: error.message,
            };
          }
        },
        opts.concurrency
      );

      perUnit.push(...chunkResults);

      const processed = perUnit.length;
      const elapsedSec = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
      const rate = processed / elapsedSec;
      const remaining = Math.max(0, movilIds.length - processed);
      const etaSec = rate > 0 ? Math.round(remaining / rate) : 0;
      const okCount = perUnit.filter((item) => item.ok).length;
      const errCount = perUnit.length - okCount;

      console.log(
        `[BACKFILL] Chunk ${chunkIndex + 1}/${chunks.length} listo en ${Date.now() - chunkStartedAt}ms | ` +
          `procesados=${processed}/${movilIds.length} (${pct(processed, movilIds.length)}%) | ok=${okCount} err=${errCount} | ETA=${etaSec}s`
      );
    }

    const totalDurationMs = Date.now() - startedAt;
    const okCount = perUnit.filter((item) => item.ok).length;
    const errCount = perUnit.length - okCount;
    const totalEvents = perUnit.reduce((acc, item) => acc + (item.inputEvents || 0), 0);
    const totalIntervals = perUnit.reduce((acc, item) => acc + (item.intervalsBuilt || 0), 0);

    const summary = {
      ok: true,
      fechaDesde: opts.fechaDesde,
      fechaHasta: opts.fechaHasta,
      month: opts.month || null,
      unitsDetected: movilIds.length,
      unitsProcessed: perUnit.length,
      successCount: okCount,
      errorCount: errCount,
      totalDurationMs,
      throughputUnitsPerSec: Number((perUnit.length / Math.max(totalDurationMs / 1000, 0.001)).toFixed(2)),
      totalEvents,
      totalIntervals,
      finishedAt: new Date().toISOString(),
    };

    console.log('[BACKFILL] FINAL_SUMMARY', JSON.stringify(summary));

    const reportPath = `tmp/backfill-summary-${opts.month || Date.now()}.json`;
    await fs.mkdir('tmp', { recursive: true });
    await fs.writeFile(reportPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
    console.log(`[BACKFILL] Reporte guardado: ${reportPath}`);
  } finally {
    if (lockAcquired) {
      try {
        await releaseLock(opts.lockKey);
      } catch {
      }
    }

    await closePool();
  }
}

main().catch((error) => {
  console.error('[BACKFILL] ERROR', error.message);
  process.exit(1);
});
