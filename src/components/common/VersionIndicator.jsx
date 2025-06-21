import React, { useState, useEffect } from "react";
import {
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Info as InfoIcon,
  SystemUpdateAlt as UpdateIcon,
  CheckCircleOutline as CheckIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { paymentService } from "../../services/paymentService";

const VersionIndicator = () => {
  const [currentVersion, setCurrentVersion] = useState(null);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [versionData, setVersionData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Cargar la versión actual al montar el componente
  useEffect(() => {
    fetchCurrentVersion();
  }, []);

  // Obtener estado de pagos para posicionamiento dinámico
  useEffect(() => {
    const getCurrentPaymentStatus = () => {
      const status = paymentService.getCurrentUserStatus();
      setPaymentStatus(status);
    };

    getCurrentPaymentStatus();
    const interval = setInterval(getCurrentPaymentStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchCurrentVersion = async () => {
    try {
      const response = await fetch("/version.json");
      const data = await response.json();
      setCurrentVersion(data.version);
      setVersionData(data);
    } catch (error) {
      console.error("Error al cargar la versión:", error);
      setCurrentVersion("?.?.?");
    }
  };

  const handleVersionClick = () => {
    setShowVersionModal(true);
  };

  const handleCloseModal = () => {
    setShowVersionModal(false);
  };

  // Renderizar el changelog como lista de elementos
  const renderChangelog = (changelog) => {
    if (!changelog) return null;

    const lines = changelog.split("\n").filter((line) => line.trim() !== "");

    return (
      <List dense>
        {lines.map((line, index) => {
          const isHeader = line.includes("📅") || line.includes("Versión");
          const isFeature =
            line.includes("✅") ||
            line.includes("NUEVO") ||
            line.includes("CORRECCIÓN") ||
            line.includes("OPTIMIZACIÓN") ||
            line.includes("MEJORA");

          if (isHeader) {
            return (
              <Box key={index}>
                {index > 0 && <Divider sx={{ my: 1 }} />}
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: "bold", color: "primary.main", mt: 1 }}
                >
                  {line.trim()}
                </Typography>
              </Box>
            );
          }

          if (isFeature) {
            return (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckIcon color="success" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={line.replace(/^✅\s*/, "").trim()}
                  primaryTypographyProps={{ variant: "body2" }}
                />
              </ListItem>
            );
          }

          return (
            <ListItem key={index} sx={{ py: 0.25, pl: 4 }}>
              <ListItemText
                primary={line.trim()}
                primaryTypographyProps={{
                  variant: "body2",
                  color: "text.secondary",
                }}
              />
            </ListItem>
          );
        })}
      </List>
    );
  };

  if (!currentVersion) {
    return null; // No mostrar nada mientras carga
  }

  // Determinar si hay chip de morosidad para ajustar posicionamiento
  const hasPaymentChip =
    paymentStatus &&
    (paymentStatus.status === "Moroso leve" ||
      paymentStatus.status === "Moroso grave");

  // Calcular posición dinámica
  const getPositionStyles = () => {
    if (isMobile) {
      // En móvil, posición discreta en la esquina inferior derecha
      return {
        position: "fixed",
        bottom: "24px",
        right: "16px",
        zIndex: 998,
      };
    } else {
      // En desktop, esquina inferior derecha también
      return {
        position: "fixed",
        bottom: "158px",
        right: "16px",
        zIndex: 998,
      };
    }
  };

  return (
    <>
      {/* Indicador de versión */}
      <Box sx={getPositionStyles()}>
        <Tooltip title="Ver información de la versión" placement="top">
          <Chip
            icon={<InfoIcon />}
            label={`v${currentVersion}`}
            onClick={handleVersionClick}
            size="small"
            variant="outlined"
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(4px)",
              border: "1px solid rgba(0, 0, 0, 0.1)",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 1)",
                border: "1px solid",
                borderColor: "primary.main",
                cursor: "pointer",
                transform: "scale(1.05)",
              },
              fontSize: "0.75rem",
              height: "24px",
              minWidth: "50px",
              transition: "all 0.2s ease-in-out",
              boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.12)",
              "& .MuiChip-icon": {
                fontSize: "12px",
              },
              "& .MuiChip-label": {
                fontSize: "0.65rem",
                fontWeight: "500",
                padding: "0 4px",
              },
            }}
          />
        </Tooltip>
      </Box>

      {/* Modal de información de versión */}
      <Dialog
        open={showVersionModal}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: "80vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: "primary.main",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <UpdateIcon />
            <Typography variant="h6">Información de Versión</Typography>
          </Box>
          <IconButton
            onClick={handleCloseModal}
            size="small"
            sx={{ color: "white" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h5" color="primary" gutterBottom>
              Versión Actual: {currentVersion}
            </Typography>

            {versionData?.buildDate && (
              <Typography variant="body2" color="text.secondary">
                Fecha de compilación:{" "}
                {new Date(versionData.buildDate).toLocaleString("es-ES")}
              </Typography>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Novedades y Mejoras:
          </Typography>

          {versionData?.changelog ? (
            renderChangelog(versionData.changelog)
          ) : (
            <Typography variant="body2" color="text.secondary">
              No hay información de cambios disponible.
            </Typography>
          )}

          <Divider sx={{ my: 2 }} />

          <Typography
            variant="body2"
            color="primary"
            sx={{ fontStyle: "italic" }}
          >
            ¡Gracias por usar FullControl GPS! 🚛
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCloseModal}
            variant="contained"
            color="primary"
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default VersionIndicator;
