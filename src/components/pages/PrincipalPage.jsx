import React, { useEffect, useState, useMemo, useRef } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
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
import empresasAExcluir from "../../data/empresasAExcluir.json";
import HistoricalView from "./HistoricalView";
import HistoricalMarkers from "../common/HistoricalMarkers";
import UserChip from "../common/UserChip";
import FleetSelectorButton from "../common/FleetSelectorButton"; // Añadir esta importación

const PrincipalPage = () => {
  const { state, dispatch } = useContextValue();
  const center = [-38.95622, -68.081845];
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [markersData, setMarkersData] = useState([]);
  const [liteData, setLiteData] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [historicalData, setHistoricalData] = useState(null);
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

      if (selectedUnit) {
        const updatedSelectedUnit = prefData?.GPS?.find(
          (marker) => marker.Movil_ID === selectedUnit.Movil_ID
        );
        setSelectedUnit(updatedSelectedUnit || null);
      }
    }
  }, [prefData, selectedUnit]);

  useEffect(() => {
    if (liteResponse) {
      let filteredData = liteResponse?.GPS || {};
      console.log("HideLowUnits: ", state.hideLowUnits);

      if (state.role === "Administrador" && state.hideLowUnits) {
        console.log(
          "Aplicando filtros para administrador con hideLowUnits activado"
        );

        if (filteredData[""]) {
          filteredData[""] = filteredData[""].filter((unit) => {
            if (!unit.fec) return false;

            const fecha = new Date(
              unit.fec.split(" ")[0] +
                "T" +
                unit.fec.split(" ")[1].replace("-03", "")
            );
            const fechaCorte = new Date("2025-01-01");

            return (
              unit.id !== null && unit.patente !== null && fecha >= fechaCorte
            );
          });
        }

        empresasAExcluir.forEach((empresa) => {
          if (filteredData[empresa]) {
            delete filteredData[empresa];
          }
        });
      }

      console.log(Object.keys(filteredData).length);
      console.log("filteredData", filteredData);
      setLiteData({ GPS: filteredData });
    }
  }, [liteResponse, state.role, state.hideLowUnits]);

  useEffect(() => {
    if (!prefLoading && !liteLoading) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [prefLoading, liteLoading]);

  const handleUnitSelect = (units) => {
    dispatch({ type: "SET_SELECTED_UNITS", payload: units });

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
    if (!state.selectedUnits.length || !markersData) return [];
    return markersData.filter((marker) =>
      state.selectedUnits.includes(marker.Movil_ID)
    );
  }, [state.selectedUnits, markersData]);

  const handleViewHistory = () => {
    if (selectedUnit) {
      console.log("Ver histórico de la unidad:", selectedUnit);
    }
  };

  return (
    <>
      {state.viewMode === "rastreo" && markersData.length === 0 && (
        <LoadingModal isLoading={isLoading} />
      )}

      {state.viewMode === "rastreo" &&
        markersData.length > 0 &&
        (prefLoading || liteLoading) && <LinearLoading />}

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
            <MenuButton selectedUnit={selectedUnit} />
            {state.viewMode === "rastreo" && <UserChip />}
            {state.viewMode === "rastreo" &&
              liteData?.GPS &&
              Object.keys(liteData.GPS).length > 0 && (
                <>
                  <UnitSelector
                    liteData={liteData}
                    onUnitSelect={handleUnitSelect}
                  />
                  <FleetSelectorButton setSelectedUnit={setSelectedUnit} />{" "}
                  {/* Pasamos setSelectedUnit como prop */}
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
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              {state.viewMode === "rastreo" &&
                filteredMarkersData.map((marker) => (
                  <CustomMarker
                    key={Number(marker.Movil_ID)}
                    position={[Number(marker.latitud), Number(marker.longitud)]}
                    popupContent={marker.patente}
                    color={
                      !reportando(marker.fechaHora, false)
                        ? "gray"
                        : marker.estadoDeMotor === "Motor Encendido"
                        ? "green"
                        : "red"
                    }
                    rotationAngle={marker.grados}
                    onClick={() => {
                      setSelectedUnit(marker);
                    }}
                    velocidad={marker.velocidad}
                  />
                ))}
              {state.viewMode === "historico" && selectedUnit && (
                <HistoricalView
                  selectedUnit={selectedUnit}
                  onHistoricalDataFetched={setHistoricalData}
                />
              )}

              {state.viewMode === "historico" && historicalData && (
                <HistoricalMarkers historicalData={historicalData} />
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
