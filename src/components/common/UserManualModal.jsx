import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Collapse,
  Divider,
  useTheme,
  useMediaQuery,
  Chip,
  Card,
  CardContent,
  Link,
} from "@mui/material";
import {
  Close as CloseIcon,
  ExpandLess,
  ExpandMore,
  Help as HelpIcon,
  Computer as ComputerIcon,
  Map as MapIcon,
  History as HistoryIcon,
  Assessment as ReportIcon,
  Settings as SettingsIcon,
  Phone as PhoneIcon,
  GetApp as DownloadIcon,
  Security as SecurityIcon,
  Update as UpdateIcon,
} from "@mui/icons-material";

const UserManualModal = ({ open, onClose }) => {
  const [selectedSection, setSelectedSection] = useState("inicio");
  const [expandedSections, setExpandedSections] = useState({
    funciones: true,
    reportes: false,
    soporte: false,
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleSectionToggle = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const menuSections = [
    {
      id: "inicio",
      title: "Bienvenido",
      icon: <HelpIcon />,
      content: "inicio",
    },
    {
      id: "acceso",
      title: "Acceso al Sistema",
      icon: <SecurityIcon />,
      content: "acceso",
    },
    {
      id: "pantalla-principal",
      title: "Pantalla Principal",
      icon: <ComputerIcon />,
      content: "pantalla-principal",
    },
    {
      id: "funciones",
      title: "Funciones Principales",
      icon: <MapIcon />,
      hasChildren: true,
      children: [
        { id: "seleccion-vehiculos", title: "Selección de Vehículos" },
        { id: "informacion-detallada", title: "Información Detallada" },
        { id: "tipos-mapas", title: "Tipos de Mapas" },
      ],
    },
    {
      id: "historico",
      title: "Vista de Histórico",
      icon: <HistoryIcon />,
      content: "historico",
    },
    {
      id: "reportes",
      title: "Reportes y Descargas",
      icon: <ReportIcon />,
      hasChildren: true,
      children: [
        { id: "tipos-reportes", title: "Tipos de Reportes" },
        { id: "reporte-posicion", title: "⭐ Reporte de Posición Actual" },
        { id: "historico-avanzado", title: "Histórico Avanzado" },
        { id: "informes-parciales", title: "Informes Parciales" },
        { id: "certificados", title: "Certificados" },
      ],
    },
    {
      id: "flotas",
      title: "Gestión de Flotas",
      icon: <SettingsIcon />,
      content: "flotas",
    },
    {
      id: "soporte",
      title: "Soporte y Ayuda",
      icon: <PhoneIcon />,
      hasChildren: true,
      children: [
        { id: "contacto", title: "Información de Contacto" },
        { id: "problemas-comunes", title: "Problemas Comunes" },
        { id: "consejos", title: "Consejos de Uso" },
      ],
    },
  ];

  const renderContent = () => {
    switch (selectedSection) {
      case "inicio":
        return (
          <Box>
            <Typography
              variant="h4"
              gutterBottom
              sx={{ fontWeight: "bold", color: "green" }}
            >
              🎉 Bienvenido a FullControl GPS
            </Typography>
            <Card
              sx={{
                mb: 3,
                bgcolor: "rgba(0, 128, 0, 0.1)",
                border: "1px solid green",
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: "green" }}>
                  ¿Qué es FullControl GPS?
                </Typography>
                <Typography variant="body1" paragraph>
                  FullControl GPS es una plataforma web moderna y fácil de usar
                  que le permite monitorear su flota de vehículos en tiempo real
                  desde cualquier dispositivo con conexión a internet.
                </Typography>
                <Typography variant="body1" paragraph>
                  Con FullControl GPS puede:
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  <li>
                    <Typography variant="body2">
                      🚗 Monitorear vehículos en tiempo real
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      📍 Ver ubicaciones exactas en mapas interactivos
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      📊 Generar reportes detallados
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      📱 Acceder desde cualquier dispositivo
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      🔒 Gestionar flotas de manera segura
                    </Typography>
                  </li>
                </Box>
              </CardContent>
            </Card>

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
              <Chip
                icon={<ComputerIcon />}
                label="Acceso Web 24/7"
                color="primary"
              />
              <Chip
                icon={<SecurityIcon />}
                label="Datos Encriptados"
                color="success"
              />
              <Chip
                icon={<UpdateIcon />}
                label="Actualizaciones Automáticas"
                color="info"
              />
            </Box>

            <Typography variant="h6" gutterBottom>
              📋 Contenido de este Manual
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Use el menú lateral para navegar por las diferentes secciones.
              Este manual le ayudará a aprovechar al máximo todas las funciones
              de FullControl GPS.
            </Typography>
          </Box>
        );

      case "acceso":
        return (
          <Box>
            <Typography
              variant="h4"
              gutterBottom
              color="primary"
              sx={{ fontWeight: "bold" }}
            >
              🔐 Acceso al Sistema
            </Typography>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🌐 Ingreso a la Plataforma
                </Typography>
                <Box component="ol" sx={{ pl: 2 }}>
                  <li>
                    <Typography variant="body2" paragraph>
                      <strong>Abrir el navegador web</strong> (Chrome, Firefox,
                      Safari, Edge)
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" paragraph>
                      <strong>Navegar a:</strong>{" "}
                      https://plataforma.fullcontrolgps.com.ar
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" paragraph>
                      <strong>Ingresar credenciales:</strong>
                    </Typography>
                    <Box sx={{ ml: 2, mt: 1 }}>
                      <Typography variant="body2">
                        • Usuario: Su nombre de usuario asignado
                      </Typography>
                      <Typography variant="body2">
                        • Contraseña: Su contraseña personal
                      </Typography>
                    </Box>
                  </li>
                </Box>
              </CardContent>
            </Card>

            <Card
              sx={{
                mb: 3,
                bgcolor: "warning.50",
                border: "1px solid",
                borderColor: "warning.200",
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom color="warning.main">
                  ❓ ¿Olvidó su contraseña?
                </Typography>
                <Typography variant="body2" paragraph>
                  Haga clic en "¿Olvidaste tu password?" para obtener ayuda vía
                  WhatsApp.
                </Typography>
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<PhoneIcon />}
                  href="https://wa.me/+5492994667595?text=necesito%20ayuda%20con%20mi%20password"
                  target="_blank"
                  size="small"
                >
                  Ayuda con Contraseña
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🎯 Primer Acceso
                </Typography>
                <Typography variant="body2" paragraph>
                  • Al ingresar por primera vez, verá un mensaje de bienvenida
                </Typography>
                <Typography variant="body2" paragraph>
                  • El sistema se adapta automáticamente a su dispositivo
                  (computadora, tablet o celular)
                </Typography>
                <Typography variant="body2">
                  • La interfaz es responsiva y funciona perfectamente en todos
                  los dispositivos
                </Typography>
              </CardContent>
            </Card>
          </Box>
        );

      case "pantalla-principal":
        return (
          <Box>
            <Typography
              variant="h4"
              gutterBottom
              color="primary"
              sx={{ fontWeight: "bold" }}
            >
              🖥️ Pantalla Principal
            </Typography>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🗺️ Vista del Mapa
                </Typography>
                <Typography variant="body2" paragraph>
                  Al ingresar, verá un mapa interactivo que muestra:
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                  <Chip
                    icon="🟢"
                    label="Verde: Vehículo encendido"
                    size="small"
                  />
                  <Chip icon="🔴" label="Rojo: Vehículo apagado" size="small" />
                  <Chip
                    icon="⚫"
                    label="Gris: Sin reportar (24hs)"
                    size="small"
                  />
                </Box>
                <Typography variant="body2" paragraph>
                  • <strong>Ubicación actual</strong> de todos sus vehículos
                </Typography>
                <Typography variant="body2" paragraph>
                  • <strong>Estado de cada unidad</strong> mediante colores
                  distintivos
                </Typography>
                <Typography variant="body2">
                  • <strong>Información en tiempo real</strong> actualizada cada
                  30 segundos
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  👤 Información de Usuario
                </Typography>
                <Typography variant="body2" paragraph>
                  En la esquina superior derecha encontrará:
                </Typography>
                <Typography variant="body2" paragraph>
                  • Su nombre de usuario
                </Typography>
                <Typography variant="body2">
                  • Menú principal (ícono de hamburguesa ☰)
                </Typography>
              </CardContent>
            </Card>

            <Card
              sx={{
                bgcolor: "info.50",
                border: "1px solid",
                borderColor: "info.200",
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom color="info.main">
                  💡 Consejo
                </Typography>
                <Typography variant="body2">
                  Use los gestos táctiles para navegar el mapa en dispositivos
                  móviles. Pellizque para hacer zoom y deslice para moverse por
                  el mapa.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        );

      case "seleccion-vehiculos":
        return (
          <Box>
            <Typography
              variant="h4"
              gutterBottom
              color="primary"
              sx={{ fontWeight: "bold" }}
            >
              🚗 Selección de Vehículos
            </Typography>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📋 Selector de Unidades
                </Typography>
                <Typography variant="body2" paragraph>
                  En la parte superior izquierda encontrará el botón{" "}
                  <strong>"Seleccionar Unidades"</strong>:
                </Typography>
                <Box component="ol" sx={{ pl: 2 }}>
                  <li>
                    <Typography variant="body2">
                      Haga clic en el botón
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Busque vehículos usando el campo de búsqueda
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Seleccione/deseleccione usando los interruptores
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Use "Seleccionar todos" con el interruptor superior
                    </Typography>
                  </li>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🏢 Selector de Flotas
                </Typography>
                <Typography variant="body2" paragraph>
                  Si tiene flotas configuradas:
                </Typography>
                <Box component="ol" sx={{ pl: 2 }}>
                  <li>
                    <Typography variant="body2">
                      Haga clic en el ícono de vehículo 🚗
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Seleccione la flota deseada
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Todas las unidades de esa flota se mostrarán
                      automáticamente
                    </Typography>
                  </li>
                </Box>
              </CardContent>
            </Card>

            <Card
              sx={{
                bgcolor: "success.50",
                border: "1px solid",
                borderColor: "success.200",
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom color="success.main">
                  ✅ Tip Útil
                </Typography>
                <Typography variant="body2">
                  Use el campo de búsqueda para encontrar rápidamente vehículos
                  específicos por patente o nombre.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        );

      case "informacion-detallada":
        return (
          <Box>
            <Typography
              variant="h4"
              gutterBottom
              color="primary"
              sx={{ fontWeight: "bold" }}
            >
              📊 Información Detallada de Vehículos
            </Typography>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🔍 Ver Detalles de una Unidad
                </Typography>
                <Typography variant="body2" paragraph>
                  Haga clic en cualquier marcador del mapa para ver:
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: 2,
                    mt: 2,
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" color="primary">
                      Información Básica:
                    </Typography>
                    <Typography variant="body2">• Patente</Typography>
                    <Typography variant="body2">• Empresa</Typography>
                    <Typography variant="body2">• Estado del motor</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="primary">
                      Ubicación:
                    </Typography>
                    <Typography variant="body2">• Velocidad actual</Typography>
                    <Typography variant="body2">• Área/Dirección</Typography>
                    <Typography variant="body2">
                      • Enlace a Google Maps
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="primary">
                      Detalles Técnicos:
                    </Typography>
                    <Typography variant="body2">• Marca y modelo</Typography>
                    <Typography variant="body2">• ID del equipo GPS</Typography>
                    <Typography variant="body2">
                      • Conductor asignado
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ⚙️ Opciones Disponibles
                </Typography>
                <Typography variant="body2" paragraph>
                  Desde la ventana de detalles puede acceder a:
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Chip
                    icon={<HistoryIcon />}
                    label="Ver histórico"
                    color="primary"
                    size="small"
                  />
                  <Chip
                    icon={<ReportIcon />}
                    label="Ver contratos"
                    color="secondary"
                    size="small"
                  />
                  <Chip
                    icon="👤"
                    label="Ver conductor"
                    color="info"
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>
        );

      case "tipos-mapas":
        return (
          <Box>
            <Typography
              variant="h4"
              gutterBottom
              color="primary"
              sx={{ fontWeight: "bold" }}
            >
              🗺️ Tipos de Mapas
            </Typography>

            <Card>
              <CardContent>
                <Typography variant="body2" paragraph>
                  Puede cambiar el tipo de mapa desde el control en la esquina
                  inferior derecha:
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" color="primary">
                      🗺️ OpenStreetMap
                    </Typography>
                    <Typography variant="body2">
                      Mapa estándar con detalles de calles
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="primary">
                      🛰️ Esri Satellite
                    </Typography>
                    <Typography variant="body2">
                      Vista satelital de alta calidad
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="primary">
                      🌍 Google Maps
                    </Typography>
                    <Typography variant="body2">
                      Mapa clásico de Google
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="primary">
                      📡 Google Satélite
                    </Typography>
                    <Typography variant="body2">
                      Vista satelital de Google
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        );

      case "historico":
        return (
          <Box>
            <Typography
              variant="h4"
              gutterBottom
              color="primary"
              sx={{ fontWeight: "bold" }}
            >
              📈 Vista de Histórico
            </Typography>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🕐 Acceder al Histórico
                </Typography>
                <Box component="ol" sx={{ pl: 2 }}>
                  <li>
                    <Typography variant="body2">
                      Seleccione un vehículo en el mapa
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Haga clic en "HISTORICO" en la ventana de detalles
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Seleccione la fecha que desea consultar
                    </Typography>
                  </li>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📊 Información Mostrada
                </Typography>
                <Typography variant="body2" paragraph>
                  • <strong>Ruta recorrida</strong> en el mapa con líneas de
                  colores
                </Typography>
                <Typography variant="body2" paragraph>
                  • <strong>Puntos de parada</strong> marcados especialmente
                </Typography>
                <Typography variant="body2" paragraph>
                  • <strong>Velocidad</strong> en cada tramo del recorrido
                </Typography>
                <Typography variant="body2">
                  • <strong>Horarios</strong> de inicio y fin de viaje
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📱 Detalles en Móvil
                </Typography>
                <Typography variant="body2" paragraph>
                  En dispositivos móviles, deslice hacia arriba para ver:
                </Typography>
                <Typography variant="body2" paragraph>
                  • Tabla detallada con eventos y horarios
                </Typography>
                <Typography variant="body2" paragraph>
                  • Función de búsqueda dentro de los eventos
                </Typography>
                <Typography variant="body2">
                  • Información completa de cada punto registrado
                </Typography>
              </CardContent>
            </Card>

            <Card
              sx={{
                bgcolor: "info.50",
                border: "1px solid",
                borderColor: "info.200",
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom color="info.main">
                  📥 Exportar Histórico
                </Typography>
                <Typography variant="body2" paragraph>
                  Desde la vista de histórico puede:
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Chip
                    icon={<DownloadIcon />}
                    label="Excel (.xlsx)"
                    color="success"
                    size="small"
                  />
                  <Chip
                    icon={<DownloadIcon />}
                    label="Google Earth (.kml)"
                    color="info"
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>
        );

      case "tipos-reportes":
        return (
          <Box>
            <Typography
              variant="h4"
              gutterBottom
              color="primary"
              sx={{ fontWeight: "bold" }}
            >
              📋 Tipos de Reportes
            </Typography>

            <Box sx={{ display: "grid", gap: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    📊 Histórico Diario
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Un día específico en formato Excel o KML
                  </Typography>
                  <Typography variant="body2">
                    Ideal para: Revisar la actividad de un día particular
                  </Typography>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    📈 Histórico Avanzado
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Múltiples días en formato Excel
                  </Typography>
                  <Typography variant="body2">
                    Ideal para: Análisis de períodos extensos y comparativas
                  </Typography>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    🏗️ Informes Parciales
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Reportes por contrato y período específico
                  </Typography>
                  <Typography variant="body2">
                    Ideal para: Facturación y control de obras
                  </Typography>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    📜 Certificados
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Documentos oficiales en formato PDF
                  </Typography>
                  <Typography variant="body2">
                    Ideal para: Trámites legales y verificaciones oficiales
                  </Typography>
                </CardContent>
              </Card>

              <Card
                sx={{
                  bgcolor: "rgba(76, 175, 80, 0.1)",
                  border: "2px solid #4CAF50",
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      color: "#2E7D32",
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    📍 Reporte de Posición Actual ⭐ NUEVO
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Ubicación actual de todas las unidades con direcciones
                    automáticas
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>Incluye:</strong> Geocodificación automática,
                    timestamps en archivos y protección Excel
                  </Typography>
                  <Typography variant="body2">
                    Ideal para: Control instantáneo de flota, reportes
                    ejecutivos, auditorías
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        );

      case "reporte-posicion":
        return (
          <Box>
            <Typography
              variant="h4"
              gutterBottom
              sx={{ fontWeight: "bold", color: "#2E7D32" }}
            >
              📍 Reporte de Posición Actual ⭐ NUEVO
            </Typography>

            <Card
              sx={{
                mb: 3,
                bgcolor: "rgba(76, 175, 80, 0.1)",
                border: "2px solid #4CAF50",
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: "#2E7D32" }}>
                  🚀 ¿Qué es el Reporte de Posición Actual?
                </Typography>
                <Typography variant="body2" paragraph>
                  Esta nueva función permite generar un reporte Excel completo
                  con la ubicación actual de todas las unidades de su flota,
                  incluyendo direcciones automáticas obtenidas mediante
                  geocodificación inteligente.
                </Typography>
                <Typography variant="body2" paragraph>
                  Es la herramienta perfecta para control instantáneo de flota,
                  reportes ejecutivos y auditorías en tiempo real.
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: "#2E7D32" }}>
                  📋 Cómo Generar el Reporte
                </Typography>
                <Box component="ol" sx={{ pl: 2 }}>
                  <li>
                    <Typography variant="body2" paragraph>
                      <strong>Acceso:</strong> Desde el menú principal ☰ →
                      "Informes de Posición"
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" paragraph>
                      <strong>Selección:</strong> Elija entre dos opciones:
                    </Typography>
                    <Box sx={{ ml: 2, mt: 1 }}>
                      <Typography variant="body2" paragraph>
                        • <strong>Unidades seleccionadas:</strong> Solo las
                        unidades que tiene marcadas en el selector de unidades
                        principal. Al combinarlo con el selector de flota,
                        optimice los tiempos de ejecución.
                      </Typography>
                      <Typography variant="body2" paragraph>
                        • <strong>Toda la flota:</strong> Todas las unidades de
                        su cuenta
                      </Typography>
                    </Box>
                  </li>
                  <li>
                    <Typography variant="body2" paragraph>
                      <strong>Procesamiento:</strong> Haga clic en "Solicitar
                      Informe"
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" paragraph>
                      <strong>Geocodificación:</strong> El sistema convertirá
                      automáticamente las coordenadas GPS a direcciones legibles
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" paragraph>
                      <strong>Descarga:</strong> Al finalizar, haga clic en
                      "Exportar Excel"
                    </Typography>
                  </li>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: "#2E7D32" }}>
                  📊 Características del Archivo Excel
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: "#2E7D32", fontWeight: "bold" }}
                  >
                    🕒 Nombre con Timestamp:
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Formato:{" "}
                    <code>
                      Reporte_Posicion_Actual_[Tipo]_DD_MM_AAAA_HH_MM.xlsx
                    </code>
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Ejemplo:{" "}
                    <code>
                      Reporte_Posicion_Actual_Seleccionadas_20_06_2025_14_30.xlsx
                    </code>
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: "#2E7D32", fontWeight: "bold" }}
                  >
                    📋 Contenido del Reporte:
                  </Typography>
                  <Typography variant="body2" paragraph>
                    • Timestamp de generación en formato 24 horas (ej:
                    "20/06/2025, 14:30:55")
                  </Typography>
                  <Typography variant="body2" paragraph>
                    • Datos completos de cada unidad: patente, empresa,
                    ubicación, dirección
                  </Typography>
                  <Typography variant="body2" paragraph>
                    • Coordenadas GPS exactas (latitud y longitud)
                  </Typography>
                  <Typography variant="body2" paragraph>
                    • Estado del motor, velocidad y geocerca
                  </Typography>
                  <Typography variant="body2" paragraph>
                    • Información del conductor asignado
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: "#2E7D32", fontWeight: "bold" }}
                  >
                    🔒 Protección Inteligente:
                  </Typography>
                  <Typography variant="body2" paragraph>
                    • Filtros y ordenamiento habilitados para análisis
                  </Typography>

                  <Typography variant="body2" paragraph>
                    • Permite copiar y analizar datos sin restricciones
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: "#2E7D32" }}>
                  🔔 Sistema de Notificaciones
                </Typography>
                <Typography variant="body2" paragraph>
                  Para mejorar su experiencia, el sistema incluye notificaciones
                  de finalización:
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                  <Chip
                    label="🔊 Sonido de finalización"
                    sx={{ bgcolor: "rgba(76, 175, 80, 0.2)" }}
                    size="small"
                  />
                  <Chip
                    label="🔔 Notificación del navegador"
                    sx={{ bgcolor: "rgba(76, 175, 80, 0.2)" }}
                    size="small"
                  />
                  <Chip
                    label="✅ Confirmación visual"
                    sx={{ bgcolor: "rgba(76, 175, 80, 0.2)" }}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" paragraph>
                  <strong>💡 Tip:</strong> Para reportes grandes (más de 50
                  unidades), el proceso puede tomar varios minutos. Active las
                  notificaciones del navegador para ser avisado cuando termine.
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: "#2E7D32" }}>
                  ⚡ Tiempos de Procesamiento
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: 2,
                  }}
                >
                  <Card variant="outlined">
                    <CardContent>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: "#4CAF50",
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        🚀 Flota Pequeña (≤20 unidades)
                      </Typography>
                      <Typography variant="body2">
                        • Procesamiento: Automático
                      </Typography>
                      <Typography variant="body2">
                        • Tiempo: 30 segundos - 2 minutos
                      </Typography>
                      <Typography variant="body2">
                        • Experiencia: Rápida y fluida
                      </Typography>
                    </CardContent>
                  </Card>

                  <Card variant="outlined">
                    <CardContent>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: "#FF9800",
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        ⏳ Flota Mediana (21-50 unidades)
                      </Typography>
                      <Typography variant="body2">
                        • Procesamiento: Manual
                      </Typography>
                      <Typography variant="body2">
                        • Tiempo: 3-8 minutos
                      </Typography>
                      <Typography variant="body2">
                        • Experiencia: Con estimación de tiempo
                      </Typography>
                    </CardContent>
                  </Card>

                  <Card variant="outlined">
                    <CardContent>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: "#F44336",
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        ⏰ Flota Grande ({">"}50 unidades)
                      </Typography>
                      <Typography variant="body2">
                        • Procesamiento: Manual
                      </Typography>
                      <Typography variant="body2">
                        • Tiempo: 10+ minutos
                      </Typography>
                      <Typography variant="body2">
                        • Experiencia: Con progreso en tiempo real
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </CardContent>
            </Card>

            <Card
              sx={{
                bgcolor: "rgba(76, 175, 80, 0.1)",
                border: "1px solid #4CAF50",
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: "#2E7D32" }}>
                  ✨ Ventajas del Nuevo Sistema
                </Typography>
                <Box sx={{ display: "grid", gap: 1.5 }}>
                  <Typography variant="body2">
                    ✅ <strong>Organización temporal:</strong> Archivos únicos
                    por fecha y hora
                  </Typography>
                  <Typography variant="body2">
                    ✅ <strong>Formato 24 horas:</strong> Sin ambigüedad AM/PM
                  </Typography>

                  <Typography variant="body2">
                    ✅ <strong>Geocodificación inteligente:</strong> Direcciones
                    completas automáticamente
                  </Typography>
                  <Typography variant="body2">
                    ✅ <strong>Análisis facilitado:</strong> Ordenar y filtrar
                    sin restricciones
                  </Typography>
                  <Typography variant="body2">
                    ✅ <strong>Vista móvil optimizada:</strong> Interfaz
                    adaptada para dispositivos móviles
                  </Typography>
                  <Typography variant="body2">
                    ✅ <strong>Notificaciones inteligentes:</strong> Sistema
                    completo de alertas
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        );

      case "contacto":
        return (
          <Box>
            <Typography
              variant="h4"
              gutterBottom
              color="primary"
              sx={{ fontWeight: "bold" }}
            >
              📞 Información de Contacto
            </Typography>

            <Card
              sx={{
                mb: 3,
                bgcolor: "success.50",
                border: "1px solid",
                borderColor: "success.200",
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom color="success.main">
                  💬 WhatsApp - Soporte Principal
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>+54 9 299 466-7595</strong>
                </Typography>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<PhoneIcon />}
                    href="https://wa.me/+5492994667595?text=necesito%20ayuda%20con%20mi%20password"
                    target="_blank"
                  >
                    Ayuda con Contraseña
                  </Button>
                  <Button
                    variant="outlined"
                    color="success"
                    startIcon={<PhoneIcon />}
                    href="https://wa.me/+5492994667595?text=necesito%20ayuda%20con%20mi%20usuario"
                    target="_blank"
                  >
                    Ayuda con Usuario
                  </Button>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🕐 Horarios de Atención
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Soporte:</strong> Horario comercial de lunes a viernes
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Sistema:</strong> Disponible 24/7 los 365 días del año
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🔒 Seguridad y Privacidad
                </Typography>
                <Typography variant="body2" paragraph>
                  • Datos protegidos con encriptación de alta seguridad
                </Typography>
                <Typography variant="body2" paragraph>
                  • Actualizaciones automáticas sin interrupciones
                </Typography>
                <Typography variant="body2">
                  • Cumplimiento de normativas de protección de datos
                </Typography>
              </CardContent>
            </Card>
          </Box>
        );

      case "problemas-comunes":
        return (
          <Box>
            <Typography
              variant="h4"
              gutterBottom
              color="primary"
              sx={{ fontWeight: "bold" }}
            >
              🔧 Problemas Comunes y Soluciones
            </Typography>

            <Box sx={{ display: "grid", gap: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="error">
                    ❌ No veo mis vehículos
                  </Typography>
                  <Box component="ol" sx={{ pl: 2 }}>
                    <li>
                      <Typography variant="body2">
                        Verifique su conexión a internet
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body2">
                        Actualice la página (F5)
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body2">
                        Verifique que los vehículos estén encendidos
                      </Typography>
                    </li>
                  </Box>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="warning.main">
                    🗺️ El mapa no carga
                  </Typography>
                  <Box component="ol" sx={{ pl: 2 }}>
                    <li>
                      <Typography variant="body2">
                        Verifique su conexión
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body2">
                        Pruebe cambiar el tipo de mapa
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body2">
                        Actualice su navegador
                      </Typography>
                    </li>
                  </Box>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="info.main">
                    📊 No puedo generar reportes
                  </Typography>
                  <Box component="ol" sx={{ pl: 2 }}>
                    <li>
                      <Typography variant="body2">
                        Seleccione un vehículo primero
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body2">
                        Verifique las fechas seleccionadas
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body2">
                        Espere a que termine la descarga
                      </Typography>
                    </li>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        );

      case "consejos":
        return (
          <Box>
            <Typography
              variant="h4"
              gutterBottom
              color="primary"
              sx={{ fontWeight: "bold" }}
            >
              💡 Consejos de Uso
            </Typography>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="success.main">
                  🚀 Navegación Eficiente
                </Typography>
                <Typography variant="body2" paragraph>
                  • Use la rueda del mouse o gestos táctiles para zoom
                </Typography>
                <Typography variant="body2" paragraph>
                  • Use el buscador en el selector de unidades
                </Typography>
                <Typography variant="body2">
                  • Los datos se actualizan automáticamente cada 30 segundos
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="info.main">
                  ✅ Mejores Prácticas
                </Typography>
                <Typography variant="body2" paragraph>
                  • Mantenga actualizado su navegador web
                </Typography>
                <Typography variant="body2" paragraph>
                  • Use conexión estable para mejor rendimiento
                </Typography>
                <Typography variant="body2" paragraph>
                  • Cierre sesión al terminar de usar el sistema
                </Typography>
                <Typography variant="body2">
                  • Guarde reportes importantes en su dispositivo
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="secondary.main">
                  📱 Dispositivos Móviles
                </Typography>
                <Typography variant="body2" paragraph>
                  • La interfaz se adapta automáticamente
                </Typography>
                <Typography variant="body2" paragraph>
                  • Use gestos táctiles para navegar el mapa
                </Typography>
                <Typography variant="body2" paragraph>
                  • Rotación de pantalla soportada
                </Typography>
                <Typography variant="body2">
                  • Funciones completas disponibles
                </Typography>
              </CardContent>
            </Card>
          </Box>
        );

      case "historico-avanzado":
        return (
          <Box>
            <Typography
              variant="h4"
              gutterBottom
              sx={{ fontWeight: "bold", color: "green" }}
            >
              📈 Histórico Avanzado
            </Typography>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: "green" }}>
                  🚀 ¿Qué es el Histórico Avanzado?
                </Typography>
                <Typography variant="body2" paragraph>
                  El Histórico Avanzado le permite descargar datos de múltiples
                  días en un solo reporte Excel, ideal para análisis de períodos
                  extensos y comparativas de rendimiento.
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: "green" }}>
                  📋 Cómo Generar un Histórico Avanzado
                </Typography>
                <Box component="ol" sx={{ pl: 2 }}>
                  <li>
                    <Typography variant="body2" paragraph>
                      <strong>Acceder al menú:</strong> Haga clic en el menú ☰ y
                      seleccione "Histórico Avanzado"
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" paragraph>
                      <strong>Seleccionar vehículo:</strong> Asegúrese de tener
                      un vehículo seleccionado en el mapa
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" paragraph>
                      <strong>Elegir fechas:</strong> Seleccione la fecha
                      inicial y final del período a consultar
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" paragraph>
                      <strong>Descargar:</strong> Haga clic en "Descargar" para
                      generar el archivo Excel
                    </Typography>
                  </li>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: "green" }}>
                  📊 Información Incluida en el Reporte
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: "green" }}>
                      Datos de Ubicación:
                    </Typography>
                    <Typography variant="body2">• Coordenadas GPS</Typography>
                    <Typography variant="body2">
                      • Direcciones detalladas
                    </Typography>
                    <Typography variant="body2">
                      • Velocidades registradas
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: "green" }}>
                      Eventos del Vehículo:
                    </Typography>
                    <Typography variant="body2">• Encendido/Apagado</Typography>
                    <Typography variant="body2">
                      • Paradas y arranques
                    </Typography>
                    <Typography variant="body2">
                      • Alertas de velocidad
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: "green" }}>
                      Información Temporal:
                    </Typography>
                    <Typography variant="body2">
                      • Fechas y horarios exactos
                    </Typography>
                    <Typography variant="body2">
                      • Duración de eventos
                    </Typography>
                    <Typography variant="body2">
                      • Tiempo total de operación
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card
              sx={{
                bgcolor: "rgba(0, 128, 0, 0.1)",
                border: "1px solid green",
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: "green" }}>
                  💡 Consejos para Histórico Avanzado
                </Typography>
                <Typography variant="body2" paragraph>
                  • <strong>Límite recomendado:</strong> Máximo 30 días por
                  descarga para optimizar el rendimiento
                </Typography>
                <Typography variant="body2" paragraph>
                  • <strong>Formato Excel:</strong> Compatible con Microsoft
                  Excel, Google Sheets y LibreOffice
                </Typography>
                <Typography variant="body2" paragraph>
                  • <strong>Análisis de datos:</strong> Use filtros y tablas
                  dinámicas para análisis avanzados
                </Typography>
                <Typography variant="body2">
                  • <strong>Tiempo de descarga:</strong> Depende del período
                  seleccionado, sea paciente con períodos largos
                </Typography>
              </CardContent>
            </Card>
          </Box>
        );

      case "informes-parciales":
        return (
          <Box>
            <Typography
              variant="h4"
              gutterBottom
              sx={{ fontWeight: "bold", color: "green" }}
            >
              🏗️ Informes Parciales
            </Typography>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: "green" }}>
                  📋 ¿Qué son los Informes Parciales?
                </Typography>
                <Typography variant="body2" paragraph>
                  Los Informes Parciales son reportes especializados por
                  contrato que permiten generar documentación específica para
                  obras, proyectos o contratos de servicios.
                </Typography>
                <Typography variant="body2" paragraph>
                  Estos reportes son ideales para facturación, control de
                  cumplimiento de contratos y documentación oficial de
                  actividades por período.
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: "green" }}>
                  🚀 Cómo Generar un Informe Parcial
                </Typography>
                <Box component="ol" sx={{ pl: 2 }}>
                  <li>
                    <Typography variant="body2" paragraph>
                      <strong>Acceder al menú:</strong> Haga clic en el menú ☰ y
                      seleccione "Informes Parciales"
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" paragraph>
                      <strong>Seleccionar contrato:</strong> Elija el contrato
                      del cual desea generar el informe
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" paragraph>
                      <strong>Elegir período:</strong> Puede usar vista simple
                      (por mes) o avanzada (rango personalizado)
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" paragraph>
                      <strong>Descargar:</strong> El informe se genera
                      automáticamente en formato Excel
                    </Typography>
                  </li>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: "green" }}>
                  📊 Tipos de Vista Disponibles
                </Typography>
                <Box sx={{ display: "grid", gap: 2 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography
                        variant="subtitle1"
                        sx={{ color: "green", fontWeight: "bold" }}
                      >
                        📅 Vista Simple (Mensual)
                      </Typography>
                      <Typography variant="body2" paragraph>
                        Seleccione un mes específico del contrato
                      </Typography>
                      <Typography variant="body2">
                        • Rápido y fácil de usar
                        <br />
                        • Períodos predefinidos
                        <br />• Ideal para informes mensuales regulares
                      </Typography>
                    </CardContent>
                  </Card>

                  <Card variant="outlined">
                    <CardContent>
                      <Typography
                        variant="subtitle1"
                        sx={{ color: "green", fontWeight: "bold" }}
                      >
                        ⚙️ Vista Avanzada (Rango Personalizado)
                      </Typography>
                      <Typography variant="body2" paragraph>
                        Defina fechas específicas de inicio y fin
                      </Typography>
                      <Typography variant="body2">
                        • Control total sobre el período
                        <br />
                        • Informes parciales de mes
                        <br />• Ideal para períodos específicos de obra
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </CardContent>
            </Card>

            <Card
              sx={{
                bgcolor: "rgba(0, 128, 0, 0.1)",
                border: "1px solid green",
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: "green" }}>
                  📄 Contenido del Informe Parcial
                </Typography>
                <Typography variant="body2" paragraph>
                  • <strong>Resumen ejecutivo</strong> del período seleccionado
                </Typography>
                <Typography variant="body2" paragraph>
                  • <strong>Detalle de actividades</strong> por vehículo y por
                  día
                </Typography>
                <Typography variant="body2" paragraph>
                  • <strong>Estadísticas de uso</strong> (horas de trabajo,
                  kilometraje, etc.)
                </Typography>
                <Typography variant="body2" paragraph>
                  • <strong>Gráficos y tablas</strong> para análisis visual
                </Typography>
                <Typography variant="body2" paragraph>
                  • <strong>Información del contrato</strong> y datos de
                  facturación
                </Typography>
              </CardContent>
            </Card>
          </Box>
        );

      case "certificados":
        return (
          <Box>
            <Typography
              variant="h4"
              gutterBottom
              sx={{ fontWeight: "bold", color: "green" }}
            >
              📜 Certificado de Funcionamiento
            </Typography>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: "green" }}>
                  🏛️ ¿Qué es el Certificado de Funcionamiento?
                </Typography>
                <Typography variant="body2" paragraph>
                  El Certificado de Funcionamiento es un documento oficial en
                  formato PDF que certifica el correcto funcionamiento del
                  equipo GPS instalado en el vehículo durante un período
                  específico.
                </Typography>
                <Typography variant="body2" paragraph>
                  Este documento tiene validez legal y es requerido por
                  organismos oficiales, compañías de seguros y entidades
                  gubernamentales.
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: "green" }}>
                  📋 Cómo Obtener un Certificado
                </Typography>
                <Box component="ol" sx={{ pl: 2 }}>
                  <li>
                    <Typography variant="body2" paragraph>
                      <strong>Seleccionar vehículo:</strong> Haga clic en
                      cualquier vehículo del mapa para seleccionarlo
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" paragraph>
                      <strong>Acceder al menú:</strong> Haga clic en el menú ☰ y
                      seleccione "Certificado de Funcionamiento"
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" paragraph>
                      <strong>Generar certificado:</strong> El sistema generará
                      automáticamente el documento en PDF
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" paragraph>
                      <strong>Descargar:</strong> El certificado se descargará
                      directamente a su dispositivo
                    </Typography>
                  </li>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: "green" }}>
                  📄 Información Incluida en el Certificado
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: "green" }}>
                      Datos del Vehículo:
                    </Typography>
                    <Typography variant="body2">
                      • Patente del vehículo
                    </Typography>
                    <Typography variant="body2">• Marca y modelo</Typography>
                    <Typography variant="body2">
                      • Empresa propietaria
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: "green" }}>
                      Datos del Equipo:
                    </Typography>
                    <Typography variant="body2">
                      • ID del dispositivo GPS
                    </Typography>
                    <Typography variant="body2">
                      • Estado de funcionamiento
                    </Typography>
                    <Typography variant="body2">
                      • Fecha de instalación
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: "green" }}>
                      Validación Oficial:
                    </Typography>
                    <Typography variant="body2">• Fecha de emisión</Typography>
                    <Typography variant="body2">• Firma digital</Typography>
                    <Typography variant="body2">
                      • Número de certificado
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card
              sx={{
                mb: 3,
                bgcolor: "rgba(255, 193, 7, 0.1)",
                border: "1px solid orange",
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: "orange" }}>
                  ⚠️ Requisitos Importantes
                </Typography>
                <Typography variant="body2" paragraph>
                  • <strong>Vehículo seleccionado:</strong> Debe tener un
                  vehículo seleccionado en el mapa
                </Typography>
                <Typography variant="body2" paragraph>
                  • <strong>Equipo activo:</strong> El dispositivo GPS debe
                  estar funcionando correctamente
                </Typography>
                <Typography variant="body2" paragraph>
                  • <strong>Datos recientes:</strong> El vehículo debe haber
                  reportado en las últimas 24 horas
                </Typography>
              </CardContent>
            </Card>

            <Card
              sx={{
                bgcolor: "rgba(0, 128, 0, 0.1)",
                border: "1px solid green",
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: "green" }}>
                  📋 Usos del Certificado
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                  <Chip
                    label="Trámites municipales"
                    sx={{ bgcolor: "rgba(0, 128, 0, 0.2)" }}
                    size="small"
                  />
                  <Chip
                    label="Seguros vehiculares"
                    sx={{ bgcolor: "rgba(0, 128, 0, 0.2)" }}
                    size="small"
                  />
                  <Chip
                    label="Verificaciones técnicas"
                    sx={{ bgcolor: "rgba(0, 128, 0, 0.2)" }}
                    size="small"
                  />
                  <Chip
                    label="Auditorías de flota"
                    sx={{ bgcolor: "rgba(0, 128, 0, 0.2)" }}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" paragraph>
                  • <strong>Validez legal:</strong> Documento con firma digital
                  y validez oficial
                </Typography>
                <Typography variant="body2" paragraph>
                  • <strong>Formato estándar:</strong> PDF compatible con todos
                  los organismos
                </Typography>
                <Typography variant="body2">
                  • <strong>Disponibilidad inmediata:</strong> Generación
                  instantánea 24/7
                </Typography>
              </CardContent>
            </Card>
          </Box>
        );

      case "flotas":
        return (
          <Box>
            <Typography
              variant="h4"
              gutterBottom
              sx={{ fontWeight: "bold", color: "green" }}
            >
              🏢 Gestión de Flotas
            </Typography>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: "green" }}>
                  🚗 ¿Qué son las Flotas?
                </Typography>
                <Typography variant="body2" paragraph>
                  Las flotas le permiten agrupar vehículos por criterios
                  específicos como obras, proyectos, zonas geográficas o tipos
                  de servicio para una gestión más eficiente.
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: "green" }}>
                  📋 Selector de Flotas
                </Typography>
                <Typography variant="body2" paragraph>
                  En la pantalla principal encontrará el ícono de vehículo 🚗
                  junto al selector de unidades:
                </Typography>
                <Box component="ol" sx={{ pl: 2 }}>
                  <li>
                    <Typography variant="body2">
                      Haga clic en el ícono de vehículo
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Seleccione la flota deseada de la lista
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Automáticamente se mostrarán solo los vehículos de esa
                      flota
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Para quitar la selección, haga clic en la X
                    </Typography>
                  </li>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: "green" }}>
                  ⚙️ Administración de Flotas
                </Typography>
                <Typography variant="body2" paragraph>
                  Desde el menú ☰ → "Flotas", puede administrar sus flotas:
                </Typography>
                <Box sx={{ display: "grid", gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: "green" }}>
                      ✅ Crear Flotas Nuevas:
                    </Typography>
                    <Typography variant="body2">
                      • Asigne un nombre descriptivo (mínimo 5 caracteres)
                    </Typography>
                    <Typography variant="body2">
                      • Las flotas se crean vacías inicialmente
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: "green" }}>
                      🔄 Gestionar Vehículos:
                    </Typography>
                    <Typography variant="body2">
                      • Agregue vehículos de la lista "Disponibles"
                    </Typography>
                    <Typography variant="body2">
                      • Quite vehículos de la flota cuando sea necesario
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: "green" }}>
                      🗑️ Eliminar Flotas:
                    </Typography>
                    <Typography variant="body2">
                      • Seleccione la flota a eliminar
                    </Typography>
                    <Typography variant="body2">
                      • Los vehículos vuelven a estar disponibles
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card
              sx={{
                bgcolor: "rgba(0, 128, 0, 0.1)",
                border: "1px solid green",
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: "green" }}>
                  💡 Casos de Uso Recomendados
                </Typography>
                <Typography variant="body2" paragraph>
                  • <strong>Por obra/proyecto:</strong> "Obra Centro Comercial",
                  "Proyecto Ruta 22"
                </Typography>
                <Typography variant="body2" paragraph>
                  • <strong>Por zona geográfica:</strong> "Zona Norte", "Región
                  Patagonia"
                </Typography>
                <Typography variant="body2" paragraph>
                  • <strong>Por tipo de servicio:</strong> "Transporte Carga",
                  "Servicios Urbanos"
                </Typography>
                <Typography variant="body2">
                  • <strong>Por cliente:</strong> "Cliente ABC", "Contrato XYZ"
                </Typography>
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return (
          <Typography variant="body1">
            Seleccione una sección del menú para ver el contenido.
          </Typography>
        );
    }
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="user-manual-title">
      <Paper
        elevation={10}
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "95%", sm: "90%", md: "85%", lg: "80%" },
          height: { xs: "95%", sm: "90%" },
          bgcolor: "background.paper",
          borderRadius: "16px",
          boxShadow: 24,
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          overflow: "hidden",
        }}
      >
        {/* Sidebar Navigation */}
        <Box
          sx={{
            width: isMobile ? "100%" : "320px",
            height: isMobile ? "auto" : "100%",
            borderRight: isMobile ? "none" : "1px solid",
            borderBottom: isMobile ? "1px solid" : "none",
            borderColor: "divider",
            bgcolor: "grey.50",
            display: "flex",
            flexDirection: "column",
            maxHeight: isMobile ? "200px" : "100%",
            overflowY: "auto",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              borderBottom: "1px solid",
              borderColor: "divider",
              bgcolor: "green",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                fontSize: isMobile ? "1rem" : "1.25rem",
              }}
            >
              📚 Manual de Usuario
            </Typography>
            {isMobile && (
              <IconButton onClick={onClose} sx={{ color: "white" }}>
                <CloseIcon />
              </IconButton>
            )}
          </Box>

          {/* Navigation List */}
          <List dense sx={{ flexGrow: 1, p: 0 }}>
            {menuSections.map((section) => (
              <React.Fragment key={section.id}>
                <ListItem disablePadding>
                  <ListItemButton
                    selected={selectedSection === section.id}
                    onClick={() => {
                      if (section.hasChildren) {
                        handleSectionToggle(section.id);
                      } else {
                        setSelectedSection(section.id);
                      }
                    }}
                    sx={{
                      py: 1,
                      "&.Mui-selected": {
                        bgcolor: "primary.100",
                        borderRight: "4px solid",
                        borderColor: "primary.main",
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {section.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={section.title}
                      primaryTypographyProps={{
                        fontSize: "0.9rem",
                        fontWeight:
                          selectedSection === section.id ? "bold" : "normal",
                      }}
                    />
                    {section.hasChildren &&
                      (expandedSections[section.id] ? (
                        <ExpandLess />
                      ) : (
                        <ExpandMore />
                      ))}
                  </ListItemButton>
                </ListItem>

                {section.hasChildren && (
                  <Collapse
                    in={expandedSections[section.id]}
                    timeout="auto"
                    unmountOnExit
                  >
                    <List component="div" disablePadding>
                      {section.children.map((child) => (
                        <ListItem key={child.id} disablePadding>
                          <ListItemButton
                            selected={selectedSection === child.id}
                            onClick={() => setSelectedSection(child.id)}
                            sx={{
                              pl: 4,
                              py: 0.5,
                              "&.Mui-selected": {
                                bgcolor: "primary.50",
                                borderRight: "3px solid",
                                borderColor: "primary.main",
                              },
                            }}
                          >
                            <ListItemText
                              primary={child.title}
                              primaryTypographyProps={{
                                fontSize: "0.8rem",
                                fontWeight:
                                  selectedSection === child.id
                                    ? "bold"
                                    : "normal",
                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                )}
              </React.Fragment>
            ))}
          </List>
        </Box>

        {/* Main Content */}
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          {/* Content Header */}
          {!isMobile && (
            <Box
              sx={{
                p: 2,
                borderBottom: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: "bold", color: "green" }}
                >
                  FullControl GPS
                </Typography>
                <Chip
                  label="v2025"
                  size="small"
                  sx={{ bgcolor: "green", color: "white" }}
                />
              </Box>
              <IconButton onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </Box>
          )}

          {/* Content Body */}
          <Box
            sx={{
              flexGrow: 1,
              p: { xs: 2, sm: 3, md: 4 },
              overflowY: "auto",
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(0,0,0,0.3)",
                borderRadius: "4px",
              },
            }}
          >
            {renderContent()}
          </Box>

          {/* Footer */}
          <Box
            sx={{
              p: 2,
              borderTop: "1px solid",
              borderColor: "divider",
              bgcolor: "grey.50",
              textAlign: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              © FullControlGPS 2025 | Manual actualizado: Junio 2025
            </Typography>
            <Link
              href="https://wa.me/+5492994667595"
              target="_blank"
              sx={{ fontSize: "0.8rem" }}
            >
              ¿Necesita más ayuda? Contáctenos por WhatsApp
            </Link>
          </Box>
        </Box>
      </Paper>
    </Modal>
  );
};

export default UserManualModal;
