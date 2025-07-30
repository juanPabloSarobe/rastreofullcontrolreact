import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Typography,
  CircularProgress,
} from "@mui/material";
import DepartureBoardIcon from "@mui/icons-material/DepartureBoard";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import SortIcon from "@mui/icons-material/Sort";
import BaseExpandableAlert from "./BaseExpandableAlert";
import { useContextValue } from "../../context/Context"; // Corregir la importación del contexto

// Componente memoizado para cada item de la lista de ralentí
const IdleUnitItem = React.memo(
  ({
    unit,
    index,
    isLast,
    isIgnored,
    idleTime,
    stateColor,
    isLoadingHistorical,
    onToggleIgnore,
    onUnitSelect,
  }) => (
    <ListItem
      key={unit.Movil_ID}
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
        <IconButton
          size="small"
          onClick={(e) => onToggleIgnore(unit.Movil_ID, e)}
          sx={{
            color: isIgnored ? "text.disabled" : "text.secondary",
            mx: 1,
            "&:hover": {
              backgroundColor: isIgnored
                ? "rgba(0, 0, 0, 0.04)"
                : "rgba(255, 152, 0, 0.1)",
            },
          }}
        >
          {isIgnored ? (
            <VisibilityOffIcon fontSize="small" />
          ) : (
            <VisibilityIcon fontSize="small" />
          )}
        </IconButton>

        <ListItemButton
          onClick={() => onUnitSelect(unit)}
          sx={{
            opacity: isIgnored ? 0.5 : 1,
            flex: 1,
            py: 0.5,
            "&:hover": {
              backgroundColor: isIgnored
                ? "rgba(0, 0, 0, 0.04)"
                : "rgba(255, 152, 0, 0.08)",
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
                    component="div"
                    sx={{
                      fontWeight: "bold",
                      fontSize: "0.9rem",
                      display: "flex",
                      alignItems: "center",
                      minWidth: 0,
                    }}
                  >
                    <Box sx={{ marginRight: "8px", flexShrink: 0 }}>
                      {unit.patente || "Sin patente"}
                    </Box>
                    <Box sx={{ marginRight: "8px", flexShrink: 0 }}>-</Box>
                    <Box
                      sx={{
                        maxWidth: "50%",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {unit.empresa || "Sin empresa"}
                    </Box>
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "grey.100",
                    color: "text.primary",
                    px: 1,
                    py: 0.25,
                    borderRadius: "12px",
                    fontFamily: "monospace",
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  {idleTime}
                  {isLoadingHistorical && (
                    <CircularProgress
                      size={12}
                      thickness={4}
                      sx={{
                        color: "primary.main",
                        ml: 0.25,
                      }}
                    />
                  )}
                </Box>
              </Box>
            }
            secondary={
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mt: 0.75,
                }}
              >
                <Box
                  sx={{
                    display: "inline-block",
                    backgroundColor:
                      stateColor === "error.main"
                        ? "error.50"
                        : stateColor === "text.primary"
                        ? "grey.100"
                        : "warning.50",
                    color: stateColor,
                    px: 1,
                    py: 0.25,
                    borderRadius: "8px",
                    fontSize: "0.7rem",
                    fontWeight: "medium",
                  }}
                >
                  {unit.estado}
                </Box>

                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.75rem",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  👤 {unit.nombre || "Conductor no identificado"}
                </Typography>
              </Box>
            }
            sx={{
              "& .MuiListItemText-primary": {
                marginBottom: "0px",
              },
              "& .MuiListItemText-secondary": {
                marginTop: "0px",
              },
            }}
          />
        </ListItemButton>
      </Box>
    </ListItem>
  )
);

const IdleUnitsAlert = ({ markersData, onUnitSelect }) => {
  const [ignoredUnits, setIgnoredUnits] = useState(new Set());
  const [sortBy, setSortBy] = useState("time"); // Cambiar orden por defecto a tiempo
  const [loadingHistoricalData, setLoadingHistoricalData] = useState(new Set()); // Nuevo estado para trackear cargas
  const { state, dispatch } = useContextValue(); // Obtener estado y dispatch del contexto

  // Constantes
  const STORAGE_KEY = "idleTimers";
  const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
  const ONE_HOUR_MS = 60 * 60 * 1000;
  const FIFTEEN_MINUTES_MS = 15 * 60 * 1000; // Nueva constante para 15 minutos

  // Memoizar array de estados idle para evitar recrearlo en cada render
  const idleStates = useMemo(
    () => [
      "inicio ralenti",
      "inicio ralentí",
      "inicio de ralenti",
      "inicio de ralentí",
      "fin de ralenti",
      "fin de ralentí",
      "fin ralenti",
      "fin ralentí",
      "reporte en ralenti",
      "reporte en ralentí",
      "reporte de ralenti",
      "reporte de ralentí",
      "ralentí",
      "ralenti",
    ],
    []
  );

  // Función para normalizar strings - Memoizada para optimizar rendimiento
  const normalizeString = useCallback(
    (str) =>
      str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim(),
    []
  );

  // Función para cargar timers desde localStorage
  const loadTimersFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedTimers = JSON.parse(stored);
        const timersMap = new Map();

        // Convertir y validar datos almacenados
        Object.entries(parsedTimers).forEach(([unitId, timer]) => {
          if (
            timer &&
            typeof timer === "object" &&
            timer.startTime &&
            timer.lastUpdate
          ) {
            timersMap.set(unitId, {
              startTime: timer.startTime,
              accumulatedTime: timer.accumulatedTime || 0,
              lastUpdate: timer.lastUpdate,
              isFromStorage: true, // Marcar como cargado desde storage
            });
          }
        });

        return timersMap;
      }
    } catch (error) {
      console.warn("Error cargando timers desde localStorage:", error);
    }
    return new Map();
  }, []);

  // Función para obtener datos históricos de una unidad
  const fetchHistoricalData = useCallback(async (unitId) => {
    try {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const fechaInicial = today.toISOString().split("T")[0]; // YYYY-MM-DD
      const fechaFinal = tomorrow.toISOString().split("T")[0]; // YYYY-MM-DD

      const url = `/api/servicio/historico.php/historico?movil=${unitId}&&fechaInicial=${fechaInicial}&&fechaFinal=${fechaFinal}`;

      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data.Historico || [];
    } catch (error) {
      console.warn(`Error fetching historical data for unit ${unitId}:`, error);
      return [];
    }
  }, []);

  // Función para analizar datos históricos y encontrar inicio de ralentí
  const analyzeHistoricalIdleData = useCallback(
    (historicalData) => {
      if (!historicalData || historicalData.length === 0) {
        return { hasIdleStart: false, idleStartTime: null };
      }

      // Empezar desde el final (último reporte) e ir hacia atrás
      let idleStartTime = null;
      let hasIdleStart = false;

      for (let i = historicalData.length - 1; i >= 0; i--) {
        const record = historicalData[i];
        const event = normalizeString(record.evn || "");

        // Verificar si es "Inicio Ralenti" (punto exacto) - con y sin acentos
        if (event === "inicio ralenti" || event === "inicio de ralenti") {
          const datetime = `${record.fec}T${record.hor}`;
          idleStartTime = new Date(datetime).getTime();
          hasIdleStart = true;
          break; // Encontramos el inicio exacto, no necesitamos seguir
        }

        // Si es "Reporte en Ralenti", guardarlo como candidato (fallback) - con y sin acentos
        else if (
          event === "reporte en ralenti" ||
          event === "reporte de ralenti"
        ) {
          if (!idleStartTime) {
            // Solo si no hemos encontrado uno ya
            const datetime = `${record.fec}T${record.hor}`;
            idleStartTime = new Date(datetime).getTime();
            // No marcamos hasIdleStart como true porque es un fallback
          }
        }

        // Si encontramos "Fin de ralenti", significa que hemos pasado el período actual - con y sin acentos
        else if (event === "fin de ralenti" || event === "fin ralenti") {
          break; // Salir del loop, no hay ralentí activo antes de este punto
        }
      }

      return {
        hasIdleStart,
        idleStartTime,
      };
    },
    [normalizeString]
  );

  // Función para cargar y procesar datos históricos para unidades específicas
  const loadHistoricalIdleData = useCallback(
    async (unitsToProcess) => {
      const promises = unitsToProcess.map(async (unitId) => {
        try {
          const historicalData = await fetchHistoricalData(unitId);
          const analysis = analyzeHistoricalIdleData(historicalData);

          return {
            unitId,
            ...analysis,
          };
        } catch (error) {
          console.warn(
            `Error processing historical data for unit ${unitId}:`,
            error
          );
          return {
            unitId,
            hasIdleStart: false,
            idleStartTime: null,
          };
        }
      });

      const results = await Promise.all(promises);
      return results;
    },
    [fetchHistoricalData, analyzeHistoricalIdleData]
  );

  // Función para guardar timers en localStorage
  const saveTimersToStorage = useCallback((timersMap) => {
    try {
      const timersObject = {};
      timersMap.forEach((timer, unitId) => {
        timersObject[unitId] = {
          startTime: timer.startTime,
          accumulatedTime: timer.accumulatedTime,
          lastUpdate: timer.lastUpdate,
        };
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(timersObject));
    } catch (error) {
      console.warn("Error guardando timers en localStorage:", error);
    }
  }, []);

  // Inicializar timers al montar el componente
  useEffect(() => {
    const storedTimers = loadTimersFromStorage();
    if (storedTimers.size > 0) {
      dispatch({
        type: "SET_IDLE_TIMERS",
        payload: storedTimers,
      });
    }
  }, [loadTimersFromStorage, dispatch]);

  // Detectar unidades en ralentí
  const idleUnits = useMemo(() => {
    if (!markersData) return [];

    const currentTime = Date.now();

    return markersData.filter((unit) => {
      if (!unit.estado || !unit.fechaHora) return false;

      // Filtro por antigüedad: excluir reportes de más de 12 horas
      const reportTime = new Date(unit.fechaHora).getTime();
      const timeDifference = currentTime - reportTime;

      if (timeDifference > TWELVE_HOURS_MS) {
        return false; // Excluir reportes antiguos
      }

      const estado = normalizeString(unit.estado);

      const hasIdleState = idleStates.some((idleState) => {
        const normalizedIdleState = normalizeString(idleState);
        return estado.includes(normalizedIdleState);
      });

      // NUEVA LÓGICA: Si la unidad está en ralentí pero su último reporte tiene más de 15 minutos, excluirla
      if (hasIdleState && timeDifference > FIFTEEN_MINUTES_MS) {
        return false; // Excluir unidades en ralentí que no reportan hace más de 15 minutos
      }

      // Si es "fin de ralentí/ralenti" y motor apagado, no incluir en la lista
      if (
        hasIdleState &&
        (estado.includes("fin de ralenti") || estado.includes("fin ralenti"))
      ) {
        const motorApagado = unit.estadoDeMotor
          ?.toLowerCase()
          .includes("motor apagado");
        return !motorApagado; // Solo incluir si el motor NO está apagado
      }

      return hasIdleState;
    });
  }, [
    markersData,
    TWELVE_HOURS_MS,
    FIFTEEN_MINUTES_MS,
    idleStates,
    normalizeString,
  ]);

  // Memoizar set de unidades activas para optimizar rendimiento
  const activeUnitIds = useMemo(
    () => new Set(idleUnits.map((unit) => unit.Movil_ID)),
    [idleUnits]
  );

  // Gestionar contadores de tiempo con estrategia híbrida mejorada
  useEffect(() => {
    if (idleUnits.length === 0) return;

    const processTimers = () => {
      const newTimers = new Map(state.idleTimers);
      const currentTime = Date.now();

      // Procesar cada unidad en ralentí
      idleUnits.forEach((unit) => {
        const unitId = unit.Movil_ID;
        const fechaHora = new Date(unit.fechaHora).getTime();

        if (!newTimers.has(unitId)) {
          // Nueva unidad en ralentí detectada
          // Buscar si hay datos persistidos para calcular tiempo más preciso
          const storedTimer = loadTimersFromStorage().get(unitId);

          if (
            storedTimer &&
            currentTime - storedTimer.lastUpdate < ONE_HOUR_MS
          ) {
            // Usar datos almacenados si son recientes (menos de 1 hora)
            // CORREGIDO: No usar currentTime, usar el timestamp del GPS actual
            const timeSinceStorage = fechaHora - storedTimer.lastUpdate;
            newTimers.set(unitId, {
              startTime: storedTimer.startTime,
              accumulatedTime:
                storedTimer.accumulatedTime + Math.max(0, timeSinceStorage),
              lastUpdate: fechaHora,
              isPersisted: true,
            });
          } else {
            // Calcular basándose en el timestamp del GPS
            const estimatedStartTime = Math.max(
              fechaHora - 5 * 60 * 1000,
              fechaHora
            ); // Máximo 5 min hacia atrás

            // CORREGIDO: Usar fechaHora en lugar de currentTime para cálculo inicial
            const tempTimer = {
              startTime: estimatedStartTime,
              accumulatedTime: Math.max(0, fechaHora - estimatedStartTime),
              lastUpdate: fechaHora,
              isTemporary: true,
            };

            newTimers.set(unitId, tempTimer);

            // Buscar datos históricos en background
            setLoadingHistoricalData((prev) => new Set([...prev, unitId])); // Marcar como cargando

            loadHistoricalIdleData([unitId])
              .then((results) => {
                const result = results[0];
                if (result && result.hasIdleStart && result.idleStartTime) {
                  // CORREGIDO: Usar fechaHora (último timestamp GPS) en lugar de Date.now()
                  const preciseAccumulatedTime =
                    fechaHora - result.idleStartTime;

                  const updatedTimer = {
                    startTime: result.idleStartTime,
                    accumulatedTime: Math.max(0, preciseAccumulatedTime),
                    lastUpdate: fechaHora,
                    isHistoricallyLoaded: true,
                  };

                  // Actualizar en el contexto
                  dispatch({
                    type: "UPDATE_IDLE_TIMER",
                    payload: { unitId, timer: updatedTimer },
                  });
                }
              })
              .catch((error) => {
                console.warn(
                  `Error cargando datos históricos para unidad ${unitId}:`,
                  error
                );
              })
              .finally(() => {
                // Remover del estado de loading cuando termine (éxito o error)
                setLoadingHistoricalData((prev) => {
                  const newSet = new Set(prev);
                  newSet.delete(unitId);
                  return newSet;
                });
              });

            // CORREGIDO: Timer inicial también usa fechaHora
            newTimers.set(unitId, {
              startTime: estimatedStartTime,
              accumulatedTime: Math.max(0, fechaHora - estimatedStartTime),
              lastUpdate: fechaHora,
              isNewDetection: true,
            });
          }
        } else {
          // Actualizar unidad existente
          const timer = newTimers.get(unitId);
          const timeDiff = fechaHora - timer.lastUpdate;

          // Solo sumar tiempo si la diferencia es positiva y razonable (menos de 1 hora)
          if (timeDiff > 0 && timeDiff < ONE_HOUR_MS) {
            timer.accumulatedTime += timeDiff;
          } else if (timeDiff < 0) {
            // CORREGIDO: Si el timestamp es anterior, mantener el tiempo acumulado sin usar currentTime
            // Solo ajustar si es necesario, pero nunca usar horario actual
            timer.accumulatedTime = Math.max(
              timer.accumulatedTime,
              fechaHora - timer.startTime
            );
          }

          timer.lastUpdate = fechaHora;
          newTimers.set(unitId, timer);
        }
      });

      // Remover unidades que ya no están en ralentí o que han expirado
      for (const [unitId, timer] of newTimers.entries()) {
        // CORREGIDO: Usar el último timestamp GPS conocido en lugar de currentTime
        const lastKnownGpsTime = timer.lastUpdate;
        const timeSinceLastUpdate = currentTime - lastKnownGpsTime;

        // Remover si la unidad ya no está en ralentí o si han pasado más de 1 hora sin actualizaciones GPS
        if (!activeUnitIds.has(unitId) || timeSinceLastUpdate > ONE_HOUR_MS) {
          newTimers.delete(unitId);
          // También remover de ignorados si ya no está en ralentí
          if (!activeUnitIds.has(unitId)) {
            setIgnoredUnits((prev) => {
              const newIgnored = new Set(prev);
              newIgnored.delete(unitId);
              return newIgnored;
            });
          }
        }
      }

      // Actualizar contexto y localStorage
      dispatch({
        type: "SET_IDLE_TIMERS",
        payload: newTimers,
      });

      saveTimersToStorage(newTimers);
    };
    processTimers();
  }, [
    idleUnits,
    activeUnitIds,
    // state.idleTimers, // ← REMOVIDO: Esta dependencia causa bucle infinito
    dispatch,
    saveTimersToStorage,
    loadTimersFromStorage,
    ONE_HOUR_MS,
  ]);

  // Formatear tiempo en formato HH:MM:SS - Memoizado para optimizar rendimiento
  const formatTime = useCallback((milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  // Obtener tiempo de ralentí para una unidad
  const getIdleTime = useCallback(
    (unitId) => {
      const timer = state.idleTimers.get(unitId);
      if (!timer) return "00:00:00";

      return formatTime(timer.accumulatedTime);
    },
    [state.idleTimers, formatTime]
  );

  // Determinar color del estado basado en tiempo y condiciones - Memoizado para optimizar rendimiento
  const getStateColor = useCallback(
    (estado, unitId) => {
      if (!estado) return "inherit";

      const estadoLower = normalizeString(estado);

      // Inicio de ralentí: siempre naranja - con variaciones
      if (
        estadoLower.includes("inicio ralenti") ||
        estadoLower.includes("inicio de ralenti")
      ) {
        return "warning.main";
      }

      // Fin de ralentí con motor encendido: gris - con variaciones
      if (
        estadoLower.includes("fin de ralenti") ||
        estadoLower.includes("fin ralenti")
      ) {
        return "text.primary";
      }

      // Reporte en ralentí: color basado en tiempo - con variaciones
      if (
        estadoLower.includes("reporte en ralenti") ||
        estadoLower.includes("reporte de ralenti")
      ) {
        const timer = state.idleTimers.get(unitId);
        if (timer) {
          const totalMinutes = Math.floor(timer.accumulatedTime / (1000 * 60));
          return totalMinutes >= 5 ? "error.main" : "warning.main"; // Rojo >= 5min, Naranja < 5min
        }
        return "warning.main"; // Por defecto naranja si no hay timer
      }

      // Ralentí genérico: naranja
      return "warning.main";
    },
    [state.idleTimers, normalizeString]
  );

  // Ordenar unidades
  const sortedIdleUnits = useMemo(() => {
    const units = [...idleUnits];

    if (sortBy === "alphabetic") {
      units.sort((a, b) => (a.patente || "").localeCompare(b.patente || ""));
    } else if (sortBy === "time") {
      units.sort((a, b) => {
        const timeA = state.idleTimers.get(a.Movil_ID)?.accumulatedTime || 0;
        const timeB = state.idleTimers.get(b.Movil_ID)?.accumulatedTime || 0;
        return timeB - timeA; // Descendente (más tiempo en ralentí arriba)
      });
    }

    // Separar ignoradas y activas
    const active = units.filter((unit) => !ignoredUnits.has(unit.Movil_ID));
    const ignored = units.filter((unit) => ignoredUnits.has(unit.Movil_ID));

    return [...active, ...ignored];
  }, [idleUnits, sortBy, ignoredUnits, state.idleTimers]);

  // Manejar toggle de ignorar unidad - Memoizado para optimizar rendimiento
  const toggleIgnoreUnit = useCallback((unitId, event) => {
    event.stopPropagation();
    setIgnoredUnits((prev) => {
      const newIgnored = new Set(prev);
      if (newIgnored.has(unitId)) {
        newIgnored.delete(unitId);
      } else {
        newIgnored.add(unitId);
      }
      return newIgnored;
    });
  }, []);

  // Manejar selección de unidad - Memoizado para optimizar rendimiento
  const handleUnitSelect = useCallback(
    (unit) => {
      if (onUnitSelect) {
        // Crear nueva lista: mantener las existentes + poner la clickeada al final
        const currentUnits = [...state.selectedUnits];

        // Remover la unidad si ya estaba (para evitar duplicados)
        const filteredUnits = currentUnits.filter((id) => id !== unit.Movil_ID);

        // Agregar la unidad clickeada al final (será la que reciba foco)
        const updatedUnits = [...filteredUnits, unit.Movil_ID];

        onUnitSelect(updatedUnits);
      }
    },
    [onUnitSelect, state.selectedUnits]
  );

  // Manejar cambio de ordenamiento - Memoizado para optimizar rendimiento
  const handleSortChange = useCallback(() => {
    setSortBy(sortBy === "alphabetic" ? "time" : "alphabetic");
  }, [sortBy]);

  // Renderizar contenido específico de ralentí
  const renderIdleContent = ({
    onUnitSelect: onUnitSelectFromBase,
    handleClose,
  }) => (
    <>
      {/* Eliminar el header duplicado - directamente la lista */}
      {sortedIdleUnits.length > 0 ? (
        <List dense sx={{ maxHeight: "328px", overflow: "auto", p: 0 }}>
          {sortedIdleUnits.map((unit, index) => {
            const isIgnored = ignoredUnits.has(unit.Movil_ID);
            const idleTime = getIdleTime(unit.Movil_ID);
            const stateColor = getStateColor(unit.estado, unit.Movil_ID);
            const isLoadingHistorical = loadingHistoricalData.has(
              unit.Movil_ID
            );
            const isLast = index === sortedIdleUnits.length - 1;

            return (
              <IdleUnitItem
                key={unit.Movil_ID}
                unit={unit}
                index={index}
                isLast={isLast}
                isIgnored={isIgnored}
                idleTime={idleTime}
                stateColor={stateColor}
                isLoadingHistorical={isLoadingHistorical}
                onToggleIgnore={toggleIgnoreUnit}
                onUnitSelect={handleUnitSelect}
              />
            );
          })}
        </List>
      ) : (
        <Box
          sx={{
            p: 4,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
          }}
        >
          <DepartureBoardIcon sx={{ fontSize: 48, color: "grey.300" }} />
          <Typography variant="body2" color="text.secondary">
            No hay unidades en ralentí
          </Typography>
          <Typography variant="caption" color="text.disabled">
            Las unidades aparecerán aquí cuando detectemos estados de ralentí
          </Typography>
        </Box>
      )}
    </>
  );

  return (
    <BaseExpandableAlert
      icon={DepartureBoardIcon}
      title="Unidades en ralentí"
      count={idleUnits.length}
      tooltipText={`Unidades en ralentí: ${idleUnits.length}`}
      verticalOffset={{ desktop: 300, mobile: 200 }}
      onUnitSelect={handleUnitSelect}
      // Nuevas props para ordenamiento
      sortBy={sortBy}
      onSortChange={handleSortChange}
      showSortButton={true}
      sortOptions={{ option1: "Patente", option2: "Tiempo" }}
      badgeColor="warning.main"
      iconColor="warning.main"
      zIndex={1200}
    >
      {renderIdleContent}
    </BaseExpandableAlert>
  );
};

export default IdleUnitsAlert;
