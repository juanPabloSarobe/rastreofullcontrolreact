import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Typography,
  Divider,
  Button,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import DeleteIcon from "@mui/icons-material/Delete";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import RefreshIcon from "@mui/icons-material/Refresh";
import BaseExpandableAlert from "./BaseExpandableAlert";
import { useContextValue } from "../../context/Context";

// Componente memoizado para cada item de la lista de infracciones
const InfractionItem = React.memo(
  ({
    unit,
    index,
    isLast,
    isHistory,
    severityColor,
    formattedTime,
    onDelete,
    onUnitSelect,
    onRefreshDetails,
    isLoadingDetails = false,
  }) => (
    <ListItem
      key={unit.Movil_ID}
      disablePadding
      sx={{
        borderBottom: !isLast ? "1px solid" : "none",
        borderColor: "divider",
        opacity: isHistory ? 0.6 : 1,
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
        {/* Botón de eliminar del lado izquierdo para historial */}
        {isHistory && onDelete && (
          <IconButton
            size="small"
            onClick={(e) => onDelete(unit.Movil_ID, e)}
            sx={{
              color: "text.disabled",
              ml: 1,
              mr: 0.5,
              "&:hover": {
                backgroundColor: "rgba(244, 67, 54, 0.1)",
                color: "error.main",
              },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}

        {/* Botón de refrescar detalles solo para historial */}
        {/* Temporalmente oculto para evaluar la UI
        {isHistory && onRefreshDetails && (
          <Tooltip title="Refrescar detalles de infracción">
            <IconButton
              size="small"
              onClick={(e) => onRefreshDetails(unit, e)}
              disabled={isLoadingDetails}
              sx={{
                color: "text.disabled",
                mr: 0.5,
                "&:hover": {
                  backgroundColor: "rgba(33, 150, 243, 0.1)",
                  color: "primary.main",
                },
                "&:disabled": {
                  color: "text.disabled",
                  opacity: 0.5,
                },
              }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        */}

        <ListItemButton
          onClick={() => onUnitSelect(unit)}
          sx={{
            flex: 1,
            py: 0.5,
            "&:hover": {
              backgroundColor: isHistory
                ? "rgba(0, 0, 0, 0.04)"
                : "rgba(244, 67, 54, 0.08)", // error.main con alpha
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
                    backgroundColor: isHistory ? "grey.100" : "error.50",
                    color: isHistory ? "text.disabled" : "error.main",
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
                  {formattedTime}
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
                {/* Información diferente para historial vs activas */}
                {isHistory ? (
                  // Para historial: velocidad máxima y duración (placeholders por ahora)
                  <>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        alignItems: "center",
                        flex: 1,
                        minWidth: 0, // Permite que se comprima
                      }}
                    >
                      {isLoadingDetails ? (
                        // Mostrar loading mientras se obtienen los datos
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            px: 1,
                            py: 0.25,
                          }}
                        >
                          <CircularProgress size={16} thickness={4} />
                          <Typography
                            variant="caption"
                            sx={{
                              color: "text.secondary",
                              fontSize: "0.7rem",
                            }}
                          >
                            Obteniendo detalles...
                          </Typography>
                        </Box>
                      ) : (
                        // Mostrar datos de la infracción
                        <>
                          <Box
                            sx={{
                              display: "inline-block",
                              backgroundColor: "grey.200",
                              color: "grey.700",
                              px: 1,
                              py: 0.25,
                              borderRadius: "8px",
                              fontSize: "0.7rem",
                              fontWeight: "medium",
                            }}
                          >
                            Max {unit.maxVelocidad || "-- km/h"}
                          </Box>
                          <Box
                            sx={{
                              display: "inline-block",
                              backgroundColor: "grey.200",
                              color: "grey.700",
                              px: 1,
                              py: 0.25,
                              borderRadius: "8px",
                              fontSize: "0.7rem",
                              fontWeight: "medium",
                              ml: 0.5,
                            }}
                          >
                            ⏱️ {unit.duracion || "--:--"}
                          </Box>
                        </>
                      )}
                    </Box>

                    <Typography
                      variant="caption"
                      sx={{
                        color: "grey.600",
                        fontSize: "0.7rem",
                        display: "flex",
                        alignItems: "center",
                        maxWidth: "50%",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        ml: "auto", // Empujar hacia la derecha
                      }}
                    >
                      👤 {unit.nombre || "Conductor no identificado"}
                    </Typography>
                  </>
                ) : (
                  // Para infracciones activas: mantener el estado actual
                  <>
                    <Box
                      sx={{
                        display: "inline-block",
                        backgroundColor: severityColor + ".50",
                        color: severityColor + ".main",
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
                        color: "grey.600",
                        fontSize: "0.7rem",
                        display: "flex",
                        alignItems: "center",
                        maxWidth: "50%",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        ml: "auto", // Empujar hacia la derecha
                      }}
                    >
                      👤 {unit.nombre || "Conductor no identificado"}
                    </Typography>
                  </>
                )}
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

// Constantes para localStorage (fuera del componente para evitar recreación)
const INFRACTION_HISTORY_STORAGE_KEY = "infractionHistory";
const LOADING_UNITS_STORAGE_KEY = "loadingInfractionUnits";

const InfractionAlert = ({ markersData, onUnitSelect }) => {
  const [sortBy, setSortBy] = useState("time"); // Por defecto por tiempo
  const { state, dispatch } = useContextValue(); // Obtener estado y dispatch del contexto

  // Función para cargar historial desde localStorage
  const loadHistoryFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(INFRACTION_HISTORY_STORAGE_KEY);
      if (stored) {
        const parsedHistory = JSON.parse(stored);
        return Array.isArray(parsedHistory) ? parsedHistory : [];
      }
    } catch (error) {
      console.warn(
        "Error cargando historial de infracciones desde localStorage:",
        error
      );
    }
    return [];
  }, []); // Sin dependencias - función estable

  // Función para guardar historial en localStorage
  const saveHistoryToStorage = useCallback((history) => {
    try {
      localStorage.setItem(
        INFRACTION_HISTORY_STORAGE_KEY,
        JSON.stringify(history)
      );
    } catch (error) {
      console.warn(
        "Error guardando historial de infracciones en localStorage:",
        error
      );
    }
  }, []); // Sin dependencias - función estable

  // Función para cargar unidades en carga desde localStorage
  const loadLoadingUnitsFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(LOADING_UNITS_STORAGE_KEY);
      if (stored) {
        const parsedUnits = JSON.parse(stored);
        return new Set(Array.isArray(parsedUnits) ? parsedUnits : []);
      }
    } catch (error) {
      console.warn(
        "Error cargando unidades en carga desde localStorage:",
        error
      );
    }
    return new Set();
  }, []); // Sin dependencias - función estable

  // Función para guardar unidades en carga en localStorage
  const saveLoadingUnitsToStorage = useCallback((loadingUnitsSet) => {
    try {
      const loadingUnitsArray = Array.from(loadingUnitsSet);
      localStorage.setItem(
        LOADING_UNITS_STORAGE_KEY,
        JSON.stringify(loadingUnitsArray)
      );
    } catch (error) {
      console.warn("Error guardando unidades en carga en localStorage:", error);
    }
  }, []); // Sin dependencias - función estable

  // Constantes memoizadas
  const TWELVE_HOURS_MS = useMemo(() => 12 * 60 * 60 * 1000, []);

  // Inicializar datos desde localStorage al montar el componente
  useEffect(() => {
    const storedHistory = loadHistoryFromStorage();
    const storedLoadingUnits = loadLoadingUnitsFromStorage();

    if (storedHistory.length > 0) {
      dispatch({
        type: "SET_INFRACTION_HISTORY",
        payload: storedHistory,
      });
    }

    if (storedLoadingUnits.size > 0) {
      dispatch({
        type: "SET_LOADING_INFRACTION_UNITS",
        payload: storedLoadingUnits,
      });
    }
  }, [loadHistoryFromStorage, loadLoadingUnitsFromStorage, dispatch]);

  // Sincronizar localStorage cuando cambie el contexto
  useEffect(() => {
    saveHistoryToStorage(state.infractionHistory);
  }, [state.infractionHistory, saveHistoryToStorage]);

  useEffect(() => {
    saveLoadingUnitsToStorage(state.loadingInfractionUnits);
  }, [state.loadingInfractionUnits, saveLoadingUnitsToStorage]);

  // Array de estados de infracción memoizado - Solo términos explícitos
  const infractionStates = useMemo(
    () => [
      "infracción",
      "infraccion",
      "infracción de velocidad",
      "infraccion de velocidad",
      "infracción tiempo",
      "infraccion tiempo",
      "infracción movimiento",
      "infraccion movimiento",
      "infracción de descanso",
      "infraccion de descanso",
    ],
    []
  );

  // Función para normalizar strings - Memoizada
  const normalizeString = useCallback(
    (str) =>
      str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim(),
    []
  );

  // Función para determinar severidad de infracción - Memoizada
  const determineInfractionSeverity = useCallback(
    (estado) => {
      const estadoLower = normalizeString(estado);

      // Solo evaluar severidad si ya confirmamos que es una infracción
      // Infracciones de alta severidad (velocidad)
      if (
        estadoLower.includes("velocidad") ||
        estadoLower.includes("infraccion de velocidad") ||
        estadoLower.includes("infracción de velocidad") ||
        estadoLower.includes("violacion de velocidad") ||
        estadoLower.includes("violación de velocidad")
      ) {
        return "error"; // Rojo
      }
      // Infracciones de media severidad (tiempo/descanso)
      if (
        estadoLower.includes("tiempo") ||
        estadoLower.includes("descanso") ||
        estadoLower.includes("infraccion tiempo") ||
        estadoLower.includes("infracción tiempo")
      ) {
        return "warning"; // Naranja
      }
      // Infracciones de baja severidad (movimiento y otras)
      return "info"; // Azul
    },
    [normalizeString]
  );

  // Función para formatear tiempo de infracción - Memoizada
  const formatInfractionTime = useCallback((fechaHora) => {
    const date = new Date(fechaHora);
    return date.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false, // Formato 24 horas
    });
  }, []);

  // Función para formatear duración en formato mm:ss
  const formatDuration = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }, []);

  // Función para procesar la secuencia de infracción y calcular detalles
  const processInfractionSequence = useCallback(
    (historicalData, unit) => {
      if (!historicalData || !Array.isArray(historicalData)) {
        return null;
      }

      // Buscar la secuencia de infracción más reciente
      const infractionEvents = [];
      let startEvent = null;
      let endEvent = null;

      // Recorrer en orden cronológico inverso para encontrar la última infracción
      for (let i = historicalData.length - 1; i >= 0; i--) {
        const event = historicalData[i];
        const eventType = (event.evn || "").toLowerCase();

        // Buscar fin de infracción primero (yendo hacia atrás)
        if (
          !endEvent &&
          (eventType.includes("fin de infracción") ||
            eventType.includes("fin de infraccion") ||
            eventType.includes("fin de infracci"))
        ) {
          endEvent = event;
          infractionEvents.unshift(event);
          continue;
        }

        // Si ya encontramos el fin, buscar movimientos en infracción
        if (
          endEvent &&
          (eventType.includes("movimiento en infracción") ||
            eventType.includes("movimiento en infraccion"))
        ) {
          infractionEvents.unshift(event);
          continue;
        }

        // Buscar inicio de infracción
        if (
          endEvent &&
          (eventType.includes("inicio de infracción") ||
            eventType.includes("inicio de infraccion"))
        ) {
          startEvent = event;
          infractionEvents.unshift(event);
          break; // Secuencia completa encontrada
        }

        // Si encontramos otro evento que no es parte de la secuencia, parar
        if (
          endEvent &&
          !eventType.includes("infracción") &&
          !eventType.includes("infraccion") &&
          !eventType.includes("infracci")
        ) {
          break;
        }
      }

      if (!startEvent || !endEvent || infractionEvents.length === 0) {
        return null;
      }

      // Calcular velocidad máxima
      const maxVelocidad = Math.max(
        ...infractionEvents.map((event) => parseInt(event.vel) || 0)
      );

      // Calcular duración
      const startTime = new Date(`${startEvent.fec} ${startEvent.hor}`);
      const endTime = new Date(`${endEvent.fec} ${endEvent.hor}`);
      const durationInSeconds = Math.floor((endTime - startTime) / 1000);

      return {
        maxVelocidad: `${maxVelocidad} km/h`,
        duracion: formatDuration(durationInSeconds),
        infractionEvents,
      };
    },
    [formatDuration]
  );

  // Función para obtener detalles completos de la infracción
  const fetchInfractionDetails = useCallback(
    async (unit) => {
      try {
        const infractionDate = new Date(unit.fechaHora);
        // Buscar desde el día de la infracción hasta el día siguiente
        const startDate = new Date(infractionDate);
        const endDate = new Date(infractionDate);
        endDate.setDate(infractionDate.getDate() + 1); // Día siguiente

        // 🔧 CORREGIDO: Usar horario local en lugar de UTC
        // Formatear fechas como YYYY-MM-DD usando horario local
        const formatLocalDate = (date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        };

        const fechaInicial = formatLocalDate(startDate);
        const fechaFinal = formatLocalDate(endDate);

        console.log(`📅 Buscando historial para ${unit.patente}:`, {
          fechaInfraccion: unit.fechaHora,
          fechaInicial,
          fechaFinal,
          infractionDate: infractionDate.toString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });

        const url = `/api/servicio/historico.php/historico?movil=${unit.Movil_ID}&&fechaInicial=${fechaInicial}&&fechaFinal=${fechaFinal}`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        // El endpoint devuelve los datos en data.Historico, no directamente en data
        const historicalData = data.Historico || data;

        // Procesar los datos para encontrar la secuencia de infracción
        const infractionDetails = processInfractionSequence(
          historicalData,
          unit
        );

        return infractionDetails;
      } catch (error) {
        console.error(
          `Error obteniendo detalles de infracción para ${unit.patente}:`,
          error
        );
        return null;
      }
    },
    [processInfractionSequence]
  );

  // Detectar infracciones activas - Memoizado para optimizar rendimiento
  const activeInfractions = useMemo(() => {
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

      // Control de errores de configuración: validar que el motor esté encendido
      // Solo considerar infracciones válidas cuando el motor esté encendido
      if (unit.estadoDeMotor !== "Motor Encendido") {
        return false; // Excluir infracciones con motor apagado (error de configuración)
      }

      const estado = normalizeString(unit.estado);

      // Verificar si contiene palabras de infracción
      const hasInfractionState = infractionStates.some((infractionState) => {
        const normalizedInfractionState = normalizeString(infractionState);
        return estado.includes(normalizedInfractionState);
      });

      return hasInfractionState;
    });
  }, [markersData, TWELVE_HOURS_MS, infractionStates, normalizeString]);

  // Sets memoizados para comparaciones rápidas
  const activeInfractionIds = useMemo(
    () => new Set(activeInfractions.map((unit) => unit.Movil_ID)),
    [activeInfractions]
  );

  // Ordenar infracciones activas - Memoizado
  const sortedActiveInfractions = useMemo(() => {
    const units = [...activeInfractions];

    if (sortBy === "alphabetic") {
      units.sort((a, b) => (a.patente || "").localeCompare(b.patente || ""));
    } else if (sortBy === "time") {
      units.sort((a, b) => {
        const timeA = new Date(a.fechaHora).getTime();
        const timeB = new Date(b.fechaHora).getTime();
        return timeB - timeA; // Más recientes arriba
      });
    }

    return units;
  }, [activeInfractions, sortBy]);

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

  // Set memoizado de historial para comparaciones rápidas
  const historyInfractionIds = useMemo(
    () => new Set(state.infractionHistory.map((unit) => unit.Movil_ID)),
    [state.infractionHistory]
  );

  // Manejar eliminación individual del historial - Memoizado
  const handleRemoveFromHistory = useCallback(
    (unitId, event) => {
      event.stopPropagation();

      // Actualizar contexto
      dispatch({
        type: "REMOVE_FROM_INFRACTION_HISTORY",
        payload: { unitId },
      });

      // Actualizar localStorage
      const updatedHistory = state.infractionHistory.filter(
        (unit) => unit.Movil_ID !== unitId
      );
      saveHistoryToStorage(updatedHistory);
    },
    [state.infractionHistory, dispatch, saveHistoryToStorage]
  );

  // Manejar limpiar todo el historial - Memoizado
  const handleClearAllHistory = useCallback(
    (event) => {
      event.stopPropagation();

      // Limpiar contexto
      dispatch({ type: "CLEAR_INFRACTION_HISTORY" });

      // Limpiar localStorage
      saveHistoryToStorage([]);
    },
    [dispatch, saveHistoryToStorage]
  );

  // Manejar refrescar detalles de infracción manualmente - Memoizado
  const handleRefreshInfractionDetails = useCallback(
    async (unit, event) => {
      event.stopPropagation();

      // Marcar como cargando
      dispatch({
        type: "ADD_LOADING_INFRACTION_UNIT",
        payload: { unitId: unit.Movil_ID },
      });

      try {
        // Obtener detalles de la infracción
        const details = await fetchInfractionDetails(unit);

        if (details) {
          // Actualizar la unidad en el historial con los nuevos detalles
          dispatch({
            type: "UPDATE_INFRACTION_HISTORY",
            payload: { unitId: unit.Movil_ID, details },
          });
        }
      } catch (error) {
        console.error(
          `Error refrescando detalles para ${unit.patente}:`,
          error
        );
      } finally {
        // Remover del estado de carga
        dispatch({
          type: "REMOVE_LOADING_INFRACTION_UNIT",
          payload: { unitId: unit.Movil_ID },
        });
      }
    },
    [dispatch, fetchInfractionDetails]
  );

  // Gestión automática del historial - Detectar unidades que salen de infracción
  useEffect(() => {
    // Encontrar unidades que estaban en infracción previamente pero ya no están activas
    const processHistoryMovement = async () => {
      const currentActiveIds = new Set(
        activeInfractions.map((unit) => unit.Movil_ID)
      );

      // Modificado: Permitir que unidades ya en historial se procesen nuevamente
      // para manejar infracciones múltiples de la misma unidad
      const unitsToMoveToHistory = state.previousActiveInfractions.filter(
        (unit) => !currentActiveIds.has(unit.Movil_ID)
      );

      if (unitsToMoveToHistory.length > 0) {
        // Separar unidades nuevas vs existentes en historial
        const existingInHistory = unitsToMoveToHistory.filter((unit) =>
          historyInfractionIds.has(unit.Movil_ID)
        );
        const newUnitsForHistory = unitsToMoveToHistory.filter(
          (unit) => !historyInfractionIds.has(unit.Movil_ID)
        );

        // Agregar solo las unidades nuevas al historial
        if (newUnitsForHistory.length > 0) {
          const updatedHistory = [
            ...state.infractionHistory,
            ...newUnitsForHistory,
          ];
          const limitedHistory = updatedHistory.slice(0, 50); // Limitar a 50 elementos

          dispatch({
            type: "SET_INFRACTION_HISTORY",
            payload: limitedHistory,
          });
        }

        // Procesar TODAS las unidades que terminaron infracción (nuevas y existentes)
        // para actualizar con los datos más recientes
        for (const unit of unitsToMoveToHistory) {
          const isExistingInHistory = historyInfractionIds.has(unit.Movil_ID);

          // Log temporal para debugging
          console.log(
            `🔄 Procesando unidad ${unit.patente} (${unit.Movil_ID}):`,
            {
              esNuevaEnHistorial: !isExistingInHistory,
              yaExisteEnHistorial: isExistingInHistory,
              accion: isExistingInHistory
                ? "ACTUALIZAR_EXISTENTE"
                : "AGREGAR_NUEVA",
            }
          );

          // Marcar como cargando
          dispatch({
            type: "ADD_LOADING_INFRACTION_UNIT",
            payload: { unitId: unit.Movil_ID },
          });

          try {
            // Obtener detalles de la infracción más reciente
            const details = await fetchInfractionDetails(unit);

            if (details) {
              console.log(`✅ Detalles obtenidos para ${unit.patente}:`, {
                horaInfraccion: details.fechaHoraFormateada,
                velocidad: details.velocidadMaxima,
                duracion: details.duracionFormateada,
              });

              // Actualizar en el historial con los datos más recientes
              dispatch({
                type: "UPDATE_INFRACTION_HISTORY",
                payload: {
                  unitId: unit.Movil_ID,
                  details: { ...details, ...unit }, // Combinar detalles + datos actuales
                },
              });
            }
          } catch (error) {
            console.error(
              `Error obteniendo detalles para ${unit.patente}:`,
              error
            );
          } finally {
            // Remover del estado de carga
            dispatch({
              type: "REMOVE_LOADING_INFRACTION_UNIT",
              payload: { unitId: unit.Movil_ID },
            });
          }
        }
      }
    };

    // Solo procesar si tenemos infracciones previas para comparar
    if (state.previousActiveInfractions.length > 0) {
      processHistoryMovement();
    }

    // Actualizar el estado previo con las infracciones actuales
    dispatch({
      type: "SET_PREVIOUS_ACTIVE_INFRACTIONS",
      payload: activeInfractions,
    });
  }, [
    activeInfractions,
    historyInfractionIds,
    fetchInfractionDetails,
    state.previousActiveInfractions,
    dispatch,
  ]);

  // Cleanup automático del historial (eliminar elementos > 24 horas)
  useEffect(() => {
    const cleanupOldHistory = () => {
      const ONE_DAY_MS = 24 * 60 * 60 * 1000;
      const currentTime = Date.now();

      const filteredHistory = state.infractionHistory.filter((unit) => {
        const unitTime = new Date(unit.fechaHora).getTime();
        return currentTime - unitTime < ONE_DAY_MS;
      });

      // Solo actualizar si hubo cambios
      if (filteredHistory.length !== state.infractionHistory.length) {
        dispatch({
          type: "SET_INFRACTION_HISTORY",
          payload: filteredHistory,
        });
        saveHistoryToStorage(filteredHistory);
      }
    };

    // Ejecutar limpieza cada 30 minutos
    const interval = setInterval(cleanupOldHistory, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [state.infractionHistory, dispatch, saveHistoryToStorage]);

  // Renderizar contenido específico de infracciones
  const renderInfractionContent = ({
    onUnitSelect: onUnitSelectFromBase,
    handleClose,
  }) => (
    <Box sx={{ maxHeight: "328px", overflow: "auto", p: 0 }}>
      {/* Infracciones activas */}
      {sortedActiveInfractions.length > 0 && (
        <>
          {/* Header de infracciones activas */}
          <Box
            sx={{
              p: 2,
              borderBottom: "1px solid",
              borderColor: "divider",
              backgroundColor: "error.50",
            }}
          >
            <Typography
              variant="subtitle2"
              component="div"
              sx={{
                fontWeight: "bold",
                color: "error.main",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              🚨 Infracciones activas ({sortedActiveInfractions.length})
            </Typography>
          </Box>

          {/* Lista de infracciones activas */}
          <List dense sx={{ p: 0 }}>
            {sortedActiveInfractions.map((unit, index) => {
              const severityColor = determineInfractionSeverity(unit.estado);
              const formattedTime = formatInfractionTime(unit.fechaHora);
              const isLast =
                index === sortedActiveInfractions.length - 1 &&
                state.infractionHistory.length === 0;

              return (
                <InfractionItem
                  key={unit.Movil_ID}
                  unit={unit}
                  index={index}
                  isLast={isLast}
                  isHistory={false}
                  severityColor={severityColor}
                  formattedTime={formattedTime}
                  onDelete={null} // No eliminar en activas
                  onRefreshDetails={null} // No refrescar en activas
                  onUnitSelect={handleUnitSelect}
                />
              );
            })}
          </List>
        </>
      )}

      {/* Separador entre activas e historial */}
      {sortedActiveInfractions.length > 0 &&
        state.infractionHistory.length > 0 && (
          <Divider sx={{ borderColor: "divider" }} />
        )}

      {/* Historial de infracciones */}
      {state.infractionHistory.length > 0 && (
        <>
          {/* Header del historial con botón limpiar */}
          <Box
            sx={{
              p: 2,
              borderBottom: "1px solid",
              borderColor: "divider",
              backgroundColor: "grey.50",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              variant="subtitle2"
              component="div"
              sx={{
                fontWeight: "bold",
                color: "text.secondary",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              📋 Historial de infracciones ({state.infractionHistory.length})
            </Typography>

            <Button
              size="small"
              onClick={handleClearAllHistory}
              startIcon={<ClearAllIcon fontSize="small" />}
              sx={{
                fontSize: "0.75rem",
                color: "text.secondary",
                "&:hover": {
                  backgroundColor: "rgba(244, 67, 54, 0.1)",
                  color: "error.main",
                },
              }}
            >
              Limpiar
            </Button>
          </Box>

          {/* Lista del historial */}
          <List dense sx={{ p: 0 }}>
            {state.infractionHistory.map((unit, index) => {
              const severityColor = determineInfractionSeverity(unit.estado);
              const formattedTime = formatInfractionTime(unit.fechaHora);
              const isLast = index === state.infractionHistory.length - 1;
              const isLoadingDetails = state.loadingInfractionUnits.has(
                unit.Movil_ID
              );

              return (
                <InfractionItem
                  key={`history-${unit.Movil_ID}`}
                  unit={unit}
                  index={index}
                  isLast={isLast}
                  isHistory={true}
                  severityColor={severityColor}
                  formattedTime={formattedTime}
                  onDelete={handleRemoveFromHistory}
                  onRefreshDetails={handleRefreshInfractionDetails}
                  onUnitSelect={handleUnitSelect}
                  isLoadingDetails={isLoadingDetails}
                />
              );
            })}
          </List>
        </>
      )}

      {/* Placeholder cuando no hay infracciones ni historial */}
      {sortedActiveInfractions.length === 0 &&
        state.infractionHistory.length === 0 && (
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
            <WarningIcon sx={{ fontSize: 48, color: "grey.300" }} />
            <Typography variant="body2" color="text.secondary">
              No hay infracciones detectadas
            </Typography>
            <Typography variant="caption" color="text.disabled">
              Las infracciones aparecerán aquí cuando se detecten en el sistema
            </Typography>
          </Box>
        )}
    </Box>
  );

  return (
    <BaseExpandableAlert
      icon={WarningIcon}
      title="Unidades en infracción"
      count={activeInfractions.length}
      tooltipText={
        activeInfractions.length > 0
          ? `Infracciones activas: ${activeInfractions.length}`
          : "No hay infracciones activas"
      }
      verticalOffset={{ desktop: 370, mobile: 320 }}
      noUnitsOffset={{ desktop: 144, mobile: 234 }}
      sortBy={sortBy}
      onSortChange={handleSortChange}
      showSortButton={true}
      sortOptions={{ option1: "Patente", option2: "Tiempo" }}
      onUnitSelect={onUnitSelect}
      badgeColor="error.main"
      iconColor="error.main"
      showHistoryDot={state.infractionHistory.length > 0}
      historyTooltip={`Historial: ${state.infractionHistory.length} infracciones concluidas`}
      zIndex={1100}
    >
      {renderInfractionContent}
    </BaseExpandableAlert>
  );
};

export default InfractionAlert;
