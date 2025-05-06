import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import HistoryIcon from "@mui/icons-material/History";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import { useContextValue } from "../../context/Context";
import UnitWorksModal from "./UnitWorksModal";
import DriverWorksModal from "./DriverWorksModal";

const UnitDetails = ({ unitData }) => {
  const [worksModalOpen, setWorksModalOpen] = useState(false);
  const [driverWorksModalOpen, setDriverWorksModalOpen] = useState(false);
  const { state, dispatch } = useContextValue();

  if (!unitData) return null;

  // Desestructuración con valores predeterminados
  const {
    empresa = "Sin empresa",
    patente = "Sin patente",
    fechaHora = "01/01/1999 00:00-03",
    estadoDeMotor = "Desconocido",
    estado = "Sin datos",
    latitud = 0,
    longitud = 0,
    area = "No especificada",
    velocidad = 0,
    marca = "Sin marca",
    modelo = "Sin modelo",
    nombre = "Sin nombre",
    llave = "",
    equipo_id_OID = "Sin ID",
    Movil_ID,
    conductorEnViaje_identificacion_OID: conductorId,
  } = unitData;

  const handleViewHistory = () => {
    dispatch({
      type: "SET_HISTORY_UNIT",
      payload: unitData,
    });
    dispatch({ type: "SET_VIEW_MODE", payload: "historico" });
  };

  const handleViewWorks = () => {
    setWorksModalOpen(true);
  };

  const handleViewDriverWorks = () => {
    setDriverWorksModalOpen(true);
  };

  const handleClose = () => {
    const updatedUnits = state.selectedUnits.filter((id) => id !== Movil_ID);
    dispatch({ type: "SET_SELECTED_UNITS", payload: updatedUnits });
  };

  return (
    <>
      <Box
        sx={{
          position: "absolute",
          top: { xs: "auto", sm: "80px" },
          bottom: { xs: 0, sm: "auto" },
          left: { xs: 0, sm: "16px" },
          width: { xs: "100%", sm: "400px" },
          maxWidth: { sm: "400px" },
          zIndex: 1000,
          bgcolor: "white",
          borderRadius: { xs: "24px 24px 0 0", sm: "24px" },
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "48px",
            bgcolor: "green",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderRadius: "24px 24px 0 0",
            px: 2,
          }}
        >
          <Box sx={{ width: "24px" }}></Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              sx={{
                fontWeight: "bold",
                fontSize: "16px",
                textAlign: "center",
                pr: 0,
              }}
            >
              {empresa} - {patente}
            </Typography>
            <Tooltip title="Ver contratos">
              <IconButton
                onClick={handleViewWorks}
                sx={{
                  color: "white",
                  padding: "4px",
                  marginBottom: "18px",
                }}
                size="small"
              >
                <OpenInNewIcon sx={{ fontSize: "16px" }} />
              </IconButton>
            </Tooltip>
          </Box>
          <Tooltip title="Quitar unidad">
            <IconButton
              onClick={handleClose}
              sx={{
                color: "white",
                padding: "4px",
              }}
              size="small"
            >
              <CloseIcon sx={{ fontSize: "20px" }} />
            </IconButton>
          </Tooltip>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            marginTop: "48px",
            paddingBottom: { xs: "16px", sm: "0" },
          }}
        >
          <Box
            sx={{
              flex: 1,
              padding: "10px",
              bgcolor: "#f9f9f9",
            }}
          >
            <Typography variant="body2" sx={{ fontSize: "12px" }}>
              Ult Reporte: {fechaHora ? fechaHora.slice(0, -3) : "Sin datos"}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: "12px" }}>
              Estado: {estadoDeMotor}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: "12px" }}>
              Evento: {estado}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: "12px" }}>
              Velocidad: {velocidad} km/h
            </Typography>
            <Typography variant="body2" sx={{ fontSize: "12px" }}>
              Área: {area}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: "12px" }}>
              <a
                href={`https://www.google.com/maps?q=${latitud},${longitud}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  textDecoration: "none",
                  color: "blue",
                  fontWeight: "bold",
                }}
              >
                Cómo llegar
              </a>
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gridTemplateRows: "1fr auto",
              flex: 1,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: "6px",
              }}
            >
              <Typography
                variant="body2"
                sx={{ textAlign: "center", fontSize: "12px" }}
              >
                {marca}
              </Typography>
              <Typography
                variant="body2"
                sx={{ textAlign: "center", fontSize: "12px" }}
              >
                {modelo}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: "12px" }}>
                Id: {equipo_id_OID}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: "6px",
              }}
            >
              <IconButton
                onClick={handleViewHistory}
                sx={{
                  color: "#1E90FF",
                }}
              >
                <HistoryIcon sx={{ fontSize: "24px" }} />
              </IconButton>
              <Typography
                variant="body2"
                sx={{ marginTop: "4px", color: "#1E90FF", fontSize: "12px" }}
              >
                HISTORICO
              </Typography>
            </Box>

            <Box
              sx={{
                gridColumn: "1 / span 2",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: "16px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ textAlign: "center", fontSize: "12px" }}
                >
                  {nombre}
                </Typography>

                {conductorId && (
                  <Tooltip title="Ver obras del conductor">
                    <IconButton
                      onClick={handleViewDriverWorks}
                      sx={{
                        color: "#1E90FF",
                        padding: "4px",
                        marginLeft: "4px",
                      }}
                      size="small"
                    >
                      <PersonIcon sx={{ fontSize: "16px" }} />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>

              <Typography
                variant="body2"
                sx={{ textAlign: "center", fontSize: "12px" }}
              >
                {llave}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <UnitWorksModal
        open={worksModalOpen}
        onClose={() => setWorksModalOpen(false)}
        movilId={Movil_ID}
        patente={patente}
      />

      {conductorId && (
        <DriverWorksModal
          open={driverWorksModalOpen}
          onClose={() => setDriverWorksModalOpen(false)}
          conductorId={conductorId}
          conductorNombre={nombre}
        />
      )}
    </>
  );
};

export default UnitDetails;

const MainComponent = ({
  state,
  liteData,
  handleUnitSelect,
  selectedUnit,
  center,
  mapRef,
  filteredMarkersData,
  reportando,
  isMobile,
}) => {
  return (
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
            <UnitSelector liteData={liteData} onUnitSelect={handleUnitSelect} />
            <UnitDetails unitData={selectedUnit} />
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
                  position={[Number(marker.latitud), Number(marker.longitud)]}
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
  );
};

export { MainComponent };
