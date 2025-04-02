import React from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css"; // Asegúrate de importar los estilos de Leaflet
import Box from "@mui/material/Box"; // Importa el componente Box de MUI
import MenuButton from "../common/MenuButton";

const PrincipalPage = () => {
  const center = [-38.95622, -68.081845]; // Coordenadas iniciales (Neuquen)

  return (
    <Box display="flex" height="100vh" width="100vw" bgcolor="grey">
      {/* Cuadro blanco en el lado izquierdo */}
      <Box
        display="flex"
        height="100vh"
        padding="4px"
        width="100vw"
        flexDirection="row"
        justifyContent="center"
      >
        <Box
          width="25%"
          bgcolor="white"
          display="flex"
          alignItems="center"
          justifyContent="center"
          boxShadow="2px 0 5px rgba(0, 0, 0, 0.1)"
          sx={{ borderTopLeftRadius: "12px", borderBottomLeftRadius: "12px" }}
        >
          <p>Contenido del cuadro</p>
        </Box>

        {/* Mapa en el lado derecho */}
        <Box
          width="75%"
          height="100%"
          sx={{ borderTopRightRadius: "12px", borderBottomRightRadius: "12px" }}
          position="relative" // Necesario para posicionar elementos dentro del mapa
        >
          {/* Botón flotante en la esquina superior derecha */}
          <Box
            position="absolute"
            top="16px"
            right="16px"
            zIndex={1000} // Asegura que el botón esté por encima del mapa
          >
            <MenuButton />
          </Box>

          <MapContainer
            center={center} // Coordenadas iniciales
            zoom={13} // Nivel de zoom inicial
            style={{
              height: "100%",
              width: "100%",
              borderTopRightRadius: "12px",
              borderBottomRightRadius: "12px",
            }}
          >
            <Marker position={center}>
              <Popup>
                A pretty CSS3 popup. <br /> Easily customizable.
              </Popup>
            </Marker>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
          </MapContainer>
        </Box>
      </Box>
    </Box>
  );
};

export default PrincipalPage;
