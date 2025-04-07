import React, { useEffect, useState, useMemo, useRef } from "react"; // Importa useRef
import { MapContainer, Marker, Popup, useMap } from "react-leaflet"; // Asegúrate de importar useMap
import "leaflet/dist/leaflet.css";
import Box from "@mui/material/Box";
import MenuButton from "../common/MenuButton";
import MapsLayers from "../common/MapsLayers";
import AddZoomControl from "../common/AddZoomControl";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import usePrefFetch from "../../hooks/usePrefFetch";
import { useContextValue } from "../../context/Context";
import CustomMarker from "../common/CustomMarker";
import { reportando } from "../../utils/reportando";
import UnitSelector from "../common/UnitSelector";

const PrincipalPage = () => {
  const { state } = useContextValue();
  const center = [-38.95622, -68.081845]; // Coordenadas iniciales
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [markersData, setMarkersData] = useState([]);
  const [liteData, setLiteData] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedUnits, setSelectedUnits] = useState([]);
  const mapRef = useRef(null); // Crea un ref para el mapa

  const { data: prefData } = usePrefFetch(
    "/api/servicio/equipos.php/pref",
    30000,
    state.viewMode === "rastreo"
  );

  const { data: liteResponse } = usePrefFetch(
    "/api/servicio/equipos.php/lite",
    30000,
    true
  );

  useEffect(() => {
    if (prefData) {
      setMarkersData(prefData?.GPS || []);
    }
  }, [prefData]);

  useEffect(() => {
    if (liteResponse) {
      setLiteData(liteResponse || []);
    }
  }, [liteResponse]);

  const handleUnitSelect = (units) => {
    setSelectedUnits(units);

    // Mueve el foco del mapa a la última unidad seleccionada
    if (units.length > 0) {
      const lastSelectedUnit = units[units.length - 1]; // Obtén la última unidad seleccionada
      const selectedMarker = markersData.find(
        (marker) => marker.Movil_ID === lastSelectedUnit
      );
      if (selectedMarker && mapRef.current) {
        mapRef.current.setView(
          [selectedMarker.latitud, selectedMarker.longitud],
          13 // Nivel de zoom
        );
      }
    }
  };

  const filteredMarkersData = useMemo(() => {
    if (!selectedUnits.length || !markersData) return [];
    return markersData.filter((marker) =>
      selectedUnits.includes(marker.Movil_ID)
    );
  }, [selectedUnits, markersData]);

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
          {state.viewMode === "rastreo" &&
            liteData?.GPS &&
            Object.keys(liteData.GPS).length > 0 && (
              <UnitSelector
                liteData={liteData}
                onUnitSelect={handleUnitSelect}
              />
            )}
          <MapContainer
            center={center}
            zoom={13}
            style={{
              height: "100%",
              width: "100%",
              borderRadius: "12px",
            }}
            zoomControl={false}
            ref={mapRef} // Asigna el ref al MapContainer
          >
            {state.viewMode === "rastreo" &&
              filteredMarkersData &&
              filteredMarkersData.length > 0 && (
                <>
                  {filteredMarkersData.map((marker) => (
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

            <MapsLayers />
            {isMobile || <AddZoomControl />}
          </MapContainer>
        </Box>
      </Box>
    </Box>
  );
};

export default PrincipalPage;
