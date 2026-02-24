import React from "react";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar"; // Ícono de ejemplo
import { reportando } from "../../utils/reportando";
import { Tooltip } from "@mui/material";

const StatusIcon = ({ mot, fec }) => {
  // Determina el color del ícono basado en las condiciones
  const getColor = () => {
    if (!reportando(fec)) return "gray"; // Gris si `reportando(fec)` devuelve false
    return mot === "1" ? "green" : "red"; // Verde si `mot = 1`, rojo si `mot = 0`
  };

  const color = getColor();

  return (
    <Tooltip title={`Estado: ${color}`} arrow>
      <DirectionsCarIcon sx={{ color }} />
    </Tooltip>
  );
};

export default StatusIcon;
