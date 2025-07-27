import React from "react";
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  Grow,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SortIcon from "@mui/icons-material/Sort";
import useExpandableAlert from "../../hooks/useExpandableAlert";

const BaseExpandableAlert = ({
  icon: Icon,
  title,
  count,
  tooltipText,
  children,
  badgeColor = "warning.main",
  iconColor = "warning.main",
  verticalOffset,
  noUnitsOffset, // Nueva prop para posición sin unidades
  onUnitSelect,
  // Nuevas props para ordenamiento
  sortBy,
  onSortChange,
  showSortButton = false,
  sortOptions = { option1: "Patente", option2: "Tiempo" }, // Configurable para reutilización
  // Nueva prop para indicador de historial
  showHistoryDot = false,
  historyTooltip = "",
  // Nueva prop para zIndex configurable
  zIndex = 1001,
}) => {
  const theme = useTheme();

  // Resolver colores del tema usando las props pasadas
  const resolvedBadgeColor = badgeColor.includes(".")
    ? badgeColor.split(".").reduce((obj, key) => obj[key], theme.palette)
    : theme.palette[badgeColor];

  const resolvedIconColor = iconColor.includes(".")
    ? iconColor.split(".").reduce((obj, key) => obj[key], theme.palette)
    : theme.palette[iconColor];
  const {
    anchorEl,
    isHovered,
    open,
    handleClick,
    handleClose,
    setIsHovered,
    getPosition,
    getBadgePosition,
  } = useExpandableAlert();

  return (
    <>
      {/* Badge independiente cuando está contraído */}
      {!isHovered && !open && (
        <Box
          position="absolute"
          sx={{
            ...getBadgePosition(verticalOffset, noUnitsOffset),
            zIndex: zIndex + 1,
            pointerEvents: "none",
          }}
        >
          <Box
            sx={{
              backgroundColor: resolvedBadgeColor,
              color: "white",
              borderRadius: "50%",
              minWidth: "20px",
              height: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.75rem",
              fontWeight: "bold",
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
            }}
          >
            {count}
          </Box>
        </Box>
      )}

      {/* Contenedor principal */}
      <Box
        position="absolute"
        sx={{
          ...getPosition(verticalOffset, noUnitsOffset),
          height: "48px",
          transition: "all 0.3s ease",
          borderRadius: open ? "24px 24px 0px 0px" : "24px",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          backgroundColor: "white",
          display: "flex",
          alignItems: "center",
          zIndex: zIndex,
          overflow: "hidden",
          width: isHovered || open ? { xs: "75%", sm: "400px" } : "48px",
        }}
        onMouseEnter={() => !open && setIsHovered(true)}
        onMouseLeave={() => !open && setIsHovered(false)}
      >
        <Tooltip title={tooltipText}>
          <IconButton
            onClick={handleClick}
            sx={{
              color: resolvedIconColor,
              height: "48px",
              width: "48px",
              "&:hover": {
                backgroundColor: "rgba(255, 152, 0, 0.1)",
              },
              position: "relative",
            }}
          >
            <Icon />
          </IconButton>
        </Tooltip>

        {/* Texto expandido */}
        {(isHovered || open) && (
          <Grow in={isHovered || open} timeout={300}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                pr: 1,
              }}
            >
              <Typography
                variant="body1"
                component="div"
                sx={{
                  marginLeft: "4px",
                  marginRight: "8px",
                  fontWeight: "medium",
                  fontSize: { xs: "12px", sm: "14px" },
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "flex",
                  alignItems: "center",
                  maxWidth: { xs: "120px", sm: "200px" }, // Reducido para dar espacio al botón de ordenar
                }}
              >
                {/* Badge a la izquierda del título */}
                <Box
                  sx={{
                    mr: 1,
                    backgroundColor: resolvedBadgeColor,
                    color: "white",
                    borderRadius: "50%",
                    minWidth: "20px",
                    height: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                  }}
                >
                  {count}
                </Box>
                {title}
              </Typography>

              {/* Botón de ordenamiento (solo cuando la lista está abierta) */}
              {showSortButton && open && (
                <Tooltip title="Ordenar listado">
                  <IconButton
                    size="small"
                    onClick={onSortChange}
                    sx={{
                      color: "text.secondary",
                      backgroundColor: "grey.100",
                      borderRadius: "8px",
                      px: 1,
                      mr: 1,
                      display: "flex",
                      gap: 0.5,
                      "&:hover": {
                        backgroundColor: "grey.200",
                        color: "text.primary",
                      },
                    }}
                  >
                    <SortIcon fontSize="small" />
                    <Typography variant="caption" sx={{ fontSize: "10px" }}>
                      {sortBy === "alphabetic"
                        ? sortOptions.option1
                        : sortOptions.option2}
                    </Typography>
                  </IconButton>
                </Tooltip>
              )}

              {/* Botón de cerrar cuando está abierto */}
              {open && (
                <IconButton
                  size="small"
                  onClick={handleClose}
                  sx={{ color: "rgba(0, 0, 0, 0.6)" }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Grow>
        )}
      </Box>

      {/* Dot indicator para historial - completamente fuera del contenedor principal */}
      {showHistoryDot && (
        <Tooltip title={historyTooltip} placement="bottom">
          <Box
            sx={{
              position: "absolute",
              ...getPosition(verticalOffset, noUnitsOffset),
              bottom: "auto",
              top: {
                xs: `${
                  parseInt(getPosition(verticalOffset, noUnitsOffset).top.xs) +
                  32
                }px`,
                sm: `${
                  parseInt(getPosition(verticalOffset, noUnitsOffset).top.sm) +
                  32
                }px`,
              },
              left: {
                xs: `${
                  parseInt(getPosition(verticalOffset, noUnitsOffset).left.xs) +
                  32
                }px`,
                sm: `${
                  parseInt(getPosition(verticalOffset, noUnitsOffset).left.sm) +
                  32
                }px`,
              },
              width: 20,
              height: 20,
              backgroundColor: "grey.400",
              borderRadius: "50%",
              border: "2px solid white",
              boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.2)",
              zIndex: zIndex + 2,
              pointerEvents: "none",
            }}
          />
        </Tooltip>
      )}

      {/* Contenido expandido (children) */}
      {open && (
        <Box
          position="absolute"
          sx={{
            ...getPosition(verticalOffset, noUnitsOffset),
            top: {
              xs: `${
                parseInt(getPosition(verticalOffset, noUnitsOffset).top.xs) + 48
              }px`,
              sm: `${
                parseInt(getPosition(verticalOffset, noUnitsOffset).top.sm) + 48
              }px`,
            },
            width: "400px",
            maxHeight: "400px",
            backgroundColor: "white",
            borderRadius: "0px 0px 24px 24px",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
            zIndex: zIndex - 1,
            overflow: "hidden",
          }}
        >
          {children({ onUnitSelect, handleClose })}
        </Box>
      )}
    </>
  );
};

export default BaseExpandableAlert;
