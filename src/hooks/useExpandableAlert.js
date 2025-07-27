import { useState } from "react";
import { useContextValue } from "../context/Context";

const useExpandableAlert = () => {
  const { state } = useContextValue();
  const [anchorEl, setAnchorEl] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  const open = Boolean(anchorEl);

  // Manejadores básicos
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Determinar posición según el contexto (reutilizable)
  const getPosition = (
    verticalOffset = { desktop: 300, mobile: 200 },
    noUnitsOffset = null
  ) => {
    if (state.selectedUnits.length > 0) {
      // Con unidades seleccionadas: debajo del detalle de la unidad
      return {
        top: {
          xs: `${verticalOffset.mobile}px`,
          sm: `${verticalOffset.desktop}px`,
        },
        left: { xs: "16px", sm: "16px" },
      };
    } else {
      // Sin unidades seleccionadas: posición personalizable o por defecto
      const defaultPositions = { xs: "130px", sm: "80px" };
      const positions = noUnitsOffset
        ? {
            xs: `${noUnitsOffset.mobile}px`,
            sm: `${noUnitsOffset.desktop}px`,
          }
        : defaultPositions;

      return {
        top: positions,
        left: { xs: "16px", sm: "16px" },
      };
    }
  };

  // Posición del badge (reutilizable)
  const getBadgePosition = (
    verticalOffset = { desktop: 300, mobile: 200 },
    noUnitsOffset = null
  ) => {
    const baseTop =
      state.selectedUnits.length > 0
        ? {
            xs: `${verticalOffset.mobile - 8}px`,
            sm: `${verticalOffset.desktop - 8}px`,
          }
        : noUnitsOffset
        ? {
            xs: `${noUnitsOffset.mobile - 8}px`,
            sm: `${noUnitsOffset.desktop - 8}px`,
          }
        : {
            xs: "122px",
            sm: "72px",
          };

    return {
      top: baseTop,
      left: {
        xs: "48px",
        sm: "48px",
      },
    };
  };

  return {
    // Estados
    anchorEl,
    isHovered,
    open,

    // Funciones
    handleClick,
    handleClose,
    setIsHovered,
    getPosition,
    getBadgePosition,

    // Estado global
    state,
  };
};

export default useExpandableAlert;
