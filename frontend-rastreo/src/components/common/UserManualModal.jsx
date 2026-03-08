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
  Drawer,
  AppBar,
  Toolbar,
} from "@mui/material";
import {
  Close as CloseIcon,
  ExpandLess,
  ExpandMore,
  Help as HelpIcon,
  Computer as ComputerIcon,
  Map as MapIcon,
  History as HistoryIcon,
  WorkHistory as WorkHistoryIcon,
  Assessment as ReportIcon,
  Settings as SettingsIcon,
  Phone as PhoneIcon,
  GetApp as DownloadIcon,
  Security as SecurityIcon,
  Update as UpdateIcon,
  CropFree as CropFreeIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";


const UserManualModal = ({ open, onClose }) => {
  const [selectedSection, setSelectedSection] = useState("inicio");
  const [expandedSections, setExpandedSections] = useState({
    funciones: true,
    reportes: true,
    soporte: false,
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleSectionToggle = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSectionSelect = (sectionId) => {
    setSelectedSection(sectionId);
    if (isMobile) {
      setMobileMenuOpen(false);
    }
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
        { id: "alertas-ralenti", title: "⭐ Alertas de Ralentí" },
        { id: "alertas-infracciones", title: "🚨 Alertas de Infracciones" },
        {
          id: "alertas-conduccion-agresiva",
          title: "🟣 Alertas de Conducción Agresiva",
        },
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
      id: "historico-conductor",
      title: " Histórico por Conductor",
      icon: <WorkHistoryIcon />,
      content: "historico-conductor",
    },
    {
      id: "reportes",
      title: "Reportes y Descargas",
      icon: <ReportIcon />,
      hasChildren: true,
      children: [
        { id: "tipos-reportes", title: "Tipos de Reportes" },
        { id: "reporte-posicion", title: "⭐ Reporte de Posición Actual" },
        { id: "ralenti-por-movil", title: "📊 Ralentí por Movil" },
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
                      � Histórico por conductor (NUEVA funcionalidad)
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      �📊 Generar reportes detallados
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
                  <li>
                    <Typography variant="body2" sx={{ color: "#25D366", fontWeight: "bold" }}>
                      📱 Notificaciones WhatsApp automáticas (NUEVO)
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
              <Chip
                icon="📱"
                label="Notificaciones WhatsApp"
                sx={{ bgcolor: "#25D366", color: "white", fontWeight: "bold" }}
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
                  href="https://wa.me/+5492994119010?text=necesito%20ayuda%20con%20mi%20password"
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

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 1,
                    color: "#2E7D32"
                  }}
                >
                  👨‍💼 Histórico por Conductor (NUEVO)
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Nueva funcionalidad:</strong> Consulte históricos filtrados
                  por conductor específico:
                </Typography>
                <Box component="ol" sx={{ pl: 2 }}>
                  <li>
                    <Typography variant="body2">
                      Haga clic en el botón 👨‍💼 (junto al selector de flotas)
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Seleccione el conductor deseado
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Elija el período (mes o rango de fechas)
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Seleccione vehículo y fecha para ver el recorrido
                    </Typography>
                  </li>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                  ⚠️ Requiere conductores previamente asignados en el sistema
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <CropFreeIcon sx={{ color: "primary.main" }} />
                  Selección por Área (NUEVO)
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Nueva funcionalidad:</strong> Seleccione múltiples
                  unidades dibujando un área en el mapa:
                </Typography>
                <Box component="ol" sx={{ pl: 2 }}>
                  <li>
                    <Typography
                      variant="body2"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        flexWrap: "wrap",
                      }}
                    >
                      Haga clic en el botón con ícono{" "}
                      <CropFreeIcon
                        sx={{ fontSize: "1rem", color: "primary.main" }}
                      />{" "}
                      (junto al selector de flotas)
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Haga clic y arrastre en el mapa para dibujar un rectángulo
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Las unidades dentro del área se seleccionarán
                      automáticamente
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Presione ESC para cancelar el dibujo en cualquier momento
                    </Typography>
                  </li>
                </Box>

                <Typography
                  variant="subtitle2"
                  sx={{ mt: 2, mb: 1, fontWeight: "bold" }}
                >
                  Límites de selección:
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  <li>
                    <Typography variant="body2" color="success.main">
                      <strong>1-75 unidades:</strong> Selección automática sin
                      advertencia
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" color="warning.main">
                      <strong>76-150 unidades:</strong> Muestra advertencia pero
                      permite continuar
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" color="error.main">
                      <strong>Más de 150 unidades:</strong> No permite la
                      selección (para mantener rendimiento)
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
                  ✅ Tips Útiles
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  <li>
                    <Typography variant="body2">
                      Use el campo de búsqueda para encontrar rápidamente
                      vehículos específicos por patente o nombre.
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      La selección por área es ideal para monitorear vehículos
                      en una zona específica (depósitos, rutas, ciudades).
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Si el área es muy grande, aumente el zoom del mapa para
                      reducir la cantidad de unidades seleccionadas.
                    </Typography>
                  </li>
                </Box>
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

      case "alertas-ralenti":
        return (
          <Box>
            <Typography
              variant="h4"
              gutterBottom
              color="primary"
              sx={{ fontWeight: "bold" }}
            >
              ⚡ Alertas de Unidades en Ralentí ⭐ NUEVO
            </Typography>

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
                  🎯 ¿Qué es el Sistema de Alertas de Ralentí?
                </Typography>
                <Typography variant="body2" paragraph>
                  El sistema detecta automáticamente vehículos que se encuentran
                  en estado de ralentí (motor encendido pero sin movimiento),
                  permitiendo optimizar el consumo de combustible y mejorar la
                  gestión operativa de su flota.
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📍 Ubicación Visual
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Posición:</strong> Panel flotante en la parte
                  izquierda de la pantalla
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Estados visuales:</strong>
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  <li>
                    <Typography variant="body2">
                      <strong>Contraído:</strong> Círculo con ícono + badge rojo
                      con número
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      <strong>Expandido en hover:</strong> Muestra "Unidades en
                      ralentí"
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      <strong>Lista desplegada:</strong> Panel completo con
                      detalles
                    </Typography>
                  </li>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🔍 Detección Automática
                </Typography>
                <Typography variant="body2" paragraph>
                  El sistema identifica unidades en ralentí basándose en:
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  <li>
                    <Typography variant="body2">
                      🟠 <strong>"Inicio Ralenti"</strong> → Color naranja
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      🟠 <strong>"Reporte en Ralenti"</strong> → Naranja (&lt; 5
                      min) / 🔴 Rojo (≥ 5 min)
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      🔘 <strong>"Fin de Ralenti"</strong> → Gris (si motor
                      encendido)
                    </Typography>
                  </li>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📋 Información Mostrada
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Formato de 2 líneas por unidad:</strong>
                </Typography>
                <Box
                  sx={{
                    bgcolor: "grey.100",
                    p: 2,
                    borderRadius: 1,
                    fontFamily: "monospace",
                    mb: 2,
                  }}
                >
                  <Typography variant="body2" component="div">
                    AF-162-EE - OPS
                    SRL&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[00:17:12]
                  </Typography>
                  <Typography variant="body2" component="div">
                    [Reporte en
                    Ralentí]&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;👤
                    Luccioni Jesus
                  </Typography>
                </Box>
                <Typography variant="body2">
                  <strong>Primera línea:</strong> Patente - Empresa + tiempo
                  transcurrido
                  <br />
                  <strong>Segunda línea:</strong> Estado actual + conductor
                  asignado
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🎯 Funciones Interactivas
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Selección de Unidades:</strong>
                </Typography>
                <Box component="ol" sx={{ pl: 2, mb: 2 }}>
                  <li>
                    <Typography variant="body2">
                      Haga clic en cualquier unidad de la lista
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      El mapa se centrará automáticamente en esa unidad
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Se mostrará la información completa
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Mantiene otras unidades seleccionadas previamente
                    </Typography>
                  </li>
                </Box>

                <Typography variant="body2" paragraph>
                  <strong>Ordenamiento Inteligente:</strong>
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                  <li>
                    <Typography variant="body2">
                      <strong>Por tiempo</strong> (predeterminado): Unidades con
                      más tiempo arriba
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      <strong>Por patente:</strong> Orden alfabético
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Botón visible solo cuando la lista está abierta
                    </Typography>
                  </li>
                </Box>

                <Typography variant="body2" paragraph>
                  <strong>Sistema de Ignorados:</strong>
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  <li>
                    <Typography variant="body2">
                      👁️ <strong>Ícono de ojo:</strong> Ocultar temporalmente
                      una unidad
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      👁️‍🗨️ <strong>Ojo tachado:</strong> Mostrar unidades ocultas
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Unidades ignoradas aparecen al final en gris
                    </Typography>
                  </li>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ⏱️ Contador de Tiempo Avanzado
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  <li>
                    <Typography variant="body2">
                      <strong>Basado en GPS:</strong> No depende de hora local
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      <strong>Formato reloj:</strong> HH:MM:SS (ej: 01:23:45)
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      <strong>Cambio automático:</strong> Naranja → Rojo a los 5
                      minutos
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      <strong>Persistencia:</strong> Se mantiene durante la
                      sesión
                    </Typography>
                  </li>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  💼 Casos de Uso Prácticos
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Para Gestores de Flota:</strong>
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                  <li>
                    <Typography variant="body2">
                      Identificar vehículos consumiendo combustible
                      innecesariamente
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Optimizar operaciones reduciendo tiempos de espera
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Monitoreo en tiempo real de eficiencia operativa
                    </Typography>
                  </li>
                </Box>

                <Typography variant="body2" paragraph>
                  <strong>Para Supervisores:</strong>
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  <li>
                    <Typography variant="body2">
                      Contactar conductores cuando excedan 5 minutos
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Planificar rutas más eficientes
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Generar reportes de optimización de combustible
                    </Typography>
                  </li>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: "#25D366", display: "flex", alignItems: "center", gap: 1 }}>
                  📱 Notificaciones WhatsApp ⭐ NUEVO
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Cada unidad en ralentí incluye un botón de WhatsApp</strong> para 
                  comunicación inmediata con conductores o administradores:
                </Typography>
                
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, fontWeight: "bold" }}>
                  Estados del Botón:
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                  <li>
                    <Typography variant="body2" sx={{ color: "#4CAF50" }}>
                      🟢 <strong>Verde:</strong> Conductor tiene teléfono registrado - Envía mensaje directo
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" sx={{ color: "#FF9800" }}>
                      🟠 <strong>Naranja:</strong> Sin teléfono del conductor - Solicita al administrador
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" sx={{ color: "#9E9E9E" }}>
                      ⚪ <strong>Gris:</strong> Datos no disponibles - Botón deshabilitado
                    </Typography>
                  </li>
                </Box>

                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, fontWeight: "bold" }}>
                  Mensajes Automáticos:
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                  <li>
                    <Typography variant="body2">
                      <strong>Para conductores:</strong> "Estimado [Nombre], detectamos que la unidad [Patente] 
                      lleva [Tiempo] en estado ralentí. ¿Podrías indicarnos qué está pasando?"
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      <strong>Para administradores:</strong> "Necesitamos el teléfono del conductor [Nombre], 
                      para contactarlo por una alerta de RALENTÍ en la unidad [Patente]."
                    </Typography>
                  </li>
                </Box>

                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, fontWeight: "bold" }}>
                  Funciones Adicionales:
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  <li>
                    <Typography variant="body2">
                      ⏱️ <strong>Cooldown de 10 segundos</strong> para evitar spam
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      📊 <strong>Incluye datos contextuales:</strong> tiempo en ralentí, ubicación, conductor
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
                  💡 Consejos de Uso
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  <li>
                    <Typography variant="body2">
                      <strong>Monitoree regularmente</strong> durante horarios
                      operativos
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      <strong>Tiempo objetivo:</strong> Máximo 3-5 minutos in
                      ralentí por parada
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      <strong>Comunicación proactiva:</strong> Contactar antes
                      de llegar a rojo
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      <strong>Use la función ignorar</strong> para unidades que
                      requieren espera justificada
                    </Typography>
                  </li>
                </Box>
              </CardContent>
            </Card>
          </Box>
        );

      case "alertas-infracciones":
        return (
          <Box>
            <Typography
              variant="h4"
              gutterBottom
              color="primary"
              sx={{ fontWeight: "bold" }}
            >
              🚨 Alertas de Unidades en Infracción ⭐ NUEVO
            </Typography>

            <Card
              sx={{
                mb: 3,
                bgcolor: "error.50",
                border: "1px solid",
                borderColor: "error.200",
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom color="error.main">
                  🎯 ¿Qué es el Sistema de Alertas de Infracciones?
                </Typography>
                <Typography variant="body2" paragraph>
                  El sistema detecta automáticamente vehículos que cometen
                  infracciones de velocidad en tiempo real, permitiendo una
                  respuesta inmediata para mejorar la seguridad vial y el
                  cumplimiento normativo de su flota.
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📍 Ubicación Visual
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Posición:</strong> Panel flotante debajo de las
                  alertas de ralentí
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Estados visuales:</strong>
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  <li>
                    <Typography variant="body2">
                      <strong>Contraído:</strong> Círculo con ícono de alerta +
                      contador de infracciones
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      <strong>Lista desplegada:</strong> Panel con infracciones
                      activas e historial
                    </Typography>
                  </li>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🔍 Detección Automática
                </Typography>
                <Typography variant="body2" paragraph>
                  El sistema identifica infracciones basándose en:
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  <li>
                    <Typography variant="body2">
                      🔴 <strong>"Infracción de velocidad"</strong> → Color rojo
                      (alta severidad)
                    </Typography>
                  </li>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📋 Sistema de Doble Lista
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>🚨 Infracciones Activas (sección superior):</strong>
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                  <li>
                    <Typography variant="body2">
                      Unidades actualmente en infracción
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Información en tiempo real del estado
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Fondo rojo para máxima visibilidad
                    </Typography>
                  </li>
                </Box>

                <Typography variant="body2" paragraph>
                  <strong>
                    📋 Historial de Infracciones (sección inferior):
                  </strong>
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  <li>
                    <Typography variant="body2">
                      Última Infracción ya finalizada.
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Velocidad máxima alcanzada y duración
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Botones para eliminar individual o limpiar todo
                    </Typography>
                  </li>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📊 Información Detallada en Historial
                </Typography>
                <Box
                  sx={{
                    bgcolor: "grey.100",
                    p: 2,
                    borderRadius: 1,
                    fontFamily: "monospace",
                    mb: 2,
                  }}
                >
                  AB-123-CD - EMPRESA EJEMPLO
                  <br />
                  Max 87 km/h ⏱️ 02:35 👤 Juan Pérez
                </Box>
                <Box component="ul" sx={{ pl: 2 }}>
                  <li>
                    <Typography variant="body2">
                      <strong>Max XX km/h:</strong> Velocidad máxima durante la
                      infracción
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      <strong>⏱️ MM:SS:</strong> Duración total de la infracción
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      <strong>👤 Conductor:</strong> Operador asignado al
                      vehículo
                    </Typography>
                  </li>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ⚡ Funcionalidades Avanzadas
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>🔄 Persistencia Inteligente:</strong>
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                  <li>
                    <Typography variant="body2">
                      Historial se mantiene durante la sesión
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Datos guardados en localStorage
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Limpieza automática después de 24 horas
                    </Typography>
                  </li>
                </Box>

                <Typography variant="body2" paragraph>
                  <strong>🎯 Gestión de Infracciones Múltiples:</strong>
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                  <li>
                    <Typography variant="body2">
                      Actualiza datos cuando la misma unidad comete otra
                      infracción
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Siempre muestra la infracción más reciente
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Evita duplicados en el historial
                    </Typography>
                  </li>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📈 Casos de Uso Recomendados
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Para Operadores:</strong>
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                  <li>
                    <Typography variant="body2">
                      Monitoreo en tiempo real de infracciones críticas
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Respuesta inmediata ante excesos de velocidad
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Verificación de cumplimiento normativo
                    </Typography>
                  </li>
                </Box>

                <Typography variant="body2" paragraph>
                  <strong>Para Supervisores:</strong>
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                  <li>
                    <Typography variant="body2">
                      Análisis de patrones de conducta por conductor
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Identificación de zonas problemáticas
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Planificación de capacitación específica
                    </Typography>
                  </li>
                </Box>

                <Typography variant="body2" paragraph>
                  <strong>Para Gerencia:</strong>
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  <li>
                    <Typography variant="body2">
                      Métricas de seguridad vial
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Compliance con regulaciones de transporte
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Reducción de riesgos y responsabilidad civil
                    </Typography>
                  </li>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: "#25D366", display: "flex", alignItems: "center", gap: 1 }}>
                  📱 Notificaciones WhatsApp ⭐ NUEVO
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Cada infracción incluye un botón de WhatsApp</strong> para 
                  comunicación inmediata durante infracciones activas y históricas:
                </Typography>
                
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, fontWeight: "bold" }}>
                  Estados del Botón:
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                  <li>
                    <Typography variant="body2" sx={{ color: "#4CAF50" }}>
                      🟢 <strong>Verde:</strong> Conductor con teléfono - Mensaje directo sobre la infracción
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" sx={{ color: "#FF9800" }}>
                      🟠 <strong>Naranja:</strong> Sin teléfono del conductor - Solicita al administrador
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" sx={{ color: "#9E9E9E" }}>
                      ⚪ <strong>Gris:</strong> Datos no disponibles - Botón deshabilitado
                    </Typography>
                  </li>
                </Box>

                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, fontWeight: "bold" }}>
                  Mensajes con Información Detallada:
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                  <li>
                    <Typography variant="body2">
                      <strong>Para conductores:</strong> "Estimado [Nombre], detectamos una infracción de velocidad 
                      en la unidad [Patente] alcanzando [Velocidad] km/h en [Ubicación] con duración de [Tiempo]."
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      <strong>Para administradores:</strong> "Necesitamos el teléfono del conductor [Nombre], 
                      para contactarlo por una INFRACCIÓN de velocidad ([Velocidad] km/h) con duración de [Tiempo]."
                    </Typography>
                  </li>
                </Box>

                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, fontWeight: "bold" }}>
                  Datos Incluidos en Mensajes:
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                  <li>
                    <Typography variant="body2">
                      🏎️ <strong>Velocidad máxima alcanzada</strong> durante la infracción
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      ⏱️ <strong>Duración completa</strong> de la infracción
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      🕐 <strong>Hora precisa</strong> del evento
                    </Typography>
                  </li>
                </Box>

                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, fontWeight: "bold" }}>
                  Disponible en:
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  <li>
                    <Typography variant="body2">
                      🚨 <strong>Infracciones activas:</strong> Para respuesta inmediata
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      📋 <strong>Historial de infracciones:</strong> Para seguimiento y capacitación
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
                  💡 Consejos de Uso
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  <li>
                    <Typography variant="body2">
                      <strong>Respuesta inmediata:</strong> Contactar al
                      conductor durante infracciones activas
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      <strong>Análisis del historial:</strong> Revisar
                      velocidades máximas y duraciones
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      <strong>Gestión del historial:</strong> Limpiar
                      periódicamente para mantener relevancia
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      <strong>Educación preventiva:</strong> Usar datos para
                      capacitación de conductores
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      <strong>Solo desktop:</strong> Funcionalidad optimizada
                      para pantallas grandes
                    </Typography>
                  </li>
                </Box>
              </CardContent>
            </Card>
          </Box>
        );

      case "alertas-conduccion-agresiva":
        return (
          <Box>
            <Typography
              variant="h4"
              gutterBottom
              color="primary"
              sx={{ fontWeight: "bold" }}
            >
              🟣 Alertas de Conducción Agresiva ⭐ NUEVO
            </Typography>

            <Card
              sx={{
                mb: 3,
                bgcolor: "rgba(156, 39, 176, 0.1)",
                border: "1px solid",
                borderColor: "#9c27b0",
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: "#9c27b0" }}>
                  🎯 ¿Qué es el Sistema de Alertas de Conducción Agresiva?
                </Typography>
                <Typography variant="body2" paragraph>
                  El sistema detecta automáticamente conductores que acumulan
                  múltiples preavisos de manejo agresivo durante el día,
                  permitiendo identificar patrones de conducta no defensiva y
                  tomar medidas preventivas para mejorar la seguridad vial.
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: "#9c27b0" }}>
                  🎨 Sistema de Colores por Severidad
                </Typography>
                <Box sx={{ display: "grid", gap: 2 }}>
                  <Box
                    sx={{
                      p: 1,
                      bgcolor: "rgba(76, 175, 80, 0.1)",
                      borderRadius: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "#4caf50", fontWeight: "bold" }}
                    >
                      🟢 Nivel Bajo (Menos de 10 preavisos)
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 1,
                      bgcolor: "rgba(255, 152, 0, 0.1)",
                      borderRadius: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "#f57c00", fontWeight: "bold" }}
                    >
                      🟡 Nivel Medio (10-14 preavisos)
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 1,
                      bgcolor: "rgba(211, 47, 47, 0.1)",
                      borderRadius: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "#d32f2f", fontWeight: "bold" }}
                    >
                      🔴 Nivel Alto (15+ preavisos)
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: "#9c27b0" }}>
                  📋 Información del Ranking
                </Typography>
                <Typography variant="body2" paragraph>
                  • <strong>Nombre del conductor</strong> con número de
                  preavisos
                </Typography>
                <Typography variant="body2" paragraph>
                  • <strong>Hora del último preaviso</strong> en tiempo real
                </Typography>
                <Typography variant="body2" paragraph>
                  • <strong>Vehículo actual</strong> (patente y marca)
                </Typography>
                <Typography variant="body2" paragraph>
                  • <strong>Reset automático</strong> diario a las 00:00
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: "#25D366", display: "flex", alignItems: "center", gap: 1 }}>
                  📱 Notificaciones WhatsApp ⭐ NUEVO
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Cada conductor con alertas de conducción agresiva incluye un botón de WhatsApp</strong> 
                  para comunicación directa sobre el patrón de conducta:
                </Typography>
                
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, fontWeight: "bold" }}>
                  Estados del Botón:
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                  <li>
                    <Typography variant="body2" sx={{ color: "#4CAF50" }}>
                      🟢 <strong>Verde:</strong> Conductor con teléfono registrado - Mensaje directo
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" sx={{ color: "#FF9800" }}>
                      🟠 <strong>Naranja:</strong> Sin teléfono del conductor - Solicita al administrador
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" sx={{ color: "#9E9E9E" }}>
                      ⚪ <strong>Gris:</strong> Datos no disponibles - Botón deshabilitado
                    </Typography>
                  </li>
                </Box>

                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, fontWeight: "bold" }}>
                  Mensajes Adaptativos por Severidad:
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                  <li>
                    <Typography variant="body2">
                      <strong>Para conductores:</strong> "Estimado [Nombre], detectamos que llevas [Cantidad] 
                      eventos de conducción agresiva en el día de hoy en la unidad [Patente]. 
                      Te pedimos que conduzcas defensivamente y no superes los límites de velocidad."
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      <strong>Para administradores:</strong> "Necesitamos el teléfono del conductor [Nombre], 
                      para contactarlo por una alerta de CONDUCCIÓN AGRESIVA en la unidad [Patente]."
                    </Typography>
                  </li>
                </Box>

                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, fontWeight: "bold" }}>
                  Información Contextual:
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                  <li>
                    <Typography variant="body2">
                      📊 <strong>Cantidad específica</strong> de eventos acumulados
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      🚗 <strong>Vehículo actual</strong> donde ocurrieron los eventos
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      📅 <strong>Período del día</strong> para contexto temporal
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      🎯 <strong>Mensaje educativo</strong> para promover conducción defensiva
                    </Typography>
                  </li>
                </Box>

                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, fontWeight: "bold" }}>
                  Uso Estratégico:
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  <li>
                    <Typography variant="body2">
                      📞 <strong>Intervención temprana:</strong> Contactar antes de llegar a niveles críticos
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      🎓 <strong>Capacitación proactiva:</strong> Momento ideal para recordar buenas prácticas
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      📋 <strong>Documentación:</strong> Registro de comunicaciones por temas de seguridad
                    </Typography>
                  </li>
                </Box>
              </CardContent>
            </Card>

            <Card
              sx={{
                bgcolor: "rgba(156, 39, 176, 0.1)",
                border: "1px solid #9c27b0",
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: "#9c27b0" }}>
                  💡 Casos de Uso
                </Typography>
                <Typography variant="body2" paragraph>
                  • <strong>Supervisores:</strong> Identificación temprana de
                  conductores de riesgo
                </Typography>
                <Typography variant="body2" paragraph>
                  • <strong>RRHH:</strong> Evaluaciones objetivas y programas de
                  capacitación
                </Typography>
                <Typography variant="body2" paragraph>
                  • <strong>Seguridad:</strong> Prevención proactiva de
                  infracciones y accidentes
                </Typography>
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

      case "historico-conductor":
        return (
          <Box>
            <Typography
              variant="h4"
              gutterBottom
              color="primary"
              sx={{ fontWeight: "bold" }}
            >
               Histórico por Conductor
            </Typography>

            <Card
              sx={{
                mb: 3,
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
                  🆕 Nueva Funcionalidad
                </Typography>
                <Typography variant="body2" paragraph>
                  Consulte el historial de recorridos filtrado por conductor específico.
                  Esta funcionalidad permite rastrear qué conductor manejó cada vehículo
                  en períodos determinados.
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🚀 Acceder al Histórico por Conductor
                </Typography>
                <Box component="ol" sx={{ pl: 2 }}>
                  <li>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Haga clic en el botón{" "}
                      <strong style={{ color: "#2E7D32" }}>👨‍💼</strong> (Histórico por Conductor)
                      ubicado junto al selector de flotas
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Seleccione el conductor desde la lista desplegable
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Elija el período de consulta (mes específico o rango de fechas)
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Seleccione el vehículo y fecha específica para ver el recorrido
                    </Typography>
                  </li>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ⚙️ Opciones de Búsqueda
                </Typography>
                
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, fontWeight: "bold" }}>
                  📅 Vista Simple (Por Mes)
                </Typography>
                <Typography variant="body2" paragraph>
                  • Seleccione uno de los últimos 6 meses disponibles
                </Typography>
                <Typography variant="body2" paragraph>
                  • Ideal para consultas rápidas y recientes
                </Typography>

                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, fontWeight: "bold" }}>
                  📊 Vista Avanzada (Rango de Fechas)
                </Typography>
                <Typography variant="body2" paragraph>
                  • Active el interruptor "Avanzado" para seleccionar fechas específicas
                </Typography>
                <Typography variant="body2" paragraph>
                  • Defina fecha inicial y fecha final del período
                </Typography>
                <Typography variant="body2">
                  • Útil para análisis de períodos específicos
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🚗 Selección de Vehículos y Fechas
                </Typography>
                
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, fontWeight: "bold" }}>
                  Lista de Vehículos
                </Typography>
                <Typography variant="body2" paragraph>
                  • Se muestran solo los vehículos que el conductor manejó en el período
                </Typography>
                <Typography variant="body2" paragraph>
                  • Cada vehículo muestra la cantidad de días con datos disponibles
                </Typography>

                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, fontWeight: "bold" }}>
                  Calendario de Fechas
                </Typography>
                <Typography variant="body2" paragraph>
                  • Los días disponibles aparecen resaltados en verde
                </Typography>
                <Typography variant="body2" paragraph>
                  • Solo se pueden seleccionar fechas con datos del conductor
                </Typography>
                <Typography variant="body2">
                  • El calendario se habilita al seleccionar un vehículo
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📱 Información Mostrada
                </Typography>
                <Typography variant="body2" paragraph>
                  • <strong>Recorrido completo</strong> del conductor en el mapa
                </Typography>
                <Typography variant="body2" paragraph>
                  • <strong>Detalles del conductor</strong> (nombre, DNI, empresa)
                </Typography>
                <Typography variant="body2" paragraph>
                  • <strong>Información del vehículo</strong> utilizado
                </Typography>
                <Typography variant="body2" paragraph>
                  • <strong>Velocidades y paradas</strong> durante el recorrido
                </Typography>
                <Typography variant="body2">
                  • <strong>Horarios de inicio y fin</strong> de la jornada
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📥 Exportación de Datos
                </Typography>
                <Typography variant="body2" paragraph>
                  Al visualizar un recorrido de conductor, puede exportar:
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                  <Chip
                    icon={<DownloadIcon />}
                    label="Histórico Excel"
                    color="success"
                    size="small"
                  />
                  <Chip
                    icon={<DownloadIcon />}
                    label="Resumen Excel"
                    color="primary"
                    size="small"
                  />
                  <Chip
                    icon={<DownloadIcon />}
                    label="Google Earth (.kml)"
                    color="info"
                    size="small"
                  />
                </Box>
                <Typography variant="body2">
                  Los archivos incluyen información específica del conductor seleccionado.
                </Typography>
              </CardContent>
            </Card>

            <Card
              sx={{
                bgcolor: "warning.50",
                border: "1px solid",
                borderColor: "warning.200",
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom color="warning.main">
                  ⚠️ Consideraciones Importantes
                </Typography>
                <Typography variant="body2" paragraph>
                  • Esta funcionalidad requiere que los conductores estén previamente 
                  asignados en el sistema
                </Typography>
                <Typography variant="body2" paragraph>
                  • Si no ve conductores disponibles, contacte al administrador
                </Typography>
                <Typography variant="body2" paragraph>
                  • Los datos mostrados dependen del registro de conductores en cada viaje
                </Typography>
                <Typography variant="body2">
                  • En caso de no encontrar datos, verifique que el período seleccionado 
                  tenga actividad registrada
                </Typography>
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
                  <strong>+54 9 299 411-9010</strong>
                </Typography>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<PhoneIcon />}
                    href="https://wa.me/+5492994119010?text=necesito%20ayuda%20con%20mi%20password"
                    target="_blank"
                  >
                    Ayuda con Contraseña
                  </Button>
                  <Button
                    variant="outlined"
                    color="success"
                    startIcon={<PhoneIcon />}
                    href="https://wa.me/+5492994119010?text=necesito%20ayuda%20con%20mi%20usuario"
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
                <Typography variant="body2" paragraph>
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

      case "ralenti-por-movil":
        return (
          <Box>
            <Typography
              variant="h4"
              gutterBottom
              sx={{ fontWeight: "bold", color: "green" }}
            >
              📊 Ralentí por Movil
            </Typography>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: "green" }}>
                  🎯 ¿Qué es el Ralentí?
                </Typography>
                <Typography variant="body2" paragraph>
                  El ralentí es el tiempo que el motor del vehículo funciona mientras el auto está detenido. Esta información es valiosa para detectar malas prácticas operacionales, posibles problemas mecánicos y analizar eficiencia de combustible.
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: "green" }}>
                  ✅ ¿Para qué sirve este reporte?
                </Typography>
                <Typography variant="body2" paragraph>
                  Le permite monitorear y analizar el tiempo de ralentí de sus vehículos, identificando oportunidades para mejorar el rendimiento operacional y reducir consumo de combustible y desgaste del motor.
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: "green" }}>
                  📋 Cómo Usar Ralentí por Movil
                </Typography>
                <Box component="ol" sx={{ pl: 2 }}>
                  <li>
                    <Typography variant="body2" paragraph>
                      <strong>Acceder:</strong> Haga clic en el menú ☰ y seleccione "Ralentí por movil"
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" paragraph>
                      <strong>Seleccionar unidades:</strong> Elija los vehículos de los cuales desea analizar el ralentí (se pueden seleccionar múltiples vehículos)
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" paragraph>
                      <strong>Elegir período:</strong> Seleccione la fecha a consultar para ver un gráfico por día del ralentí de cada vehículo.
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" paragraph>
                      <strong>Visualizar datos:</strong> Vea gráficos y tablas con el tiempo de ralentí por vehículo y por día
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" paragraph>
                      <strong>Exportar:</strong> Descargue el informe en Excel para análisis más detallados
                    </Typography>
                  </li>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: "green" }}>
                  📊 Información que Obtiene
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
                      Datos Generales:
                    </Typography>
                    <Typography variant="body2">• Tiempo total de ralentí</Typography>
                    <Typography variant="body2">
                      • Tiempo de ralentí por día y por vehículo
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: "green" }}>
                      Desglose Temporal:
                    </Typography>
                    <Typography variant="body2">• Ralentí por día</Typography>
                    <Typography variant="body2">
                      • Comparativa entre vehículos
                    </Typography>
                    <Typography variant="body2">
                      • Evolución en el período
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: "green" }}>
                  💾 Opciones de Exportación
                </Typography>
                <Box component="ol" sx={{ pl: 2 }}>
                  <li>
                    <Typography variant="body2" paragraph>
                      <strong>Exportar ralentí actual:</strong> Descarga los datos más recientes de ralentí en Excel
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" paragraph>
                      <strong>Informe ralentí completo:</strong> Genera un reporte detallado con hasta 31 días de historial en un solo archivo
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" paragraph>
                      <strong>Formato Excel:</strong> Compatible con Microsoft Excel, Google Sheets y LibreOffice para análisis personalizados
                    </Typography>
                  </li>
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
                  💡 Consejos Prácticos
                </Typography>
                <Typography variant="body2" paragraph>
                  • <strong>Identifique patrones:</strong> Compare diferentes vehículos para distinguir conductores eficientes
                </Typography>
                <Typography variant="body2" paragraph>
                  • <strong>Mejore operaciones:</strong> Reduza ralentís innecesarios para ahorrar combustible
                </Typography>
                <Typography variant="body2" paragraph>
                  • <strong>Intervención temprana:</strong> Ralentís anormales pueden indicar problemas mecánicos
                </Typography>
                <Typography variant="body2" paragraph>
                  • <strong>Análisis histórico:</strong> Use la exportación completa para tendencias a largo plazo
                </Typography>
                <Typography variant="body2" paragraph>
                  • <strong>Seguimiento:</strong> Revise regularmente para mantener flota optimizada
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
                <Typography variant="body2" paragraph>
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
              📊 Informes Parciales
            </Typography>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: "green" }}>
                  🎯 ¿Qué son los Informes Parciales?
                </Typography>
                <Typography variant="body2" paragraph>
                  Son reportes específicos por contrato que le permiten descargar datos de períodos seleccionados (últimos 6 meses o rango personalizado) en formato Excel para análisis detallado.
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: "green" }}>
                  📋 Cómo Generar un Informe Parcial
                </Typography>
                <Box component="ol" sx={{ pl: 2 }}>
                  <li>
                    <Typography variant="body2" paragraph>
                      <strong>Acceder al menú:</strong> Haga clic en el menú ☰ y seleccione "Informes Parciales"
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" paragraph>
                      <strong>Seleccionar contrato:</strong> Elija el contrato del cual desea el informe
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" paragraph>
                      <strong>Elegir período:</strong> Seleccione uno de los últimos 6 meses o use el modo avanzado para fechas personalizadas
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" paragraph>
                      <strong>Descargar:</strong> Haga clic en "Descargar" para obtener el archivo Excel
                    </Typography>
                  </li>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: "green" }}>
                  📈 Contenido del Informe
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
                      Datos Operacionales:
                    </Typography>
                    <Typography variant="body2">• Movimientos por día</Typography>
                    <Typography variant="body2">
                      • Kilómetros recorridos
                    </Typography>
                    <Typography variant="body2">
                      • Horas de operación
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: "green" }}>
                      Información de Flotas:
                    </Typography>
                    <Typography variant="body2">• Vehículos por contrato</Typography>
                    <Typography variant="body2">
                      • Resumen de actividades
                    </Typography>
                    <Typography variant="body2">
                      • Datos consolidados
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
                  💡 Consejos Útiles
                </Typography>
                <Typography variant="body2" paragraph>
                  • <strong>Modo Avanzado:</strong> Use fechas personalizadas para análisis más específicos
                </Typography>
                <Typography variant="body2" paragraph>
                  • <strong>Múltiples Descargas:</strong> Puede descargar varios períodos y consolidar en un solo folder
                </Typography>
                <Typography variant="body2" paragraph>
                  • <strong>Formato Compatible:</strong> Los archivos Excel son editables para sus propios análisis
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
              📜 Certificados de Funcionamiento
            </Typography>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: "green" }}>
                  ✅ ¿Para qué sirve un Certificado?
                </Typography>
                <Typography variant="body2" paragraph>
                  El Certificado de Funcionamiento es un documento oficial que comprueba que su vehículo está equipado con GPS y funcionando correctamente. Ideal para presentar ante aseguradoras, clientes, rentas o durante inspecciones.
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: "green" }}>
                  📝 Cómo Generar un Certificado
                </Typography>
                <Box component="ol" sx={{ pl: 2 }}>
                  <li>
                    <Typography variant="body2" paragraph>
                      <strong>Seleccionar vehículo:</strong> En el menú ☰, haga clic en "Certificado de Funcionamiento"
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" paragraph>
                      <strong>Seleccionar unidad:</strong> Seleccione el vehículo para el cual desea el certificado
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" paragraph>
                      <strong>Descargar PDF:</strong> El certificado se genera automáticamente en formato PDF listo para imprimir
                    </Typography>
                  </li>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: "green" }}>
                  📋 ¿Qué incluye el Certificado?
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
                    <Typography variant="body2">• Patente</Typography>
                    <Typography variant="body2">• Marca y modelo</Typography>
                    <Typography variant="body2">• Empresa propietaria</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: "green" }}>
                      Información del Equipo:
                    </Typography>
                    <Typography variant="body2">• ID del GPS</Typography>
                    <Typography variant="body2">• Fecha de emisión</Typography>
                    <Typography variant="body2">• Firma oficial</Typography>
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
                  💡 Información Importante
                </Typography>
                <Typography variant="body2" paragraph>
                  • El certificado es válido únicamente si el vehículo se encuentra reportando posición en tiempo real
                </Typography>
                <Typography variant="body2" paragraph>
                  • Puede descargar múltiples certificados para todos sus vehículos
                </Typography>
                <Typography variant="body2" paragraph>
                  • El documento es firmado digitalmente y tiene validez legal
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
              🚗 Gestión de Flotas
            </Typography>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: "green" }}>
                  📦 ¿Qué son las Flotas?
                </Typography>
                <Typography variant="body2" paragraph>
                  Las flotas son agrupaciones personalizadas de vehículos que le permiten organizar mejor su parque vehicular por tipo, ruta, departamento o el criterio que usted prefiera.
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: "green" }}>
                  ⚙️ Cómo Gestionar sus Flotas
                </Typography>
                <Box component="ol" sx={{ pl: 2 }}>
                  <li>
                    <Typography variant="body2" paragraph>
                      <strong>Acceder:</strong> Haga clic en el menú ☰ y seleccione "Gestión de Flotas"
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" paragraph>
                      <strong>Crear flota:</strong> Use el botón "+" para crear una nueva flota con nombre personalizado
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" paragraph>
                      <strong>Agregar vehículos:</strong> Seleccione una flota y agregue vehículos disponibles
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" paragraph>
                      <strong>Organizar:</strong> Mueva vehículos entre flotas usando los botones de flecha
                    </Typography>
                  </li>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: "green" }}>
                  💼 Ejemplos de Flotas
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: 2,
                  }}
                >
                  <Box sx={{ p: 1.5, bgcolor: "rgba(0, 128, 0, 0.05)", borderRadius: 1 }}>
                    <Typography variant="subtitle2" sx={{ color: "green" }}>
                      Por Tipo:
                    </Typography>
                    <Typography variant="body2">• Camiones</Typography>
                    <Typography variant="body2">• Autos</Typography>
                    <Typography variant="body2">• Motos</Typography>
                  </Box>
                  <Box sx={{ p: 1.5, bgcolor: "rgba(0, 128, 0, 0.05)", borderRadius: 1 }}>
                    <Typography variant="subtitle2" sx={{ color: "green" }}>
                      Por Zona:
                    </Typography>
                    <Typography variant="body2">• Neuquén (Capital)</Typography>
                    <Typography variant="body2">• Interior</Typography>
                    <Typography variant="body2">• Litoral</Typography>
                  </Box>
                  <Box sx={{ p: 1.5, bgcolor: "rgba(0, 128, 0, 0.05)", borderRadius: 1 }}>
                    <Typography variant="subtitle2" sx={{ color: "green" }}>
                      Por Departamento:
                    </Typography>
                    <Typography variant="body2">• Ventas</Typography>
                    <Typography variant="body2">• Distribución</Typography>
                    <Typography variant="body2">• Servicio Técnico</Typography>
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
                  💡 Ventajas de Usar Flotas
                </Typography>
                <Typography variant="body2" paragraph>
                  • Mayor claridad: Vea de un vistazo qué vehículos pertenecen a cada grupo
                </Typography>
                <Typography variant="body2" paragraph>
                  • Facilita análisis: Compare rendimiento entre grupos de vehículos
                </Typography>
                <Typography variant="body2" paragraph>
                  • Mejor organización: Asigne responsabilidades por flota
                </Typography>
                <Typography variant="body2" paragraph>
                  • Flexible: Reorganice sus flotas según necesidades
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

  // Renderizar el menú lateral
  const renderSidebarMenu = () => (
    <Box
      sx={{
        width: isMobile ? "280px" : "320px",
        height: "100%",
        bgcolor: "grey.50",
        display: "flex",
        flexDirection: "column",
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
          <IconButton
            onClick={() => setMobileMenuOpen(false)}
            sx={{ color: "white" }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      {/* Navigation List */}
      <List dense sx={{ flexGrow: 1, p: 0, overflowY: "auto" }}>
        {menuSections.map((section) => (
          <React.Fragment key={section.id}>
            <ListItem disablePadding>
              <ListItemButton
                selected={selectedSection === section.id}
                onClick={() => {
                  if (section.hasChildren) {
                    handleSectionToggle(section.id);
                  } else {
                    handleSectionSelect(section.id);
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
                        onClick={() => handleSectionSelect(child.id)}
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
                              selectedSection === child.id ? "bold" : "normal",
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
  );

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
        {/* Desktop Sidebar */}
        {!isMobile && renderSidebarMenu()}

        {/* Mobile Drawer */}
        {isMobile && (
          <Drawer
            variant="temporary"
            anchor="left"
            open={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
              style: { zIndex: 1400 }, // Aumentar z-index para estar por encima del modal
            }}
            sx={{
              "& .MuiDrawer-paper": {
                width: "280px",
                boxSizing: "border-box",
                zIndex: 1400, // Asegurar que el papel también tenga z-index alto
              },
            }}
          >
            {renderSidebarMenu()}
          </Drawer>
        )}

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
              {isMobile && (
                <IconButton
                  onClick={() => setMobileMenuOpen(true)}
                  sx={{ mr: 1 }}
                >
                  <MenuIcon />
                </IconButton>
              )}
              <Typography
                variant={isMobile ? "h6" : "h5"}
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
              © FullControlGPS 2025 | Manual actualizado: Agosto 2025
            </Typography>
            <Link
              href="https://wa.me/+5492994119010"
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
