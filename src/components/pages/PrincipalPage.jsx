import React, { useEffect, useState, useMemo, useRef } from "react";
import { MapContainer, Marker, Popup, useMap } from "react-leaflet";
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
import UnitDetails from "../common/UnitDetails";
import LoadingModal from "../common/LoadingModal";
import LinearLoading from "../common/LinearLoading";
import empresasAExcluir from "../../data/empresasAExcluir.json"; // Asegúrate de que esta ruta sea correcta

const PrincipalPage = () => {
  const { state } = useContextValue();
  const center = [-38.95622, -68.081845];
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [markersData, setMarkersData] = useState([]);
  const [liteData, setLiteData] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Estado para controlar el modal de carga
  const mapRef = useRef(null);

  const { data: prefData, loading: prefLoading } = usePrefFetch(
    "/api/servicio/equipos.php/pref",
    30000,
    state.viewMode === "rastreo"
  );

  const { data: liteResponse, loading: liteLoading } = usePrefFetch(
    "/api/servicio/equipos.php/lite",
    30000,
    state.viewMode === "rastreo"
  );

  useEffect(() => {
    if (prefData) {
      setMarkersData(prefData?.GPS || []);
    }
  }, [prefData]);

  useEffect(() => {
    if (liteResponse) {
      let filteredData = liteResponse?.GPS || {};
      console.log("HideLowUnits: ", state.hideLowUnits);

      // Aplica los filtros solo si el usuario es administrador y `hideLowUnits` es true
      if (state.role === "Administrador" && state.hideLowUnits) {
        console.log(
          "Aplicando filtros para administrador con hideLowUnits activado"
        );

        // Filtra únicamente el objeto cuya clave sea ""
        if (filteredData[""]) {
          filteredData[""] = filteredData[""].filter((unit) => {
            // Verifica que `unit.fec` no sea null o undefined antes de usar `.split()`
            if (!unit.fec) return false;

            const fecha = new Date(
              unit.fec.split(" ")[0] +
                "T" +
                unit.fec.split(" ")[1].replace("-03", "")
            );
            const fechaCorte = new Date("2025-01-01");

            return (
              unit.id !== null && // ID no debe ser null
              unit.patente !== null && // Patente no debe ser null
              fecha >= fechaCorte // Fecha debe ser mayor o igual al 1 de enero de 2024
            );
          });
        }

        // Itera sobre las claves y elimina las empresas a excluir
        empresasAExcluir.forEach((empresa) => {
          if (filteredData[empresa]) {
            delete filteredData[empresa];
          }
        });
      }

      console.log(Object.keys(filteredData).length);
      console.log("filteredData", filteredData);
      setLiteData({ GPS: filteredData }); // Actualiza `liteData` con los datos filtrados
    }
  }, [liteResponse, state.role, state.hideLowUnits]);

  // Controla el estado de carga
  useEffect(() => {
    if (!prefLoading && !liteLoading) {
      setIsLoading(false); // Oculta el modal cuando ambos fetchs han terminado
    } else {
      setIsLoading(true); // Muestra el modal mientras los fetchs están cargando
    }
  }, [prefLoading, liteLoading]);

  const handleUnitSelect = (units) => {
    setSelectedUnits(units);

    if (units.length > 0) {
      const lastSelectedUnit = units[units.length - 1];
      const selectedMarker = markersData.find(
        (marker) => marker.Movil_ID === lastSelectedUnit
      );
      setSelectedUnit(selectedMarker);

      if (selectedMarker && mapRef.current) {
        mapRef.current.setView(
          [selectedMarker.latitud, selectedMarker.longitud],
          13
        );
      }
    } else {
      setSelectedUnit(null);
    }
  };

  const filteredMarkersData = useMemo(() => {
    if (!selectedUnits.length || !markersData) return [];
    return markersData.filter((marker) =>
      selectedUnits.includes(marker.Movil_ID)
    );
  }, [selectedUnits, markersData]);

  const handleViewHistory = () => {
    if (selectedUnit) {
      console.log("Ver histórico de la unidad:", selectedUnit);
    }
  };

  return (
    <>
      {/* Modal de carga */}
      {markersData.length === 0 && <LoadingModal isLoading={isLoading} />}

      {/* Indicador de carga lineal */}
      {markersData.length > 0 && (prefLoading || liteLoading) && (
        <LinearLoading />
      )}

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
                <>
                  <UnitSelector
                    liteData={liteData}
                    onUnitSelect={handleUnitSelect}
                  />
                  {/* Muestra los detalles de la unidad seleccionada */}
                  <UnitDetails
                    unitData={selectedUnit}
                    onViewHistory={handleViewHistory}
                  />
                </>
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
              ref={mapRef}
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
                        onClick={() => setSelectedUnit(marker)}
                        velocidad={marker.velocidad}
                      />
                    ))}
                  </>
                )}

              <MapsLayers isMobile={isMobile} unitData={selectedUnit} />

              {isMobile || <AddZoomControl />}
            </MapContainer>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default PrincipalPage;
