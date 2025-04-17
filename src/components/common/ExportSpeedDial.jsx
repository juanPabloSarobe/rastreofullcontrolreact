import React, { useState } from "react";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import DownloadIcon from "@mui/icons-material/Download";
import TableViewIcon from "@mui/icons-material/TableView";
import PublicIcon from "@mui/icons-material/Public";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

const ExportSpeedDial = ({ selectedUnit, selectedDate, historicalData }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Función para exportar a Excel con fetch
  const exportToExcel = async () => {
    if (!selectedUnit || !selectedDate) {
      console.error("No hay unidad o fecha seleccionada");
      return;
    }

    try {
      setLoading(true);
      handleClose();

      const movilId = selectedUnit.Movil_ID;
      const fechaInicial = selectedDate.format("YYYY-MM-DD");

      // Construir la URL con los parámetros requeridos
      const url = `/api/servicio/excel.php?movil=${movilId}&&fechaInicial=${fechaInicial}&&fechaFinal=${fechaInicial}`;

      console.log("Descargando Excel desde:", url);

      // Realizar la solicitud fetch
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Error en la descarga: ${response.status}`);
      }

      // Convertir la respuesta a blob
      const blob = await response.blob();

      // Crear un objeto URL para el blob
      const objectUrl = window.URL.createObjectURL(blob);

      // Crear un elemento <a> para la descarga
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `Historial_${selectedUnit.patente}_${fechaInicial}.xlsx`;

      // Añadir al DOM, hacer clic y luego eliminar
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Liberar el objeto URL
      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("Error al exportar a Excel:", error);
    } finally {
      // Esperar un momento antes de quitar el indicador de carga
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  // Función para exportar a Google Earth
  const exportToGoogleEarth = () => {
    if (!selectedUnit || !selectedDate || !historicalData) {
      console.error("No hay unidad, fecha o datos históricos");
      return;
    }

    try {
      setLoading(true);
      const movilId = selectedUnit.Movil_ID;
      const patente = selectedUnit.patente;
      const fechaInicial = selectedDate.format("YYYY-MM-DD");

      // Verificar la estructura de datos
      console.log("Estructura de historicalData:", Object.keys(historicalData));

      // Verificar si tenemos Markers (con M mayúscula) o markers (con m minúscula)
      const markersArray =
        historicalData.Markers || historicalData.markers || [];
      const pathsArray = historicalData.paths || [];

      if (markersArray.length === 0) {
        throw new Error("No hay puntos de marcadores para exportar");
      }

      // Creamos el documento KML
      let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Recorrido histórico de ${patente} (${fechaInicial})</name>
    <description>Historial de recorrido del móvil ${movilId}</description>
    
    <!-- Estilo para los marcadores -->
    <Style id="markerIconStyle">
      <IconStyle>
        <Icon>
          <href>https://maps.google.com/mapfiles/kml/paddle/grn-circle.png</href>
        </Icon>
        <scale>1.0</scale>
      </IconStyle>
    </Style>
    
    <!-- Estilo para la línea del recorrido -->
    <Style id="lineStyle">
      <LineStyle>
        <color>ff0000ff</color>
        <width>4</width>
      </LineStyle>
    </Style>
    
    <!-- Marcadores -->`;

      // Agregamos cada marcador al KML
      markersArray.forEach((marker, index) => {
        // Verificar que el marcador tenga las propiedades necesarias
        if (!marker.lat || !marker.lng) return;

        // Limpiar el mensaje para la descripción
        const description = marker.message
          ? marker.message
              .replace(/<\/?br>/g, "\n")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
          : "Sin datos";

        // Extraer fecha/hora y velocidad del mensaje para usarlos en el nombre
        let placemarkName = `Punto ${index + 1}`;

        if (marker.message) {
          // Extraer fecha/hora
          const fechaHoraMatch = marker.message.match(
            /Fecha\/Hora: ([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2})/
          );
          const fechaHora = fechaHoraMatch ? fechaHoraMatch[1] : "";

          // Extraer velocidad
          const velocidadMatch = marker.message.match(/Velocidad: ([0-9]+)/);
          const velocidad = velocidadMatch ? velocidadMatch[1] : "0";

          // Formar el nuevo nombre
          if (fechaHora) {
            placemarkName = `${fechaHora} vel: ${velocidad} km/h`;
          }
        }

        kml += `
    <Placemark>
      <name>${placemarkName}</name>
      <description><![CDATA[${description}]]></description>
      <styleUrl>#markerIconStyle</styleUrl>
      <Point>
        <coordinates>${marker.lng},${marker.lat},0</coordinates>
      </Point>
    </Placemark>`;
      });

      // Agregamos la línea del recorrido
      kml += `
    <!-- Línea del recorrido -->
    <Placemark>
      <name>Recorrido completo</name>
      <styleUrl>#lineStyle</styleUrl>
      <LineString>
        <tessellate>1</tessellate>
        <coordinates>`;

      // Agregamos las coordenadas de la ruta
      pathsArray.forEach((path) => {
        if (path.lat && path.lng) {
          kml += `\n          ${path.lng},${path.lat},0`;
        }
      });

      kml += `
        </coordinates>
      </LineString>
    </Placemark>
  </Document>
</kml>`;

      // Crear blob y descargar
      const blob = new Blob([kml], {
        type: "application/vnd.google-earth.kml+xml",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Recorrido_${patente}_${fechaInicial}.kml`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log("KML exportado correctamente");
    } catch (error) {
      console.error("Error al exportar a KML:", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }

    handleClose();
  };

  const actions = [
    {
      icon: <TableViewIcon />,
      name: "Excel",
      tooltipTitle: "Exportar a Excel",
      onClick: exportToExcel,
    },
    {
      icon: <PublicIcon />,
      name: "KML",
      tooltipTitle: "Exportar a Google Earth",
      onClick: exportToGoogleEarth,
    },
  ];

  return (
    <>
      {/* Backdrop para mostrar mientras se descarga */}
      <Backdrop
        sx={{
          color: "#fff",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
        open={loading}
      >
        <CircularProgress color="inherit" size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Descargando Datos...
        </Typography>
      </Backdrop>

      <SpeedDial
        ariaLabel="Opciones de exportación"
        sx={{
          position: "absolute",
          bottom: isMobile ? 140 : null,
          top: isMobile ? null : 450,
          left: isMobile ? null : 20,
          right: isMobile ? 14 : null,
          zIndex: 900,
          "& .MuiSpeedDial-actions": {
            paddingLeft: 6,
            gap: "8px",
          },
        }}
        icon={<SpeedDialIcon openIcon={<DownloadIcon />} />}
        onClose={handleClose}
        onOpen={handleOpen}
        open={open}
        direction={isMobile ? "left" : "right"}
        openOnHover={false}
        FabProps={{
          sx: {
            bgcolor: "green",
            "&:hover": {
              bgcolor: "darkgreen",
            },
          },
        }}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            slotProps={{
              tooltip: {
                title: action.tooltipTitle,
              },
              fab: {
                sx: {
                  bgcolor: "white",
                  "&:hover": {
                    bgcolor: "#f5f5f5",
                  },
                },
              },
            }}
            onClick={action.onClick}
          />
        ))}
      </SpeedDial>
    </>
  );
};

export default ExportSpeedDial;
