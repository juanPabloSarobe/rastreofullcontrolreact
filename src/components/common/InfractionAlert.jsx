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
} from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import DeleteIcon from "@mui/icons-material/Delete";
import ClearAllIcon from "@mui/icons-material/ClearAll";
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
                              backgroundColor: "grey.100",
                              color: "text.disabled",
                              px: 1,
                              py: 0.25,
                              borderRadius: "8px",
                              fontSize: "0.7rem",
                              fontWeight: "medium",
                            }}
                          >
                            🚗 {unit.maxVelocidad || "-- km/h"}
                          </Box>
                          <Box
                            sx={{
                              display: "inline-block",
                              backgroundColor: "grey.100",
                              color: "text.disabled",
                              px: 1,
                              py: 0.25,
                              borderRadius: "8px",
                              fontSize: "0.7rem",
                              fontWeight: "medium",
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
                        color: "text.disabled",
                        fontSize: "0.75rem",
                        display: "flex",
                        alignItems: "center",
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
                        color: "text.secondary",
                        fontSize: "0.75rem",
                        display: "flex",
                        alignItems: "center",
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

const InfractionAlert = ({ markersData, onUnitSelect }) => {
  const [sortBy, setSortBy] = useState("time"); // Por defecto por tiempo
  const [historyInfractions, setHistoryInfractions] = useState([]);
  const [previousActiveInfractions, setPreviousActiveInfractions] = useState(
    []
  );
  const [loadingUnits, setLoadingUnits] = useState(new Set()); // Estado para unidades cargando
  const { state } = useContextValue();

  // Constantes memoizadas
  const TWELVE_HOURS_MS = useMemo(() => 12 * 60 * 60 * 1000, []);

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

  // Función para obtener detalles completos de la infracción
  const fetchInfractionDetails = useCallback(async (unit) => {
    try {
      const endDate = new Date(unit.fechaHora);
      // Buscar en las últimas 2 horas para asegurar que capturamos toda la infracción
      const startDate = new Date(endDate.getTime() - 2 * 60 * 60 * 1000);

      const fechaInicial = startDate
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
      const fechaFinal = endDate.toISOString().slice(0, 19).replace("T", " ");

      const url = `/api/servicio/historico.php/historico?movil=${unit.Movil_ID}&&fechaInicial=${fechaInicial}&&fechaFinal=${fechaFinal}`;

      console.log(
        `Consultando detalles de infracción para ${unit.patente}:`,
        url
      );

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();

      // Procesar los datos para encontrar la secuencia de infracción
      const infractionDetails = processInfractionSequence(data, unit);

      return infractionDetails;
    } catch (error) {
      console.error(
        `Error obteniendo detalles de infracción para ${unit.patente}:`,
        error
      );
      return null;
    }
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
            eventType.includes("fin de infraccion"))
        ) {
          endEvent = event;
          infractionEvents.unshift(event);
          continue;
        }

        // Si ya encontramos el fin, buscar movimientos en infracción
        if (endEvent && eventType.includes("movimiento en infracción")) {
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
          !eventType.includes("infraccion")
        ) {
          break;
        }
      }

      if (!startEvent || !endEvent || infractionEvents.length === 0) {
        console.log(
          `No se encontró secuencia completa de infracción para ${unit.patente}`
        );
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

      console.log(`Infracción procesada para ${unit.patente}:`, {
        maxVelocidad,
        duracion: formatDuration(durationInSeconds),
        eventos: infractionEvents.length,
      });

      return {
        maxVelocidad: `${maxVelocidad} km/h`,
        duracion: formatDuration(durationInSeconds),
        infractionEvents,
      };
    },
    [formatDuration]
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
    () => new Set(historyInfractions.map((unit) => unit.Movil_ID)),
    [historyInfractions]
  );

  // Manejar eliminación individual del historial - Memoizado
  const handleRemoveFromHistory = useCallback((unitId, event) => {
    event.stopPropagation();
    setHistoryInfractions((prev) =>
      prev.filter((unit) => unit.Movil_ID !== unitId)
    );
  }, []);

  // Manejar limpiar todo el historial - Memoizado
  const handleClearAllHistory = useCallback((event) => {
    event.stopPropagation();
    setHistoryInfractions([]);
  }, []);

  // Gestión automática del historial - Detectar unidades que salen de infracción
  useEffect(() => {
    // Encontrar unidades que estaban en infracción previamente pero ya no están activas
    const processHistoryMovement = async () => {
      const currentActiveIds = new Set(
        activeInfractions.map((unit) => unit.Movil_ID)
      );

      // Unidades que estaban activas previamente pero ya no están
      const unitsToMoveToHistory = previousActiveInfractions.filter(
        (unit) =>
          !currentActiveIds.has(unit.Movil_ID) &&
          !historyInfractionIds.has(unit.Movil_ID)
      );

      if (unitsToMoveToHistory.length > 0) {
        console.log(
          "Moviendo al historial:",
          unitsToMoveToHistory.map((u) => u.patente)
        );

        // Agregar unidades al historial inmediatamente (sin detalles)
        setHistoryInfractions((prev) => {
          const newHistory = [...prev, ...unitsToMoveToHistory];
          return newHistory.slice(0, 50);
        });

        // Obtener detalles para cada unidad que se movió al historial
        for (const unit of unitsToMoveToHistory) {
          // Marcar como cargando
          setLoadingUnits((prev) => new Set([...prev, unit.Movil_ID]));

          try {
            // Obtener detalles de la infracción
            const details = await fetchInfractionDetails(unit);

            if (details) {
              // Actualizar la unidad en el historial con los detalles
              setHistoryInfractions((prev) =>
                prev.map((historyUnit) =>
                  historyUnit.Movil_ID === unit.Movil_ID
                    ? { ...historyUnit, ...details }
                    : historyUnit
                )
              );
            }
          } catch (error) {
            console.error(
              `Error obteniendo detalles para ${unit.patente}:`,
              error
            );
          } finally {
            // Remover del estado de carga
            setLoadingUnits((prev) => {
              const newSet = new Set(prev);
              newSet.delete(unit.Movil_ID);
              return newSet;
            });
          }
        }
      }
    };

    // Solo procesar si tenemos infracciones previas para comparar
    if (previousActiveInfractions.length > 0) {
      processHistoryMovement();
    }

    // Actualizar el estado previo con las infracciones actuales
    setPreviousActiveInfractions(activeInfractions);
  }, [
    activeInfractions,
    historyInfractionIds,
    fetchInfractionDetails,
    // NO incluir historyInfractions ni previousActiveInfractions para evitar bucle infinito
  ]);

  // Cleanup automático del historial (eliminar elementos > 24 horas)
  useEffect(() => {
    const cleanupOldHistory = () => {
      const ONE_DAY_MS = 24 * 60 * 60 * 1000;
      const currentTime = Date.now();

      setHistoryInfractions((prev) =>
        prev.filter((unit) => {
          const unitTime = new Date(unit.fechaHora).getTime();
          return currentTime - unitTime < ONE_DAY_MS;
        })
      );
    };

    // Ejecutar limpieza cada 30 minutos
    const interval = setInterval(cleanupOldHistory, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

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
                historyInfractions.length === 0;

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
                  onUnitSelect={handleUnitSelect}
                />
              );
            })}
          </List>
        </>
      )}

      {/* Separador entre activas e historial */}
      {sortedActiveInfractions.length > 0 && historyInfractions.length > 0 && (
        <Divider sx={{ borderColor: "divider" }} />
      )}

      {/* Historial de infracciones */}
      {historyInfractions.length > 0 && (
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
              📋 Historial de infracciones ({historyInfractions.length})
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
            {historyInfractions.map((unit, index) => {
              const severityColor = determineInfractionSeverity(unit.estado);
              const formattedTime = formatInfractionTime(unit.fechaHora);
              const isLast = index === historyInfractions.length - 1;
              const isLoadingDetails = loadingUnits.has(unit.Movil_ID);

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
        historyInfractions.length === 0 && (
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
      showHistoryDot={historyInfractions.length > 0}
      historyTooltip={`Historial: ${historyInfractions.length} infracciones concluidas`}
      zIndex={1100}
    >
      {renderInfractionContent}
    </BaseExpandableAlert>
  );
};

export default InfractionAlert;
