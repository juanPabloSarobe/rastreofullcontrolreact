import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Stack,
  Divider,
  IconButton,
} from "@mui/material";
import { updateService } from "../../utils/updateService";
import CloseIcon from "@mui/icons-material/Close";

const UpdateTester = () => {
  const [newVersion, setNewVersion] = useState("");
  const [changelog, setChangelog] = useState("");
  const [currentVersion, setCurrentVersion] = useState(null);
  const [isVisible, setIsVisible] = useState(true);

  // Al montar el componente, obtener la versión actual
  React.useEffect(() => {
    const fetchVersion = async () => {
      try {
        const response = await fetch("/version.json?t=" + new Date().getTime());
        if (response.ok) {
          const data = await response.json();
          setCurrentVersion(data);
          // Prepopular el campo de versión para facilitar pruebas
          setNewVersion(
            (data.version || "1.0.0").replace(
              /\d+$/,
              (match) => parseInt(match) + 1
            )
          );
          setChangelog(data.changelog || "");
        }
      } catch (error) {
        console.error("Error al obtener versión actual:", error);
      }
    };

    fetchVersion();
  }, []);

  // Función para simular una nueva versión
  const simulateNewVersion = () => {
    if (!newVersion.trim()) {
      alert("Por favor ingresa un número de versión");
      return;
    }

    // Crear un nuevo objeto de datos de versión
    const mockedVersionData = {
      version: newVersion.trim(),
      buildDate: new Date().toISOString(),
      changelog: changelog || "- Actualización simulada para pruebas",
    };

    // Invocar el callback como si fuera una actualización real
    if (updateService.onUpdateAvailable) {
      updateService.onUpdateAvailable(mockedVersionData);
    } else {
      alert("El servicio de actualización no está inicializado correctamente");
    }
  };

  // Función para manejar el cierre del panel
  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Card
      sx={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "350px",
        zIndex: 9999,
        boxShadow: 3,
        display: process.env.NODE_ENV === "none" ? "block" : "none", // Solo mostrar en desarrollo
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography variant="h6" color="primary">
            Tester de Actualizaciones
          </Typography>
          <IconButton
            size="small"
            onClick={handleClose}
            aria-label="cerrar panel"
            sx={{ color: "gray" }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 2 }} />

        {currentVersion && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Versión actual: <strong>{currentVersion.version}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              Fecha: {new Date(currentVersion.buildDate).toLocaleString()}
            </Typography>
          </Box>
        )}

        <Stack spacing={2}>
          <TextField
            label="Nueva versión"
            value={newVersion}
            onChange={(e) => setNewVersion(e.target.value)}
            size="small"
            fullWidth
          />

          <TextField
            label="Changelog"
            value={changelog}
            onChange={(e) => setChangelog(e.target.value)}
            multiline
            rows={3}
            size="small"
            fullWidth
            placeholder="- Cambio 1&#10;- Cambio 2&#10;- Cambio 3"
          />

          <Button
            variant="contained"
            color="primary"
            onClick={simulateNewVersion}
            fullWidth
          >
            Simular Actualización
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default UpdateTester;
