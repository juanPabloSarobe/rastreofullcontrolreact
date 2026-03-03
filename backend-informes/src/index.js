/**
 * BACKEND FULLCONTROL - INFORMES v2
 * Servidor principal con gestión de secretos AWS y BD RDS
 */

import express from 'express';
import cors from 'cors';

import { initializePool, closePool } from './db/pool.js';
import { getSecrets } from './config/secrets.js';
import { logger, setLogLevel } from './utils/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

import healthRoutes from './routes/health.js';
import informesRoutes from './routes/informes.js';
import ralentisRoutes from './routes/ralentis.js';
import ralentisV2Routes from './routes/ralentisV2.js';
import conductoresRoutes from './routes/conductores.js';

const app = express();
let backgroundIntervals = [];

function toIsoWithOffset(date) {
  const tzOffsetMinutes = date.getTimezoneOffset();
  const sign = tzOffsetMinutes > 0 ? '-' : '+';
  const pad = (value) => String(Math.floor(Math.abs(value))).padStart(2, '0');

  const absMinutes = Math.abs(tzOffsetMinutes);
  const hh = pad(absMinutes / 60);
  const mm = pad(absMinutes % 60);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}T${hour}:${minute}:${second}${sign}${hh}:${mm}`;
}

function envNumber(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) ? value : fallback;
}

function envBool(name, fallback) {
  const value = process.env[name];
  if (value === undefined) return fallback;
  return String(value).toLowerCase() === 'true';
}

function startRalentisV2AutoJobs(port) {
  const enabled = envBool('RALENTI_V2_AUTORUN_ENABLED', false);
  if (!enabled) {
    logger.info('RALENTI_V2_AUTORUN deshabilitado');
    return;
  }

  const baseUrl = `http://localhost:${port}`;
  const activeIntervalMs = envNumber('RALENTI_V2_AUTORUN_ACTIVE_INTERVAL_MS', 240000);
  const retroIntervalMs = envNumber('RALENTI_V2_AUTORUN_RETRO_INTERVAL_MS', 3600000);
  const retroHours = envNumber('RALENTI_V2_AUTORUN_RETRO_HOURS', 72);

  const runActive = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/ralentis-v2/reconstruir-activos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persist: true }),
      });

      const payload = await response.json();
      if (!response.ok) {
        logger.warn('Job activo-only respondió con error', {
          status: response.status,
          payload,
        });
        return;
      }

      logger.info('Job activo-only completado', {
        activeUnitsFound: payload?.data?.activeUnitsFound,
        totalDurationMs: payload?.data?.totalDurationMs,
      });
    } catch (error) {
      logger.error('Fallo job activo-only', { message: error.message });
    }
  };

  const runRetro = async () => {
    try {
      const now = new Date();
      const from = new Date(now.getTime() - retroHours * 60 * 60 * 1000);

      const response = await fetch(`${baseUrl}/api/ralentis-v2/reconstruir-activos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fechaDesde: toIsoWithOffset(from),
          fechaHasta: toIsoWithOffset(now),
          persist: true,
          lockKey: envNumber('RALENTI_V2_AUTORUN_RETRO_LOCK_KEY', 95012028),
          maxMoviles: envNumber('RALENTI_V2_AUTORUN_RETRO_MAX_MOVILES', 5000),
          concurrency: envNumber('RALENTI_V2_AUTORUN_RETRO_CONCURRENCY', 8),
          chunkSize: envNumber('RALENTI_V2_AUTORUN_RETRO_CHUNK_SIZE', 120),
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        logger.warn('Job retroactivo respondió con error', {
          status: response.status,
          payload,
        });
        return;
      }

      logger.info('Job retroactivo completado', {
        activeUnitsFound: payload?.data?.activeUnitsFound,
        totalDurationMs: payload?.data?.totalDurationMs,
        retroHours,
      });
    } catch (error) {
      logger.error('Fallo job retroactivo', { message: error.message });
    }
  };

  runActive();

  const activeTimer = setInterval(runActive, activeIntervalMs);
  const retroTimer = setInterval(runRetro, retroIntervalMs);

  backgroundIntervals = [activeTimer, retroTimer];

  logger.info('RALENTI_V2_AUTORUN habilitado', {
    activeIntervalMs,
    retroIntervalMs,
    retroHours,
  });
}

// ============================================
// INICIALIZACIÓN
// ============================================

async function bootstrap() {
  try {
    console.log('\n🚀 Iniciando Backend FullControl v2...\n');

    // 1. Cargar configuración (secretos)
    const config = await getSecrets();
    
    // 2. Configurar logger
    setLogLevel(config.logging.level);
    logger.info('Logger inicializado', { level: config.logging.level });

    // 3. Inicializar pool de BD
    await initializePool();

    // 4. Configurar Express
    const rawCorsOrigin = (config.server.corsOrigin || '').trim();
    const corsOrigin =
      rawCorsOrigin === '*'
        ? true
        : rawCorsOrigin.split(',').map((origin) => origin.trim());

    app.use(cors({
      origin: corsOrigin,
      credentials: true,
    }));
    app.use(express.json());
    app.use(requestLogger);

    // 5. Rutas
    app.use('/servicio/v2/health', healthRoutes);
    app.use('/api/informes', informesRoutes);
    app.use('/api/ralentis', ralentisRoutes);
    app.use('/api/ralentis-v2', ralentisV2Routes);
    app.use('/api/conductores', conductoresRoutes);

    // 6. Manejadores de errores
    app.use(notFoundHandler);
    app.use(errorHandler);

    // 7. Iniciar servidor
    const server = app.listen(config.server.port, () => {
      logger.info(`✓ Servidor escuchando en http://localhost:${config.server.port}`);
      logger.info(`✓ Entorno: ${config.server.env}`);
    });

    startRalentisV2AutoJobs(config.server.port);

    // 8. Manejo de señales de terminación
    process.on('SIGINT', () => gracefulShutdown(server));
    process.on('SIGTERM', () => gracefulShutdown(server));

    return { app, server, config };
  } catch (error) {
    logger.error('Error fatal durante bootstrap:', error);
    process.exit(1);
  }
}

// ============================================
// SHUTDOWN GRACEFUL
// ============================================

async function gracefulShutdown(server) {
  logger.info('Recibida señal de terminación, cerrando conexiones...');

  backgroundIntervals.forEach((timer) => clearInterval(timer));
  backgroundIntervals = [];

  server.close(async () => {
    await closePool();
    logger.info('✓ Servidor cerrado correctamente');
    process.exit(0);
  });

  // Timeout de 10 segundos para forzar cierre
  setTimeout(() => {
    logger.error('Timeout de cierre, forzando salida');
    process.exit(1);
  }, 10000);
}

// ============================================
// INICIAR
// ============================================

bootstrap().catch((error) => {
  logger.error('Error fatal:', error);
  process.exit(1);
});
