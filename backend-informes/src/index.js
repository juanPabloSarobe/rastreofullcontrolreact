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

const app = express();

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
    app.use(cors({
      origin: config.server.corsOrigin.split(','),
      credentials: true,
    }));
    app.use(express.json());
    app.use(requestLogger);

    // 5. Rutas
    app.use('/servicio/v2/health', healthRoutes);
    app.use('/api/informes', informesRoutes);

    // 6. Manejadores de errores
    app.use(notFoundHandler);
    app.use(errorHandler);

    // 7. Iniciar servidor
    const server = app.listen(config.server.port, () => {
      logger.info(`✓ Servidor escuchando en http://localhost:${config.server.port}`);
      logger.info(`✓ Entorno: ${config.server.env}`);
    });

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
