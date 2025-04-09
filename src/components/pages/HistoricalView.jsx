import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
} from "react-leaflet";

const HistoricalView = ({ selectedUnit, onHistoricalDataFetched }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const fetchHistoricalData = async () => {
    if (!selectedUnit || !selectedDate) return;

    const movilId = selectedUnit.Movil_ID; // ID de la unidad seleccionada
    const fechaInicial = selectedDate;
    const fechaFinal = new Date(new Date(selectedDate).getTime() + 86400000)
      .toISOString()
      .split("T")[0]; // Sumar un día para obtener la fecha final

    const url = `/api/servicio/historico.php/optimo/?movil=${movilId}&&fechaInicial=${fechaInicial}&&fechaFinal=${fechaFinal}`;
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        position: "absolute",
        top: "16px",
        left: "16px",
        width: { xs: "90%", sm: "400px" },
        bgcolor: "white",
        borderRadius: "12px",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        padding: "16px",
        zIndex: 1000,
      }}
    >
      <Typography variant="h6" sx={{ marginBottom: "16px" }}>
        Histórico de la Unidad
      </Typography>
      <TextField
        label="Seleccionar Fecha"
        type="date"
        value={selectedDate}
        onChange={handleDateChange}
        fullWidth
        InputLabelProps={{
          shrink: true,
        }}
        sx={{ marginBottom: "16px" }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={fetchHistoricalData}
        disabled={!selectedDate || loading}
        fullWidth
      >
        {loading ? <CircularProgress size={24} /> : "Buscar Histórico"}
      </Button>
    </Box>
  );
};

export default HistoricalView;
