import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";

const FleetSelector = ({ userId, onFleetSelect }) => {
  const [loading, setLoading] = useState(false);
  const [fleets, setFleets] = useState([]);
  const [selectedFleet, setSelectedFleet] = useState("");

  // Cargar flotas cuando el componente se monta
  useEffect(() => {
    if (userId) {
      fetchFleets();
    }
  }, [userId]);

  // Función para obtener las flotas
  const fetchFleets = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/servicio/consultasFlota.php/flotaXUsuario/${userId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Error al obtener flotas: ${response.status}`);
      }

      const data = await response.json();
      if (data.prefijos) {
        setFleets(data.prefijos);
      }
    } catch (error) {
      console.error("Error al obtener flotas:", error);
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambio de flota
  const handleChange = (event) => {
    const fleetId = event.target.value;
    setSelectedFleet(fleetId);

    // Buscar la flota completa para pasarla al callback
    const selectedFleetObject = fleets.find(
      (fleet) => fleet.Flota_ID === fleetId
    );
    if (onFleetSelect && selectedFleetObject) {
      onFleetSelect(selectedFleetObject);
    }
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel id="fleet-selector-label">Seleccionar Flota</InputLabel>
        <Select
          labelId="fleet-selector-label"
          id="fleet-selector"
          value={selectedFleet}
          label="Seleccionar Flota"
          onChange={handleChange}
          disabled={loading}
          startAdornment={
            loading ? (
              <CircularProgress size={20} color="inherit" sx={{ ml: 1 }} />
            ) : null
          }
        >
          {fleets.map((fleet) => (
            <MenuItem key={fleet.Flota_ID} value={fleet.Flota_ID}>
              {fleet.Flota_Nombre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default FleetSelector;
