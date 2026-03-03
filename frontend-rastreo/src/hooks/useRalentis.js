/**
 * Hook personalizado para ralentís
 * Facilita el uso del servicio de ralentís en componentes React
 */

import { useState, useCallback, useRef } from 'react';
import * as ralentiService from '../services/ralentiService.js';

/**
 * Hook useRalentis
 * Maneja el estado y ejecución de llamadas a API de ralentís
 */
export function useRalentis() {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const latestRequestRef = useRef(0);

  const fetchRalentisPorMoviles = useCallback(
    async (movilIds, fechaDesde, fechaHasta) => {
      const requestId = Date.now();
      latestRequestRef.current = requestId;

      setLoading(true);
      setError(null);
      try {
        const result = await ralentiService.getRalentisPorMovilesConRefresh(
          movilIds,
          fechaDesde,
          fechaHasta
        );

        if (latestRequestRef.current === requestId) {
          setData(result);
        }

        setRefreshing(true);
        ralentiService
          .triggerRalentisOnDemandRefresh(movilIds, fechaDesde, fechaHasta)
          .then(async () => {
            if (latestRequestRef.current !== requestId) {
              return;
            }

            const refreshedResult = await ralentiService.getRalentisPorMoviles(
              movilIds,
              fechaDesde,
              fechaHasta
            );

            if (latestRequestRef.current === requestId) {
              setData(refreshedResult);
            }
          })
          .catch((refreshError) => {
            console.warn('Refresh on-demand en segundo plano falló:', refreshError?.message);
          })
          .finally(() => {
            if (latestRequestRef.current === requestId) {
              setRefreshing(false);
            }
          });

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
    refreshing,
    error,
    fetchRalentisPorMoviles,
    fetchAllRalentis,
    fetchRalentiById,
  };
}

export default useRalentis;
