import React, { useState } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  FormControlLabel,
  Switch,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Radio,
  RadioGroup,
  Grid,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import { DatePicker, DateCalendar } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useContextValue } from "../../context/Context";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import dayjs from "dayjs";
import "dayjs/locale/es";

// Mock de conductores (del plan de implementación)
const mockConductores = {
  Permisos: [
    {
      idCon: 11777,
      nombre: "Abad Francisco",
      empresa: "OPS SRL",
      dni: 12345678,
      telefono: "+5492996911111",
      email: "abad@gmail.com",
    },
    {
      idCon: 13845,
      nombre: "Abel Jorge Navarrete",
      empresa: "OPS SRL",
      dni: 87654321,
      telefono: "+5492996922222",
      email: "jorge@gmail.com",
    },
  ],
};

// Generar últimos 6 meses
const generateLast6Months = () => {
  const months = [];
  for (let i = 0; i < 6; i++) {
    const date = dayjs().subtract(i, "month");
    months.push({
      value: date.format("YYYY-MM"),
      label: date.format("MMMM YYYY"),
    });
  }
  return months;
};

const ConductorHistoryView = () => {
  const { dispatch } = useContextValue();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [selectedConductor, setSelectedConductor] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [advancedView, setAdvancedView] = useState(false);
  const [dateRange, setDateRange] = useState([null, null]);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);

  // Mock de vehículos para el conductor seleccionado
  const mockVehicles = selectedConductor
    ? [
        { id: "1", patente: "ABC123", marca: "Toyota", modelo: "Hilux" },
        { id: "2", patente: "DEF456", marca: "Ford", modelo: "F-150" },
        { id: "3", patente: "GHI789", marca: "Chevrolet", modelo: "S10" },
      ]
    : [];

  // Mock de días disponibles (solo algunos días del mes tienen datos)
  const mockAvailableDays = selectedVehicle
    ? [
        dayjs().subtract(1, "day"),
        dayjs().subtract(3, "day"),
        dayjs().subtract(5, "day"),
        dayjs().subtract(7, "day"),
        dayjs().subtract(10, "day"),
      ]
    : [];

  const last6Months = generateLast6Months();

  const handleBack = () => {
    dispatch({ type: "SET_VIEW_MODE", payload: "rastreo" });
  };

  const showResults =
    selectedConductor &&
    (advancedView ? dateRange[0] && dateRange[1] : selectedMonth);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
      {/* Componente flotante principal - igual que HistoricalView */}
      <Box
        sx={{
          position: "absolute",
          top: "16px",
          left: "16px",
          width: { xs: "90%", sm: showResults ? "800px" : "400px" },
          maxWidth: "90vw",
          bgcolor: "white",
          borderRadius: "24px",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          zIndex: 1000,
          overflow: "hidden",
          transition: "width 0.3s ease",
        }}
      >
        {/* Header verde - igual que HistoricalView */}
        <Box
          display="flex"
          alignItems="center"
          sx={{ marginBottom: "16px", bgcolor: "green" }}
        >
          <Tooltip title="Volver">
            <IconButton
              onClick={handleBack}
              sx={{ marginRight: "12px", marginLeft: "12px" }}
            >
              <ArrowBackIcon sx={{ color: "white" }} />
            </IconButton>
          </Tooltip>
          <Typography
            variant="h6"
            noWrap
            sx={{
              flex: 1,
              textAlign: "left",
              fontWeight: "bold",
              fontSize: "20px",
              bgcolor: "green",
              color: "white",
              padding: "8px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Histórico por Conductor
          </Typography>
        </Box>

        {/* Contenido */}
        <Box sx={{ p: 2, paddingTop: 0 }}>
          {/* Selector de Conductor */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="conductor-select-label">
              Seleccionar Conductor
            </InputLabel>
            <Select
              labelId="conductor-select-label"
              id="conductor-select"
              value={selectedConductor}
              onChange={(e) => setSelectedConductor(e.target.value)}
              label="Seleccionar Conductor"
              size="small"
            >
              {mockConductores.Permisos.map((conductor) => (
                <MenuItem key={conductor.idCon} value={conductor.idCon}>
                  {conductor.nombre} - {conductor.empresa}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Selector de Período */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 1,
              alignItems: { xs: "stretch", sm: "flex-end" },
              mb: 2,
            }}
          >
            {/* Vista simple: Selector de mes */}
            {!advancedView && (
              <FormControl sx={{ flex: 1 }}>
                <InputLabel id="month-select-label">Seleccionar mes</InputLabel>
                <Select
                  labelId="month-select-label"
                  id="month-select"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  disabled={!selectedConductor}
                  label="Seleccionar mes"
                  size="small"
                >
                  {last6Months.map((month) => (
                    <MenuItem key={month.value} value={month.value}>
                      {month.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Vista avanzada: Calendarios */}
            {advancedView && (
              <Box sx={{ display: "flex", gap: 1, flex: 1 }}>
                <DatePicker
                  label="Fecha inicial"
                  value={dateRange[0]}
                  onChange={(newValue) =>
                    setDateRange([newValue, dateRange[1]])
                  }
                  disabled={!selectedConductor}
                  maxDate={dayjs()}
                  slotProps={{ textField: { size: "small" } }}
                  sx={{ flex: 1 }}
                />
                <DatePicker
                  label="Fecha final"
                  value={dateRange[1]}
                  onChange={(newValue) =>
                    setDateRange([dateRange[0], newValue])
                  }
                  disabled={!selectedConductor || !dateRange[0]}
                  minDate={dateRange[0]}
                  maxDate={dayjs()}
                  slotProps={{ textField: { size: "small" } }}
                  sx={{ flex: 1 }}
                />
              </Box>
            )}

            {/* Switch Vista Avanzada */}
            <FormControlLabel
              control={
                <Switch
                  checked={advancedView}
                  onChange={(e) => setAdvancedView(e.target.checked)}
                  color="success"
                  size="small"
                />
              }
              label="Avanzado"
              sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.875rem" } }}
            />
          </Box>

          {/* Layout de Resultados */}
          {showResults && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                {/* Lista de Vehículos */}
                <Grid item xs={12} md={6}>
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    sx={{ fontWeight: "bold", fontSize: "14px" }}
                  >
                    Vehículos del Conductor
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      maxHeight: "200px",
                      overflow: "auto",
                      border: "1px solid #e0e0e0",
                    }}
                  >
                    <RadioGroup
                      value={selectedVehicle}
                      onChange={(e) => setSelectedVehicle(e.target.value)}
                    >
                      <List dense>
                        {mockVehicles.map((vehicle) => (
                          <ListItem key={vehicle.id} disablePadding>
                            <ListItemButton
                              onClick={() => setSelectedVehicle(vehicle.id)}
                              sx={{ py: 0.5 }}
                            >
                              <ListItemIcon sx={{ minWidth: "32px" }}>
                                <Radio
                                  edge="start"
                                  value={vehicle.id}
                                  tabIndex={-1}
                                  disableRipple
                                  color="success"
                                  size="small"
                                />
                              </ListItemIcon>
                              <ListItemIcon sx={{ minWidth: "32px" }}>
                                <DirectionsCarIcon
                                  color="primary"
                                  sx={{ fontSize: "20px" }}
                                />
                              </ListItemIcon>
                              <ListItemText
                                primary={vehicle.patente}
                                secondary={`${vehicle.marca} ${vehicle.modelo}`}
                                primaryTypographyProps={{ fontSize: "14px" }}
                                secondaryTypographyProps={{ fontSize: "12px" }}
                              />
                            </ListItemButton>
                          </ListItem>
                        ))}
                      </List>
                    </RadioGroup>
                  </Paper>
                </Grid>

                {/* Calendario */}
                <Grid item xs={12} md={6}>
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    sx={{ fontWeight: "bold", fontSize: "14px" }}
                  >
                    Días Disponibles
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1,
                      border: "1px solid #e0e0e0",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <DateCalendar
                      value={selectedDate}
                      onChange={(newValue) => setSelectedDate(newValue)}
                      disabled={!selectedVehicle}
                      disableFuture
                      shouldDisableDate={(date) => {
                        if (!selectedVehicle) return true;
                        return !mockAvailableDays.some((availableDay) =>
                          date.isSame(availableDay, "day")
                        );
                      }}
                      sx={{
                        "& .MuiPickersDay-root": {
                          fontSize: "12px",
                          "&.Mui-disabled": {
                            color: "text.disabled",
                          },
                          "&:not(.Mui-disabled)": {
                            backgroundColor: "rgba(76, 175, 80, 0.1)",
                            "&:hover": {
                              backgroundColor: "rgba(76, 175, 80, 0.2)",
                            },
                          },
                          "&.Mui-selected": {
                            backgroundColor: "green !important",
                            "&:hover": {
                              backgroundColor: "darkgreen !important",
                            },
                          },
                        },
                        "& .MuiPickersCalendarHeader-label": {
                          fontSize: "14px",
                        },
                        "& .MuiDayCalendar-weekDayLabel": {
                          fontSize: "12px",
                        },
                      }}
                    />
                  </Paper>
                  {!selectedVehicle && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "block",
                        textAlign: "center",
                        mt: 1,
                        fontSize: "11px",
                      }}
                    >
                      Seleccione un vehículo para habilitar el calendario
                    </Typography>
                  )}
                </Grid>
              </Grid>

              {/* Mensaje de resultado */}
              {selectedDate && selectedVehicle && (
                <Box
                  sx={{
                    mt: 2,
                    p: 1.5,
                    bgcolor: "rgba(76, 175, 80, 0.1)",
                    borderRadius: "8px",
                    border: "1px solid rgba(76, 175, 80, 0.3)",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: "bold",
                      color: "green",
                      fontSize: "13px",
                    }}
                  >
                    ✅ Recorrido Encontrado
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: "12px" }}
                  >
                    Vehículo:{" "}
                    {
                      mockVehicles.find((v) => v.id === selectedVehicle)
                        ?.patente
                    }{" "}
                    • Fecha: {selectedDate.format("DD/MM/YYYY")}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: "11px", mt: 0.5 }}
                  >
                    🚧 Próxima implementación: Mostrar recorrido en el mapa
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default ConductorHistoryView;
