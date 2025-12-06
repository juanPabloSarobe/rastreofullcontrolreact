import React, { useState, useMemo, useCallback } from "react";
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
import WhatsAppButton from "./WhatsAppButton";
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

        {/* Botón WhatsApp para contactar por conducción agresiva - Ubicado a la derecha */}
        <WhatsAppButton
          unitData={{
            ...conductor.lastUnit,
            nombre: conductor.nombre // Asegurar que el nombre del conductor esté disponible
          }}
          messageType="CONDUCCION_AGRESIVA"
          messageData={{ 
            cantidad: conductor.count,
            periodo: "en el día de hoy",
            conductor: conductor.nombre
          }}
          size="small"
          sx={{ mx: 0.5 }}
        />
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

  // Funciones de utilidad simples (movidas del hook)
  const determineAggressiveSeverity = useCallback((count) => {
    if (count >= 15) return "#d32f2f"; // Rojo
    if (count >= 10) return "#f57c00"; // Amarillo/Naranja
    return "#4caf50"; // Verde
  }, []);

  const formatAggressiveTime = useCallback((fechaHora) => {
    const date = new Date(fechaHora);
    return date.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false, // Formato 24 horas
    });
  }, []);

  // Ordenamiento de conductores
  const sortedConductors = useMemo(() => {
    const conductorsCopy = [...conductors];

    if (sortBy === "count") {
      // Ordenar por ranking (más preavisos primero) - Comportamiento por defecto
      conductorsCopy.sort((a, b) => b.count - a.count);
    } else if (sortBy === "alphabetic") {
      conductorsCopy.sort((a, b) =>
        (a.nombre || "").localeCompare(b.nombre || "")
      );
    } else if (sortBy === "time") {
      conductorsCopy.sort((a, b) => {
        const timeA = new Date(a.lastTime).getTime();
        const timeB = new Date(b.lastTime).getTime();
        return timeB - timeA; // Más recientes primero
      });
    }

    return conductorsCopy;
  }, [conductors, sortBy]);

  // Handlers memoizados
  const handleSortChange = useCallback(() => {
    setSortBy((prev) => {
      if (prev === "count") return "alphabetic";
      if (prev === "alphabetic") return "time";
      return "count";
    });
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

  // Renderizar contenido específico de conducción agresiva
  const renderContent = ({ onUnitSelect, handleClose }) => (
    <Box sx={{ maxHeight: "328px", overflow: "auto" }}>
      {/* Indicador de inicialización */}
      {!isInitialized && (
        <Box sx={{ p: 1, textAlign: "center" }}>
          <Typography
            variant="caption"
            sx={{ color: "info.main", fontStyle: "italic" }}
          >
            🚀 Inicializando sistema de alertas...
          </Typography>
        </Box>
      )}

      {/* Lista de conductores */}
      {sortedConductors.length > 0 && (
        <List disablePadding>
          {sortedConductors.map((conductor, index) => (
            <AggressiveDrivingItem
              key={conductor.conductorId}
              conductor={conductor}
              index={index}
              isLast={index === sortedConductors.length - 1}
              severityColor={determineAggressiveSeverity(conductor.count)}
              formattedTime={formatAggressiveTime(conductor.lastTime)}
              previewCount={
                conductor.isLoading ||
                loadingConductors.has(conductor.conductorId)
                  ? "..."
                  : conductor.count
              }
              onUnitSelect={handleUnitSelect}
              isLoadingDetails={
                conductor.isLoading ||
                loadingConductors.has(conductor.conductorId)
              }
            />
          ))}
        </List>
      )}

      {/* Mensaje cuando no hay datos */}
      {sortedConductors.length === 0 && isInitialized && (
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
      count={conductors.length}
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
      showHistoryDot={false} // Sin historial separado
      zIndex={1100}
    >
      {renderContent}
    </BaseExpandableAlert>
  );
};

export default AggressiveDrivingAlert;
