import { useState, useEffect, useCallback, useRef } from "react";
import { useContextValue } from "../context/Context";

/**
 * Hook personalizado para manejar el cache de conductores con alertas de conducción agresiva
 *
 * Características principales:
 * - Detección automática de nuevos conductores en tiempo real
 * - Gestión inteligente de API calls (evita duplicados y respeta throttling)
 * - Persistencia automática en localStorage específico por usuario
 * - Garantía de count >= 1 para todos los conductores
 * - Limpieza automática de datos obsoletos (días anteriores)
 * - Sistema de refresh automático al inicializar sesión
 */
const useConductorCache = (markersData, aggressiveStates) => {
  // Context y estado local
  const { state, dispatch } = useContextValue();

  // Estados del hook
  const [isInitialized, setIsInitialized] = useState(false);
  const [loadingConductors, setLoadingConductors] = useState(new Set());
  const [needsRefresh, setNeedsRefresh] = useState(false);

  // Refs para control interno
  const processedConductorsRef = useRef(new Set());
  const isProcessingRef = useRef(false);
  const lastProcessTimeRef = useRef(0);
  const cacheRef = useRef(new Map());

  // ==================== UTILIDADES ====================

  const normalizeString = useCallback((str) => {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }, []);

  const getConductorInfo = useCallback(
    (unit) => {
      const conductorId = unit.conductorEnViaje_identificacion_OID;
      const conductorName = unit.nombre?.trim();
      const llave = unit.llave?.trim();
      const patente = unit.patente?.trim();

      // Verificar si es un conductor válido
      const isValidConductor =
        conductorName &&
        !normalizeString(conductorName).includes("conductor no identificado") &&
        !normalizeString(conductorName).includes("sin conductor") &&
        !normalizeString(conductorName).includes("no identificado");

      if (isValidConductor && conductorId) {
        return {
          groupKey: `conductor_${conductorId}`,
          conductorId: conductorId,
          displayName: conductorName,
          nombre: conductorName,
          llave: llave,
          isGroupedByPatente: false,
          patente: patente,
        };
      } else if (patente && patente.length > 0) {
        return {
          groupKey: `patente_${patente}`,
          conductorId: `patente_${patente}`,
          displayName: `${patente}`,
          nombre: null,
          llave: null,
          isGroupedByPatente: true,
          patente: patente,
        };
      }

      return null;
    },
    [normalizeString]
  );

  // ==================== LOCALSTORAGE MANAGEMENT ====================

  const getStorageKey = useCallback(() => {
    return state.user ? `aggressiveDrivingRanking_${state.user}` : null;
  }, [state.user]);

  const loadFromStorage = useCallback(() => {
    try {
      const storageKey = getStorageKey();
      if (!storageKey) return [];

      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (error) {
      console.warn("Error cargando cache desde localStorage:", error);
    }
    return [];
  }, [getStorageKey]);

  const saveToStorage = useCallback(
    (cache) => {
      try {
        const storageKey = getStorageKey();
        if (!storageKey) return;

        // Convertir Map a Array para storage
        const dataToStore = Array.from(cache.values());

        // Filtrar solo datos válidos
        const validData = dataToStore.filter(
          (conductor) =>
            conductor.conductorId &&
            conductor.nombre &&
            typeof conductor.count === "number" &&
            conductor.count >= 1
        );

        localStorage.setItem(storageKey, JSON.stringify(validData));

        console.log(`💾 Cache guardado: ${validData.length} conductores`);
      } catch (error) {
        console.error("Error guardando cache:", error);
      }
    },
    [getStorageKey]
  );

  // ==================== API CALLS ====================

  const fetchConductorHistory = useCallback(
    async (unit, conductorInfo) => {
      try {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const formatLocalDate = (date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        };

        const fechaInicial = formatLocalDate(today);
        const fechaFinal = formatLocalDate(tomorrow);
        const url = `/api/servicio/historico.php/historico?movil=${unit.Movil_ID}&fechaInicial=${fechaInicial}&fechaFinal=${fechaFinal}`;

        console.log(
          `🔍 EJECUTANDO API CALL para ${conductorInfo.displayName}:`
        );
        console.log(`    URL: ${url}`);
        console.log(`    Movil_ID: ${unit.Movil_ID}`);
        console.log(`    Rango: ${fechaInicial} a ${fechaFinal}`);

        const response = await fetch(url);

        console.log(`📡 Response status: ${response.status}`);

        if (!response.ok) {
          console.warn(`⚠️ Error HTTP ${response.status} - usando fallback`);
          return 1;
        }

        const data = await response.json();
        console.log(`📦 Data recibida:`, data);

        const historicalData = data.Historico || data;

        if (!Array.isArray(historicalData) || historicalData.length === 0) {
          console.log(`📭 Sin historial - usando count: 1`);
          return 1;
        }

        // Contar preavisos del conductor
        let totalPreavisos = 0;

        historicalData.forEach((event) => {
          const eventoDelConductor =
            (conductorInfo.llave && event.lla === conductorInfo.llave) ||
            (conductorInfo.nombre &&
              event.nom &&
              normalizeString(event.nom) ===
                normalizeString(conductorInfo.nombre));

          if (eventoDelConductor) {
            const evento = normalizeString(event.evn || "");
            const esPreaviso = aggressiveStates.some((aggressiveState) => {
              const normalizedAggressiveState =
                normalizeString(aggressiveState);
              return evento.includes(normalizedAggressiveState);
            });

            if (esPreaviso) {
              totalPreavisos++;
              console.log(`🎯 Preaviso encontrado en historial: ${event.evn}`);
            }
          }
        });

        const finalCount = Math.max(totalPreavisos, 1);
        console.log(
          `✅ Count final para ${conductorInfo.displayName}: ${finalCount} (historial: ${totalPreavisos})`
        );
        return finalCount;
      } catch (error) {
        console.error(`❌ Error API para ${conductorInfo.displayName}:`, error);
        return 1;
      }
    },
    [aggressiveStates, normalizeString]
  );

  // ==================== CACHE MANAGEMENT ====================

  const updateCache = useCallback(
    (updates) => {
      const currentCache = new Map(cacheRef.current);
      let hasChanges = false;

      updates.forEach((update) => {
        const { conductorId, data, action = "upsert" } = update;

        if (action === "upsert") {
          const existing = currentCache.get(conductorId);
          const newData = {
            ...existing,
            ...data,
            conductorId,
            count: Math.max(data.count || 1, 1), // Garantizar mínimo 1
            lastUpdated: new Date().toISOString(),
          };

          currentCache.set(conductorId, newData);
          hasChanges = true;

          console.log(
            `🔄 Cache actualizado: ${newData.nombre} -> count: ${newData.count}`
          );
        } else if (action === "remove") {
          if (currentCache.has(conductorId)) {
            currentCache.delete(conductorId);
            hasChanges = true;
            console.log(`🗑️ Conductor removido del cache: ${conductorId}`);
          }
        }
      });

      if (hasChanges) {
        cacheRef.current = currentCache;

        // Actualizar contexto global
        const contextData = Array.from(currentCache.values());
        dispatch({
          type: "SET_AGRESSIVE_HISTORY",
          payload: contextData,
        });

        // Guardar en localStorage
        saveToStorage(currentCache);
      }

      return hasChanges;
    },
    [dispatch, saveToStorage]
  );

  const detectRealtimeConductors = useCallback(() => {
    if (!markersData || !isInitialized) return [];

    const today = new Date().toDateString();

    // Filtrar eventos de conducción agresiva del día actual
    const aggressiveEvents = markersData.filter((unit) => {
      if (!unit.estado || !unit.fechaHora) return false;

      const unitDate = new Date(unit.fechaHora);
      const unitDateString = unitDate.toDateString();

      // DEBUG MODE COMENTADO - INICIO
      if (unitDateString !== today) return false;

      // DEBUG: Filtrar desde 2000-01-01 para ver datos históricos
      //   const debugDate = new Date("2000-01-01");
      //   if (unitDate < debugDate) return false;
      // DEBUG MODE COMENTADO - FIN

      const estado = normalizeString(unit.estado);
      const hasAggressiveState = aggressiveStates.some((aggressiveState) => {
        const normalizedAggressiveState = normalizeString(aggressiveState);
        return estado.includes(normalizedAggressiveState);
      });

      if (hasAggressiveState) {
        console.log("🚨 Preaviso detectado:", {
          conductor: unit.nombre || "Sin conductor",
          patente: unit.patente,
          fechaHora: unit.fechaHora,
        });
      }

      return hasAggressiveState;
    });

    // Agrupar por conductor
    const conductorGroups = {};

    aggressiveEvents.forEach((unit) => {
      const conductorInfo = getConductorInfo(unit);
      if (!conductorInfo) return;

      const groupKey = conductorInfo.groupKey;

      if (!conductorGroups[groupKey]) {
        conductorGroups[groupKey] = {
          conductorId: conductorInfo.conductorId,
          nombre: conductorInfo.displayName,
          count: 0,
          lastUnit: unit,
          lastTime: unit.fechaHora,
          isGroupedByPatente: conductorInfo.isGroupedByPatente,
          patente: conductorInfo.patente,
          isNewDetection: true,
        };
      }

      conductorGroups[groupKey].count++;

      // Mantener la unidad más reciente
      if (
        new Date(unit.fechaHora) > new Date(conductorGroups[groupKey].lastTime)
      ) {
        conductorGroups[groupKey].lastUnit = unit;
        conductorGroups[groupKey].lastTime = unit.fechaHora;
      }
    });

    return Object.values(conductorGroups);
  }, [
    markersData,
    isInitialized,
    aggressiveStates,
    normalizeString,
    getConductorInfo,
  ]);

  const mergeRealtimeWithCache = useCallback(
    (realtimeConductors) => {
      const currentCache = new Map(cacheRef.current);
      const updates = [];

      realtimeConductors.forEach((conductor) => {
        const existing = currentCache.get(conductor.conductorId);

        if (existing) {
          // Conductor existente: actualizar con datos más recientes
          const finalCount = Math.max(
            existing.count || 1,
            conductor.count || 1
          );

          updates.push({
            conductorId: conductor.conductorId,
            data: {
              ...existing,
              lastUnit: conductor.lastUnit,
              lastTime: conductor.lastTime,
              count: finalCount,
            },
            action: "upsert",
          });
        } else {
          // Nuevo conductor: marcar para procesamiento
          updates.push({
            conductorId: conductor.conductorId,
            data: {
              ...conductor,
              count: Math.max(conductor.count || 1, 1),
              needsHistoryFetch: true,
              isLoading: true,
              detectedAt: new Date().toISOString(),
            },
            action: "upsert",
          });
        }
      });

      if (updates.length > 0) {
        updateCache(updates);
      }

      return updates;
    },
    [updateCache]
  );

  // ==================== PROCESAMIENTO DE NUEVOS CONDUCTORES ====================

  const processNewConductors = useCallback(async () => {
    // Lock para evitar procesamiento concurrente
    if (isProcessingRef.current) {
      console.log("🔒 Procesamiento ya en curso, saliendo");
      return;
    }

    // REDUCIR THROTTLING: cambiar de 3000ms a 1000ms para más responsividad
    const now = Date.now();
    if (now - lastProcessTimeRef.current < 1000) {
      console.log("⏸️ Throttling activo, esperando");
      return;
    }

    const currentCache = cacheRef.current;

    // CORREGIR FILTRO: No excluir conductores que están en loadingConductors
    // porque pueden ser nuevos que necesitan procesamiento inicial
    const newConductors = Array.from(currentCache.values()).filter(
      (conductor) =>
        conductor.needsHistoryFetch &&
        conductor.isLoading &&
        !processedConductorsRef.current.has(conductor.conductorId)
      // REMOVIDO: && !loadingConductors.has(conductor.conductorId)
    );

    console.log(`🔍 FILTROS APLICADOS:`);
    console.log(`    Total conductores en cache: ${currentCache.size}`);
    console.log(
      `    Con needsHistoryFetch: ${
        Array.from(currentCache.values()).filter((c) => c.needsHistoryFetch)
          .length
      }`
    );
    console.log(
      `    Con isLoading: ${
        Array.from(currentCache.values()).filter((c) => c.isLoading).length
      }`
    );
    console.log(`    Ya procesados: ${processedConductorsRef.current.size}`);
    console.log(`    En loadingSet: ${loadingConductors.size}`);
    console.log(
      `    Resultado final: ${newConductors.length} conductores para procesar`
    );

    if (newConductors.length === 0) {
      console.log("⏭️ No hay conductores nuevos para procesar");
      return;
    }

    console.log(
      `🔄 INICIANDO PROCESAMIENTO de ${newConductors.length} conductores nuevos`
    );

    // LOG DETALLADO para debugging
    newConductors.forEach((conductor, index) => {
      console.log(
        `  ${index + 1}. ${conductor.nombre} (ID: ${conductor.conductorId})`
      );
      console.log(`     - needsHistoryFetch: ${conductor.needsHistoryFetch}`);
      console.log(`     - isLoading: ${conductor.isLoading}`);
      console.log(`     - lastUnit:`, conductor.lastUnit ? "✅" : "❌");
      console.log(
        `     - ya procesado: ${processedConductorsRef.current.has(
          conductor.conductorId
        )}`
      );
      console.log(
        `     - en loadingSet: ${loadingConductors.has(conductor.conductorId)}`
      );
    });

    // Activar lock y actualizar timestamp
    isProcessingRef.current = true;
    lastProcessTimeRef.current = now;

    // Marcar como procesados inmediatamente
    newConductors.forEach((c) => {
      processedConductorsRef.current.add(c.conductorId);
    });

    // Marcar como en carga (si no están ya)
    setLoadingConductors((prev) => {
      const newSet = new Set(prev);
      newConductors.forEach((c) => newSet.add(c.conductorId));
      return newSet;
    });

    try {
      const batchUpdates = [];

      for (const conductor of newConductors) {
        if (conductor.lastUnit) {
          const conductorInfo = getConductorInfo(conductor.lastUnit);

          if (conductorInfo) {
            try {
              console.log(`🆕 EJECUTANDO API CALL para: ${conductor.nombre}`);
              console.log(
                `    URL será: /api/servicio/historico.php/historico?movil=${conductor.lastUnit.Movil_ID}`
              );

              const historyCount = await fetchConductorHistory(
                conductor.lastUnit,
                conductorInfo
              );

              console.log(
                `✅ API CALL COMPLETADA para ${conductor.nombre} - Resultado: ${historyCount}`
              );

              const finalCount = Math.max(
                historyCount,
                conductor.count || 1,
                1
              );

              batchUpdates.push({
                conductorId: conductor.conductorId,
                data: {
                  count: finalCount,
                  needsHistoryFetch: false,
                  isLoading: false,
                  lastHistoryUpdate: new Date().toISOString(),
                },
                action: "upsert",
              });

              console.log(
                `✅ Procesado: ${conductor.nombre} -> count: ${finalCount}`
              );
            } catch (error) {
              console.error(`❌ Error procesando ${conductor.nombre}:`, error);

              batchUpdates.push({
                conductorId: conductor.conductorId,
                data: {
                  needsHistoryFetch: false,
                  isLoading: false,
                  lastHistoryUpdate: new Date().toISOString(),
                  count: Math.max(conductor.count || 1, 1),
                },
                action: "upsert",
              });
            } finally {
              // Remover del loading set
              setLoadingConductors((prev) => {
                const newSet = new Set(prev);
                newSet.delete(conductor.conductorId);
                return newSet;
              });
            }
          } else {
            console.warn(
              `⚠️ No se pudo obtener conductorInfo para ${conductor.nombre}`
            );
          }
        } else {
          console.warn(`⚠️ No hay lastUnit para ${conductor.nombre}`);
        }

        // REDUCIR PAUSA: de 500ms a 200ms para mayor responsividad
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      // Aplicar todas las actualizaciones
      if (batchUpdates.length > 0) {
        updateCache(batchUpdates);
        console.log(
          `✅ Batch procesado: ${batchUpdates.length} actualizaciones`
        );
      }
    } finally {
      // Liberar lock siempre
      isProcessingRef.current = false;
      console.log("🔓 Lock liberado - Procesamiento completado");
    }
  }, [getConductorInfo, fetchConductorHistory, updateCache, loadingConductors]);

  // ==================== LIMPIEZA Y MANTENIMIENTO ====================

  const cleanStaleData = useCallback(() => {
    const today = new Date().toDateString();
    const currentCache = new Map(cacheRef.current);
    const toRemove = [];

    currentCache.forEach((conductor, conductorId) => {
      const conductorDate = new Date(
        conductor.lastTime || conductor.detectedAt
      ).toDateString();

      if (conductorDate !== today) {
        toRemove.push({ conductorId, action: "remove" });
      }
    });

    if (toRemove.length > 0) {
      console.log(`🧹 Limpiando ${toRemove.length} conductores obsoletos`);
      updateCache(toRemove);
    }
  }, [updateCache]);

  const refreshAllConductors = useCallback(async () => {
    const currentCache = Array.from(cacheRef.current.values());
    console.log(`🔄 Refresh automático de ${currentCache.length} conductores`);

    const refreshUpdates = [];

    for (const conductor of currentCache) {
      if (conductor.lastUnit) {
        const conductorInfo = getConductorInfo(conductor.lastUnit);

        if (conductorInfo) {
          setLoadingConductors((prev) =>
            new Set(prev).add(conductor.conductorId)
          );

          try {
            const updatedCount = await fetchConductorHistory(
              conductor.lastUnit,
              conductorInfo
            );

            refreshUpdates.push({
              conductorId: conductor.conductorId,
              data: {
                count: Math.max(updatedCount, conductor.count || 1, 1),
                lastHistoryUpdate: new Date().toISOString(),
              },
              action: "upsert",
            });
          } catch (error) {
            console.warn(`Error refrescando ${conductor.nombre}:`, error);
          } finally {
            setLoadingConductors((prev) => {
              const newSet = new Set(prev);
              newSet.delete(conductor.conductorId);
              return newSet;
            });
          }
        }
      }
    }

    if (refreshUpdates.length > 0) {
      updateCache(refreshUpdates);
      console.log(
        `✅ Refresh completado: ${refreshUpdates.length} actualizaciones`
      );
    }
  }, [getConductorInfo, fetchConductorHistory, updateCache]);

  // ==================== EFECTOS PRINCIPALES ====================

  // Inicialización
  useEffect(() => {
    if (!state.user) return;

    console.log("🚀 Inicializando cache de conductores");

    // Limpiar estado previo
    processedConductorsRef.current.clear();
    isProcessingRef.current = false;
    lastProcessTimeRef.current = 0;
    setLoadingConductors(new Set());

    // Cargar datos persistentes
    const storedData = loadFromStorage();

    if (storedData.length > 0) {
      console.log(
        `📂 Cargando ${storedData.length} conductores desde localStorage`
      );

      // Filtrar solo datos del día actual
      const today = new Date().toDateString();
      const validData = storedData.filter((conductor) => {
        const conductorDate = new Date(
          conductor.lastTime || conductor.detectedAt
        ).toDateString();
        return conductorDate === today;
      });

      if (validData.length > 0) {
        // Convertir a Map para cache interno
        const cacheMap = new Map();
        validData.forEach((conductor) => {
          cacheMap.set(conductor.conductorId, conductor);
        });

        cacheRef.current = cacheMap;

        // Actualizar contexto
        dispatch({
          type: "SET_AGRESSIVE_HISTORY",
          payload: validData,
        });

        // Activar refresh automático
        setNeedsRefresh(true);
        console.log(
          `🔄 Activando refresh para ${validData.length} conductores`
        );
      } else {
        console.log("🗑️ Datos obsoletos limpiados");
        saveToStorage(new Map());
      }
    }

    setIsInitialized(true);
  }, [state.user, loadFromStorage, dispatch, saveToStorage]);

  // Procesamiento de datos en tiempo real
  useEffect(() => {
    if (!isInitialized) return;

    const realtimeConductors = detectRealtimeConductors();

    if (realtimeConductors.length > 0) {
      console.log(
        `⚡ Detectados ${realtimeConductors.length} conductores en tiempo real`
      );
      mergeRealtimeWithCache(realtimeConductors);
    }
  }, [isInitialized, detectRealtimeConductors, mergeRealtimeWithCache]);

  // Procesamiento de nuevos conductores - REDUCIR DELAY
  useEffect(() => {
    if (!isInitialized) return;

    const timer = setTimeout(() => {
      processNewConductors();
    }, 500); // Cambio aquí: de 1000ms a 500ms

    return () => clearTimeout(timer);
  }, [isInitialized, processNewConductors]);

  // AGREGAR NUEVO EFECTO para debugging del cache
  useEffect(() => {
    if (!isInitialized) return;

    const currentCache = Array.from(cacheRef.current.values());
    const needsProcessing = currentCache.filter(
      (c) => c.needsHistoryFetch && c.isLoading
    );

    if (needsProcessing.length > 0) {
      console.log(
        `🔍 DEBUGGING CACHE - ${needsProcessing.length} conductores necesitan procesamiento:`
      );
      needsProcessing.forEach((conductor, index) => {
        console.log(`  ${index + 1}. ${conductor.nombre}:`);
        console.log(`     - needsHistoryFetch: ${conductor.needsHistoryFetch}`);
        console.log(`     - isLoading: ${conductor.isLoading}`);
        console.log(
          `     - en processedRef: ${processedConductorsRef.current.has(
            conductor.conductorId
          )}`
        );
        console.log(
          `     - en loadingSet: ${loadingConductors.has(
            conductor.conductorId
          )}`
        );
      });
    }
  }, [cacheRef.current, isInitialized, loadingConductors]);

  // Refresh automático al inicializar
  useEffect(() => {
    if (needsRefresh && isInitialized) {
      console.log("🔄 Ejecutando refresh automático inicial");

      refreshAllConductors().finally(() => {
        setNeedsRefresh(false);
        console.log("✅ Refresh inicial completado");
      });
    }
  }, [needsRefresh, isInitialized, refreshAllConductors]);

  // Limpieza periódica
  useEffect(() => {
    if (!isInitialized) return;

    const cleanupInterval = setInterval(() => {
      cleanStaleData();
    }, 300000); // Cada 5 minutos

    return () => clearInterval(cleanupInterval);
  }, [isInitialized, cleanStaleData]);

  // ==================== API PÚBLICA ====================

  return {
    // Datos principales
    conductors: Array.from(cacheRef.current.values()),
    loadingConductors,
    isInitialized,

    // Métodos públicos
    refreshConductor: useCallback(
      async (conductorId) => {
        const conductor = cacheRef.current.get(conductorId);
        if (conductor && conductor.lastUnit) {
          const conductorInfo = getConductorInfo(conductor.lastUnit);
          if (conductorInfo) {
            setLoadingConductors((prev) => new Set(prev).add(conductorId));

            try {
              const updatedCount = await fetchConductorHistory(
                conductor.lastUnit,
                conductorInfo
              );

              updateCache([
                {
                  conductorId,
                  data: { count: Math.max(updatedCount, 1) },
                  action: "upsert",
                },
              ]);
            } catch (error) {
              console.error(
                `Error refrescando conductor ${conductorId}:`,
                error
              );
            } finally {
              setLoadingConductors((prev) => {
                const newSet = new Set(prev);
                newSet.delete(conductorId);
                return newSet;
              });
            }
          }
        }
      },
      [fetchConductorHistory, getConductorInfo, updateCache]
    ),

    refreshAll: useCallback(() => {
      if (isInitialized) {
        refreshAllConductors();
      }
    }, [isInitialized, refreshAllConductors]),
  };
};

export default useConductorCache;
