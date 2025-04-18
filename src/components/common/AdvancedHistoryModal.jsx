import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { MobileDatePicker, DateCalendar } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/es";
import dayjs from "dayjs";

const AdvancedHistoryModal = ({ open, onClose, selectedUnit }) => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([null, null]);
  const hasUnitSelected = Boolean(selectedUnit);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
            width: { xs: "90%", sm: 400 },
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

  return (
    <>
      <Modal
        open={open}
        onClose={(e, reason) => {
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
            width: { xs: "90%", sm: "80%", md: "60%" },
            height: "auto",
            maxHeight: "90vh",
            bgcolor: "background.paper",
            borderRadius: "12px",
            boxShadow: 24,
            display: "flex",
            flexDirection: "column",
            p: 0,
            overflow: "auto",
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
              textAlign="center"
              fontSize={isMobile ? "1.2rem" : "1.5rem"}
              sx={{
                fontWeight: "bold",
              }}
            >
              Histórico Avanzado {isMobile ? <br /> : " - "}
              {selectedUnit?.patente}
            </Typography>
          </Box>

          {/* Contenido principal */}
          <Box
            sx={{
              p: { xs: 2, sm: 4 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              overflow: "visible",
            }}
          >
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
              {isMobile ? (
                // Versión móvil con MobileDatePicker
                <Stack
                  direction="column"
                  spacing={3}
                  width="100%"
                  alignItems="center"
                >
                  <Box sx={{ width: "100%" }}>
                    <Typography
                      variant="subtitle1"
                      textAlign="center"
                      fontWeight="bold"
                      mb={1}
                    >
                      Fecha inicial
                    </Typography>
                    <MobileDatePicker
                      value={dateRange[0]}
                      onChange={(newDate) =>
                        setDateRange([newDate, dateRange[1]])
                      }
                      disableFuture
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: "outlined",
                          InputProps: {
                            sx: {
                              "& .MuiOutlinedInput-root.Mui-focused": {
                                "& > fieldset": { borderColor: "green" },
                              },
                            },
                          },
                        },
                      }}
                      sx={{
                        width: "100%",
                        "& .MuiPickersDay-root.Mui-selected": {
                          backgroundColor: "green !important",
                        },
                      }}
                    />
                  </Box>

                  <Box sx={{ width: "100%" }}>
                    <Typography
                      variant="subtitle1"
                      textAlign="center"
                      fontWeight="bold"
                      mb={1}
                    >
                      Fecha final
                    </Typography>
                    <MobileDatePicker
                      value={dateRange[1]}
                      onChange={(newDate) =>
                        setDateRange([dateRange[0], newDate])
                      }
                      disableFuture
                      minDate={dateRange[0] || dayjs()}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: "outlined",
                          InputProps: {
                            sx: {
                              "& .MuiOutlinedInput-root.Mui-focused": {
                                "& > fieldset": { borderColor: "green" },
                              },
                            },
                          },
                        },
                      }}
                      sx={{
                        width: "100%",
                        "& .MuiPickersDay-root.Mui-selected": {
                          backgroundColor: "green !important",
                        },
                      }}
                    />
                  </Box>
                </Stack>
              ) : (
                // Versión desktop con DateCalendar
                <Stack
                  direction="row"
                  spacing={3}
                  width="100%"
                  alignItems="flex-start"
                  justifyContent="center"
                >
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
                      minDate={dateRange[0] || dayjs()}
                      sx={{
                        "& .MuiPickersDay-root.Mui-selected": {
                          backgroundColor: "green !important",
                        },
                      }}
                    />
                  </Box>
                </Stack>
              )}
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
              disabled={
                !dateRange[0] ||
                !dateRange[1] ||
                loading ||
                dateRange[1] < dateRange[0]
              }
              onClick={handleDownload}
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
                  Descargando...
                </Box>
              ) : (
                "Descargar"
              )}
            </Button>
          </Box>
        </Paper>
      </Modal>
    </>
  );
};

export default AdvancedHistoryModal;
