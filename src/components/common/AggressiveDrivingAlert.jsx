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
    isHistory,
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
        <ListItemButton
          onClick={() => onUnitSelect(conductor.lastUnit)}
          sx={{
            flex: 1,
            py: 0.5,
            "&:hover": {
              backgroundColor: isHistory
                ? "rgba(0, 0, 0, 0.04)"
                : "rgba(156, 39, 176, 0.08)", // Color violeta para hover
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

        {isHistory && (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(conductor.conductorId);
            }}
            sx={{
              color: "text.secondary",
              mr: 1,
              "&:hover": {
                color: "error.main",
                backgroundColor: "rgba(211, 47, 47, 0.08)",
              },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}

        {!isHistory && (
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
        )}
      </Box>
    </ListItem>
  )
);

const AggressiveDrivingAlert = ({ markersData, onUnitSelect }) => {
  const { state, dispatch } = useContextValue();
  const [sortBy, setSortBy] = useState("time");

  // Arrays constantes memoizados
  const aggressiveStates = useMemo(
    () => ["Preaviso Manejo Agresivo", "preaviso manejo agresivo"],
    []
  );

  const TWELVE_HOURS_MS = useMemo(() => 12 * 60 * 60 * 1000, []);
  const ONE_DAY_MS = useMemo(() => 24 * 60 * 60 * 1000, []);

  // Función de normalización de strings - Memoizada
  const normalizeString = useCallback(
    (str) =>
      str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim(),
    []
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
    });
  }, []);

  // Detectar preavisos de conducción agresiva activos - Memoizado
  const activeAggressiveDriving = useMemo(() => {
    if (!markersData) return [];

    const currentTime = Date.now();
    const currentDate = new Date().toDateString(); // Para agrupar por día

    // Filtrar preavisos de manejo agresivo
    const aggressivePreviews = markersData.filter((unit) => {
      if (!unit.estado || !unit.fechaHora) return false;

      // Filtro por antigüedad: excluir reportes de más de 12 horas
      const reportTime = new Date(unit.fechaHora).getTime();
      const timeDifference = currentTime - reportTime;

      if (timeDifference > TWELVE_HOURS_MS) {
        return false;
      }

      // Verificar que sea un preaviso de manejo agresivo
      const estado = normalizeString(unit.estado);
      const hasAggressiveState = aggressiveStates.some((aggressiveState) => {
        const normalizedAggressiveState = normalizeString(aggressiveState);
        return estado.includes(normalizedAggressiveState);
      });

      return hasAggressiveState;
    });

    // Agrupar por conductor y contar preavisos del día actual
    const conductorGroups = {};

    aggressivePreviews.forEach((unit) => {
      const conductorId = unit.conductorEnViaje_identificacion_OID;
      const conductorName = unit.nombre;
      const reportDate = new Date(unit.fechaHora).toDateString();

      if (!conductorId || !conductorName) return;

      // Solo contar preavisos del día actual
      if (reportDate !== currentDate) return;

      if (!conductorGroups[conductorId]) {
        conductorGroups[conductorId] = {
          conductorId,
          nombre: conductorName,
          count: 0,
          lastUnit: unit,
          lastTime: unit.fechaHora,
          previews: [],
        };
      }

      conductorGroups[conductorId].count++;
      conductorGroups[conductorId].previews.push(unit);

      // Mantener la unidad más reciente
      if (
        new Date(unit.fechaHora) >
        new Date(conductorGroups[conductorId].lastTime)
      ) {
        conductorGroups[conductorId].lastUnit = unit;
        conductorGroups[conductorId].lastTime = unit.fechaHora;
      }
    });

    // Convertir a array y filtrar solo conductores con más de 0 preavisos
    return Object.values(conductorGroups).filter(
      (conductor) => conductor.count > 0
    );
  }, [markersData, TWELVE_HOURS_MS, aggressiveStates, normalizeString]);

  // Sets memoizados para comparaciones rápidas
  const activeAggressiveIds = useMemo(
    () =>
      new Set(
        activeAggressiveDriving.map((conductor) => conductor.conductorId)
      ),
    [activeAggressiveDriving]
  );

  const historyAggressiveIds = useMemo(
    () =>
      new Set(
        state.aggressiveDrivingHistory?.map(
          (conductor) => conductor.conductorId
        ) || []
      ),
    [state.aggressiveDrivingHistory]
  );

  // Ordenar conductores con conducción agresiva - Memoizado
  const sortedActiveAggressiveDriving = useMemo(() => {
    const conductors = [...activeAggressiveDriving];

    if (sortBy === "alphabetic") {
      conductors.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
    } else if (sortBy === "time") {
      conductors.sort((a, b) => {
        const timeA = new Date(a.lastTime).getTime();
        const timeB = new Date(b.lastTime).getTime();
        return timeB - timeA; // Más recientes primero
      });
    }

    return conductors;
  }, [activeAggressiveDriving, sortBy]);

  // Handlers memoizados
  const handleRemoveFromHistory = useCallback(
    (conductorId) => {
      dispatch({
        type: "REMOVE_FROM_AGGRESSIVE_HISTORY",
        payload: { conductorId },
      });
    },
    [dispatch]
  );

  const handleClearAllHistory = useCallback(() => {
    dispatch({
      type: "CLEAR_AGGRESSIVE_HISTORY",
    });
  }, [dispatch]);

  const handleSortChange = useCallback(() => {
    setSortBy((prev) => (prev === "alphabetic" ? "time" : "alphabetic"));
  }, []);

  const handleRefreshDetails = useCallback(async (conductor) => {
    // Por ahora, solo simulamos la carga
    // En el futuro se puede implementar obtención de detalles adicionales
    console.log(`Refrescando detalles para conductor: ${conductor.nombre}`);
  }, []);

  // Gestión automática del historial - Detectar conductores que salen de conducción agresiva
  useEffect(() => {
    const processHistoryMovement = async () => {
      const currentActiveIds = new Set(
        activeAggressiveDriving.map((conductor) => conductor.conductorId)
      );

      // Encontrar conductores que estaban activos previamente pero ya no están
      const conductorsToMoveToHistory = (
        state.previousActiveAggressiveDriving || []
      ).filter((conductor) => !currentActiveIds.has(conductor.conductorId));

      if (conductorsToMoveToHistory.length > 0) {
        // Mover al historial
        for (const conductor of conductorsToMoveToHistory) {
          if (!historyAggressiveIds.has(conductor.conductorId)) {
            dispatch({
              type: "UPDATE_AGGRESSIVE_HISTORY",
              payload: {
                conductorId: conductor.conductorId,
                details: {
                  ...conductor,
                  movedToHistoryAt: new Date().toISOString(),
                },
              },
            });
          }
        }
      }
    };

    // Solo procesar si tenemos conductores previos para comparar
    if ((state.previousActiveAggressiveDriving || []).length > 0) {
      processHistoryMovement();
    }

    // Actualizar el estado previo con los conductores actuales
    dispatch({
      type: "SET_PREVIOUS_ACTIVE_AGGRESSIVE_DRIVING",
      payload: activeAggressiveDriving,
    });
  }, [
    activeAggressiveDriving,
    historyAggressiveIds,
    state.previousActiveAggressiveDriving,
    dispatch,
  ]);

  // Cleanup automático del historial (eliminar elementos > 24 horas)
  useEffect(() => {
    const cleanupOldHistory = () => {
      const currentTime = Date.now();

      const filteredHistory = (state.aggressiveDrivingHistory || []).filter(
        (conductor) => {
          const movedTime = new Date(
            conductor.movedToHistoryAt || conductor.lastTime
          ).getTime();
          return currentTime - movedTime < ONE_DAY_MS;
        }
      );

      // Solo actualizar si hubo cambios
      if (
        filteredHistory.length !== (state.aggressiveDrivingHistory || []).length
      ) {
        dispatch({
          type: "SET_AGGRESSIVE_HISTORY",
          payload: filteredHistory,
        });
      }
    };

    const interval = setInterval(cleanupOldHistory, 30 * 60 * 1000); // Cada 30 minutos
    return () => clearInterval(interval);
  }, [state.aggressiveDrivingHistory, dispatch, ONE_DAY_MS]);

  // Reset diario a las 00:00
  useEffect(() => {
    const checkDailyReset = () => {
      const now = new Date();
      const lastReset = new Date(
        localStorage.getItem("aggressiveDrivingLastReset") || "1970-01-01"
      );

      // Si cambió el día, limpiar historial y reset
      if (now.toDateString() !== lastReset.toDateString()) {
        dispatch({
          type: "CLEAR_AGGRESSIVE_HISTORY",
        });
        localStorage.setItem("aggressiveDrivingLastReset", now.toISOString());
      }
    };

    // Verificar al montar el componente
    checkDailyReset();

    // Verificar cada minuto por si pasa medianoche
    const interval = setInterval(checkDailyReset, 60 * 1000);
    return () => clearInterval(interval);
  }, [dispatch]);

  // Renderizar contenido específico de conducción agresiva
  const renderContent = ({ onUnitSelect, handleClose }) => (
    <Box sx={{ maxHeight: "328px", overflow: "auto" }}>
      {/* Header con información */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 2,
          py: 1,
          backgroundColor: "rgba(156, 39, 176, 0.05)", // Fondo violeta suave
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 600, color: "#9c27b0" }}
        >
          Conductores con Manejo Agresivo
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          Reset diario 00:00
        </Typography>
      </Box>

      {/* Lista de conductores activos */}
      {sortedActiveAggressiveDriving.length > 0 && (
        <List disablePadding>
          {sortedActiveAggressiveDriving.map((conductor, index) => (
            <AggressiveDrivingItem
              key={conductor.conductorId}
              conductor={conductor}
              index={index}
              isLast={
                index === sortedActiveAggressiveDriving.length - 1 &&
                (state.aggressiveDrivingHistory || []).length === 0
              }
              isHistory={false}
              severityColor={determineAggressiveSeverity(conductor.count)}
              formattedTime={formatAggressiveTime(conductor.lastTime)}
              previewCount={conductor.count}
              onDelete={handleRemoveFromHistory}
              onUnitSelect={onUnitSelect}
              onRefreshDetails={handleRefreshDetails}
              isLoadingDetails={false}
            />
          ))}
        </List>
      )}

      {/* Separador si hay historial */}
      {sortedActiveAggressiveDriving.length > 0 &&
        (state.aggressiveDrivingHistory || []).length > 0 && (
          <Divider sx={{ my: 1 }} />
        )}

      {/* Lista de historial */}
      {(state.aggressiveDrivingHistory || []).length > 0 && (
        <Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              px: 2,
              py: 1,
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", fontWeight: 600 }}
            >
              Historial
            </Typography>
            <Button
              size="small"
              startIcon={<ClearAllIcon />}
              onClick={handleClearAllHistory}
              sx={{
                fontSize: "0.7rem",
                py: 0.25,
                px: 1,
                minHeight: "24px",
              }}
            >
              Limpiar
            </Button>
          </Box>

          <List disablePadding>
            {(state.aggressiveDrivingHistory || []).map((conductor, index) => (
              <AggressiveDrivingItem
                key={`history-${conductor.conductorId}`}
                conductor={conductor}
                index={index}
                isLast={
                  index === (state.aggressiveDrivingHistory || []).length - 1
                }
                isHistory={true}
                severityColor={determineAggressiveSeverity(conductor.count)}
                formattedTime={formatAggressiveTime(conductor.lastTime)}
                previewCount={conductor.count}
                onDelete={handleRemoveFromHistory}
                onUnitSelect={onUnitSelect}
                onRefreshDetails={handleRefreshDetails}
                isLoadingDetails={false}
              />
            ))}
          </List>
        </Box>
      )}

      {/* Mensaje cuando no hay datos */}
      {sortedActiveAggressiveDriving.length === 0 &&
        (state.aggressiveDrivingHistory || []).length === 0 && (
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
      title="Manejo Agresivo"
      count={activeAggressiveDriving.length}
      tooltipText="Conductores con manejo agresivo"
      badgeColor="#9c27b0" // Color violeta
      iconColor="#9c27b0" // Color violeta
      verticalOffset={{ desktop: 450, mobile: 400 }} // Cuando hay unidades seleccionadas
      noUnitsOffset={{ desktop: 340, mobile: 180 }} // Cuando NO hay unidades seleccionadas - posición media
      onUnitSelect={onUnitSelect}
      sortBy={sortBy}
      onSortChange={handleSortChange}
      showSortButton={true}
      sortOptions={{ option1: "Conductor", option2: "Tiempo" }}
      showHistoryDot={(state.aggressiveDrivingHistory || []).length > 0}
      historyTooltip={`${
        (state.aggressiveDrivingHistory || []).length
      } en historial`}
      zIndex={1150} // Entre InfractionAlert (1200) y IdleUnitsAlert (1100)
    >
      {renderContent}
    </BaseExpandableAlert>
  );
};

export default AggressiveDrivingAlert;
