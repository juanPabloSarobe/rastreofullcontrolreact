import React from "react";
import { MapContainer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css"; // Asegúrate de importar los estilos de Leaflet
import Box from "@mui/material/Box"; // Importa el componente Box de MUI
import MenuButton from "../common/MenuButton";
import MapsLayers from "../common/MapsLayers"; // Importa el componente MapsLayers
import AddZoomControl from "../common/AddZoomControl"; // Importa el nuevo componente AddZoomControl
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import usePrefFetch from "../../hooks/usePrefFetch"; // Importa el custom hook

const PrincipalPage = () => {
  const center = [-38.95622, -68.081845]; // Coordenadas iniciales (Neuquen)
  // Detecta si la pantalla es móvil o escritorio
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Usa el custom hook para realizar la consulta
  const { data, loading, error } = usePrefFetch(
    "/api/servicio/equipos.php/pref"
  );
  console.log("Data:", data);
  console.log("Loading:", loading);
  console.log("Error:", error);
  return (
    <Box display="flex" height="100vh" width="100vw" bgcolor="grey">
      <Box
        display="flex"
        height="100vh"
        padding="4px"
        width="100vw"
        flexDirection="row"
        justifyContent="center"
      >
        <Box
          width="100%"
          height="100%"
          sx={{ borderRadius: "12px" }}
          position="relative" // Necesario para posicionar elementos dentro del mapa
        >
          {/* Botón flotante en la esquina superior derecha */}

          <MenuButton />

          <MapContainer
            center={center} // Coordenadas iniciales
            zoom={13} // Nivel de zoom inicial
            style={{
              height: "100%",
              width: "100%",
              borderRadius: "12px",
            }}
            zoomControl={false} // Deshabilita los controles de zoom predeterminados
          >
            <Marker position={center}>
              <Popup>
                A pretty CSS3 popup. <br /> Easily customizable.
              </Popup>
            </Marker>

            <MapsLayers />

            {isMobile || <AddZoomControl />}
          </MapContainer>

          {/* Renderiza los datos obtenidos */}
          <Box
            position="absolute"
            bottom="16px"
            left="16px"
            bgcolor="white"
            padding="8px"
            borderRadius="8px"
            boxShadow="0px 4px 6px rgba(0, 0, 0, 0.1)"
            zIndex={1000}
          >
            {loading && <p>Cargando datos...</p>}
            {error && <p>Error: {error}</p>}
            {data && (
              <div>
                <h4>Datos recibidos:</h4>
                <pre>{JSON.stringify(data, null, 2)}</pre>
              </div>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PrincipalPage;
