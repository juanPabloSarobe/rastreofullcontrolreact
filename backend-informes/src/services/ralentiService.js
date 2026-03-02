/**
 * Servicio de Ralentís
 * Lógica de negocio para consulta de informes de ralentización
 */

import { query } from '../db/pool.js';
import { logger } from '../utils/logger.js';

/**
 * Obtiene ralentís por IDs de móviles y rango de fechas
 * @param {Array<number>} movilIds - Lista de IDs de móviles (Movil_ID)
 * @param {string} fechaDesde - Fecha/hora inicio (ISO 8601)
 * @param {string} fechaHasta - Fecha/hora fin (ISO 8601)
 * @returns {Array} Lista de registros de ralentís
 */
export async function getRalentisPorMoviles(movilIds, fechaDesde, fechaHasta) {
  try {
    // Validaciones
    if (!Array.isArray(movilIds) || movilIds.length === 0) {
      const error = new Error('movilIds es requerida y debe ser un array no vacío');
      error.status = 400;
      throw error;
    }

    if (!fechaDesde || !fechaHasta) {
      const error = new Error('FechaDesde y FechaHasta son requeridas');
      error.status = 400;
      throw error;
    }

    // Crear placeholders dinámicamente para el IN con movilIds
    const placeholders = movilIds.map((_, idx) => `$${idx + 1}`).join(',');
    
    const sql = `
      SELECT 
        "idRalenti",
        "IdMovil",
        "fechaHoraInicio",
        "fechahoraFin",
        "tiempoRalenti",
        latitud,
        longitud,
        "idPersona",
        "idEquipo"
      FROM public."informesRalentis"
      WHERE "IdMovil" IN (${placeholders})
        AND "fechaHoraInicio" >= $${movilIds.length + 1}
        AND "fechaHoraInicio" <= $${movilIds.length + 2}
      ORDER BY "fechaHoraInicio" DESC
    `;

    const params = [...movilIds, fechaDesde, fechaHasta];
    const result = await query(sql, params);

    logger.info(
      `getRalentisPorMoviles: Retornando ${result.rows.length} registros`,
      { movilIds: movilIds.length, fechaDesde, fechaHasta }
    );

    return result.rows;
  } catch (error) {
    logger.error('Error en getRalentisPorMoviles:', error);
    throw error;
  }
}

/**
 * Obtiene todos los ralentís (sin filtros)
 * @param {number} limit - Límite de registros (default 100)
 * @returns {Array} Lista de registros
 */
export async function getAllRalentis(limit = 100) {
  try {
    const sql = `
      SELECT 
        "idRalenti",
        "IdMovil",
        "fechaHoraInicio",
        "fechahoraFin",
        "tiempoRalenti",
        latitud,
        longitud,
        "idPersona",
        "idEquipo"
      FROM public."informesRalentis"
      ORDER BY "fechaHoraInicio" DESC
      LIMIT $1
    `;

    const result = await query(sql, [limit]);
    logger.info(`getAllRalentis: Retornando ${result.rows.length} registros`);
    return result.rows;
  } catch (error) {
    logger.error('Error en getAllRalentis:', error);
    throw error;
  }
}

/**
 * Obtiene un ralentí específico por ID
 * @param {number} idRalenti - ID del ralentí
 * @returns {Object} Registro del ralentí
 */
export async function getRalentiById(idRalenti) {
  try {
    const result = await query(
      `SELECT * FROM public."informesRalentis" WHERE "idRalenti" = $1`,
      [idRalenti]
    );

    if (result.rows.length === 0) {
      const error = new Error('Ralentí no encontrado');
      error.status = 404;
      throw error;
    }

    logger.info(`getRalentiById: Obtenido ralentí ${idRalenti}`);
    return result.rows[0];
  } catch (error) {
    logger.error(`Error en getRalentiById(${idRalenti}):`, error);
    throw error;
  }
}
