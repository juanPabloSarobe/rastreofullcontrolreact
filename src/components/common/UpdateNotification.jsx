import React, { useState, useEffect } from "react";
import { updateService } from "../../utils/updateService";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

const UpdateNotification = () => {
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [hasShownNotification, setHasShownNotification] = useState(false);

  useEffect(() => {
    // Limpiar datos del sistema anterior (migración)
    updateService.cleanOldVersionData();

    // Inicializar el servicio de actualización
    updateService.initialize();

    // Configurar callback para cuando hay una actualización disponible
    updateService.setUpdateCallback((versionData) => {
      setUpdateInfo(versionData);

      // Si es primera ejecución o si el diálogo no está abierto, mostrar la notificación
      if (versionData.isFirstRun || !showUpdateDialog) {
        setShowSnackbar(true);
        setHasShownNotification(true);
      }
    });

    return () => {
      // Si es necesario limpiar algo cuando el componente se desmonta
    };
  }, [showUpdateDialog]);

  useEffect(() => {
    if (hasShownNotification && !showSnackbar && !showUpdateDialog) {
      const timer = setTimeout(() => {
        setHasShownNotification(false);
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [hasShownNotification, showSnackbar, showUpdateDialog]);

  const handleUpdate = () => {
    updateService.clearCacheAndReload();
  };

  const handleCloseDialog = () => {
    setShowUpdateDialog(false);
    // Marcar la versión como vista cuando el usuario cierra el diálogo
    if (updateInfo && updateInfo.isFirstRun) {
      updateService.markCurrentVersionAsSeen();
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setShowSnackbar(false);
  };

  const handleSnackbarAction = () => {
    setShowSnackbar(false);
    setShowUpdateDialog(true);
  };

  const renderChangelog = (changelog) => {
    if (!changelog) return null;

    if (typeof changelog === "string") {
      return (
        <List
          dense
          sx={{ mt: 2, bgcolor: "background.paper", borderRadius: 1, py: 0 }}
        >
          {changelog.split("\n").map((item, index) => (
            <ListItem key={index} sx={{ py: 0.5 }}>
              <ListItemText primary={item.replace(/^-\s*/, "")} />
            </ListItem>
          ))}
        </List>
      );
    }

    if (Array.isArray(changelog)) {
      return (
        <List
          dense
          sx={{ mt: 2, bgcolor: "background.paper", borderRadius: 1, py: 0 }}
        >
          {changelog.map((item, index) => (
            <ListItem key={index} sx={{ py: 0.5 }}>
              <ListItemText primary={item.replace(/^-\s*/, "")} />
            </ListItem>
          ))}
        </List>
      );
    }

    return null;
  };

  return (
    <>
      <Snackbar
        open={showSnackbar}
        // Eliminamos autoHideDuration para que no se cierre automáticamente
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="info"
          onClose={handleSnackbarClose}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={handleSnackbarAction}
              startIcon={<SystemUpdateAltIcon />}
            >
              VER
            </Button>
          }
        >
          ¡Nueva versión disponible!
        </Alert>
      </Snackbar>

      <Dialog
        open={showUpdateDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: "primary.main", color: "white" }}>
          {updateInfo && updateInfo.isFirstRun
            ? "¡Bienvenido a la nueva versión!"
            : "Nueva versión disponible"}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box>
            <Typography variant="body1" gutterBottom>
              {updateInfo && updateInfo.isFirstRun
                ? "La aplicación ha sido actualizada con nuevas funcionalidades."
                : "Hay una nueva versión de la aplicación disponible."}
            </Typography>

            {updateInfo && (
              <Typography variant="body2" color="textSecondary">
                Versión: {updateInfo.version}
              </Typography>
            )}

            {updateInfo && updateInfo.changelog && (
              <>
                <Typography
                  variant="subtitle1"
                  sx={{ mt: 2, fontWeight: "bold" }}
                >
                  {updateInfo.isFirstRun
                    ? "Novedades en esta versión:"
                    : "Cambios en esta versión:"}
                </Typography>

                {renderChangelog(updateInfo.changelog)}
              </>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" color="warning.main">
              {updateInfo && updateInfo.isFirstRun
                ? "Esperamos que disfrutes de las mejoras implementadas."
                : "Se recomienda actualizar para obtener las últimas mejoras y correcciones."}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            {updateInfo && updateInfo.isFirstRun ? "Entendido" : "Más tarde"}
          </Button>
          {!updateInfo || !updateInfo.isFirstRun ? (
            <Button
              onClick={handleUpdate}
              color="success"
              variant="contained"
              startIcon={<SystemUpdateAltIcon />}
            >
              Actualizar ahora
            </Button>
          ) : null}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UpdateNotification;
