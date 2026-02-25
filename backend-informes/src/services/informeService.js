/**
 * Servicio de Informes
 * Lógica de negocio para generación y consulta de informes
 */

import { query } from '../db/pool.js';
import { logger } from '../utils/logger.js';

/**
 * Obtiene lista de informes
 */
export async function getInformes(filters = {}) {
  try {
    let sql = `
      SELECT 
        id, 
        titulo, 
        descripcion, 
        estado, 
        fecha_creacion, 
        fecha_modificacion,
        usuario_id
      FROM informes
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;

    // Filtros opcionales
    if (filters.estado) {
      sql += ` AND estado = $${paramIndex}`;
      params.push(filters.estado);
      paramIndex++;
    }

    if (filters.usuario_id) {
      sql += ` AND usuario_id = $${paramIndex}`;
      params.push(filters.usuario_id);
      paramIndex++;
    }

    sql += ` ORDER BY fecha_modificacion DESC LIMIT 100`;

    const result = await query(sql, params);
    logger.info(`getInformes: Retornando ${result.rows.length} informes`);
    return result.rows;
  } catch (error) {
    logger.error('Error en getInformes:', error);
    throw error;
  }
}

/**
 * Obtiene un informe específico
 */
export async function getInforme(id) {
  try {
    const result = await query(
      `SELECT * FROM informes WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      const error = new Error('Informe no encontrado');
      error.status = 404;
      throw error;
    }

    logger.info(`getInforme: Obtenido informe ${id}`);
    return result.rows[0];
  } catch (error) {
    logger.error(`Error en getInforme(${id}):`, error);
    throw error;
  }
}

/**
 * Crea un nuevo informe
 */
export async function crearInforme(datos) {
  try {
    const { titulo, descripcion, usuario_id } = datos;

    if (!titulo || !usuario_id) {
      const error = new Error('Titulo y usuario_id son requeridos');
      error.status = 400;
      throw error;
    }

    const result = await query(
      `INSERT INTO informes (titulo, descripcion, estado, usuario_id, fecha_creacion, fecha_modificacion)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [titulo, descripcion || null, 'borrador', usuario_id]
    );

    logger.info(`crearInforme: Nuevo informe creado con ID ${result.rows[0].id}`);
    return result.rows[0];
  } catch (error) {
    logger.error('Error en crearInforme:', error);
    throw error;
  }
}

/**
 * Actualiza un informe
 */
export async function actualizarInforme(id, datos) {
  try {
    const { titulo, descripcion, estado } = datos;

    // Construir query dinámicamente
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (titulo !== undefined) {
      updates.push(`titulo = $${paramIndex}`);
      params.push(titulo);
      paramIndex++;
    }

    if (descripcion !== undefined) {
      updates.push(`descripcion = $${paramIndex}`);
      params.push(descripcion);
      paramIndex++;
    }

    if (estado !== undefined) {
      updates.push(`estado = $${paramIndex}`);
      params.push(estado);
      paramIndex++;
    }

    if (updates.length === 0) {
      const error = new Error('No hay campos para actualizar');
      error.status = 400;
      throw error;
    }

    updates.push(`fecha_modificacion = NOW()`);
    params.push(id);

    const result = await query(
      `UPDATE informes SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      const error = new Error('Informe no encontrado');
      error.status = 404;
      throw error;
    }

    logger.info(`actualizarInforme: Informe ${id} actualizado`);
    return result.rows[0];
  } catch (error) {
    logger.error(`Error en actualizarInforme(${id}):`, error);
    throw error;
  }
}

export default {
  getInformes,
  getInforme,
  crearInforme,
  actualizarInforme,
};
