import React, { useState } from "react";
import { Box, IconButton, Tooltip, Typography, Grow, CircularProgress } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import { useContextValue } from "../../context/Context";
import { useFleetSelectorState } from "./FleetSelectorButton";
import { useAreaSelectorState } from "./AreaSelectorButton";

const ConductorHistoryButton = () => {
  const { state, dispatch } = useContextValue();
  const { fleetSelectorWidth } = useFleetSelectorState();
  const { areaSelectorWidth } = useAreaSelectorState();
  const [isHovered, setIsHovered] = useState(false);

  // Estados de conductores del Context
  const { conductores, loadingConductores, conductoresLoaded } = state;
  
  // Determinar el estado del botón
  const hasConductores = conductores.length > 0;
  const isDisabled = conductoresLoaded && !hasConductores;
  const isLoading = loadingConductores && !conductoresLoaded;

  const handleClick = () => {
    if (!isDisabled && !isLoading) {
      dispatch({ type: "SET_VIEW_MODE", payload: "conductor" });
    }
  };

  // Determinar el texto del tooltip
  const getTooltipTitle = () => {
    if (isLoading) return "Cargando conductores...";
    if (isDisabled) return "Sin conductores asignados";
    return "Histórico por conductor";
  };

  // Determinar el icono a mostrar
  const getIcon = () => {
    if (isLoading) {
      return <CircularProgress size={24} sx={{ color: "green" }} />;
    }
    if (isDisabled) {
      return <PersonOffIcon />;
    }
    return <PersonIcon />;
  };

  // Determinar el color del botón
  const getButtonColor = () => {
    if (isDisabled) return "rgba(0, 0, 0, 0.26)"; // Gris deshabilitado
    return "green"; // Verde normal
  };

  // Determinar el texto del hover
  const getHoverText = () => {
    if (isLoading) return "Cargando conductores...";
    if (isDisabled) return "Sin conductores asignados";
    return "Histórico por conductor";
  };

  // Calcular posición dinámica considerando FleetSelectorButton y AreaSelectorButton
  const getPositionStyles = () => {
    // Posición base del FleetSelector: left: 432px
    const fleetSelectorBaseLeft = 432;
    // Margen entre componentes
    const margin = 16;

    // Calcular posición: FleetSelector + su ancho + margen + AreaSelector + su ancho + margen
    const dynamicLeft =
      fleetSelectorBaseLeft +
      fleetSelectorWidth +
      margin +
      areaSelectorWidth +
      margin;

    return {
      position: "absolute",
      top: { xs: "80px", sm: "16px" },
      left: {
        xs: "16px", // En móvil mantener posición fija
        sm: `${dynamicLeft}px`, // En desktop usar posición dinámica
      },
      height: "48px",
      transition: "all 0.3s ease", // Transición suave para el desplazamiento
      borderRadius: "24px",
      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
      backgroundColor: "white",
      display: "flex",
      alignItems: "center",
      zIndex: 1000,
      overflow: "hidden",
      width: isHovered ? { xs: "180px", sm: "220px" } : "48px",
    };
  };

  return (
    <Box
      sx={getPositionStyles()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Tooltip title={getTooltipTitle()}>
        <IconButton
          onClick={handleClick}
          disabled={isDisabled || isLoading}
          sx={{
            color: getButtonColor(),
            height: "48px",
            width: "48px",
            cursor: isDisabled ? "not-allowed" : "pointer",
            "&:hover": {
              backgroundColor: isDisabled 
                ? "transparent" 
                : "rgba(0, 128, 0, 0.1)",
            },
            "&.Mui-disabled": {
              color: "rgba(0, 0, 0, 0.26)",
            },
          }}
        >
          {getIcon()}
        </IconButton>
      </Tooltip>

      {/* Texto que aparece durante el hover */}
      {isHovered && (
        <Grow in={isHovered} timeout={300}>
          <Typography
            variant="body1"
            sx={{
              marginLeft: "4px",
              marginRight: "12px",
              fontWeight: "medium",
              fontSize: { xs: "12px", sm: "14px" },
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              color: isDisabled ? "rgba(0, 0, 0, 0.26)" : "inherit",
            }}
          >
            {getHoverText()}
          </Typography>
        </Grow>
      )}
    </Box>
  );
};

export default ConductorHistoryButton;
