import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Typography,
  Button,
  CircularProgress,
  Chip,
} from "@mui/material";
import DriveEtaIcon from "@mui/icons-material/DriveEta";
import DeleteIcon from "@mui/icons-material/Delete";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import RefreshIcon from "@mui/icons-material/Refresh";
import BaseExpandableAlert from "./BaseExpandableAlert";
import { useContextValue } from "../../context/Context";

// Componente memoizado para cada item de la lista de conducción agresiva
const AggressiveDrivingItem = React.memo(
  ({
    conductor,
    index,
    isLast,
    severityColor,
    formattedTime,
    previewCount,
    onDelete,
    onUnitSelect,
    onRefreshDetails,
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

        {/* Botón de refresh oculto por ahora
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onRefreshDetails(conductor);
          }}
          disabled={isLoadingDetails}
          sx={{
            color: "text.secondary",
            mr: 1,
            "&:hover": {
              color: "primary.main",
              backgroundColor: "rgba(25, 118, 210, 0.08)",
            },
          }}
        >
          {isLoadingDetails ? (
            <CircularProgress size={16} />
          ) : (
            <RefreshIcon fontSize="small" />
          )}
        </IconButton>
        */}
      </Box>
    </ListItem>
  )
);

// Constantes para localStorage con soporte multiusuario
const getAggressiveDrivingRankingStorageKey = (username) =>
  `aggressiveDrivingRanking_${username}`;

const AggressiveDrivingAlert = ({ markersData, onUnitSelect }) => {
  const { state, dispatch } = useContextValue();
  const [sortBy, setSortBy] = useState("count"); // Ordenar por ranking por defecto
  const [isInitialized, setIsInitialized] = useState(false);
  const [needsRefresh, setNeedsRefresh] = useState(false); // FASE 2: Flag para refresh automático
  const [loadingHistoryIds, setLoadingHistoryIds] = useState(new Set()); // FASE 2: Conductores cargando historial

  // CRÍTICO: Ref para trackear conductores ya procesados (evita re-ejecución)
  const processedConductorsRef = useRef(new Set());
  const lastProcessTimeRef = useRef(0);
  const isProcessingRef = useRef(false); // NUEVO: Lock global para evitar procesamiento concurrente

  // Función para limpiar refs cuando sea necesario
  const clearProcessedConductors = useCallback(() => {
    processedConductorsRef.current.clear();
    lastProcessTimeRef.current = 0;
    isProcessingRef.current = false; // Resetear lock
    setLoadingHistoryIds(new Set()); // También limpiar IDs en carga
    console.log(
      "🧹 FASE 2: Referencias de conductores procesados limpiadas completamente"
    );
  }, []);

  // Función de debug para diagnóstico (temporal)
  const debugCurrentState = useCallback(() => {
    console.log("🔍 DEBUG ESTADO ACTUAL:");
    console.log("  - isInitialized:", isInitialized);
    console.log("  - needsRefresh:", needsRefresh);
    console.log(
      "  - processedConductors:",
      Array.from(processedConductorsRef.current)
    );
    console.log("  - loadingHistoryIds:", Array.from(loadingHistoryIds));
    console.log(
      "  - aggressiveDrivingHistory:",
      state.aggressiveDrivingHistory?.map((c) => `${c.nombre}(${c.count})`)
    );
    console.log(
      "  - lastProcessTime:",
      new Date(lastProcessTimeRef.current).toLocaleTimeString()
    );
  }, [
    isInitialized,
    needsRefresh,
    loadingHistoryIds,
    state.aggressiveDrivingHistory,
  ]);

  // Arrays constantes memoizados
  const aggressiveStates = useMemo(
    () => ["Preaviso Manejo Agresivo", "preaviso manejo agresivo"],
    []
  );

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

  // FASE 2: Función para actualizar el count de un conductor específico
  const updateConductorCount = useCallback(
    (conductorId, newCount) => {
      const currentRanking = [...(state.aggressiveDrivingHistory || [])];
      const updateIndex = currentRanking.findIndex(
        (item) => item.conductorId === conductorId
      );

      if (updateIndex >= 0) {
        currentRanking[updateIndex] = {
          ...currentRanking[updateIndex],
          count: newCount,
          isLoadingHistory: false, // IMPORTANTE: Siempre marcar como no cargando
          lastHistoryUpdate: new Date().toISOString(), // Timestamp para evitar re-cargas
        };

        dispatch({
          type: "SET_AGGRESSIVE_HISTORY",
          payload: currentRanking,
        });

        // Guardar en localStorage
        saveRankingToStorage(currentRanking);
        console.log(
          `📊 FASE 2: Count actualizado para ${currentRanking[updateIndex].nombre}: ${newCount}`
        );
      } else {
        console.warn(
          `⚠️ No se encontró conductor ${conductorId} para actualizar count`
        );
      }
    },
    [state.aggressiveDrivingHistory, dispatch, saveRankingToStorage]
  );

  // FASE 2: Función para refresh automático de todos los conductores al iniciar sesión
  const refreshAllConductors = useCallback(async () => {
    const ranking = [...(state.aggressiveDrivingHistory || [])];
    console.log(
      "🔄 FASE 2: Iniciando refresh automático de todos los conductores"
    );

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
            updateConductorCount(conductor.conductorId, updatedCount);
          } catch (error) {
            console.warn(`Error actualizando ${conductor.nombre}:`, error);
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

    console.log("✅ FASE 2: Refresh automático completado");
  }, [
    state.aggressiveDrivingHistory,
    getConductorInfo,
    fetchConductorHistorialCount,
    updateConductorCount,
  ]);

  // FASE 2: Combinar datos en tiempo real con ranking persistente
  const aggressiveDrivingRanking = useMemo(() => {
    // Primero, obtener datos en tiempo real como en Fase 1
    const realtimeData = (() => {
      if (!markersData || !isInitialized) return [];

      // Obtener fecha actual para filtro
      const today = new Date();
      const todayDateString = today.toDateString(); // Comparar solo fecha sin hora

      console.log(
        "🔍 FASE 2 - Procesando datos en tiempo real:",
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

        // CRÍTICO: Filtrar solo eventos del día actual
        const unitDate = new Date(unit.fechaHora);
        const unitDateString = unitDate.toDateString();

        if (unitDateString !== todayDateString) {
          return false; // Descartar eventos que no sean de hoy
        }

        // Verificar que sea un preaviso de manejo agresivo
        const estado = normalizeString(unit.estado);

        const hasAggressiveState = aggressiveStates.some((aggressiveState) => {
          const normalizedAggressiveState = normalizeString(aggressiveState);
          return estado.includes(normalizedAggressiveState);
        });

        if (hasAggressiveState) {
          console.log("🚨 DETECTADO Preaviso Agresivo DEL DÍA:", {
            estado: unit.estado,
            conductor: unit.nombre || "Sin conductor",
            patente: unit.patente,
            fechaHora: unit.fechaHora,
            llave: unit.llave,
          });
        }

        return hasAggressiveState;
      });

      // Agrupar por conductor (lógica de Fase 1)
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
            fromRealtime: true, // Flag para identificar origen
          };
        }

        conductorGroups[groupKey].count++;

        // Mantener la unidad más reciente
        if (
          new Date(unit.fechaHora) >
          new Date(conductorGroups[groupKey].lastTime)
        ) {
          conductorGroups[groupKey].lastUnit = unit;
          conductorGroups[groupKey].lastTime = unit.fechaHora;
        }
      });

      return Object.values(conductorGroups);
    })();

    // Combinar con datos persistentes del localStorage/estado
    const persistentData = state.aggressiveDrivingHistory || [];

    console.log("🔄 FASE 2: Combinando datos...");
    console.log(
      "📦 Datos persistentes:",
      persistentData.map((p) => `${p.nombre} (${p.count})`)
    );
    console.log(
      "⚡ Datos tiempo real:",
      realtimeData.map((r) => `${r.nombre} (${r.count})`)
    );

    // Crear mapa combinado (priorizar datos persistentes pero actualizar con tiempo real)
    const combinedMap = new Map();

    // Primero agregar datos persistentes
    persistentData.forEach((conductor) => {
      combinedMap.set(conductor.conductorId, {
        ...conductor,
        fromPersistent: true,
      });

      // Debug especial para Vergara Gabriel
      if (
        conductor.nombre &&
        conductor.nombre.toLowerCase().includes("vergara")
      ) {
        console.log("🔍 VERGARA GABRIEL - Cargado desde persistente:", {
          conductorId: conductor.conductorId,
          nombre: conductor.nombre,
          count: conductor.count,
          lastHistoryUpdate: conductor.lastHistoryUpdate,
          lastTime: conductor.lastTime,
        });
      }
    });

    // Luego actualizar/agregar con datos en tiempo real
    realtimeData.forEach((conductor) => {
      const existing = combinedMap.get(conductor.conductorId);

      // Debug especial para Vergara Gabriel
      if (
        conductor.nombre &&
        conductor.nombre.toLowerCase().includes("vergara")
      ) {
        console.log("🔍 VERGARA GABRIEL - Procesando tiempo real:", {
          conductorId: conductor.conductorId,
          nombre: conductor.nombre,
          count: conductor.count,
          existing: existing ? "SÍ" : "NO",
          existingCount: existing?.count,
        });
      }

      if (existing) {
        // CORREGIDO: Siempre combinar los datos del historial con los nuevos preavisos en tiempo real
        // El count del historial puede estar desactualizado vs la realidad actual

        // 1. Obtener el count base del historial (ya procesado) o el count persistente
        const baseHistoryCount = existing.lastHistoryUpdate
          ? existing.count // Count ya procesado del historial
          : existing.count; // Count persistente actual

        // 2. Si hay nuevos preavisos en tiempo real, SUMAR la diferencia
        // Esto permite que los nuevos preavisos se agreguen al count del historial
        const newRealtimePreavisos = conductor.count;

        // 3. Calcular el count final: usar el MÁXIMO entre historial y tiempo real
        // Esto asegura que nunca perdamos preavisos y que siempre mostremos el count más alto
        const finalCount = Math.max(baseHistoryCount, newRealtimePreavisos);

        // Log especial para debugging
        if (
          conductor.nombre &&
          (conductor.nombre.toLowerCase().includes("brian") ||
            conductor.nombre.toLowerCase().includes("miranda") ||
            conductor.nombre.toLowerCase().includes("vergara"))
        ) {
          console.log(`🔍 DEBUG ${conductor.nombre}:`, {
            baseHistoryCount: baseHistoryCount,
            newRealtimePreavisos: newRealtimePreavisos,
            finalCount: finalCount,
            hasHistoryUpdate: !!existing.lastHistoryUpdate,
            isLoadingHistory: existing.isLoadingHistory,
            lastTime: conductor.lastTime,
            existingLastTime: existing.lastTime,
          });
        }

        // Actualizar datos existentes con información más reciente
        combinedMap.set(conductor.conductorId, {
          ...existing,
          lastUnit: conductor.lastUnit,
          lastTime: conductor.lastTime, // SIEMPRE actualizar con el tiempo más reciente
          count: finalCount, // USAR COUNT CALCULADO CON MÁXIMO
          // CRÍTICO: NO marcar como loading si ya fue procesado o está siendo procesado
          isLoadingHistory: existing.lastHistoryUpdate
            ? false
            : existing.isLoadingHistory,
          // MANTENER: Conservar información de procesamiento anterior
          lastHistoryUpdate: existing.lastHistoryUpdate,
          isProcessing: existing.isProcessing || false,
          // NUEVO: Trackear última actualización en tiempo real
          lastRealtimeUpdate: new Date().toISOString(),
        });

        console.log(
          `🔄 CONDUCTOR EXISTENTE ACTUALIZADO: ${
            conductor.nombre
          } - Count: ${finalCount} (historial base: ${baseHistoryCount}, tiempo real: ${newRealtimePreavisos}, procesado: ${!!existing.lastHistoryUpdate})`
        );
      } else {
        // Nuevo conductor detectado - SOLO aquí marcarlo para carga de historial
        // CRÍTICO: Marcar con count mínimo 1 para evitar eliminación prematura
        const newConductor = {
          ...conductor,
          count: Math.max(conductor.count, 1), // Garantizar mínimo 1
          isLoadingHistory: true, // Solo nuevos conductores necesitan historial
          isProcessing: false, // Inicialmente no está siendo procesado
          detectedAt: new Date().toISOString(), // Timestamp de detección
        };

        combinedMap.set(conductor.conductorId, newConductor);

        console.log(
          `🆕 NUEVO CONDUCTOR DETECTADO: ${
            conductor.nombre
          } - Count inicial: ${Math.max(conductor.count, 1)} (original: ${
            conductor.count
          })`
        );
      }
    });

    // CRÍTICO: Filtrar conductores persistentes que no tengan datos de hoy
    // Solo remover si el lastTime/addedAt no es de hoy
    const today = new Date();
    const todayDateString = today.toDateString();

    const finalMap = new Map();

    combinedMap.forEach((conductor, conductorId) => {
      // Verificar si el conductor tiene datos del día actual
      const conductorDate = conductor.lastTime
        ? new Date(conductor.lastTime).toDateString()
        : conductor.addedAt
        ? new Date(conductor.addedAt).toDateString()
        : todayDateString; // Default a hoy si no hay fecha

      // Solo mantener conductores del día actual
      if (conductorDate === todayDateString) {
        finalMap.set(conductorId, conductor);
      } else {
        console.log(
          `🗑️ Eliminando conductor de día anterior: ${conductor.nombre} (${conductorDate})`
        );
      }
    });

    const result = Array.from(finalMap.values());

    console.log("🎯 FASE 2: Ranking combinado:", result.length, "conductores");
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

    return result;
  }, [
    markersData,
    isInitialized,
    aggressiveStates,
    normalizeString,
    getConductorInfo,
    state.aggressiveDrivingHistory,
  ]);

  // Ordenar ranking - FASE 1: Por defecto ordenar por count (ranking)
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
        "💾 GUARDANDO en localStorage:",
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

      saveRankingToStorage(state.aggressiveDrivingHistory);
    }
  }, [
    state.aggressiveDrivingHistory,
    saveRankingToStorage,
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

  // FASE 2: Procesar nuevos conductores UNA SOLA VEZ (evita bucles infinitos)
  useEffect(() => {
    console.log("🔔 USEEFFECT DISPARADO - Procesar nuevos conductores");

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

    // CRÍTICO: Solo detectar conductores que REALMENTE son nuevos y nunca fueron procesados
    const newConductors = aggressiveDrivingRanking.filter(
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
        "⏭️ FASE 2: No hay conductores nuevos que requieran procesamiento"
      );
      return;
    }

    // Throttling ESTRICTO: No procesar más de una vez cada 3 segundos
    const now = Date.now();
    if (now - lastProcessTimeRef.current < 3000) {
      console.log(
        `⏸️ FASE 2: Throttling activo, esperando ${
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
      `🔄 FASE 2: ${newConductors.length} conductores necesitan historial (ejecutando API calls):`
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

    // Procesar cada conductor de forma secuencial
    const processConductorsSequentially = async () => {
      try {
        for (const conductor of newConductors) {
          if (conductor.lastUnit) {
            const conductorInfo = getConductorInfo(conductor.lastUnit);

            if (conductorInfo) {
              console.log(
                `🆕 FASE 2: ⚡ EJECUTANDO API CALL para conductor: ${conductor.nombre}`
              );

              try {
                const totalCount = await fetchConductorHistorialCount(
                  conductor.lastUnit,
                  conductorInfo
                );

                // CRÍTICO: Obtener el count actual del conductor para no perder datos
                const currentRanking = [
                  ...(state.aggressiveDrivingHistory || []),
                ];
                const updateIndex = currentRanking.findIndex(
                  (item) => item.conductorId === conductor.conductorId
                );

                // Calcular el count final: MÁXIMO entre API y count actual en tiempo real
                const currentCount =
                  updateIndex >= 0
                    ? currentRanking[updateIndex].count
                    : conductor.count;
                const finalCount = Math.max(totalCount, currentCount, 1);

                console.log(
                  `🔢 FASE 2: Calculando count final para ${conductor.nombre}:`
                );
                console.log(`  - API historial: ${totalCount}`);
                console.log(`  - Count actual: ${currentCount}`);
                console.log(`  - Count final: ${finalCount}`);

                if (updateIndex >= 0) {
                  currentRanking[updateIndex] = {
                    ...currentRanking[updateIndex],
                    count: finalCount, // USAR EL MÁXIMO CALCULADO
                    isLoadingHistory: false,
                    isProcessing: false,
                    lastHistoryUpdate: new Date().toISOString(),
                  };
                } else {
                  // Agregar nuevo conductor al ranking con todos los datos
                  currentRanking.push({
                    ...conductor,
                    count: finalCount, // USAR EL MÁXIMO CALCULADO
                    isLoadingHistory: false,
                    isProcessing: false,
                    lastHistoryUpdate: new Date().toISOString(),
                    addedAt: new Date().toISOString(),
                  });
                }

                dispatch({
                  type: "SET_AGRESSIVE_HISTORY",
                  payload: currentRanking,
                });

                // CRÍTICO: Guardar inmediatamente en localStorage después de actualizar
                console.log(
                  `💾 GUARDANDO INMEDIATAMENTE ${conductor.nombre} con count ${finalCount} en localStorage`
                );
                saveRankingToStorage(currentRanking);

                console.log(
                  `✅ FASE 2: API CALL COMPLETADA para ${conductor.nombre} - Count final: ${finalCount} (API: ${totalCount}, Actual: ${currentCount})`
                );
              } catch (error) {
                console.error(
                  `❌ Error obteniendo historial para ${conductor.nombre}:`,
                  error
                );

                // IMPORTANTE: Marcar como no cargando SIEMPRE, incluso en error
                const errorRanking = [
                  ...(state.aggressiveDrivingHistory || []),
                ];
                const errorIndex = errorRanking.findIndex(
                  (item) => item.conductorId === conductor.conductorId
                );

                if (errorIndex >= 0) {
                  errorRanking[errorIndex] = {
                    ...errorRanking[errorIndex],
                    isLoadingHistory: false,
                    isProcessing: false,
                    lastHistoryUpdate: new Date().toISOString(),
                    count: Math.max(errorRanking[errorIndex].count || 1, 1), // GARANTIZAR MÍNIMO 1
                  };

                  dispatch({
                    type: "SET_AGRESSIVE_HISTORY",
                    payload: errorRanking,
                  });

                  // CRÍTICO: Guardar también en caso de error
                  console.log(
                    `💾 GUARDANDO EN ERROR ${conductor.nombre} en localStorage`
                  );
                  saveRankingToStorage(errorRanking);
                }
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
              // Remover del loading set si no se puede procesar
              setLoadingHistoryIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(conductor.conductorId);
                return newSet;
              });
            }
          }

          // Pausa entre conductores para no sobrecargar
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } finally {
        // LIBERAR LOCK GLOBAL SIEMPRE
        isProcessingRef.current = false;
        console.log("🔓 LOCK GLOBAL LIBERADO - Procesamiento completado");
      }
    };

    processConductorsSequentially();

    console.log(
      `✅ FASE 2: Iniciado procesamiento de ${newConductors.length} conductores`
    );
  }, [
    aggressiveDrivingRanking,
    isInitialized,
    getConductorInfo,
    fetchConductorHistorialCount,
    saveRankingToStorage,
    state.aggressiveDrivingHistory,
    dispatch,
  ]); // AGREGAR DEPENDENCIAS NECESARIAS

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
