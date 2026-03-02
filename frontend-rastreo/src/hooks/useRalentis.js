/**
 * Hook personalizado para ralentís
 * Facilita el uso del servicio de ralentís en componentes React
 */

import { useState, useCallback } from 'react';
import * as ralentiService from '../services/ralentiService.js';

/**
 * Hook useRalentis
 * Maneja el estado y ejecución de llamadas a API de ralentís
 */
export function useRalentis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const fetchRalentisPorMoviles = useCallback(
    async (movilIds, fechaDesde, fechaHasta) => {
      setLoading(true);
      setError(null);
      try {
        const result = await ralentiService.getRalentisPorMoviles(
          movilIds,
          fechaDesde,
          fechaHasta
        );
        setData(result);
        return result;
      } catch (err) {
        setError(err.message || 'Error al obtener ralentís');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchAllRalentis = useCallback(async (limit = 100) => {
    setLoading(true);
    setError(null);
    try {
      const result = await ralentiService.getAllRalentis(limit);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || 'Error al obtener ralentís');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRalentiById = useCallback(async (idRalenti) => {
    setLoading(true);
    setError(null);
    try {
      const result = await ralentiService.getRalentiById(idRalenti);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || 'Error al obtener ralentí');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    fetchRalentisPorMoviles,
    fetchAllRalentis,
    fetchRalentiById,
  };
}

export default useRalentis;
