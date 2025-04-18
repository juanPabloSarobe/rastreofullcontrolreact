import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Backdrop,
  Stack,
} from "@mui/material";

import { DateCalendar } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/es";

const AdvancedHistoryModal = ({ open, onClose, selectedUnit }) => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([null, null]);
  const hasUnitSelected = Boolean(selectedUnit);

  // Restablecer las fechas cuando se cierra el modal
  useEffect(() => {
    if (!open) {
      setDateRange([null, null]);
    }
  }, [open]);

  const handleCancel = () => {
    setDateRange([null, null]);
    onClose();
  };

  const handleDownload = async () => {
    if (!selectedUnit || !dateRange[0] || !dateRange[1]) {
      return;
    }

    try {
      setLoading(true);

      const movilId = selectedUnit.Movil_ID;
      const fechaInicial = dateRange[0].format("YYYY-MM-DD");
      const fechaFinal = dateRange[1].format("YYYY-MM-DD");

      // Construir la URL con los parámetros requeridos
      const url = `/api/servicio/excel.php?movil=${movilId}&&fechaInicial=${fechaInicial}&&fechaFinal=${fechaFinal}`;

      console.log("Descargando Excel desde:", url);

      // Realizar la solicitud fetch
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Error en la descarga: ${response.status}`);
      }

      // Convertir la respuesta a blob
      const blob = await response.blob();

      // Crear un objeto URL para el blob
      const objectUrl = window.URL.createObjectURL(blob);

      // Crear un elemento <a> para la descarga
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `Historial_${selectedUnit.patente}_${fechaInicial}_${fechaFinal}.xlsx`;

      // Añadir al DOM, hacer clic y luego eliminar
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Liberar el objeto URL
      window.URL.revokeObjectURL(objectUrl);

      // Cerrar modal después de descarga exitosa
      setTimeout(() => {
        handleCancel();
      }, 1500);
    } catch (error) {
      console.error("Error al exportar a Excel:", error);
    } finally {
      // Esperar un momento antes de quitar el indicador de carga
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  // Modal cuando no hay unidad seleccionada
  if (!hasUnitSelected) {
    return (
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="no-unit-modal-title"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            borderRadius: "12px",
            boxShadow: 24,
            p: 4,
            textAlign: "center",
          }}
        >
          <Typography
            id="no-unit-modal-title"
            variant="h6"
            component="h2"
            sx={{ mb: 2 }}
          >
            Seleccionar unidad para obtener el Histórico Avanzado
          </Typography>
          <Button
            variant="contained"
            onClick={onClose}
            sx={{
              bgcolor: "green",
              "&:hover": { bgcolor: "darkgreen" },
            }}
          >
            Aceptar
          </Button>
        </Box>
      </Modal>
    );
  }

  // Modal principal con DateRangePicker
  return (
    <>
      <Backdrop
        sx={{
          color: "#fff",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
        open={loading}
      >
        <CircularProgress color="inherit" size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Descargando Datos...
        </Typography>
      </Backdrop>

      <Modal
        open={open}
        onClose={(e, reason) => {
          // No permitir cerrar al hacer clic fuera
          if (reason !== "backdropClick") {
            onClose();
          }
        }}
        disableEscapeKeyDown
        aria-labelledby="advanced-history-title"
      >
        <Paper
          elevation={5}
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "60%",
            height: "80%",
            maxHeight: "500px",
            bgcolor: "background.paper",
            borderRadius: "12px",
            boxShadow: 24,
            display: "flex",
            flexDirection: "column",
            p: 0,
            overflow: "hidden",
          }}
        >
          {/* Título con fondo verde */}
          <Box
            sx={{
              bgcolor: "green",
              color: "white",
              p: 2,
              borderTopLeftRadius: "12px",
              borderTopRightRadius: "12px",
            }}
          >
            <Typography
              id="advanced-history-title"
              variant="h6"
              component="h2"
              sx={{
                fontWeight: "bold",
              }}
            >
              Histórico Avanzado - {selectedUnit?.patente}
            </Typography>
          </Box>

          {/* Contenido principal */}
          <Box
            sx={{
              p: 4,
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Box>
                  <Typography
                    variant="subtitle1"
                    textAlign="center"
                    fontWeight="bold"
                    mb={1}
                  >
                    Fecha inicial
                  </Typography>
                  <DateCalendar
                    value={dateRange[0]}
                    onChange={(newDate) =>
                      setDateRange([newDate, dateRange[1]])
                    }
                    disableFuture
                    sx={{
                      maxWidth: "100%",
                      "& .MuiPickersDay-root.Mui-selected": {
                        backgroundColor: "green !important",
                      },
                    }}
                  />
                </Box>
                <Box>
                  <Typography
                    variant="subtitle1"
                    textAlign="center"
                    fontWeight="bold"
                    mb={1}
                  >
                    Fecha final
                  </Typography>
                  <DateCalendar
                    value={dateRange[1]}
                    onChange={(newDate) =>
                      setDateRange([dateRange[0], newDate])
                    }
                    disableFuture
                    minDate={dateRange[0] || undefined}
                    sx={{
                      maxWidth: "100%",
                      "& .MuiPickersDay-root.Mui-selected": {
                        backgroundColor: "green !important",
                      },
                    }}
                  />
                </Box>
              </Stack>
            </LocalizationProvider>
          </Box>

          {/* Botones de acción */}
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
              onClick={handleCancel}
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
              disabled={!dateRange[0] || !dateRange[1]}
              onClick={handleDownload}
              sx={{
                bgcolor: "green",
                "&:hover": { bgcolor: "darkgreen" },
                "&.Mui-disabled": {
                  backgroundColor: "rgba(0, 128, 0, 0.12)",
                  color: "rgba(0, 0, 0, 0.26)",
                },
              }}
            >
              Descargar
            </Button>
          </Box>
        </Paper>
      </Modal>
    </>
  );
};

export default AdvancedHistoryModal;
