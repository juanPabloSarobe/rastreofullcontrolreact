import React from "react";
import { Box, IconButton, Tooltip, Typography, Grow } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import useExpandableAlert from "../../hooks/useExpandableAlert";

const BaseExpandableAlert = ({
  icon: Icon,
  title,
  count,
  badgeColor = "error.main",
  iconColor = "warning.main",
  tooltipText,
  children,
  verticalOffset,
  onUnitSelect,
}) => {
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
      {!isHovered && !open && count > 0 && (
        <Box
          position="absolute"
          sx={{
            ...getBadgePosition(verticalOffset),
            zIndex: 1002,
            pointerEvents: "none",
          }}
        >
          <Box
            sx={{
              backgroundColor: badgeColor,
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
          ...getPosition(verticalOffset),
          height: "48px",
          transition: "all 0.3s ease",
          borderRadius: open ? "24px 24px 0px 0px" : "24px",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          backgroundColor: "white",
          display: "flex",
          alignItems: "center",
          zIndex: 1001,
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
              color: iconColor,
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
                  maxWidth: { xs: "120px", sm: "280px" },
                }}
              >
                {title}
                <Box
                  sx={{
                    ml: 1,
                    backgroundColor: badgeColor,
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
              </Typography>

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

      {/* Contenido expandido (children) */}
      {open && (
        <Box
          position="absolute"
          sx={{
            ...getPosition(verticalOffset),
            top: {
              xs: `${parseInt(getPosition(verticalOffset).top.xs) + 48}px`,
              sm: `${parseInt(getPosition(verticalOffset).top.sm) + 48}px`,
            },
            width: "400px",
            maxHeight: "400px",
            backgroundColor: "white",
            borderRadius: "0px 0px 24px 24px",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
            zIndex: 1000,
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
