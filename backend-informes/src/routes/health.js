/**
 * Rutas de Health Check
 */

import express from 'express';
import { getPool } from '../db/pool.js';
import { logger } from '../utils/logger.js';

export const router = express.Router();

/**
 * GET /servicio/v2/health
 * Verifica que el servicio esté funcionando
 */
router.get('/', async (req, res) => {
  try {
    // Test DB connection
    const pool = getPool();
    const dbTest = await pool.query('SELECT NOW()');
    const dbTimestamp = dbTest.rows[0].now;

    res.json({
      ok: true,
      service: 'fullcontrol-backend-informes-v2',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        timestamp: dbTimestamp,
      },
      version: process.env.npm_package_version || '1.0.0',
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      ok: false,
      service: 'fullcontrol-backend-informes-v2',
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        error: error.message,
      },
    });
  }
});

export default router;
