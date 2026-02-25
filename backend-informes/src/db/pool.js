/**
 * Pool de conexiones PostgreSQL
 * Maneja la conexión a RDS con reintentos automáticos
 */

import pg from 'pg';
import { getSecrets } from '../config/secrets.js';

const { Pool } = pg;

let pool = null;

export async function initializePool() {
  try {
    const config = await getSecrets();
    
    console.log('[DB] Inicializando pool de conexiones...');
    console.log(`[DB] Host: ${config.db.host}:${config.db.port}`);
    console.log(`[DB] Database: ${config.db.database}`);
    console.log(`[DB] User: ${config.db.user}`);

    pool = new Pool(config.db);

    // Event listeners
    pool.on('connect', () => {
      console.log('[DB] ✓ Nueva conexión establecida');
    });

    pool.on('error', (err) => {
      console.error('[DB] Error en pool:', err);
    });

    // Test conexión
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();

    console.log('[DB] ✓ Pool inicializado exitosamente');
    console.log(`[DB] Timestamp de BD: ${result.rows[0].now}`);

    return pool;
  } catch (error) {
    console.error('[DB] ✗ Error inicializando pool:', error.message);
    throw error;
  }
}

export function getPool() {
  if (!pool) {
    throw new Error('Pool no inicializado. Llama initializePool() primero.');
  }
  return pool;
}

export async function closePool() {
  if (pool) {
    await pool.end();
    console.log('[DB] Pool cerrado');
    pool = null;
  }
}

/**
 * Query helper con reintentos
 */
export async function query(sql, params = [], retries = 3) {
  let lastError;

  for (let i = 0; i < retries; i++) {
    try {
      const result = await getPool().query(sql, params);
      return result;
    } catch (error) {
      lastError = error;
      if (i < retries - 1 && error.code === 'ECONNREFUSED') {
        console.warn(`[DB] Reintentando conexión (${i + 1}/${retries})...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }

  throw lastError;
}

export default { initializePool, getPool, closePool, query };
