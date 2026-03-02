/**
 * Servicio de Ralentís (Frontend)
 * Interactúa con el nuevo backend para obtener data de ralentización
 */

import { apiFetch } from '../config/apiConfig.js';

/**
 * Obtiene ralentís por IDs de móviles y rango de fechas
 * @param {Array<number>} movilIds - Lista de IDs de móviles (Movil_ID)
 * @param {string} fechaDesde - Fecha/hora inicio (ISO 8601)
 * @param {string} fechaHasta - Fecha/hora fin (ISO 8601)
 * @returns {Promise<Array>} Lista de registros de ralentís
 */
export async function getRalentisPorMoviles(movilIds, fechaDesde, fechaHasta) {
  try {
    // Construir query params
    const params = new URLSearchParams({
      movilIds: JSON.stringify(movilIds),
      fechaDesde,
      fechaHasta,
    });

    const response = await apiFetch(
      'ralentis',
      `/api/ralentis?${params.toString()}`
    );

    if (!response || response.ok === false) {
      throw new Error(response?.error || 'Error al obtener ralentís');
    }

    return response.data || [];
  } catch (error) {
    console.error('Error en getRalentisPorMoviles:', error);
    throw error;
  }
}

/**
 * Obtiene todos los ralentís (sin filtros)
 * @param {number} limit - Límite de registros (default 100)
 * @returns {Promise<Array>} Lista de registros
 */
export async function getAllRalentis(limit = 100) {
  try {
    const response = await apiFetch(
      'ralentis',
      `/api/ralentis/all?limit=${limit}`
    );

    if (!response || response.ok === false) {
      throw new Error(response?.error || 'Error al obtener ralentís');
    }

    return response.data || [];
  } catch (error) {
    console.error('Error en getAllRalentis:', error);
    throw error;
  }
}

/**
 * Obtiene un ralentí específico por ID
 * @param {number} idRalenti - ID del ralentí
 * @returns {Promise<Object>} Registro del ralentí
 */
export async function getRalentiById(idRalenti) {
  try {
    const response = await apiFetch(
      'ralentis',
      `/api/ralentis/id/${idRalenti}`
    );

    if (!response || response.ok === false) {
      throw new Error(response?.error || 'Error al obtener ralentí');
    }

    return response.data || null;
  } catch (error) {
    console.error(`Error en getRalentiById(${idRalenti}):`, error);
    throw error;
  }
}

export default {
  getRalentisPorMoviles,
  getAllRalentis,
  getRalentiById,
};
