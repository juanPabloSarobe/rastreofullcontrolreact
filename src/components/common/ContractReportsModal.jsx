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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  FormControlLabel,
  Switch,
} from "@mui/material";

import { DateCalendar, MobileDatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/es";
import dayjs from "dayjs";

const ContractReportsModal = ({ open, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [fetchingContracts, setFetchingContracts] = useState(false);
  const [contracts, setContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState("");
  const [advancedView, setAdvancedView] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Lista de los últimos 6 meses
  const last6Months = Array.from({ length: 6 }, (_, index) => {
    const date = dayjs().subtract(index, "month");
    return {
      value: date.format("YYYY-MM"),
      label:
        date.locale("es").format("MMMM YYYY").charAt(0).toUpperCase() +
        date.locale("es").format("MMMM YYYY").slice(1),
    };
  });

  // Cargar contratos al abrir el modal
  useEffect(() => {
    if (open) {
      fetchContracts();
    } else {
      resetForm();
    }
  }, [open]);

  // Actualizar fechas cuando cambia el mes seleccionado
  useEffect(() => {
    if (selectedMonth) {
      const [year, month] = selectedMonth.split("-");
      const startDateObj = dayjs(`${year}-${month}-01`);
      const endDateObj = startDateObj.endOf("month");

      setStartDate(startDateObj);
      setEndDate(endDateObj);
    }
  }, [selectedMonth]);

  // Actualizar fechas cuando cambia el rango de fechas avanzado
  useEffect(() => {
    if (advancedView && dateRange[0] && dateRange[1]) {
      setStartDate(dateRange[0]);
      setEndDate(dateRange[1]);
    }
  }, [dateRange, advancedView]);

  const fetchContracts = async () => {
    setFetchingContracts(true);
    try {
      const response = await fetch(
        "/api/servicio/contratos.php/verListaContratos",
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Error al obtener contratos: ${response.status}`);
      }

      const data = await response.json();
      setContracts(data.Contratos || []);
    } catch (error) {
      console.error("Error al cargar los contratos:", error);
    } finally {
      setFetchingContracts(false);
    }
  };

  const resetForm = () => {
    setSelectedContract("");
    setAdvancedView(false);
    setSelectedMonth("");
    setDateRange([null, null]);
    setStartDate(null);
    setEndDate(null);
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const handleDownload = async () => {
    if (!selectedContract || !startDate || !endDate) return;

    try {
      setLoading(true);

      const fechaInicial = startDate.format("YYYY-M-D");
      const fechaFinal = endDate.format("YYYY-M-D");
      const contrato = encodeURIComponent(selectedContract);

      const url = `/api/servicio/excelinformes.php?fechaInicial=${fechaInicial}&fechaFinal=${fechaFinal}&contrato=${contrato}`;

      console.log("Descargando informe desde:", url);

      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Error en la descarga: ${response.status}`);
      }

      // Convertir la respuesta a blob y descargar
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `Informe_${selectedContract.replace(
        /\s+/g,
        "_"
      )}_${fechaInicial}_${fechaFinal}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("Error al exportar el informe:", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  const isDownloadDisabled = () => {
    return (
      !selectedContract ||
      !(
        (!advancedView && selectedMonth) ||
        (advancedView && dateRange[0] && dateRange[1])
      ) ||
      loading ||
      dateRange[0] > dateRange[1]
    );
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
      aria-labelledby="contract-reports-title"
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
            id="contract-reports-title"
            variant="h6"
            component="h2"
            textAlign="center"
            fontSize={isMobile ? "1.2rem" : "1.5rem"}
            sx={{ fontWeight: "bold" }}
          >
            Informes Parciales
          </Typography>
        </Box>

        {/* Contenido principal */}
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 2,
          }}
        >
          {/* Selector de Contratos */}
          <FormControl fullWidth>
            <InputLabel id="contract-select-label">
              Seleccionar contrato
            </InputLabel>
            <Select
              labelId="contract-select-label"
              id="contract-select"
              value={selectedContract}
              onChange={(e) => setSelectedContract(e.target.value)}
              label="Seleccionar contrato"
              disabled={fetchingContracts}
              startAdornment={
                fetchingContracts ? (
                  <InputAdornment position="start">
                    <CircularProgress size={20} />
                  </InputAdornment>
                ) : null
              }
            >
              {contracts.map((contract) => (
                <MenuItem
                  key={`${contract.idUsuario}-${contract.codEmpresa}`}
                  value={contract.nombreContrato}
                >
                  {contract.nombreContrato}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Selector de vista simple/avanzada y mes */}
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
            }}
          >
            <Box
              sx={{ width: { xs: "100%", sm: "60%" }, order: { xs: 2, sm: 1 } }}
            >
              {!advancedView && (
                <FormControl fullWidth>
                  <InputLabel id="month-select-label">
                    Seleccionar mes
                  </InputLabel>
                  <Select
                    labelId="month-select-label"
                    id="month-select"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    disabled={!selectedContract}
                    label="Seleccionar mes"
                  >
                    {last6Months.map((month) => (
                      <MenuItem key={month.value} value={month.value}>
                        {month.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              {/* Espacio vacío para mantener la estructura cuando está en modo avanzado */}
              {advancedView && <Box sx={{ height: { xs: 0, sm: "56px" } }} />}
            </Box>

            {/* Switch siempre a la derecha */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                width: { xs: "100%", sm: "40%" },
                order: { xs: 1, sm: 2 },
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={advancedView}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      setAdvancedView(isChecked);
                      if (!isChecked) {
                        // Resetear el rango de fechas al salir de la vista avanzada
                        setDateRange([null, null]);
                        // También resetear el mes seleccionado para forzar una nueva selección
                        setSelectedMonth("");
                      }
                    }}
                    disabled={!selectedContract}
                    color="success"
                  />
                }
                label="Vista avanzada"
              />
            </Box>
          </Box>

          {/* Calendarios para vista avanzada */}
          {advancedView && (
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
              <Stack
                direction={isMobile ? "column" : "row"}
                spacing={2}
                width="100%"
                alignItems="flex-start"
                justifyContent="center"
              >
                {isMobile ? (
                  // Versión móvil con MobileDatePicker
                  <>
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
                  </>
                ) : (
                  // Versión desktop con DateCalendar (mantener como está)
                  <>
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
                        views={["day"]}
                        showDaysOutsideCurrentMonth={false}
                        sx={{
                          "& .MuiPickersDay-root.Mui-selected": {
                            backgroundColor: "green !important",
                          },
                          "& .MuiDayCalendar-header": {
                            paddingTop: "4px",
                          },
                          "& .MuiDayCalendar-weekContainer": {
                            margin: "2px 0",
                          },
                          "& .MuiPickersCalendarHeader-root": {
                            paddingLeft: "8px",
                            paddingRight: "8px",
                          },
                          width: { xs: "100%", sm: "auto" },
                          maxHeight: "280px",
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
                        views={["day"]}
                        showDaysOutsideCurrentMonth={false}
                        sx={{
                          "& .MuiPickersDay-root.Mui-selected": {
                            backgroundColor: "green !important",
                          },
                          "& .MuiDayCalendar-header": {
                            paddingTop: "4px",
                          },
                          "& .MuiDayCalendar-weekContainer": {
                            margin: "2px 0",
                          },
                          "& .MuiPickersCalendarHeader-root": {
                            paddingLeft: "8px",
                            paddingRight: "8px",
                          },
                          width: { xs: "100%", sm: "auto" },
                          maxHeight: "280px",
                        }}
                      />
                    </Box>
                  </>
                )}
              </Stack>
            </LocalizationProvider>
          )}
        </Box>

        {/* Botones de acción */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
            borderTop: "1px solid #e0e0e0",
            mt: 1,
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
            Cerrar
          </Button>
          <Button
            variant="contained"
            disabled={isDownloadDisabled()}
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
  );
};

export default ContractReportsModal;
