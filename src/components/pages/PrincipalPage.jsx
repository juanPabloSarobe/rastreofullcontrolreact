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
  // Detecta si la pantalla es móvil o escritorio
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [markersData, setMarkersData] = useState([]);

  // Usa el custom hook para realizar la consulta
  const { data, loading, error } = usePrefFetch(
    "/api/servicio/equipos.php/pref"
  );
  useEffect(() => {
    if (data) {
      console.log("Datos obtenidos:", data.GPS);
      // Aquí puedes realizar otras acciones con los datos
      setMarkersData(data?.GPS); // Actualiza el estado con los datos obtenidos
    }
  }, [data]); // Se ejecuta cada vez que `data` cambia
  /* const markersData = [
    {
      Movil_ID: 4204,
      empresa_identificacion_OID: 9895,
      equipo_id_OID: "1778",
      estadoDeEquipo_idEstado_OID: null,
      marca: "FORD",
      modelo: "ECOSPORT",
      patente: "AD-076-WG",
      conductorEnViaje_identificacion_OID: null,
      ultimaLlaveIdentificada: "0000010B6045",
      division_Division_ID_OID: 499,
      tipoVehiculo: "Camioneta",
      ultimoConductor_identificacion_OID: null,
      geocercaActual_nombre_OID: null,
      vehiculo_Vehiculo_ID_OID: 4204,
      empresa: "Petrolera Aconcagua Energ\u00eda S.A.",
      eventonumero: null,
      latitud: "-38.85814",
      longitud: "-68.38941",
      grados: 323,
      area: null,
      fechaHoraAnterior: "2024-07-30 11:20:31-03",
      fechaHora: "2024-07-30 08:23:23-03",
      velocidad: 0,
      llave: "0000010B6045",
      estadoDeMotor: "Motor Encendido",
      dic: "VL",
      estado: "Modo economizador de energia ON",
      nombre: null,
    },
    {
      Movil_ID: 6500,
      empresa_identificacion_OID: 1344,
      equipo_id_OID: "4738",
      estadoDeEquipo_idEstado_OID: null,
      marca: "Volvo",
      modelo: "B450R",
      patente: "AG-408-EZ",
      conductorEnViaje_identificacion_OID: 8181,
      ultimaLlaveIdentificada: "000000000000",
      division_Division_ID_OID: 144,
      tipoVehiculo: "Camion",
      ultimoConductor_identificacion_OID: null,
      geocercaActual_nombre_OID: null,
      vehiculo_Vehiculo_ID_OID: 6500,
      empresa: "OPS SRL",
      eventonumero: null,
      latitud: "-38.93241",
      longitud: "-67.669",
      grados: 249,
      area: "Cerro Manrique 2 - Petrobras",
      fechaHoraAnterior: "2025-04-05 16:08:30-03",
      fechaHora: "2025-04-05 13:33:16-03",
      velocidad: 0,
      llave: "000000000000",
      estadoDeMotor: "Motor Apagado",
      dic: "TQ",
      estado: "Reporte Detenido",
      nombre: "Conductor No Identificado",
    },
    {
      Movil_ID: 1405,
      empresa_identificacion_OID: 1352,
      equipo_id_OID: "5399",
      estadoDeEquipo_idEstado_OID: null,
      marca: "FORD",
      modelo: "ECOSPORT",
      patente: "AA-006-EJ",
      conductorEnViaje_identificacion_OID: null,
      ultimaLlaveIdentificada: "",
      division_Division_ID_OID: 890,
      tipoVehiculo: "Camioneta",
      ultimoConductor_identificacion_OID: null,
      geocercaActual_nombre_OID: null,
      vehiculo_Vehiculo_ID_OID: 1405,
      empresa: "GLOBAL OIL S.R.L",
      eventonumero: null,
      latitud: "-38.96611",
      longitud: "-68.0567",
      grados: 244,
      area: null,
      fechaHoraAnterior: "2024-07-23 02:03:19-03",
      fechaHora: "2024-07-22 23:03:19-03",
      velocidad: 0,
      llave: null,
      estadoDeMotor: "Motor Apagado",
      dic: "VT",
      estado: "Modo economizador de energia ON",
      nombre: null,
    },
    {
      Movil_ID: 1406,
      empresa_identificacion_OID: 1352,
      equipo_id_OID: "5399",
      estadoDeEquipo_idEstado_OID: null,
      marca: "FORD",
      modelo: "ECOSPORT",
      patente: "AB-123-DM",
      conductorEnViaje_identificacion_OID: null,
      ultimaLlaveIdentificada: "",
      division_Division_ID_OID: 890,
      tipoVehiculo: "Camioneta",
      ultimoConductor_identificacion_OID: null,
      geocercaActual_nombre_OID: null,
      vehiculo_Vehiculo_ID_OID: 1405,
      empresa: "GLOBAL OIL S.R.L",
      eventonumero: null,
      latitud: "-38.96611",
      longitud: "-68.0667",
      grados: 244,
      area: null,
      fechaHoraAnterior: "2024-07-23 02:03:19-03",
      fechaHora: "2024-07-22 23:03:19-03",
      velocidad: 0,
      llave: null,
      estadoDeMotor: "Motor Apagado",
      dic: "VT",
      estado: "Modo economizador de energia ON",
      nombre: null,
    },
    {
      Movil_ID: 4496,
      empresa_identificacion_OID: 1344,
      equipo_id_OID: "1797",
      estadoDeEquipo_idEstado_OID: null,
      marca: "VW",
      modelo: "AMAROK",
      patente: "AD-336-YV",
      conductorEnViaje_identificacion_OID: 14813,
      ultimaLlaveIdentificada: "000019E404D8",
      division_Division_ID_OID: 142,
      tipoVehiculo: "Camioneta",
      ultimoConductor_identificacion_OID: null,
      geocercaActual_nombre_OID: null,
      vehiculo_Vehiculo_ID_OID: 4496,
      empresa: "OPS SRL",
      eventonumero: null,
      latitud: "-38.837",
      longitud: "-68.12653",
      grados: 255,
      area: null,
      fechaHoraAnterior: "2025-04-05 17:42:14-03",
      fechaHora: "2025-04-05 14:42:21-03",
      velocidad: 44,
      llave: "000019E404D8",
      estadoDeMotor: "Motor Encendido",
      dic: "VL",
      estado: "Ingreso a zona con limite 100 km/h",
      nombre: "BERNAL ARIEL SEBASTIAN",
    },
  ]; */
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

          {/* Renderiza los datos obtenidos */}
          {/* <Box
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
          </Box> */}
        </Box>
      </Box>
    </Box>
  );
};

export default PrincipalPage;
