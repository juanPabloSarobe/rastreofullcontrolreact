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
      // CORREGIDO: Agregar cache busting para evitar cache del navegador
      const response = await fetch("/version.json?t=" + new Date().getTime());
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

    // Filtrar líneas vacías y líneas que solo tengan un check o espacios
    const lines = changelog
      .split("\n")
      .map((line) => line.trim())
      .filter(
        (line) =>
          line !== "" &&
          line !== "✅" &&
          line !== "✅." &&
          line !== "✅:" &&
          line !== "-" &&
          line.replace(/^✅\s*/i, "").trim() !== ""
      );

    // Prefijos de features
    const featurePrefixes = [
      /^✅\s*/i,
      /^NUEVO:?\s*/i,
      /^CORRECCIÓN:?\s*/i,
      /^OPTIMIZACIÓN:?\s*/i,
      /^MEJORA:?\s*/i,
    ];

    return (
      <List dense>
        {lines.map((line, index) => {
          const isHeader = line.includes("📅") || line.includes("Versión");

          // Detectar si es feature y extraer el texto relevante
          let featureText = null;
          for (const prefix of featurePrefixes) {
            if (prefix.test(line)) {
              featureText = line.replace(prefix, "").trim();
              break;
            }
          }
          // Solo es feature si hay texto relevante después del prefijo
          const isFeature = featureText && featureText.length > 0;

          if (isHeader) {
            return (
              <Box key={index}>
                {index > 0 && <Divider sx={{ my: 1 }} />}
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: "bold", color: "primary.main", mt: 1 }}
                >
                  {line}
                </Typography>
              </Box>
            );
          }

          if (isFeature) {
            return (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <ListItemText
                  primary={featureText}
                  primaryTypographyProps={{ variant: "body2" }}
                />
              </ListItem>
            );
          }

          return (
            <ListItem key={index} sx={{ py: 0.25, pl: 4 }}>
              <ListItemText
                primary={line}
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
