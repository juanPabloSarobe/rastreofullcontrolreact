import React, { useState, useEffect, useMemo, useCallback } from "react";
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
                          fontStyle: "italic"
                        }}
                      >
                        (sin conductor)
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

  // Arrays constantes memoizados
  const aggressiveStates = useMemo(
    () => ["Preaviso Manejo Agresivo", "preaviso manejo agresivo"],
    []
  );

  // Función de normalización de strings - Memoizada
  const normalizeString = useCallback(
    (str) => {
      return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
    },
    []
  );

  // Función para obtener información del conductor desde la unidad
  const getConductorInfo = useCallback((unit) => {
    const conductorId = unit.conductorEnViaje_identificacion_OID;
    const conductorName = unit.nombre?.trim();
    const llave = unit.llave?.trim();
    const patente = unit.patente?.trim();

    // Verificar si es un conductor válido (no es "conductor no identificado" o similar)
    const isValidConductor = conductorName && 
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
        patente: patente
      };
    } else if (patente && patente.length > 0) {
      return {
        groupKey: `patente_${patente}`,
        conductorId: `patente_${patente}`,
        displayName: `Vehículo ${patente}`,
        nombre: null,
        llave: null,
        isGroupedByPatente: true,
        patente: patente
      };
    }

    return null; // No válido
  }, [normalizeString]);

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

  // FASE 1: Detectar y procesar preavisos de manejo agresivo básico
  const aggressiveDrivingRanking = useMemo(() => {
    if (!markersData || !isInitialized) return [];

    console.log("🔍 AggressiveDriving FASE 1 - markersData:", markersData.length, "unidades");
    
    // Filtrar preavisos de manejo agresivo
    const aggressivePreviews = markersData.filter((unit) => {
      if (!unit.estado || !unit.fechaHora) return false;

      // Verificar que sea un preaviso de manejo agresivo
      const estado = normalizeString(unit.estado);
      
      const hasAggressiveState = aggressiveStates.some((aggressiveState) => {
        const normalizedAggressiveState = normalizeString(aggressiveState);
        return estado.includes(normalizedAggressiveState);
      });

      if (hasAggressiveState) {
        console.log("🚨 DETECTADO Preaviso Agresivo:", {
          estado: unit.estado,
          conductor: unit.nombre || "Sin conductor",
          patente: unit.patente,
          llave: unit.llave
        });
      }

      return hasAggressiveState;
    });

    console.log("🚨 Total preavisos detectados:", aggressivePreviews.length);

    // Agrupar por conductor y contar preavisos actuales
    const conductorGroups = {};

    aggressivePreviews.forEach((unit) => {
      const conductorInfo = getConductorInfo(unit);
      if (!conductorInfo) return;

      const groupKey = conductorInfo.groupKey;
      
      console.log("✅ Procesando:", conductorInfo.displayName, `(${conductorInfo.isGroupedByPatente ? 'por patente' : 'por conductor'})`);

      if (!conductorGroups[groupKey]) {
        conductorGroups[groupKey] = {
          conductorId: conductorInfo.conductorId,
          nombre: conductorInfo.displayName,
          count: 0,
          lastUnit: unit,
          lastTime: unit.fechaHora,
          isGroupedByPatente: conductorInfo.isGroupedByPatente,
          patente: conductorInfo.patente
        };
        console.log("🆕 Nuevo grupo:", conductorInfo.displayName);
      }

      conductorGroups[groupKey].count++;
      console.log("📈 Count:", conductorGroups[groupKey].count, "para", conductorInfo.displayName);

      // Mantener la unidad más reciente
      if (
        new Date(unit.fechaHora) >
        new Date(conductorGroups[groupKey].lastTime)
      ) {
        conductorGroups[groupKey].lastUnit = unit;
        conductorGroups[groupKey].lastTime = unit.fechaHora;
      }
    });

    // Convertir a array
    const result = Object.values(conductorGroups);

    console.log("🎯 RESULTADO FINAL FASE 1:", result.length, "conductores con manejo agresivo");
    result.forEach(c => {
      console.log(`  • ${c.nombre}: ${c.count} preavisos`);
    });

    return result;
  }, [markersData, isInitialized, aggressiveStates, normalizeString, getConductorInfo]);

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

  // Inicializar datos al montar el componente
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Renderizar contenido específico de conducción agresiva - FASE 1: Solo ranking
  const renderContent = ({ onUnitSelect, handleClose }) => (
    <Box sx={{ maxHeight: "328px", overflow: "auto" }}>
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
              previewCount={conductor.count}
              onDelete={() => {}} // Sin funcionalidad de borrar en Fase 1
              onUnitSelect={handleUnitSelect}
              onRefreshDetails={handleRefreshDetails}
              isLoadingDetails={false}
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
      title="Conducción Agresiva (Fase 1)"
      count={aggressiveDrivingRanking.length}
      tooltipText="Ranking de conductores con conducción agresiva"
      badgeColor="secondary.main"
      iconColor="secondary.main"
      verticalOffset={{ desktop: 430, mobile: 400 }}
      noUnitsOffset={{ desktop: 210, mobile: 180 }}
      onUnitSelect={onUnitSelect}
      sortBy={sortBy}
      onSortChange={handleSortChange}
      showSortButton={true}
      sortOptions={{ option1: "Ranking", option2: "Conductor", option3: "Tiempo" }}
      showHistoryDot={false} // Sin historial en Fase 1
      zIndex={1100}
    >
      {renderContent}
    </BaseExpandableAlert>
  );
};

export default AggressiveDrivingAlert;
