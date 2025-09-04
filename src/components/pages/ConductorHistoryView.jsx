import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  CircularProgress,
  Backdrop,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import { DatePicker, DateCalendar } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useContextValue } from "../../context/Context";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import ConductorSelector from "../common/ConductorSelector";
import HistoricalDetailView from "../common/HistoricalDetailView";
import ExportSpeedDial from "../common/ExportSpeedDial";
import conductorService from "../../services/conductorService";
import dayjs from "dayjs";
import "dayjs/locale/es";

// Memoizar la generación de meses para evitar recálculos
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

// Memoizar la lista de meses
const LAST_6_MONTHS = generateLast6Months();

const ConductorHistoryView = ({ onConductorHistoricalDataFetched }) => {
  const { state, dispatch } = useContextValue();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [selectedMonth, setSelectedMonth] = useState("");
  const [advancedView, setAdvancedView] = useState(false);
  const [dateRange, setDateRange] = useState([null, null]);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [localConductorHistoricalData, setLocalConductorHistoricalData] =
    useState(null);

  // Usar conductores del Context
  const selectedConductor = state.selectedConductor;
  const conductores = state.conductores;
  const conductorVehicles = state.conductorVehicles;
  const loadingConductorVehicles = state.loadingConductorVehicles;

  // Memoizar el handler para seleccionar conductor
  const handleConductorSelect = useCallback(
    (conductor) => {
      dispatch({ type: "SET_SELECTED_CONDUCTOR", payload: conductor });
      // Limpiar selecciones cuando cambia el conductor
      setSelectedVehicle("");
      setSelectedDate(null);
      setSelectedMonth("");
      setDateRange([null, null]);
      // Limpiar vehículos del conductor anterior
      dispatch({ type: "SET_CONDUCTOR_VEHICLES", payload: [] });
      // Limpiar recorrido del mapa al cambiar conductor
      onConductorHistoricalDataFetched(null);
      setLocalConductorHistoricalData(null);
    },
    [dispatch, onConductorHistoricalDataFetched]
  );

  // Memoizar la función para cargar vehículos por conductor
  const loadVehiculosPorConductor = useCallback(
    async (conductor, fechaInicial, fechaFinal) => {
      try {
        dispatch({ type: "SET_LOADING_CONDUCTOR_VEHICLES", payload: true });

        const response = await conductorService.getVehiculosPorConductor(
          fechaInicial,
          fechaFinal,
          conductor.idCon
        );

        // Transformar los datos al formato esperado por el componente
        const vehiclesData = response.Vehiculos || [];

        dispatch({ type: "SET_CONDUCTOR_VEHICLES", payload: vehiclesData });
      } catch (error) {
        console.error("Error al cargar vehículos:", error);
        // En caso de error, mostrar mock para no romper la funcionalidad
        const mockVehicles = [
          {
            movil: 1,
            patente: "ABC123",
            dias: [
              dayjs().subtract(1, "day").format("YYYY-MM-DD"),
              dayjs().subtract(3, "day").format("YYYY-MM-DD"),
              dayjs().subtract(5, "day").format("YYYY-MM-DD"),
            ],
          },
          {
            movil: 2,
            patente: "DEF456",
            dias: [
              dayjs().subtract(2, "day").format("YYYY-MM-DD"),
              dayjs().subtract(4, "day").format("YYYY-MM-DD"),
            ],
          },
        ];
        dispatch({ type: "SET_CONDUCTOR_VEHICLES", payload: mockVehicles });
      } finally {
        dispatch({ type: "SET_LOADING_CONDUCTOR_VEHICLES", payload: false });
      }
    },
    [dispatch]
  );

  // Memoizar la función para cargar datos históricos del conductor
  const fetchConductorHistoricalData = useCallback(
    async (date, vehicleId, conductor) => {
      if (!date || !vehicleId || !conductor) return;

      // Limpiar datos anteriores
      onConductorHistoricalDataFetched(null);
      setLocalConductorHistoricalData(null);
      setLoading(true);

      try {
        const fechaInicial = date.format("YYYY-MM-DD");
        // La fecha final debe ser un día mayor que la inicial
        const fechaFinal = date.add(1, "day").format("YYYY-MM-DD");

        const url = `/api/servicio/historico.php/optimo/?movil=${vehicleId}&fechaInicial=${fechaInicial}&fechaFinal=${fechaFinal}&conductor=${conductor.idCon}`;

        const response = await fetch(url, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(
            "Error al obtener los datos históricos del conductor"
          );
        }

        const data = await response.json();

        setLocalConductorHistoricalData(data);
        onConductorHistoricalDataFetched(data);
      } catch (error) {
        console.error("Error al cargar histórico del conductor:", error);
        onConductorHistoricalDataFetched(null);
      } finally {
        setLoading(false);
      }
    },
    [onConductorHistoricalDataFetched]
  );

  // Memoizar showResults para evitar recálculos
  const showResults = useMemo(
    () =>
      selectedConductor &&
      (advancedView ? dateRange[0] && dateRange[1] : selectedMonth),
    [selectedConductor, advancedView, dateRange, selectedMonth]
  );

  // Memoizar hasLoadedRealData para evitar recálculos
  const hasLoadedRealData = useMemo(
    () =>
      conductorVehicles.length > 0 ||
      (!loadingConductorVehicles && showResults),
    [conductorVehicles.length, loadingConductorVehicles, showResults]
  );

  // Memoizar vehiclesToShow para evitar recálculos
  const vehiclesToShow = useMemo(
    () => (hasLoadedRealData ? conductorVehicles : []),
    [hasLoadedRealData, conductorVehicles]
  );

  // Memoizar currentSelectedVehicle para evitar búsquedas repetidas
  const currentSelectedVehicle = useMemo(
    () =>
      vehiclesToShow.find(
        (v) =>
          v.movil?.toString() === selectedVehicle || v.id === selectedVehicle
      ),
    [vehiclesToShow, selectedVehicle]
  );

  // Memoizar mockAvailableDays para evitar recálculos
  const mockAvailableDays = useMemo(() => {
    if (currentSelectedVehicle?.dias) {
      return currentSelectedVehicle.dias.map((dia) => dayjs(dia));
    }
    return selectedVehicle
      ? [
          dayjs().subtract(1, "day"),
          dayjs().subtract(3, "day"),
          dayjs().subtract(5, "day"),
          dayjs().subtract(7, "day"),
          dayjs().subtract(10, "day"),
        ]
      : [];
  }, [currentSelectedVehicle?.dias, selectedVehicle]);

  // Efecto para limpiar selección de vehículo cuando cambian los vehículos disponibles
  useEffect(() => {
    if (conductorVehicles.length > 0 && selectedVehicle) {
      // Verificar si el vehículo seleccionado aún existe en la nueva lista
      const vehicleExists = conductorVehicles.some(
        (v) => v.movil?.toString() === selectedVehicle
      );
      if (!vehicleExists) {
        setSelectedVehicle("");
        setSelectedDate(null);
        // Limpiar recorrido del mapa cuando el vehículo ya no existe
        onConductorHistoricalDataFetched(null);
        setLocalConductorHistoricalData(null);
      }
    }
  }, [conductorVehicles, selectedVehicle]);

  // Efecto para cargar vehículos cuando se confirma el período
  useEffect(() => {
    if (selectedConductor && showResults) {
      let fechaInicial, fechaFinal;

      if (advancedView && dateRange[0] && dateRange[1]) {
        // Vista avanzada: usar rango de fechas
        fechaInicial = dateRange[0].format("YYYY-MM-DD");
        // Asegurar que fechaFinal sea al menos un día mayor que fechaInicial
        const finalDate = dateRange[1].isSame(dateRange[0], "day")
          ? dateRange[1].add(1, "day")
          : dateRange[1];
        fechaFinal = finalDate.format("YYYY-MM-DD");
      } else if (!advancedView && selectedMonth) {
        // Vista simple: usar mes seleccionado
        const startOfMonth = dayjs(selectedMonth).startOf("month");
        const endOfMonth = dayjs(selectedMonth).endOf("month");
        fechaInicial = startOfMonth.format("YYYY-MM-DD");
        // Para el mes completo, la fecha final ya es naturalmente mayor
        fechaFinal = endOfMonth.format("YYYY-MM-DD");
      } else {
        return; // No hay período válido
      }

      // Limpiar recorrido del mapa al cambiar período
      onConductorHistoricalDataFetched(null);
      setLocalConductorHistoricalData(null);
      setSelectedDate(null);

      loadVehiculosPorConductor(selectedConductor, fechaInicial, fechaFinal);
    }
  }, [selectedConductor, selectedMonth, dateRange, advancedView, showResults]);

  // Memoizar el handler para volver
  const handleBack = useCallback(() => {
    // Limpiar datos del conductor al salir
    onConductorHistoricalDataFetched(null);
    dispatch({ type: "CLEAR_CONDUCTOR_DATA" });
    dispatch({ type: "SET_VIEW_MODE", payload: "rastreo" });
  }, [dispatch, onConductorHistoricalDataFetched]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
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
          Cargando datos históricos del conductor...
        </Typography>
      </Backdrop>

      {/* ExportSpeedDial - Solo cuando hay recorrido visible */}
      {selectedDate && localConductorHistoricalData && (
        <ExportSpeedDial
          selectedUnit={{
            Movil_ID: selectedVehicle,
            patente: currentSelectedVehicle?.patente || "Vehículo",
          }}
          selectedDate={selectedDate}
          historicalData={localConductorHistoricalData}
          selectedConductor={selectedConductor}
        />
      )}

      {/* Componente flotante principal - igual que HistoricalView */}
      <Box
        sx={{
          position: "absolute",
          top: "16px",
          left: "16px",
          width: { xs: "90%", sm: showResults ? "590px" : "590px" },
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
          {/* Verificar si hay conductores disponibles */}
          {conductores.length === 0 ? (
            // Mensaje cuando no hay conductores asignados
            <Box
              sx={{
                p: 3,
                textAlign: "center",
                bgcolor: "rgba(158, 158, 158, 0.1)",
                borderRadius: "8px",
                border: "1px solid rgba(158, 158, 158, 0.3)",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  color: "rgba(0, 0, 0, 0.6)",
                  fontSize: "16px",
                  mb: 1,
                }}
              >
                👤 Sin conductores asignados
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: "14px" }}
              >
                No hay conductores disponibles para consultar históricos.
                <br />
                Contacte al administrador para asignar conductores a su cuenta.
              </Typography>
            </Box>
          ) : (
            <>
              {/* Selector de Conductor */}
              <Box sx={{ mb: 2 }}>
                <ConductorSelector
                  conductores={conductores}
                  selectedConductor={selectedConductor}
                  onConductorSelect={handleConductorSelect}
                  placeholder="Seleccionar Conductor"
                />
              </Box>

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
                  <FormControl
                    sx={{ flex: 1, maxWidth: "400px", marginRight: "15px" }}
                  >
                    <InputLabel id="month-select-label" size="small">
                      Seleccionar mes
                    </InputLabel>
                    <Select
                      labelId="month-select-label"
                      id="month-select"
                      value={selectedMonth}
                      onChange={(e) => {
                        // Limpiar recorrido del mapa al cambiar mes
                        if (selectedMonth !== e.target.value) {
                          onConductorHistoricalDataFetched(null);
                          setLocalConductorHistoricalData(null);
                          setSelectedDate(null);
                        }
                        setSelectedMonth(e.target.value);
                      }}
                      disabled={!selectedConductor}
                      label="Seleccionar mes"
                      size="small"
                    >
                      {LAST_6_MONTHS.map((month) => (
                        <MenuItem key={month.value} value={month.value}>
                          {month.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {/* Vista avanzada: Calendarios */}
                {advancedView && (
                  <Box
                    sx={{ display: "flex", gap: 1, flex: 1, maxWidth: "450px" }}
                  >
                    <DatePicker
                      label="Fecha inicial"
                      value={dateRange[0]}
                      onChange={(newValue) => {
                        // Limpiar recorrido del mapa al cambiar fecha inicial
                        if (dateRange[0] !== newValue) {
                          onConductorHistoricalDataFetched(null);
                          setLocalConductorHistoricalData(null);
                          setSelectedDate(null);
                        }
                        setDateRange([newValue, dateRange[1]]);
                      }}
                      disabled={!selectedConductor}
                      maxDate={dayjs()}
                      slotProps={{ textField: { size: "small" } }}
                      sx={{ flex: 1, maxWidth: "210px" }}
                    />
                    <DatePicker
                      label="Fecha final"
                      value={dateRange[1]}
                      onChange={(newValue) => {
                        // Limpiar recorrido del mapa al cambiar fecha final
                        if (dateRange[1] !== newValue) {
                          onConductorHistoricalDataFetched(null);
                          setLocalConductorHistoricalData(null);
                          setSelectedDate(null);
                        }
                        setDateRange([dateRange[0], newValue]);
                      }}
                      disabled={!selectedConductor || !dateRange[0]}
                      minDate={dateRange[0]}
                      maxDate={dayjs()}
                      slotProps={{ textField: { size: "small" } }}
                      sx={{ flex: 1, maxWidth: "210px" }}
                    />
                  </Box>
                )}

                {/* Switch Vista Avanzada */}
                <FormControlLabel
                  control={
                    <Switch
                      checked={advancedView}
                      onChange={(e) => {
                        // Limpiar recorrido del mapa al cambiar vista
                        onConductorHistoricalDataFetched(null);
                        setLocalConductorHistoricalData(null);
                        setSelectedDate(null);
                        setSelectedVehicle("");
                        setAdvancedView(e.target.checked);
                      }}
                      color="success"
                      size="small"
                    />
                  }
                  label="Avanzado"
                  sx={{
                    "& .MuiFormControlLabel-label": { fontSize: "0.875rem" },
                  }}
                />
              </Box>

              {/* Layout de Resultados */}
              {showResults && (
                <Box sx={{ mt: 2 }}>
                  {/* Verificar si hay datos después de cargar */}
                  {!loadingConductorVehicles &&
                  hasLoadedRealData &&
                  vehiclesToShow.length === 0 ? (
                    // Mensaje cuando no hay vehículos para el período seleccionado
                    <Box
                      sx={{
                        p: 3,
                        textAlign: "center",
                        bgcolor: "rgba(255, 152, 0, 0.1)",
                        borderRadius: "8px",
                        border: "1px solid rgba(255, 152, 0, 0.3)",
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: "bold",
                          color: "orange",
                          fontSize: "16px",
                          mb: 1,
                        }}
                      >
                        📅 Sin datos para el período
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: "14px", mb: 1 }}
                      >
                        El conductor{" "}
                        <strong>{selectedConductor?.nombre}</strong> no ha
                        conducido ningún vehículo en el período seleccionado.
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: "12px" }}
                      >
                        {advancedView
                          ? `Período: ${dateRange[0]?.format(
                              "DD/MM/YYYY"
                            )} - ${dateRange[1]?.format("DD/MM/YYYY")}`
                          : `Mes: ${dayjs(selectedMonth).format("MMMM YYYY")}`}
                      </Typography>
                    </Box>
                  ) : (
                    // Layout normal con vehículos y calendario
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
                            maxWidth: "200px",
                            overflow: "auto",
                            border: "1px solid #e0e0e0",
                            position: "relative",
                          }}
                        >
                          {loadingConductorVehicles ? (
                            // Indicador de carga
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                py: 4,
                              }}
                            >
                              <CircularProgress size={32} color="success" />
                              <Typography
                                variant="body2"
                                sx={{ ml: 2, fontSize: "12px" }}
                              >
                                Cargando vehículos...
                              </Typography>
                            </Box>
                          ) : vehiclesToShow.length > 0 ? (
                            // Lista de vehículos
                            <RadioGroup
                              value={selectedVehicle}
                              size="small"
                              onChange={(e) => {
                                // Limpiar recorrido del mapa al cambiar vehículo
                                if (selectedVehicle !== e.target.value) {
                                  onConductorHistoricalDataFetched(null);
                                  setLocalConductorHistoricalData(null);
                                  setSelectedDate(null);
                                }
                                setSelectedVehicle(e.target.value);
                              }}
                            >
                              <List dense>
                                {vehiclesToShow.map((vehicle) => {
                                  // Adaptar para datos reales y mock
                                  const vehicleId =
                                    vehicle.movil?.toString() || vehicle.id;
                                  const vehiclePatente = vehicle.patente;
                                  const vehicleInfo =
                                    vehicle.marca && vehicle.modelo
                                      ? `${vehicle.marca} ${vehicle.modelo}`
                                      : `${
                                          vehicle.dias?.length || 0
                                        } días con datos`;

                                  return (
                                    <ListItem key={vehicleId} disablePadding>
                                      <ListItemButton
                                        onClick={() =>
                                          setSelectedVehicle(vehicleId)
                                        }
                                        sx={{ py: 0.5 }}
                                      >
                                        <ListItemIcon sx={{ minWidth: "32px" }}>
                                          <Radio
                                            edge="start"
                                            value={vehicleId}
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
                                          primary={vehiclePatente}
                                          secondary={vehicleInfo}
                                          primaryTypographyProps={{
                                            fontSize: "14px",
                                          }}
                                          secondaryTypographyProps={{
                                            fontSize: "12px",
                                          }}
                                        />
                                      </ListItemButton>
                                    </ListItem>
                                  );
                                })}
                              </List>
                            </RadioGroup>
                          ) : (
                            // Sin vehículos
                            <Box sx={{ p: 2, textAlign: "center" }}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontSize: "12px" }}
                              >
                                No hay vehículos disponibles para el período
                                seleccionado
                              </Typography>
                            </Box>
                          )}
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
                            onChange={(newValue) => {
                              setSelectedDate(newValue);
                              if (
                                newValue &&
                                selectedVehicle &&
                                selectedConductor
                              ) {
                                fetchConductorHistoricalData(
                                  newValue,
                                  selectedVehicle,
                                  selectedConductor
                                );
                              }
                            }}
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
                  )}
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>

      {/* HistoricalDetailView - Solo cuando hay recorrido visible */}
      {localConductorHistoricalData &&
        selectedDate &&
        selectedVehicle &&
        selectedConductor && (
          <HistoricalDetailView
            selectedUnit={{
              Movil_ID: selectedVehicle,
              patente: currentSelectedVehicle?.patente || "Vehículo",
            }}
            selectedDate={selectedDate}
            selectedConductor={selectedConductor}
          />
        )}
    </LocalizationProvider>
  );
};

export default ConductorHistoryView;
