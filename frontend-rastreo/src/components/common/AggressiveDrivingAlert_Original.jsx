import React, {
  useState,
  useMemo,
  useCallback,
} from "react";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Typography,
  CircularProgress,
  Chip,
} from "@mui/material";
import DriveEtaIcon from "@mui/icons-material/DriveEta";
import BaseExpandableAlert from "./BaseExpandableAlert";
import { useContextValue } from "../../context/Context";
import useConductorCache from "../../hooks/useConductorCache";

// Componente memoizado para cada item de la lista de conducción agresiva
const AggressiveDrivingItem = React.memo(
  ({
    conductor,
    index,
    isLast,
    severityColor,
    formattedTime,
    previewCount,
    onUnitSelect,
    isLoadingDetails = false,
  }) => (
    <ListItem
      key={`${conductor.conductorId}-${index}`}
      disablePadding
      sx={{
        borderBottom: !isLast ? "1px solid" : "none",
        borderColor: "divider",
      }}
    >
      <Box
        sx={{
          display: "flex",
          width: "100%",
          alignItems: "center",
          minHeight: "50px",
        }}
      >
        <ListItemButton
          onClick={() => onUnitSelect(conductor.lastUnit)}
          sx={{
            flex: 1,
            py: 0.5,
            "&:hover": {
              backgroundColor: "rgba(156, 39, 176, 0.08)", // Color violeta para hover
            },
          }}
        >
          <ListItemText
            primaryTypographyProps={{ component: "div" }}
            secondaryTypographyProps={{ component: "div" }}
            primary={
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 0.75,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      mr: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      flex: 1,
                    }}
                  >
                    {conductor.nombre}
                    {conductor.isGroupedByPatente && (
                      <Typography
                        component="span"
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          ml: 0.5,
                          fontStyle: "italic",
                        }}
                      >
                        (sin identificación)
                      </Typography>
                    )}
                  </Typography>

                  <Chip
                    label={`${previewCount} preavisos`}
                    size="small"
                    sx={{
                      fontSize: "0.7rem",
                      height: "20px",
                      backgroundColor: severityColor,
                      color: "#fff",
                      fontWeight: 500,
                    }}
                  />
                </Box>

                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    fontWeight: 500,
                    ml: 1,
                  }}
                >
                  {formattedTime}
                </Typography>
              </Box>
            }
            secondary={
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flex: 1,
                  }}
                >
                  {conductor.lastUnit?.patente || "Sin unidad"}
                  {conductor.lastUnit?.marca &&
                    ` • ${conductor.lastUnit.marca}`}
                </Typography>

                {isLoadingDetails && (
                  <CircularProgress size={16} sx={{ ml: 1 }} />
                )}
              </Box>
            }
          />
        </ListItemButton>
      </Box>
    </ListItem>
  )
);

const AggressiveDrivingAlert = ({ markersData, onUnitSelect }) => {
  const { state } = useContextValue();
  const [sortBy, setSortBy] = useState("count"); // Ordenar por ranking por defecto

  // Arrays constantes para el hook
  const aggressiveStates = useMemo(
    () => ["Preaviso Manejo Agresivo", "preaviso manejo agresivo"],
    []
  );

  // USAR EL NUEVO HOOK - Esta es toda la lógica compleja centralizada
  const {
    conductors,
    loadingConductors,
    isInitialized,
    refreshConductor,
    refreshAll,
  } = useConductorCache(markersData, aggressiveStates);

  // FASE 2: Función para cargar ranking desde localStorage específico del usuario
  const loadRankingFromStorage = useCallback(() => {
    try {
      if (!state.user) return []; // No cargar si no hay usuario logueado

      const userKey = getAggressiveDrivingRankingStorageKey(state.user);
      const stored = localStorage.getItem(userKey);
      if (stored) {
        const parsedRanking = JSON.parse(stored);
        const ranking = Array.isArray(parsedRanking) ? parsedRanking : [];

        // Log detallado de lo que se está cargando
        console.log(
          `📂 CARGANDO DESDE LOCALSTORAGE (${userKey}):`,
          ranking.length,
          "conductores"
        );
        ranking.forEach((conductor) => {
          console.log(
            `  📂 ${conductor.nombre}: ${conductor.count} preavisos, last: ${
              conductor.lastTime?.substring(11, 19) || "N/A"
            }, procesado: ${conductor.lastHistoryUpdate ? "✅" : "❌"}`
          );
        });

        return ranking;
      }
    } catch (error) {
      console.warn(
        "Error cargando ranking de conducción agresiva desde localStorage:",
        error
      );
    }
    return [];
  }, [state.user]);

  // FASE 2: Función para guardar ranking en localStorage específico del usuario
  const saveRankingToStorage = useCallback(
    (ranking) => {
      try {
        if (!state.user) return; // No guardar si no hay usuario logueado

        const userKey = getAggressiveDrivingRankingStorageKey(state.user);

        // Log detallado de lo que se está guardando
        console.log(
          `💾 GUARDANDO EN LOCALSTORAGE (${userKey}):`,
          ranking.length,
          "conductores"
        );
        ranking.forEach((conductor) => {
          console.log(
            `  💾 ${conductor.nombre}: ${conductor.count} preavisos, last: ${
              conductor.lastTime?.substring(11, 19) || "N/A"
            }, procesado: ${conductor.lastHistoryUpdate ? "✅" : "❌"}`
          );
        });

        localStorage.setItem(userKey, JSON.stringify(ranking));

        console.log("✅ GUARDADO EN LOCALSTORAGE COMPLETADO");
      } catch (error) {
        console.warn(
          "Error guardando ranking de conducción agresiva en localStorage:",
          error
        );
      }
    },
    [state.user]
  );

  // Función de normalización de strings - Memoizada
  const normalizeString = useCallback((str) => {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }, []);

  // FASE 2: Función para obtener historial de unidad y contar preavisos del conductor (SOLO DÍA ACTUAL)
  const fetchConductorHistorialCount = useCallback(
    async (unit, conductorInfo) => {
      try {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1); // Agregar un día

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
          `🔍 FASE 2: Fetching historial para ${conductorInfo.displayName} en unidad ${unit.Movil_ID} - RANGO: ${fechaInicial} a ${fechaFinal}`
        );

        const response = await fetch(url);
        if (!response.ok) {
          console.warn(
            `⚠️ Error HTTP ${response.status} para ${conductorInfo.displayName} - usando fallback count: 1`
          );
          return 1; // Retornar 1 en caso de error HTTP
        }

        const data = await response.json();
        const historicalData = data.Historico || data;

        // Si no hay datos históricos o está vacío, contar solo el preaviso actual
        if (!Array.isArray(historicalData) || historicalData.length === 0) {
          console.log(
            `📭 Sin historial para ${conductorInfo.displayName} - usando count: 1`
          );
          return 1; // Retornar 1 si no hay historial
        }

        // Filtrar eventos del conductor específico y contar preavisos DEL DÍA ACTUAL
        let totalPreavisos = 0;

        historicalData.forEach((event) => {
          // Verificar si el evento pertenece al conductor
          const eventoDelConductor =
            (conductorInfo.llave && event.lla === conductorInfo.llave) ||
            (conductorInfo.nombre &&
              event.nom &&
              normalizeString(event.nom) ===
                normalizeString(conductorInfo.nombre));

          if (eventoDelConductor) {
            // Verificar si es un preaviso de manejo agresivo
            const evento = normalizeString(event.evn || "");
            const esPreaviso = aggressiveStates.some((aggressiveState) => {
              const normalizedAggressiveState =
                normalizeString(aggressiveState);
              return evento.includes(normalizedAggressiveState);
            });

            if (esPreaviso) {
              totalPreavisos++;
            }
          }
        });

        // Si no encontramos ningún preaviso en el historial, usar 1 (el preaviso actual)
        const finalCount = Math.max(totalPreavisos, 1);
        console.log(
          `✅ FASE 2: Total preavisos HOY para ${conductorInfo.displayName}: ${finalCount} (historial: ${totalPreavisos})`
        );
        return finalCount;
      } catch (error) {
        console.error(
          `❌ Error obteniendo historial para ${conductorInfo.displayName}:`,
          error.message
        );
        return 1; // Retornar 1 en caso de error de red/parsing
      }
    },
    [aggressiveStates, normalizeString]
  );

  // Función para obtener información del conductor desde la unidad
  const getConductorInfo = useCallback(
    (unit) => {
      const conductorId = unit.conductorEnViaje_identificacion_OID;
      const conductorName = unit.nombre?.trim();
      const llave = unit.llave?.trim();
      const patente = unit.patente?.trim();

      // Verificar si es un conductor válido (no es "conductor no identificado" o similar)
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

      return null; // No válido
    },
    [normalizeString]
  );

  // Función para determinar severidad de conducción agresiva - Memoizada
  const determineAggressiveSeverity = useCallback((count) => {
    if (count >= 15) return "#d32f2f"; // Rojo
    if (count >= 10) return "#f57c00"; // Amarillo/Naranja
    return "#4caf50"; // Verde
  }, []);

  // Función para formatear tiempo - Memoizada
  const formatAggressiveTime = useCallback((fechaHora) => {
    const date = new Date(fechaHora);
    return date.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false, // Formato 24 horas
    });
  }, []);

  // ETAPA 3: Función de utilidad para crear funciones de debounce
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // ETAPA 3: Sistema de guardado debounced para localStorage
  const debouncedSaveToStorage = useCallback(
    debounce((ranking) => {
      try {
        if (!state.user) {
          console.warn(
            "⚠️ ETAPA 3: No se puede guardar sin usuario autenticado"
          );
          return;
        }

        const userKey = getAggressiveDrivingRankingStorageKey(state.user);

        console.log(
          `💾 ETAPA 3: Guardado debounced iniciado (${userKey}):`,
          ranking.length,
          "conductores"
        );

        // Filtrar solo datos válidos antes de guardar
        const validRanking = ranking.filter(
          (conductor) =>
            conductor.conductorId &&
            conductor.nombre &&
            typeof conductor.count === "number" &&
            conductor.count >= 0
        );

        if (validRanking.length !== ranking.length) {
          console.warn(
            `⚠️ ETAPA 3: Filtrados ${
              ranking.length - validRanking.length
            } conductores inválidos antes de guardar`
          );
        }

        localStorage.setItem(userKey, JSON.stringify(validRanking));

        console.log(
          `✅ ETAPA 3: Guardado en localStorage completado - ${validRanking.length} conductores válidos`
        );
      } catch (error) {
        console.error("❌ ETAPA 3: Error en guardado debounced:", error);
      }
    }, 1000), // Debounce de 1 segundo
    [state.user]
  );

  // ETAPA 3: Función centralizada para actualizar el historial de conducción agresiva
  const updateAggressiveHistory = useCallback(
    (updates, operation = "update") => {
      try {
        const currentRanking = [...(state.aggressiveDrivingHistory || [])];
        let hasChanges = false;

        // Crear backup para rollback en caso de error
        const backupRanking = [...currentRanking];

        console.log(
          `🔄 ETAPA 3: Ejecutando operación '${operation}' con ${
            Array.isArray(updates) ? updates.length : 1
          } actualización(es)`
        );

        // Convertir updates a array si es un solo objeto
        const updateArray = Array.isArray(updates) ? updates : [updates];

        updateArray.forEach((update) => {
          const { conductorId, data, action = "update" } = update;

          if (action === "update" || action === "upsert") {
            const updateIndex = currentRanking.findIndex(
              (item) => item.conductorId === conductorId
            );

            if (updateIndex >= 0) {
              // Actualizar conductor existente
              const oldData = { ...currentRanking[updateIndex] };
              currentRanking[updateIndex] = {
                ...oldData,
                ...data,
                lastUpdated: new Date().toISOString(),
              };

              console.log(
                `📊 ETAPA 3: Conductor actualizado - ${currentRanking[updateIndex].nombre}: count ${oldData.count} → ${currentRanking[updateIndex].count}`
              );
              hasChanges = true;
            } else if (action === "upsert") {
              // Agregar nuevo conductor (solo si es upsert)
              currentRanking.push({
                ...data,
                conductorId,
                addedAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
              });

              console.log(
                `🆕 ETAPA 3: Nuevo conductor agregado - ${data.nombre}: count ${data.count}`
              );
              hasChanges = true;
            }
          } else if (action === "remove") {
            const removeIndex = currentRanking.findIndex(
              (item) => item.conductorId === conductorId
            );

            if (removeIndex >= 0) {
              const removedConductor = currentRanking.splice(removeIndex, 1)[0];
              console.log(
                `🗑️ ETAPA 3: Conductor removido - ${removedConductor.nombre}`
              );
              hasChanges = true;
            }
          }
        });

        // Solo actualizar si hay cambios reales
        if (hasChanges) {
          // Actualizar contexto
          dispatch({
            type: "SET_AGGRESSIVE_HISTORY",
            payload: currentRanking,
          });

          // Guardar en localStorage de forma debounced
          debouncedSaveToStorage(currentRanking);

          console.log(
            `✅ ETAPA 3: Historial actualizado exitosamente - ${currentRanking.length} conductores`
          );
          return { success: true, data: currentRanking };
        } else {
          console.log(`⏭️ ETAPA 3: No hay cambios para aplicar`);
          return { success: true, data: currentRanking, noChanges: true };
        }
      } catch (error) {
        console.error(`❌ ETAPA 3: Error actualizando historial:`, error);

        // En caso de error, podrías implementar rollback aquí
        // dispatch({ type: "SET_AGGRESSIVE_HISTORY", payload: backupRanking });

        return { success: false, error: error.message };
      }
    },
    [state.aggressiveDrivingHistory, dispatch, debouncedSaveToStorage]
  );

  // ETAPA 3: Funciones modulares para combinación de datos
  const combineRealtimeWithPersistent = useCallback(
    (realtimeData, persistentData) => {
      console.log("🔄 ETAPA 3: Combinando datos con sistema modular...");
      console.log(
        "📦 Datos persistentes:",
        persistentData.map((p) => `${p.nombre} (${p.count})`)
      );
      console.log(
        "⚡ Datos tiempo real:",
        realtimeData.map((r) => `${r.nombre} (${r.count})`)
      );

      const combinedMap = new Map();

      // 1. Cargar datos persistentes
      persistentData.forEach((conductor) => {
        combinedMap.set(conductor.conductorId, {
          ...conductor,
          fromPersistent: true,
        });
      });

      // 2. Integrar/actualizar con datos en tiempo real
      realtimeData.forEach((conductor) => {
        const existing = combinedMap.get(conductor.conductorId);

        if (existing) {
          // Calcular count final usando máximo
          const baseHistoryCount = existing.lastHistoryUpdate
            ? existing.count
            : existing.count;
          const newRealtimePreavisos = conductor.count;
          const finalCount = Math.max(baseHistoryCount, newRealtimePreavisos);

          // Actualizar conductor existente
          combinedMap.set(conductor.conductorId, {
            ...existing,
            lastUnit: conductor.lastUnit,
            lastTime: conductor.lastTime,
            count: finalCount,
            isLoadingHistory: existing.lastHistoryUpdate
              ? false
              : existing.isLoadingHistory,
            lastHistoryUpdate: existing.lastHistoryUpdate,
            isProcessing: existing.isProcessing || false,
            lastRealtimeUpdate: new Date().toISOString(),
          });

          console.log(
            `🔄 ETAPA 3: Conductor actualizado - ${conductor.nombre}: Count: ${finalCount} (base: ${baseHistoryCount}, tiempo real: ${newRealtimePreavisos})`
          );
        } else {
          // Nuevo conductor detectado
          const newConductor = {
            ...conductor,
            count: Math.max(conductor.count, 1),
            isLoadingHistory: true,
            isProcessing: false,
            detectedAt: new Date().toISOString(),
          };

          combinedMap.set(conductor.conductorId, newConductor);
          console.log(
            `🆕 ETAPA 3: Nuevo conductor detectado - ${conductor.nombre}: Count inicial: ${newConductor.count}`
          );
        }
      });

      return combinedMap;
    },
    []
  );

  const filterCurrentDayData = useCallback((combinedMap) => {
    const today = new Date().toDateString();
    const finalMap = new Map();

    combinedMap.forEach((conductor, conductorId) => {
      const conductorDate = conductor.lastTime
        ? new Date(conductor.lastTime).toDateString()
        : conductor.addedAt
        ? new Date(conductor.addedAt).toDateString()
        : today;

      if (conductorDate === today) {
        finalMap.set(conductorId, conductor);
      } else {
        console.log(
          `🗑️ ETAPA 3: Eliminando conductor de día anterior: ${conductor.nombre} (${conductorDate})`
        );
      }
    });

    return finalMap;
  }, []);

  // ETAPA 3: Función para extraer datos en tiempo real (modularizada)
  const extractRealtimeData = useCallback(() => {
    if (!markersData || !isInitialized) return [];

    const today = new Date();
    const todayDateString = today.toDateString();

    console.log(
      "🔍 ETAPA 3 - Procesando datos en tiempo real:",
      markersData.length,
      "unidades"
    );
    console.log(
      "📅 FILTRO ACTIVO: Solo eventos del día actual -",
      todayDateString
    );

    // Filtrar preavisos de manejo agresivo DEL DÍA ACTUAL
    const aggressivePreviews = markersData.filter((unit) => {
      if (!unit.estado || !unit.fechaHora) return false;

      // Filtrar solo eventos del día actual
      const unitDate = new Date(unit.fechaHora);
      const unitDateString = unitDate.toDateString();

      if (unitDateString !== todayDateString) return false;

      // Verificar que sea un preaviso de manejo agresivo
      const estado = normalizeString(unit.estado);
      const hasAggressiveState = aggressiveStates.some((aggressiveState) => {
        const normalizedAggressiveState = normalizeString(aggressiveState);
        return estado.includes(normalizedAggressiveState);
      });

      if (hasAggressiveState) {
        console.log("🚨 ETAPA 3: DETECTADO Preaviso Agresivo DEL DÍA:", {
          estado: unit.estado,
          conductor: unit.nombre || "Sin conductor",
          patente: unit.patente,
          fechaHora: unit.fechaHora,
          llave: unit.llave,
        });
      }

      return hasAggressiveState;
    });

    // Agrupar por conductor
    const conductorGroups = {};

    aggressivePreviews.forEach((unit) => {
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
          fromRealtime: true,
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
    normalizeString,
    aggressiveStates,
    getConductorInfo,
  ]);

  // ETAPA 3: useMemo optimizado con funciones modulares
  const aggressiveDrivingRanking = useMemo(() => {
    console.log(
      "🎯 ETAPA 3: Iniciando combinación de datos con sistema modular"
    );

    // 1. Extraer datos en tiempo real
    const realtimeData = extractRealtimeData();

    // 2. Obtener datos persistentes
    const persistentData = state.aggressiveDrivingHistory || [];

    // 3. Combinar datos usando función modular
    const combinedMap = combineRealtimeWithPersistent(
      realtimeData,
      persistentData
    );

    // 4. Filtrar solo datos del día actual
    const finalMap = filterCurrentDayData(combinedMap);

    // 5. Convertir a array y generar resultado final
    const result = Array.from(finalMap.values());

    console.log("🎯 ETAPA 3: Ranking combinado:", result.length, "conductores");
    console.log(
      "📊 PERSISTENTES:",
      persistentData.length,
      "| TIEMPO REAL:",
      realtimeData.length,
      "| FINAL:",
      result.length
    );

    result.forEach((c) => {
      const status = c.isLoadingHistory
        ? "(🔄 cargando...)"
        : c.lastHistoryUpdate
        ? "(✅ procesado)"
        : "(📦 persistente)";
      console.log(
        `  • ${c.nombre}: ${c.count} preavisos ${status} [${c.conductorId}]`
      );
    });

    // Actualizar ref con el resultado
    aggressiveDrivingRankingRef.current = result;

    return result;
  }, [
    extractRealtimeData,
    state.aggressiveDrivingHistory,
    combineRealtimeWithPersistent,
    filterCurrentDayData,
  ]);

  // ETAPA 3: Función de refresh optimizada usando el sistema centralizado
  const refreshAllConductors = useCallback(async () => {
    const ranking = [...(state.aggressiveDrivingHistory || [])];
    console.log(
      "🔄 ETAPA 3: Iniciando refresh automático de todos los conductores"
    );

    const refreshUpdates = [];

    for (const conductor of ranking) {
      if (conductor.lastUnit) {
        const conductorInfo = getConductorInfo(conductor.lastUnit);

        if (conductorInfo) {
          setLoadingHistoryIds((prev) =>
            new Set(prev).add(conductor.conductorId)
          );

          try {
            const updatedCount = await fetchConductorHistorialCount(
              conductor.lastUnit,
              conductorInfo
            );

            // Preparar actualización para el sistema centralizado
            refreshUpdates.push({
              conductorId: conductor.conductorId,
              data: {
                count: updatedCount,
                isLoadingHistory: false,
                lastHistoryUpdate: new Date().toISOString(),
              },
              action: "update",
            });
          } catch (error) {
            console.warn(`Error actualizando ${conductor.nombre}:`, error);

            // En caso de error, marcar como no cargando
            refreshUpdates.push({
              conductorId: conductor.conductorId,
              data: {
                isLoadingHistory: false,
                lastHistoryUpdate: new Date().toISOString(),
                count: Math.max(conductor.count || 1, 1), // Garantizar mínimo 1
              },
              action: "update",
            });
          } finally {
            setLoadingHistoryIds((prev) => {
              const newSet = new Set(prev);
              newSet.delete(conductor.conductorId);
              return newSet;
            });
          }
        }
      }
    }

    // Aplicar todas las actualizaciones de una vez usando el sistema centralizado
    if (refreshUpdates.length > 0) {
      const result = updateAggressiveHistory(refreshUpdates, "batch_refresh");
      if (result.success) {
        console.log("✅ ETAPA 3: Refresh automático completado exitosamente");
      } else {
        console.error("❌ ETAPA 3: Error en refresh automático:", result.error);
      }
    }
  }, [
    state.aggressiveDrivingHistory,
    getConductorInfo,
    fetchConductorHistorialCount,
    updateAggressiveHistory,
  ]);

  // ETAPA 3: Actualizar refs con funciones estables incluyendo sistema centralizado
  stableFunctionsRef.current = {
    getConductorInfo,
    fetchConductorHistorialCount,
    saveRankingToStorage,
    updateAggressiveHistory,
    debouncedSaveToStorage,
  };

  // ETAPA 3: Ordenar ranking optimizado
  const sortedAggressiveDriving = useMemo(() => {
    const conductors = [...aggressiveDrivingRanking];

    if (sortBy === "count") {
      // Ordenar por ranking (más preavisos primero) - Comportamiento por defecto
      conductors.sort((a, b) => b.count - a.count);
    } else if (sortBy === "alphabetic") {
      conductors.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
    } else if (sortBy === "time") {
      conductors.sort((a, b) => {
        const timeA = new Date(a.lastTime).getTime();
        const timeB = new Date(b.lastTime).getTime();
        return timeB - timeA; // Más recientes primero
      });
    }

    return conductors;
  }, [aggressiveDrivingRanking, sortBy]);

  // Handlers memoizados
  const handleSortChange = useCallback(() => {
    setSortBy((prev) => {
      if (prev === "count") return "alphabetic";
      if (prev === "alphabetic") return "time";
      return "count";
    });
  }, []);

  const handleRefreshDetails = useCallback(async (conductor) => {
    console.log(`Refrescando detalles para conductor: ${conductor.nombre}`);
  }, []);

  // Manejar selección de unidad - Memoizado para optimizar rendimiento
  const handleUnitSelect = useCallback(
    (unit) => {
      if (onUnitSelect) {
        // Crear nueva lista: mantener las existentes + poner la clickeada al final
        const currentUnits = [...(state.selectedUnits || [])];

        // Remover la unidad si ya estaba (para evitar duplicados)
        const filteredUnits = currentUnits.filter((id) => id !== unit.Movil_ID);

        // Agregar la unidad clickeada al final (será la que reciba foco)
        const updatedUnits = [...filteredUnits, unit.Movil_ID];

        onUnitSelect(updatedUnits);
      }
    },
    [onUnitSelect, state.selectedUnits]
  );

  // Inicializar datos al montar el componente - FASE 2: Cargar desde localStorage y activar refresh
  useEffect(() => {
    if (!state.user) return; // No cargar si no hay usuario logueado

    // Limpiar refs al inicializar para evitar estados inconsistentes
    clearProcessedConductors();

    const storedRanking = loadRankingFromStorage();

    if (storedRanking.length > 0) {
      console.log(
        "📂 FASE 2: Cargando ranking desde localStorage:",
        storedRanking.length,
        "conductores"
      );

      // Verificar si los datos son del día actual
      const today = new Date().toDateString();
      const validRanking = storedRanking.filter((conductor) => {
        const conductorDate = new Date(
          conductor.lastTime || conductor.addedAt
        ).toDateString();
        return conductorDate === today;
      });

      if (validRanking.length > 0) {
        dispatch({
          type: "SET_AGGRESSIVE_HISTORY",
          payload: validRanking,
        });

        // Activar refresh automático si hay datos válidos
        setNeedsRefresh(true);
        console.log(
          "🔄 FASE 2: Activando refresh automático para",
          validRanking.length,
          "conductores"
        );
      } else {
        console.log("🗑️ FASE 2: Datos de días anteriores eliminados");
        // Limpiar localStorage si los datos son de días anteriores
        saveRankingToStorage([]);
      }
    }

    setIsInitialized(true);
  }, [
    loadRankingFromStorage,
    dispatch,
    saveRankingToStorage,
    state.user,
    clearProcessedConductors,
  ]);

  // FASE 2: Sincronizar localStorage cuando cambie el contexto (SIEMPRE después de inicializar)
  useEffect(() => {
    if (state.user && isInitialized && state.aggressiveDrivingHistory) {
      console.log(
        "💾 ETAPA 3: Sincronización con localStorage usando sistema debounced:",
        state.aggressiveDrivingHistory.length,
        "conductores"
      );

      // Log detallado para debugging
      state.aggressiveDrivingHistory.forEach((conductor) => {
        console.log(
          `  💾 ${conductor.nombre}: ${conductor.count} preavisos - ${
            conductor.lastHistoryUpdate ? "✅ procesado" : "📦 pendiente"
          }`
        );
      });

      // Usar el sistema debounced en lugar de guardado directo
      debouncedSaveToStorage(state.aggressiveDrivingHistory);
    }
  }, [
    state.aggressiveDrivingHistory,
    debouncedSaveToStorage,
    state.user,
    isInitialized,
  ]);

  // FASE 2: Ejecutar refresh automático cuando sea necesario (SOLO AL INICIALIZAR)
  useEffect(() => {
    if (
      needsRefresh &&
      isInitialized &&
      (state.aggressiveDrivingHistory || []).length > 0
    ) {
      console.log(
        "🔄 FASE 2: Ejecutando refresh automático SOLO UNA VEZ al inicializar"
      );

      // Ejecutar refresh y luego desactivar immediatamente
      refreshAllConductors().finally(() => {
        setNeedsRefresh(false);
        console.log("✅ FASE 2: Refresh automático completado y desactivado");
      });
    }
  }, [needsRefresh, isInitialized]); // DEPENDENCIAS MÍNIMAS - Sin state.aggressiveDrivingHistory

  // ETAPA 2: useEffect optimizado para procesar nuevos conductores (SIN bucles infinitos)
  useEffect(() => {
    console.log("🔔 USEEFFECT OPTIMIZADO - Procesar nuevos conductores");

    if (!isInitialized) {
      console.log("⏹️ No inicializado, saliendo");
      return;
    }

    // LOCK GLOBAL: Si ya está procesando, no hacer nada
    if (isProcessingRef.current) {
      console.log(
        "🔒 PROCESAMIENTO YA EN CURSO, saliendo para evitar duplicados"
      );
      return;
    }

    // CRÍTICO: Usar ref para obtener datos actuales sin crear dependencias
    const currentRanking = aggressiveDrivingRankingRef.current;

    if (!currentRanking || currentRanking.length === 0) {
      console.log("⏭️ No hay datos en el ranking, saliendo");
      return;
    }

    // CRÍTICO: Solo detectar conductores que REALMENTE son nuevos y nunca fueron procesados
    const newConductors = currentRanking.filter(
      (conductor) =>
        conductor.isLoadingHistory &&
        conductor.fromRealtime &&
        !conductor.lastHistoryUpdate && // NUNCA fue procesado
        !processedConductorsRef.current.has(conductor.conductorId) && // NO está en el ref
        !loadingHistoryIds.has(conductor.conductorId) && // NO está siendo procesado actualmente
        conductor.detectedAt // Debe tener timestamp de detección
    );

    if (newConductors.length === 0) {
      console.log(
        "⏭️ ETAPA 2: No hay conductores nuevos que requieran procesamiento"
      );
      return;
    }

    // Throttling ESTRICTO: No procesar más de una vez cada 3 segundos
    const now = Date.now();
    if (now - lastProcessTimeRef.current < 3000) {
      console.log(
        `⏸️ ETAPA 2: Throttling activo, esperando ${
          3000 - (now - lastProcessTimeRef.current)
        }ms más`
      );
      return;
    }

    // ACTIVAR LOCK GLOBAL
    isProcessingRef.current = true;

    // Actualizar timestamp de último procesamiento INMEDIATAMENTE
    lastProcessTimeRef.current = now;

    console.log(
      `🔄 ETAPA 2: ${newConductors.length} conductores necesitan historial (ejecutando API calls):`
    );
    newConductors.forEach((c) => {
      console.log(
        `  - ${c.nombre} (ID: ${c.conductorId}) - Count inicial: ${c.count} - NUNCA PROCESADO`
      );
    });

    // IMPORTANTE: Marcar inmediatamente como procesados para evitar bucles
    newConductors.forEach((c) => {
      processedConductorsRef.current.add(c.conductorId);
    });

    // Marcar como en carga
    setLoadingHistoryIds((prev) => {
      const newSet = new Set([...prev]);
      newConductors.forEach((c) => newSet.add(c.conductorId));
      return newSet;
    });

    // ETAPA 3: Usar sistema centralizado para actualizaciones
    const processConductorsSequentially = async () => {
      try {
        // Usar funciones desde refs para evitar dependencias
        const {
          getConductorInfo,
          fetchConductorHistorialCount,
          updateAggressiveHistory,
        } = stableFunctionsRef.current;

        const batchUpdates = [];

        for (const conductor of newConductors) {
          if (conductor.lastUnit) {
            const conductorInfo = getConductorInfo(conductor.lastUnit);

            if (conductorInfo) {
              console.log(
                `🆕 ETAPA 3: ⚡ EJECUTANDO API CALL para conductor: ${conductor.nombre}`
              );

              try {
                const totalCount = await fetchConductorHistorialCount(
                  conductor.lastUnit,
                  conductorInfo
                );

                // Obtener el count actual del conductor para no perder datos
                const currentRanking = [
                  ...(state.aggressiveDrivingHistory || []),
                ];
                const updateIndex = currentRanking.findIndex(
                  (item) => item.conductorId === conductor.conductorId
                );

                const currentCount =
                  updateIndex >= 0
                    ? currentRanking[updateIndex].count
                    : conductor.count;
                const finalCount = Math.max(totalCount, currentCount, 1);

                console.log(
                  `🔢 ETAPA 3: Calculando count final para ${conductor.nombre}:`
                );
                console.log(`  - API historial: ${totalCount}`);
                console.log(`  - Count actual: ${currentCount}`);
                console.log(`  - Count final: ${finalCount}`);

                // Preparar actualización para batch
                batchUpdates.push({
                  conductorId: conductor.conductorId,
                  data: {
                    count: finalCount,
                    isLoadingHistory: false,
                    isProcessing: false,
                    lastHistoryUpdate: new Date().toISOString(),
                    addedAt:
                      updateIndex < 0 ? new Date().toISOString() : undefined,
                  },
                  action: updateIndex >= 0 ? "update" : "upsert",
                });

                console.log(
                  `✅ ETAPA 3: API CALL COMPLETADA para ${conductor.nombre} - Count final: ${finalCount}`
                );
              } catch (error) {
                console.error(
                  `❌ Error obteniendo historial para ${conductor.nombre}:`,
                  error
                );

                // Preparar actualización de error para batch
                batchUpdates.push({
                  conductorId: conductor.conductorId,
                  data: {
                    isLoadingHistory: false,
                    isProcessing: false,
                    lastHistoryUpdate: new Date().toISOString(),
                    count: Math.max(conductor.count || 1, 1),
                  },
                  action: "update",
                });
              } finally {
                // Remover del loading set
                setLoadingHistoryIds((prev) => {
                  const newSet = new Set(prev);
                  newSet.delete(conductor.conductorId);
                  return newSet;
                });
              }
            } else {
              console.warn(
                `⚠️ No se pudo obtener conductor info para ${conductor.nombre}`
              );
              setLoadingHistoryIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(conductor.conductorId);
                return newSet;
              });
            }
          }

          // Pausa entre conductores
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        // Aplicar todas las actualizaciones de una vez
        if (batchUpdates.length > 0) {
          const result = updateAggressiveHistory(
            batchUpdates,
            "batch_process_new_conductors"
          );
          if (result.success) {
            console.log(
              `✅ ETAPA 3: Procesamiento batch completado exitosamente - ${batchUpdates.length} actualizaciones`
            );
          } else {
            console.error(
              `❌ ETAPA 3: Error en procesamiento batch:`,
              result.error
            );
          }
        }
      } finally {
        // LIBERAR LOCK GLOBAL SIEMPRE
        isProcessingRef.current = false;
        console.log(
          "🔓 ETAPA 3: LOCK GLOBAL LIBERADO - Procesamiento completado"
        );
      }
    };

    processConductorsSequentially();

    console.log(
      `✅ ETAPA 2: Iniciado procesamiento de ${newConductors.length} conductores`
    );
  }, [
    isInitialized,
    loadingHistoryIds,
    dispatch,
    state.aggressiveDrivingHistory,
  ]); // DEPENDENCIAS MÍNIMAS Y ESTABLES

  // Renderizar contenido específico de conducción agresiva - FASE 2: Con estados de carga
  const renderContent = ({ onUnitSelect, handleClose }) => (
    <Box sx={{ maxHeight: "328px", overflow: "auto" }}>
      {/* Indicador de refresh en curso */}
      {needsRefresh && (
        <Box sx={{ p: 1, textAlign: "center" }}>
          <Typography
            variant="caption"
            sx={{ color: "info.main", fontStyle: "italic" }}
          >
            🔄 Actualizando conteos del día...
          </Typography>
        </Box>
      )}

      {/* Lista única de ranking */}
      {sortedAggressiveDriving.length > 0 && (
        <List disablePadding>
          {sortedAggressiveDriving.map((conductor, index) => (
            <AggressiveDrivingItem
              key={conductor.conductorId}
              conductor={conductor}
              index={index}
              isLast={index === sortedAggressiveDriving.length - 1}
              severityColor={determineAggressiveSeverity(conductor.count)}
              formattedTime={formatAggressiveTime(conductor.lastTime)}
              previewCount={
                conductor.isLoadingHistory ? "..." : conductor.count
              }
              onDelete={() => {}} // Sin funcionalidad de borrar
              onUnitSelect={handleUnitSelect}
              onRefreshDetails={handleRefreshDetails}
              isLoadingDetails={
                conductor.isLoadingHistory ||
                loadingHistoryIds.has(conductor.conductorId)
              }
            />
          ))}
        </List>
      )}

      {/* Mensaje cuando no hay datos */}
      {sortedAggressiveDriving.length === 0 && (
        <Box sx={{ textAlign: "center", py: 3 }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            No hay conductores con manejo agresivo
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <BaseExpandableAlert
      icon={DriveEtaIcon}
      title="Conducción Agresiva"
      count={aggressiveDrivingRanking.length}
      tooltipText="Ranking de conductores con conducción agresiva"
      badgeColor="secondary.main"
      iconColor="secondary.main"
      verticalOffset={{ desktop: 430, mobile: 400 }}
      noUnitsOffset={{ desktop: 210, mobile: 180 }}
      onUnitSelect={onUnitSelect}
      sortBy={sortBy}
      onSortChange={handleSortChange}
      showSortButton={false} // Oculto como en otros componentes
      sortOptions={{
        option1: "Ranking",
        option2: "Conductor",
        option3: "Tiempo",
      }}
      showHistoryDot={false} // Sin historial separado en Fase 2
      zIndex={1100}
    >
      {renderContent}
    </BaseExpandableAlert>
  );
};

export default AggressiveDrivingAlert;
