import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
} from "@mui/material";

const DeleteFleetModal = ({
  open,
  onClose,
  fleetId,
  fleetName,
  onFleetDeleted,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError("");

      const response = await fetch(
        `/api/servicio/consultasFlota.php/eliminarFlota/${fleetId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Error al eliminar flota: ${response.status}`);
      }

      // Notificar que la flota se ha eliminado
      onFleetDeleted();

      // Cerrar el modal
      onClose();
    } catch (error) {
      console.error("Error al eliminar la flota:", error);
      setError(`Error: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={(e, reason) => {
        if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
          onClose();
        }
      }}
      disableEscapeKeyDown
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle
        sx={{
          bgcolor: "error.main",
          color: "white",
          textAlign: "center",
          fontWeight: "bold",
          p: 2,
        }}
      >
        Eliminar Flota {fleetName}
      </DialogTitle>
      <DialogContent sx={{ mt: 2, p: 3 }}>
        <DialogContentText>
          ¿Está seguro que quiere eliminar la flota {fleetName}? Esta acción no
          se podrá deshacer.
        </DialogContentText>
        {error && (
          <DialogContentText sx={{ color: "error.main", mt: 2 }}>
            {error}
          </DialogContentText>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, justifyContent: "center", gap: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          color="inherit"
          disabled={isDeleting}
          sx={{ minWidth: "100px" }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleDelete}
          variant="contained"
          color="error"
          disabled={isDeleting}
          sx={{ minWidth: "100px" }}
        >
          {isDeleting ? (
            <>
              <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
              Eliminando...
            </>
          ) : (
            "Eliminar"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteFleetModal;
