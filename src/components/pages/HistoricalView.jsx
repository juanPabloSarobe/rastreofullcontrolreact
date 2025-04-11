import React, { useState, useContext } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Backdrop from "@mui/material/Backdrop"; // Importar Backdrop para el modal
import {
  DateCalendar,
  LocalizationProvider,
  DatePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/es"; // Importar el idioma español
import { useContextValue } from "../../context/Context";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

const HistoricalView = ({ selectedUnit, onHistoricalDataFetched }) => {
  const { dispatch } = useContextValue();
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const fetchHistoricalData = async (date) => {
    if (!selectedUnit || !date) return;

    // Limpiar los datos históricos antes de iniciar la nueva carga
    onHistoricalDataFetched(null);
    setLoading(true);

    const movilId = selectedUnit.Movil_ID; // ID de la unidad seleccionada
    const fechaInicial = date.format("YYYY-MM-DD");
    const fechaFinal = date.add(1, "day").format("YYYY-MM-DD"); // Sumar un día para obtener la fecha final

    const url = `/api/servicio/historico.php/optimo/?movil=${movilId}&&fechaInicial=${fechaInicial}&&fechaFinal=${fechaFinal}`;
    try {
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error al obtener los datos históricos");
      }

      const data = await response.json();
      onHistoricalDataFetched(data); // Pasar los datos históricos al componente principal
    } catch (error) {
      console.error("Error al realizar la petición:", error);
      // Si hay un error, asegurarse de que no haya datos históricos visibles
      onHistoricalDataFetched(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (newValue) => {
    setSelectedDate(newValue);
    if (newValue) {
      fetchHistoricalData(newValue);
    }
  };

  const handleBackClick = () => {
    onHistoricalDataFetched(null); // Limpiar los datos históricos
    dispatch({ type: "SET_VIEW_MODE", payload: "rastreo" }); // Cambiar la vista a "rastreo"
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
      {/* Modal de carga centrado */}
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
          Cargando datos históricos...
        </Typography>
      </Backdrop>

      {isMobile ? (
        // Versión móvil
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            bgcolor: "white",
            borderRadius: "24px 24px 0px 0px",
            boxShadow: "0px -2px 10px rgba(0, 0, 0, 0.1)",
            zIndex: 1000,
            overflow: "hidden",
            padding: "0px",
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            sx={{
              bgcolor: "green",
              marginBottom: "16px",
              borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
              paddingBottom: "0px",
            }}
          >
            <IconButton
              onClick={handleBackClick}
              size="small"
              sx={{ color: "white", marginLeft: "12px" }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography
              variant="subtitle1"
              noWrap
              sx={{
                flex: 1,
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "16px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                color: "white",
                padding: "8px",
                marginRight: "48px",
              }}
            >
              Histórico de {selectedUnit?.patente}
            </Typography>
          </Box>

          <DatePicker
            label="Seleccionar fecha"
            value={selectedDate}
            onChange={handleDateChange}
            disableFuture
            disabled={loading}
            closeOnSelect={true}
            sx={{ width: "100%", marginBottom: "16px" }}
            slotProps={{
              textField: {
                fullWidth: true,
                variant: "outlined",
                sx: {
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "green" },
                    "&:hover fieldset": { borderColor: "green" },
                    "&.Mui-focused fieldset": { borderColor: "green" },
                  },
                },
              },
            }}
          />
        </Box>
      ) : (
        // Versión desktop (existente)
        <Box
          sx={{
            position: "absolute",
            top: "16px",
            left: "16px",
            width: { xs: "90%", sm: "400px" },
            bgcolor: "white",
            borderRadius: "24px",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            zIndex: 1000,
            overflow: "hidden",
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            sx={{ marginBottom: "16px", bgcolor: "green" }}
          >
            <Tooltip title="Volver">
              <IconButton
                onClick={handleBackClick}
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
              Histórico de {selectedUnit?.patente}
            </Typography>
          </Box>
          <DateCalendar
            value={selectedDate}
            onChange={handleDateChange}
            disableFuture
            disabled={loading}
            sx={{
              marginBottom: "16px",
              "& .MuiPickersDay-root": {
                color: "black",
              },
              "& .Mui-selected": {
                backgroundColor: "green !important",
                color: "white !important",
              },
              "& .Mui-selected:hover": {
                backgroundColor: "darkgreen",
              },
              "& .MuiPickersDay-root:hover": {
                backgroundColor: "rgba(0, 128, 0, 0.1)",
              },
            }}
          />
        </Box>
      )}
    </LocalizationProvider>
  );
};

export default HistoricalView;
