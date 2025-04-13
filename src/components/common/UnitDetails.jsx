import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import HistoryIcon from "@mui/icons-material/History";
import { useContextValue } from "../../context/Context"; // Importa el contexto

const UnitDetails = ({ unitData }) => {
  if (!unitData) return null; // Si no hay datos, no renderiza nada

  const {
    empresa, // Empresa
    patente, // Patente
    fechaHora, // Fecha y hora sin los últimos 3 dígitos
    estadoDeMotor, // Estado del motor
    estado, // Evento
    latitud, // Latitud
    longitud, // Longitud
    area, // Área
    velocidad, // Velocidad
    marca, // Marca del vehículo
    modelo, // Modelo del vehículo
    nombre, // Nombre del conductor
    llave, // Llave
    equipo_id_OID, // ID del equipo
  } = unitData;

  const { dispatch } = useContextValue();

  const handleViewHistory = () => {
    // Guarda los datos completos de la unidad en el contexto
    dispatch({
      type: "SET_HISTORY_UNIT",
      payload: unitData,
    });
    dispatch({ type: "SET_VIEW_MODE", payload: "historico" });
  };

  return (
    <Box
      sx={{
        position: "absolute",
        top: { xs: "auto", sm: "80px" }, // En móviles, se posiciona en la parte inferior
        bottom: { xs: 0, sm: "auto" }, // En móviles, se fija al fondo
        left: { xs: 0, sm: "16px" }, // Alineado a la izquierda
        width: { xs: "100%", sm: "400px" }, // En móviles, ocupa todo el ancho
        maxWidth: { sm: "400px" }, // En pantallas más grandes, tiene un ancho máximo
        zIndex: 1000,
        bgcolor: "white",
        borderRadius: { xs: "24px 24px 0 0", sm: "24px" }, // Bordes redondeados en móviles
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        overflow: "hidden", // Asegura que el contenido no se desborde
      }}
    >
      {/* Título fuera del padding */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "48px", // Altura fija para el título
          bgcolor: "green", // Fondo verde
          color: "white", // Texto blanco
          textAlign: "center", // Centrar el texto
          lineHeight: "48px", // Centrar verticalmente el texto
          fontWeight: "bold",
          fontSize: "16px", // Ajustar el tamaño de la fuente
          borderRadius: "24px 24px 0 0", // Bordes redondeados en la parte superior
        }}
      >
        {empresa} - {patente}
      </Box>

      {/* Contenido dividido en mitades */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          marginTop: "48px",
          paddingBottom: { xs: "16px", sm: "0" }, // Espacio inferior en móviles
        }}
      >
        {/* Mitad izquierda */}
        <Box
          sx={{
            flex: 1,
            padding: "10px",
            bgcolor: "#f9f9f9", // Fondo gris muy claro
          }}
        >
          <Typography variant="body2" sx={{ fontSize: "12px" }}>
            Ult Reporte: {fechaHora.slice(0, -3)}
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

        {/* Mitad derecha */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr", // Dos columnas iguales
            gridTemplateRows: "1fr auto", // Una fila superior y una fila inferior que ocupa el resto
            flex: 1,
          }}
        >
          {/* Cuadrante superior izquierdo */}
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

          {/* Cuadrante superior derecho */}
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
                color: "#1E90FF", // Celeste claro
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

          {/* Cuadrante inferior (unificado) */}
          <Box
            sx={{
              gridColumn: "1 / span 2", // Ocupa ambas columnas
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "16px",
            }}
          >
            <Typography
              variant="body2"
              sx={{ textAlign: "center", fontSize: "12px" }}
            >
              {nombre}
            </Typography>
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
            {/* Muestra los detalles de la unidad seleccionada */}
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
