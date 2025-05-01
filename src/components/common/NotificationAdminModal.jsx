import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/es";
import dayjs from "dayjs";

const NotificationAdminModal = ({ open, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({
    title: "",
    content: "",
    imageUrl: "",
    priority: "medium",
    expiresAt: dayjs().add(7, "day"),
  });

  const handleChange = (field) => (event) => {
    setMessage({
      ...message,
      [field]: event.target.value,
    });
  };

  const handleDateChange = (newDate) => {
    setMessage({
      ...message,
      expiresAt: newDate,
    });
  };

  const handleSave = async () => {
    if (!message.title || !message.content) return;

    setLoading(true);
    try {
      // Crear nuevo mensaje con ID único y fecha de creación
      const newMessage = {
        ...message,
        id: `msg${Date.now()}`,
        createdAt: new Date().toISOString(),
        expiresAt: message.expiresAt.toISOString(),
        readBy: [],
      };

      const success = await onSave(newMessage);
      if (success) {
        // Restablecer el formulario
        setMessage({
          title: "",
          content: "",
          imageUrl: "",
          priority: "medium",
          expiresAt: dayjs().add(7, "day"),
        });
        onClose();
      }
    } catch (error) {
      console.error("Error al guardar el mensaje:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={(e, reason) => {
        if (reason !== "backdropClick") {
          onClose();
        }
      }}
      disableEscapeKeyDown
    >
      <Paper
        elevation={5}
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: "600px" },
          maxHeight: "90vh",
          borderRadius: "12px",
          p: 0,
          overflow: "auto",
        }}
      >
        <Box
          sx={{
            bgcolor: "green",
            color: "white",
            p: 2,
            borderTopLeftRadius: "12px",
            borderTopRightRadius: "12px",
          }}
        >
          <Typography variant="h6" component="h2" sx={{ fontWeight: "bold" }}>
            Crear Nueva Notificación
          </Typography>
        </Box>

        <Box sx={{ p: 3 }}>
          <TextField
            fullWidth
            label="Título"
            variant="outlined"
            value={message.title}
            onChange={handleChange("title")}
            sx={{ mb: 2 }}
            required
          />

          <TextField
            fullWidth
            label="URL de imagen (opcional)"
            variant="outlined"
            value={message.imageUrl}
            onChange={handleChange("imageUrl")}
            placeholder="https://example.com/image.jpg"
            sx={{ mb: 2 }}
            helperText="Puedes usar servicios como Imgur para subir imágenes gratis"
          />

          <TextField
            fullWidth
            label="Contenido del mensaje"
            variant="outlined"
            value={message.content}
            onChange={handleChange("content")}
            multiline
            rows={4}
            sx={{ mb: 2 }}
            required
          />

          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Prioridad</InputLabel>
              <Select
                value={message.priority}
                label="Prioridad"
                onChange={handleChange("priority")}
              >
                <MenuItem value="low">Baja</MenuItem>
                <MenuItem value="medium">Media</MenuItem>
                <MenuItem value="high">Alta</MenuItem>
              </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
              <DateTimePicker
                label="Mostrar hasta"
                value={message.expiresAt}
                onChange={handleDateChange}
                minDate={dayjs()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: "outlined",
                  },
                }}
              />
            </LocalizationProvider>
          </Box>
        </Box>

        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
            borderTop: "1px solid #e0e0e0",
          }}
        >
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              borderColor: "green",
              color: "green",
              "&:hover": {
                borderColor: "darkgreen",
                backgroundColor: "rgba(0, 128, 0, 0.04)",
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!message.title || !message.content || loading}
            sx={{
              bgcolor: "green",
              "&:hover": { bgcolor: "darkgreen" },
              "&.Mui-disabled": {
                backgroundColor: loading ? "green" : "rgba(0, 128, 0, 0.12)",
                color: loading ? "white" : "rgba(0, 0, 0, 0.26)",
              },
            }}
          >
            {loading ? (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                Guardando...
              </Box>
            ) : (
              "Guardar"
            )}
          </Button>
        </Box>
      </Paper>
    </Modal>
  );
};

export default NotificationAdminModal;
