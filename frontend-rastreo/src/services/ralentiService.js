/**
 * Servicio de Ralentís (Frontend)
 * Interactúa con el nuevo backend para obtener data de ralentización
 */

import { apiFetch } from '../config/apiConfig.js';

const HYBRID_ON_DEMAND_ENABLED =
  String(import.meta.env.VITE_RALENTI_HYBRID_ON_DEMAND_ENABLED || 'true').toLowerCase() === 'true';
const ON_DEMAND_CONCURRENCY = Number(import.meta.env.VITE_RALENTI_ON_DEMAND_CONCURRENCY || 12);
const ON_DEMAND_FRESHNESS_MIN = Number(import.meta.env.VITE_RALENTI_ON_DEMAND_FRESHNESS_MIN || 5);

async function refreshRalentisOnDemand(movilIds, fechaDesde, fechaHasta, options = {}) {
  if (!HYBRID_ON_DEMAND_ENABLED) {
    return null;
  }

  const {
    refreshPolicy = 'auto',
    freshnessMinutes = ON_DEMAND_FRESHNESS_MIN,
    persist = true,
    concurrency = ON_DEMAND_CONCURRENCY,
  } = options || {};

  try {
    return await apiFetch('ralentis', '/api/ralentis-v2/refrescar-demanda', {
      method: 'POST',
      body: JSON.stringify({
        movilIds,
        fechaDesde,
        fechaHasta,
        persist,
        concurrency,
        freshnessMinutes,
        refreshPolicy,
      }),
    });
  } catch (error) {
    console.warn('refreshRalentisOnDemand falló, se continúa con lectura normal:', error?.message);
    return null;
  }
}

export async function triggerRalentisOnDemandRefresh(movilIds, fechaDesde, fechaHasta, options = {}) {
  return refreshRalentisOnDemand(movilIds, fechaDesde, fechaHasta, options);
}

async function fetchRalentisSnapshot(movilIds, fechaDesde, fechaHasta) {
  const params = new URLSearchParams({
    movilIds: JSON.stringify(movilIds),
    fechaDesde,
    fechaHasta,
  });

  const response = await apiFetch(
    'ralentis',
    `/api/ralentis-v2?${params.toString()}`
  );

  if (!response || response.ok === false) {
    throw new Error(response?.error || 'Error al obtener ralentís');
  }

  return response.data || [];
}

/**
 * Obtiene ralentís por IDs de móviles y rango de fechas
 * @param {Array<number>} movilIds - Lista de IDs de móviles (Movil_ID)
 * @param {string} fechaDesde - Fecha/hora inicio (ISO 8601)
 * @param {string} fechaHasta - Fecha/hora fin (ISO 8601)
 * @returns {Promise<Array>} Lista de registros de ralentís
 */
export async function getRalentisPorMoviles(movilIds, fechaDesde, fechaHasta) {
  try {
    return await fetchRalentisSnapshot(movilIds, fechaDesde, fechaHasta);
  } catch (error) {
    console.error('Error en getRalentisPorMoviles:', error);
    throw error;
  }
}

export async function getRalentisPorMovilesConRefresh(movilIds, fechaDesde, fechaHasta) {
  const snapshot = await fetchRalentisSnapshot(movilIds, fechaDesde, fechaHasta);
  return snapshot;
}

export async function getRalentisResumenDiario(movilIds, fechaDesde, fechaHasta) {
  try {
    const response = await apiFetch('ralentis', '/api/ralentis-v2/resumen-diario', {
      method: 'POST',
      body: JSON.stringify({ movilIds, fechaDesde, fechaHasta }),
    });

    if (!response || response.ok === false) {
      throw new Error(response?.error || 'Error al obtener resumen diario de ralentís');
    }

    return response.data;
  } catch (error) {
    console.error('Error en getRalentisResumenDiario:', error);
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
      `/api/ralentis-v2/all?limit=${limit}`
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
      `/api/ralentis-v2/id/${idRalenti}`
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
  getRalentisPorMovilesConRefresh,
  getRalentisResumenDiario,
  triggerRalentisOnDemandRefresh,
  getAllRalentis,
  getRalentiById,
};
