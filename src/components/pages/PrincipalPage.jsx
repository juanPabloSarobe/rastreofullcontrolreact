import React, { useEffect, useState } from "react";
import { MapContainer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css"; // Asegúrate de importar los estilos de Leaflet
import Box from "@mui/material/Box"; // Importa el componente Box de MUI
import MenuButton from "../common/MenuButton";
import MapsLayers from "../common/MapsLayers"; // Importa el componente MapsLayers
import AddZoomControl from "../common/AddZoomControl"; // Importa el nuevo componente AddZoomControl
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import usePrefFetch from "../../hooks/usePrefFetch"; // Importa el custom hook
import { useContextValue } from "../../context/Context"; // Importa el contexto
import CustomMarker from "../common/CustomMarker";
import { reportando } from "../../utils/reportando";

const PrincipalPage = () => {
  const { state } = useContextValue(); // Accede al estado del contexto
  const center = [-38.95622, -68.081845]; // Coordenadas iniciales (Neuquen)
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [markersData, setMarkersData] = useState([]);

  // Usa el custom hook para realizar la consulta
  const { data, loading, error } = usePrefFetch(
    "/api/servicio/equipos.php/pref",
    30000,
    state.viewMode === "rastreo" // Solo habilita el hook en la vista "rastreo"
  );

  useEffect(() => {
    if (data) {
      console.log("Datos obtenidos:", data.GPS);
      setMarkersData(data?.GPS); // Actualiza el estado con los datos obtenidos
    }
  }, [data]);

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
          position="relative"
        >
          <MenuButton />
          <MapContainer
            center={center}
            zoom={13}
            style={{
              height: "100%",
              width: "100%",
              borderRadius: "12px",
            }}
            zoomControl={false}
          >
            {state.viewMode === "rastreo" &&
              markersData &&
              markersData.length > 0 && (
                <>
                  {markersData.map((marker) => (
                    <CustomMarker
                      key={Number(marker.Movil_ID)}
                      position={[
                        Number(marker.latitud),
                        Number(marker.longitud),
                      ]}
                      popupContent={marker.patente}
                      color={
                        !reportando(marker.fechaHora)
                          ? "gray"
                          : marker.estadoDeMotor === "Motor Encendido"
                          ? "green"
                          : "red"
                      }
                      rotationAngle={marker.grados}
                    />
                  ))}
                </>
              )}

            {state.viewMode === "historico" && (
              <>
                <Marker
                  position={center}
                  icon={L.icon({
                    iconUrl:
                      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-red.png",
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                  })}
                >
                  <Popup>
                    Vista de Rastreo: Aquí puedes ver la ubicación en tiempo
                    real.
                  </Popup>
                </Marker>
              </>
            )}

            <MapsLayers />
            {isMobile || <AddZoomControl />}
          </MapContainer>
        </Box>
      </Box>
    </Box>
  );
};

export default PrincipalPage;
