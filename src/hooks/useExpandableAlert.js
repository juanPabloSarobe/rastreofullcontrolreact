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
  const getPosition = (verticalOffset = { desktop: 300, mobile: 200 }) => {
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
      // Sin unidades seleccionadas: debajo del selector de unidades
      return {
        top: { xs: "130px", sm: "80px" },
        left: { xs: "16px", sm: "16px" },
      };
    }
  };

  // Posición del badge (reutilizable)
  const getBadgePosition = (verticalOffset = { desktop: 300, mobile: 200 }) => {
    return {
      top: {
        xs:
          state.selectedUnits.length > 0
            ? `${verticalOffset.mobile - 8}px`
            : "122px",
        sm:
          state.selectedUnits.length > 0
            ? `${verticalOffset.desktop - 8}px`
            : "72px",
      },
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
