import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";

const AddFleetModal = ({ open, onClose, userId, empresaId, onFleetAdded }) => {
  const [fleetName, setFleetName] = useState("");
  const [isNameValid, setIsNameValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Validar longitud del nombre cuando cambia
  useEffect(() => {
    setIsNameValid(fleetName.length >= 5);
    // Limpiar mensajes de error al cambiar el nombre
    setErrorMessage("");
  }, [fleetName]);

  // Crear la nueva flota - versión simplificada
  const handleSubmit = async () => {
    if (!isNameValid || isSubmitting || fleetName.length < 5) return;

    setIsSubmitting(true);

    try {
      // Paso 1: Verificar si el nombre ya existe
      const checkUrl = `/api/servicio/consultasFlota.php/consultarNombre?nombre=${encodeURIComponent(
        fleetName
      )}&usuario=${userId}`;
      const checkResponse = await fetch(checkUrl, {
        method: "GET",
        credentials: "include",
      });

      if (!checkResponse.ok) {
        throw new Error(`Error en la verificación: ${checkResponse.status}`);
      }

      const checkData = await checkResponse.json();

      // Si el nombre ya existe, mostrar error y detener
      if (checkData.prefijos && checkData.prefijos[0].count > 0) {
        setErrorMessage(
          "Este nombre de flota ya existe. Por favor, elija otro."
        );
        setIsSubmitting(false);
        return;
      }

      // Paso 2: Si llegamos aquí, el nombre es válido - crear la flota
      const formData = new FormData();
      formData.append("nombre", fleetName);
      formData.append("descripcion", "undefined");
      formData.append("user_Id", userId);
      formData.append("empresa_Id", empresaId);

      const createResponse = await fetch(
        "/api/servicio/consultasFlota.php/nuevaFlota",
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      if (!createResponse.ok) {
        throw new Error(`Error al crear la flota: ${createResponse.status}`);
      }

      // Éxito: notificar al componente padre y cerrar
      onFleetAdded();
      handleCancel();
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Limpiar estado y cerrar modal
  const handleCancel = () => {
    setFleetName("");
    setIsNameValid(false);
    setErrorMessage("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={(e, reason) => {
        if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
          handleCancel();
        }
      }}
      disableEscapeKeyDown
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle
        sx={{
          bgcolor: "green",
          color: "white",
          textAlign: "center",
          fontWeight: "bold",
          p: 2,
        }}
      >
        Añadir Nueva Flota
      </DialogTitle>
      <DialogContent sx={{ mt: 2, p: 3 }}>
        <TextField
          autoFocus
          margin="dense"
          id="fleetName"
          label="Nombre de Flota"
          type="text"
          fullWidth
          value={fleetName}
          onChange={(e) => setFleetName(e.target.value)}
          error={
            !!errorMessage || (fleetName.length > 0 && fleetName.length < 5)
          }
          helperText={
            errorMessage ||
            (fleetName.length > 0 && fleetName.length < 5
              ? "El nombre debe tener al menos 5 caracteres"
              : "")
          }
          disabled={isSubmitting}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, justifyContent: "center", gap: 2 }}>
        <Button
          onClick={handleCancel}
          variant="outlined"
          color="error"
          disabled={isSubmitting}
          sx={{ minWidth: "100px" }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            minWidth: "100px",
            bgcolor: "green",
            "&:hover": { bgcolor: "darkgreen" },
            "&.Mui-disabled": { bgcolor: "rgba(0, 128, 0, 0.3)" },
          }}
          disabled={!isNameValid || isSubmitting || fleetName.length < 5}
        >
          {isSubmitting ? (
            <>
              <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
              Creando Flota...
            </>
          ) : (
            "Aceptar"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddFleetModal;
