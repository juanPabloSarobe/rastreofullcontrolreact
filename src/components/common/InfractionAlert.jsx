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
                    color: isHistory ? "text.secondary" : "error.main",
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
                <Box
                  sx={{
                    display: "inline-block",
                    backgroundColor: isHistory
                      ? "grey.100"
                      : severityColor + ".50",
                    color: isHistory
                      ? "text.disabled"
                      : severityColor + ".main",
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
                    color: isHistory ? "text.disabled" : "text.secondary",
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

        {/* Botón de eliminar solo para historial */}
        {isHistory && onDelete && (
          <IconButton
            size="small"
            onClick={(e) => onDelete(unit.Movil_ID, e)}
            sx={{
              color: "text.disabled",
              mx: 1,
              "&:hover": {
                backgroundColor: "rgba(244, 67, 54, 0.1)",
                color: "error.main",
              },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
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
  const { state } = useContextValue();

  // Constantes memoizadas
  const TWELVE_HOURS_MS = useMemo(() => 12 * 60 * 60 * 1000, []);

  // Array de estados de infracción memoizado
  const infractionStates = useMemo(
    () => [
      "infracción",
      "infraccion",
      "violación",
      "violacion",
      "exceso de velocidad",
      "infracción de velocidad",
      "infracción tiempo",
      "infracción movimiento",
      "velocidad excedida",
      "límite de velocidad",
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

      // Infracciones de alta severidad (velocidad)
      if (estadoLower.includes("velocidad") || estadoLower.includes("exceso")) {
        return "error"; // Rojo
      }
      // Infracciones de media severidad (tiempo)
      if (estadoLower.includes("tiempo") || estadoLower.includes("descanso")) {
        return "warning"; // Naranja
      }
      // Infracciones de baja severidad (otras)
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
    });
  }, []);

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
    const processHistoryMovement = () => {
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
        setHistoryInfractions((prev) => {
          // Agregar nuevas unidades al historial
          const newHistory = [...prev, ...unitsToMoveToHistory];

          // Limitar a 50 elementos para rendimiento
          return newHistory.slice(0, 50);
        });
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
              📋 Historial ({historyInfractions.length})
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
      historyTooltip={`Historial: ${historyInfractions.length} infracciones resueltas`}
      zIndex={1001}
    >
      {renderInfractionContent}
    </BaseExpandableAlert>
  );
};

export default InfractionAlert;
