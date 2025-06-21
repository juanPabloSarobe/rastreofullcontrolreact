import React, { useState, useEffect } from "react";
import {
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
  Box,
} from "@mui/material";
import {
  SystemUpdateAlt as UpdateIcon,
  CheckCircleOutline as CheckIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

const VersionModal = ({ open, onClose }) => {
  const [versionData, setVersionData] = useState(null);

  // Cargar la versión actual al abrir el modal
  useEffect(() => {
    if (open) {
      fetchCurrentVersion();
    }
  }, [open]);

  const fetchCurrentVersion = async () => {
    try {
      const response = await fetch("/version.json");
      const data = await response.json();
      setVersionData(data);
    } catch (error) {
      console.error("Error al cargar la versión:", error);
      setVersionData({
        version: "?.?.?",
        buildDate: null,
        changelog: "Error al cargar información de versión.",
      });
    }
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

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
        <IconButton onClick={onClose} size="small" sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {versionData ? (
          <>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h5" color="primary" gutterBottom>
                Versión Actual: {versionData.version}
              </Typography>

              {versionData.buildDate && (
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

            {versionData.changelog ? (
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
          </>
        ) : (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <Typography variant="body1">
              Cargando información de versión...
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="contained" color="primary">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VersionModal;
