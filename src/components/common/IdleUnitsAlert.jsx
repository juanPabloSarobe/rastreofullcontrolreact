import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Typography,
} from "@mui/material";
import DepartureBoardIcon from "@mui/icons-material/DepartureBoard";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import SortIcon from "@mui/icons-material/Sort";
import BaseExpandableAlert from "./BaseExpandableAlert";
import { useContextValue } from "../../context/Context"; // Corregir la importación del contexto

const IdleUnitsAlert = ({ markersData, onUnitSelect }) => {
  const [ignoredUnits, setIgnoredUnits] = useState(new Set());
  const [sortBy, setSortBy] = useState("time"); // Cambiar orden por defecto a tiempo
  const [idleTimers, setIdleTimers] = useState(new Map());
  const { state } = useContextValue(); // Obtener el estado del contexto

  // Detectar unidades en ralentí
  const idleUnits = useMemo(() => {
    if (!markersData) return [];

    const idleStates = [
      "inicio ralenti",
      "inicio ralentí", // Con acento
      "fin de ralenti",
      "fin de ralentí", // Con acento
      "reporte en ralenti",
      "reporte en ralentí", // Con acento
      "ralentí",
      "ralenti", // Sin acento
    ];

    const currentTime = Date.now();
    const twelveHoursMs = 12 * 60 * 60 * 1000; // 12 horas en milisegundos

    return markersData.filter((unit) => {
      if (!unit.estado || !unit.fechaHora) return false;

      // Filtro por antigüedad: excluir reportes de más de 12 horas
      const reportTime = new Date(unit.fechaHora).getTime();
      const timeDifference = currentTime - reportTime;

      if (timeDifference > twelveHoursMs) {
        return false; // Excluir reportes antiguos
      }

      const estado = unit.estado
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, ""); // Remover acentos

      const hasIdleState = idleStates.some((idleState) =>
        estado.includes(
          idleState.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        )
      );

      // Si es "fin de ralentí/ralenti" y motor apagado, no incluir en la lista
      if (hasIdleState && estado.includes("fin de ralenti")) {
        const motorApagado = unit.estadoDeMotor
          ?.toLowerCase()
          .includes("motor apagado");
        return !motorApagado; // Solo incluir si el motor NO está apagado
      }

      return hasIdleState;
    });
  }, [markersData]);

  // Gestionar contadores de tiempo
  useEffect(() => {
    const newTimers = new Map(idleTimers);
    const currentTime = Date.now();
    const oneHourMs = 60 * 60 * 1000; // 1 hora en milisegundos

    idleUnits.forEach((unit) => {
      const unitId = unit.Movil_ID;
      const fechaHora = new Date(unit.fechaHora).getTime();

      if (!newTimers.has(unitId)) {
        // Primera detección de esta unidad en ralentí
        newTimers.set(unitId, {
          startTime: fechaHora,
          accumulatedTime: 0,
          lastUpdate: fechaHora,
        });
      } else {
        // Actualizar tiempo acumulado
        const timer = newTimers.get(unitId);
        const timeDiff = fechaHora - timer.lastUpdate;

        // Solo sumar tiempo si la diferencia es positiva y razonable (menos de 1 hora)
        if (timeDiff > 0 && timeDiff < oneHourMs) {
          timer.accumulatedTime += timeDiff;
        }

        timer.lastUpdate = fechaHora;
        newTimers.set(unitId, timer);
      }
    });

    // Remover unidades que ya no están en ralentí o que han expirado (1 hora sin actualizaciones)
    const activeUnitIds = new Set(idleUnits.map((unit) => unit.Movil_ID));

    for (const [unitId, timer] of newTimers.entries()) {
      const timeSinceLastUpdate = currentTime - timer.lastUpdate;

      // Remover si la unidad ya no está en ralentí o si han pasado más de 1 hora sin actualizaciones
      if (!activeUnitIds.has(unitId) || timeSinceLastUpdate > oneHourMs) {
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

    setIdleTimers(newTimers);
  }, [idleUnits]);

  // Formatear tiempo en formato HH:MM:SS
  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Obtener tiempo de ralentí para una unidad
  const getIdleTime = (unitId) => {
    const timer = idleTimers.get(unitId);
    if (!timer) return "00:00:00";

    return formatTime(timer.accumulatedTime);
  };

  // Determinar color del estado basado en tiempo y condiciones
  const getStateColor = (estado, unitId) => {
    if (!estado) return "inherit";

    const estadoLower = estado
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // Normalizar acentos

    // Inicio de ralentí: siempre naranja
    if (estadoLower.includes("inicio ralenti")) {
      return "warning.main";
    }

    // Fin de ralentí con motor encendido: gris
    if (estadoLower.includes("fin de ralenti")) {
      return "text.primary";
    }

    // Reporte en ralentí: color basado en tiempo
    if (estadoLower.includes("reporte en ralenti")) {
      const timer = idleTimers.get(unitId);
      if (timer) {
        const totalMinutes = Math.floor(timer.accumulatedTime / (1000 * 60));
        return totalMinutes >= 5 ? "error.main" : "warning.main"; // Rojo >= 5min, Naranja < 5min
      }
      return "warning.main"; // Por defecto naranja si no hay timer
    }

    // Ralentí genérico: naranja
    return "warning.main";
  };

  // Ordenar unidades
  const sortedIdleUnits = useMemo(() => {
    const units = [...idleUnits];

    if (sortBy === "alphabetic") {
      units.sort((a, b) => (a.patente || "").localeCompare(b.patente || ""));
    } else if (sortBy === "time") {
      units.sort((a, b) => {
        const timeA = idleTimers.get(a.Movil_ID)?.accumulatedTime || 0;
        const timeB = idleTimers.get(b.Movil_ID)?.accumulatedTime || 0;
        return timeB - timeA; // Descendente (más tiempo en ralentí arriba)
      });
    }

    // Separar ignoradas y activas
    const active = units.filter((unit) => !ignoredUnits.has(unit.Movil_ID));
    const ignored = units.filter((unit) => ignoredUnits.has(unit.Movil_ID));

    return [...active, ...ignored];
  }, [idleUnits, sortBy, ignoredUnits, idleTimers]);

  // Manejar toggle de ignorar unidad
  const toggleIgnoreUnit = (unitId, event) => {
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
  };

  // Manejar selección de unidad
  const handleUnitSelect = (unit) => {
    if (onUnitSelect) {
      // Si la unidad ya está seleccionada, solo posicionarla en el mapa
      if (state.selectedUnits.includes(unit.Movil_ID)) {
        // Solo llamar onUnitSelect con la lista actual para que posicione el mapa
        onUnitSelect(state.selectedUnits);
      } else {
        // Si no está seleccionada, agregarla a la lista existente
        const updatedUnits = [...state.selectedUnits, unit.Movil_ID];
        onUnitSelect(updatedUnits);
      }
    }
  };

  // Manejar cambio de ordenamiento
  const handleSortChange = () => {
    setSortBy(sortBy === "alphabetic" ? "time" : "alphabetic");
  };

  // Renderizar contenido específico de ralentí
  const renderIdleContent = ({
    onUnitSelect: onUnitSelectFromBase,
    handleClose,
  }) => (
    <>
      {/* Eliminar el header duplicado - directamente la lista */}
      {sortedIdleUnits.length > 0 ? (
        <List dense sx={{ maxHeight: "328px", overflow: "auto", p: 0 }}>
          {" "}
          {/* Aumentar altura al quitar header */}
          {sortedIdleUnits.map((unit, index) => {
            const isIgnored = ignoredUnits.has(unit.Movil_ID);
            const idleTime = getIdleTime(unit.Movil_ID);
            const stateColor = getStateColor(unit.estado, unit.Movil_ID); // Agregar unitId aquí

            return (
              <ListItem
                key={unit.Movil_ID}
                disablePadding
                sx={{
                  borderBottom:
                    index < sortedIdleUnits.length - 1 ? "1px solid" : "none",
                  borderColor: "divider",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    width: "100%",
                    alignItems: "center",
                    minHeight: "50px", // Reducir altura mínima para menos espacio amarillo
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={(e) => toggleIgnoreUnit(unit.Movil_ID, e)}
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
                    onClick={() => handleUnitSelect(unit)}
                    sx={{
                      opacity: isIgnored ? 0.5 : 1,
                      flex: 1,
                      py: 0.5, // Reducir padding vertical para menos espacio amarillo
                      "&:hover": {
                        backgroundColor: isIgnored
                          ? "rgba(0, 0, 0, 0.04)"
                          : "rgba(255, 152, 0, 0.08)",
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 0.75, // Ampliar margen rojo (separación entre filas internas)
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              flex: 1,
                              minWidth: 0, // Permite que el texto se trunque
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: "bold",
                                fontSize: "0.9rem",
                                display: "flex",
                                alignItems: "center",
                                minWidth: 0,
                              }}
                            >
                              {/* Patente primero */}
                              <Box sx={{ marginRight: "8px", flexShrink: 0 }}>
                                {unit.patente || "Sin patente"}
                              </Box>
                              <Box sx={{ marginRight: "8px", flexShrink: 0 }}>
                                -
                              </Box>
                              {/* Empresa con más ancho (50% del espacio restante) */}
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
                            }}
                          >
                            {idleTime}
                          </Box>
                        </Box>
                      }
                      secondary={
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mt: 0.75, // Ampliar margen rojo (separación entre filas internas)
                          }}
                        >
                          {/* Estado a la izquierda */}
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

                          {/* Conductor a la derecha */}
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
                        // Ajustar márgenes para optimizar espacio
                        "& .MuiListItemText-primary": {
                          marginBottom: "0px", // Eliminar margen extra
                        },
                        "& .MuiListItemText-secondary": {
                          marginTop: "0px", // Eliminar margen extra
                        },
                      }}
                    />
                  </ListItemButton>
                </Box>
              </ListItem>
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
    >
      {renderIdleContent}
    </BaseExpandableAlert>
  );
};

export default IdleUnitsAlert;
