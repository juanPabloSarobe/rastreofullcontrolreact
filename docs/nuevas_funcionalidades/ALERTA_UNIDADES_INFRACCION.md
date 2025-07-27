# ALERTA DE UNIDADES EN INFRACCIÓN

## 📋 ESTADO: PENDIENTE DE IMPLEMENTACIÓN

### Resumen de la funcionalidad:

El sistema de "Alertas de unidades en infracción" permitirá visualizar y gestionar las unidades que se encuentran en estado de infracción (de velocidad, tiempo de descanso, etc.), facilitando la detección temprana de comportamientos riesgosos, mejorando la seguridad vial y permitiendo una respuesta rápida ante situaciones de incumplimiento normativo.

**Fecha estimada de implementación:** Agosto 2025  
**Arquitectura:** Reutilización del sistema BaseExpandableAlert ya implementado  
**Tiempo estimado:** 2-3 horas (reducido gracias a arquitectura reutilizable)

## 🏗️ ARQUITECTURA A UTILIZAR

### Aprovechamiento de componentes existentes:

```
src/
├── hooks/
│   └── useExpandableAlert.js              // ✅ YA IMPLEMENTADO - Reutilizable
├── components/common/
│   ├── BaseExpandableAlert.jsx            // ✅ YA IMPLEMENTADO - Reutilizable
│   └── InfractionAlert.jsx                // 🔄 A IMPLEMENTAR - Específico
└── pages/
    └── PrincipalPage.jsx                  // 🔄 A MODIFICAR - Integración
```

### Ventajas de reutilizar la arquitectura existente:

- ✅ **Hook `useExpandableAlert`** completamente reutilizable
- ✅ **Componente `BaseExpandableAlert`** soporta todas las funcionalidades necesarias
- ✅ **Estilos y comportamientos** ya validados y consistentes
- ✅ **UX/UI patterns** ya establecidos y familiares al usuario

## 🎯 ESPECIFICACIONES TÉCNICAS

### 1. **Detección de unidades en infracción:**

- **Campo de detección**: `estado` del endpoint
- **Palabras clave**: "infracción" o "infraccion" (con/sin tilde)
- **Tipos de infracción detectados**:
  - Infracción de velocidad en distintas zonas
  - Infracción de tiempo de descanso
  - Infracción de movimiento
  - Cualquier estado que contenga la palabra "infracción"
- **Detección**: Insensible a mayúsculas/minúsculas y acentos

### 2. **Sistema de doble lista (diferencia clave con ralentí):**

#### **Lista superior: Infracciones activas**

- Unidades actualmente en infracción
- **Color**: Rojo (`error.main`)
- **Orden por defecto**: Por tiempo (más recientes arriba)
- **Icono indicativo**: ⚠️ o similar

#### **Lista inferior: Historial de infracciones**

- Unidades que ya no están en infracción pero tuvieron infracciones
- **Color**: Gris (`text.disabled`)
- **Gestión de historial**:
  - Botón individual de eliminación (🗑️ icono tacho)
  - Botón "Eliminar todo el historial" en encabezado
- **Persistencia**: Durante la sesión hasta eliminación manual

### 3. **Interface de usuario (mismo patrón que ralentí):**

#### **Estado 1: Ícono contraído**

- Botón circular de 48px con ícono `WarningIcon` o `SpeedIcon`
- Badge rojo con número de infracciones activas
- **Posicionamiento**: Debajo de IdleUnitsAlert

#### **Estado 2: Hover expandido**

- Expansión horizontal: `[4] Unidades en infracción`
- Badge integrado a la izquierda del título

#### **Estado 3: Lista expandida (Fase 1 - Vista rápida)**

- **Header**: `[4] Unidades en infracción [📊 Tiempo] [🔍 Expandir] [X]`
- **Lista dual**:
  - Sección superior: Infracciones activas
  - Separador visual
  - Sección inferior: Historial con controles de eliminación
- **Nuevo botón**: `🔍 Expandir` para abrir modal detallado

#### **Estado 4: Modal expandido con mini-mapa (Fase 2 - Vista detallada)**

- **Propósito**: Análisis exhaustivo de patrones de infracción
- **Tamaño**: Modal de pantalla completa (o 90% del viewport)
- **Componentes principales**:
  - **Mini-mapa interactivo** (50% del ancho)
  - **Panel de análisis** (50% del ancho)
  - **Timeline de eventos** (parte inferior)
- **Funcionalidades avanzadas**:
  - Filtros por tipo de infracción, conductor, fecha
  - Visualización de recorridos con puntos de infracción
  - Estadísticas y métricas detalladas
  - Exportación de reportes

### 4. **Posicionamiento inteligente:**

#### **Desktop:**

- Sin unidades seleccionadas: `top: 130px, left: 16px` (debajo de IdleUnitsAlert)
- Con unidades seleccionadas: `top: 350px, left: 16px` (debajo de IdleUnitsAlert)

#### **Mobile:**

- Sin unidades seleccionadas: `top: 180px, left: 16px`
- Con unidades seleccionadas: `top: 250px, left: 16px`

#### **Ajuste de z-index:**

- Componente principal: `1000` (debajo de IdleUnitsAlert)
- Badge: `1001`

### 5. **Sistema de ordenamiento:**

- **Opciones**: "Patente" / "Tiempo"
- **Por defecto**: Tiempo (más recientes arriba)
- **Aplicación**: Solo a lista activa, historial mantiene orden cronológico

## 🎨 ESPECIFICACIONES DE DISEÑO

### **Colores específicos:**

- **Badge**: `error.main` (rojo) para contadores
- **Ícono principal**: `error.main` (rojo) - más crítico que ralentí
- **Infracciones activas**: `error.main` con fondo `error.50`
- **Historial**: `text.disabled` con fondo `grey.50`

### **Iconografía:**

- **Ícono principal**: `WarningIcon` o `SpeedIcon`
- **Infracciones activas**: ⚠️ o 🚨
- **Historial**: 📋 o 🕒
- **Eliminar individual**: 🗑️ (`DeleteIcon`)
- **Eliminar todo**: 🗑️ con texto "Limpiar historial"

### **Estructura de lista dual:**

```jsx
// Estructura visual propuesta:
<>
  {/* Infracciones activas */}
  <Box>
    <Typography>🚨 Infracciones activas ({activeCount})</Typography>
    <List>
      {activeInfractions.map((unit) => (
        <InfractionItem />
      ))}
    </List>
  </Box>

  {/* Separador */}
  <Divider />

  {/* Historial */}
  <Box>
    <Box display="flex" justifyContent="space-between">
      <Typography>📋 Historial ({historyCount})</Typography>
      <Button onClick={clearAllHistory}>🗑️ Limpiar todo</Button>
    </Box>
    <List>
      {historyInfractions.map((unit) => (
        <InfractionItem showDeleteButton={true} />
      ))}
    </List>
  </Box>
</>
```

## 🔧 GUÍA DE IMPLEMENTACIÓN

### **Paso 1: Crear InfractionAlert.jsx (Fase 1 - Lista rápida)**

```jsx
import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  List,
  Divider,
  IconButton,
  Button,
} from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import BaseExpandableAlert from "./BaseExpandableAlert";
import InfractionDetailModal from "./InfractionDetailModal"; // Nueva importación

const InfractionAlert = ({ markersData, onUnitSelect }) => {
  const [sortBy, setSortBy] = useState("time");
  const [historyInfractions, setHistoryInfractions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // Nuevo estado

  // Detectar infracciones activas
  const activeInfractions = useMemo(() => {
    // Lógica de detección similar a IdleUnitsAlert
    // Buscar "infracción" o "infraccion" en campo estado
  }, [markersData]);

  // Gestionar historial automáticamente
  useEffect(() => {
    // Mover unidades que ya no están en infracción al historial
    // Evitar duplicados en historial
  }, [activeInfractions]);

  // Renderizar contenido específico de infracciones
  const renderInfractionContent = ({ onUnitSelect, handleClose }) => (
    <Box sx={{ maxHeight: "328px", overflow: "auto" }}>
      {/* Header con botón expandir */}
      <Box sx={{ display: "flex", justifyContent: "space-between", p: 1 }}>
        <Typography variant="subtitle2">Vista rápida</Typography>
        <Button
          size="small"
          startIcon={<SearchIcon />}
          onClick={() => setIsModalOpen(true)}
          sx={{ minWidth: "auto" }}
        >
          Expandir
        </Button>
      </Box>

      {/* Lista activas */}
      {/* Separador */}
      {/* Lista historial */}
    </Box>
  );

  return (
    <>
      <BaseExpandableAlert
        icon={WarningIcon}
        title="Unidades en infracción"
        count={activeInfractions.length}
        badgeColor="error.main"
        iconColor="error.main"
        tooltipText={`Infracciones activas: ${activeInfractions.length}`}
        verticalOffset={{ desktop: 350, mobile: 250 }}
        sortBy={sortBy}
        onSortChange={() =>
          setSortBy(sortBy === "alphabetic" ? "time" : "alphabetic")
        }
        showSortButton={true}
        sortOptions={{ option1: "Patente", option2: "Tiempo" }}
        onUnitSelect={onUnitSelect}
      >
        {renderInfractionContent}
      </BaseExpandableAlert>

      {/* Modal expandido (Fase 2) */}
      <InfractionDetailModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        activeInfractions={activeInfractions}
        historyInfractions={historyInfractions}
        markersData={markersData}
        onUnitSelect={onUnitSelect}
      />
    </>
  );
};
```

### **Paso 2: Crear InfractionDetailModal.jsx (Fase 2 - Modal con mini-mapa)**

```jsx
import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Tabs,
  Tab,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FilterListIcon from "@mui/icons-material/FilterList";
import DownloadIcon from "@mui/icons-material/Download";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";

const InfractionDetailModal = ({
  open,
  onClose,
  activeInfractions,
  historyInfractions,
  markersData,
  onUnitSelect,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTimeRange, setSelectedTimeRange] = useState("today");
  const [selectedInfractionType, setSelectedInfractionType] = useState("all");
  const [selectedUnit, setSelectedUnit] = useState(null);

  // Datos filtrados según criterios
  const filteredData = useMemo(() => {
    // Aplicar filtros de tiempo, tipo, etc.
    return combineActiveAndHistory();
  }, [
    activeInfractions,
    historyInfractions,
    selectedTimeRange,
    selectedInfractionType,
  ]);

  // Generar rutas para el mini-mapa
  const mapRoutes = useMemo(() => {
    // Procesar datos para mostrar recorridos con puntos de infracción
    return generateRouteData(filteredData);
  }, [filteredData]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      sx={{ "& .MuiDialog-paper": { height: "90vh", maxHeight: "90vh" } }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            📊 Análisis Detallado de Infracciones
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Filtros superiores */}
        <Box sx={{ mb: 2, display: "flex", gap: 2, alignItems: "center" }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Período</InputLabel>
            <Select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
            >
              <MenuItem value="today">Hoy</MenuItem>
              <MenuItem value="week">Esta semana</MenuItem>
              <MenuItem value="month">Este mes</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Tipo de infracción</InputLabel>
            <Select
              value={selectedInfractionType}
              onChange={(e) => setSelectedInfractionType(e.target.value)}
            >
              <MenuItem value="all">Todas</MenuItem>
              <MenuItem value="speed">Velocidad</MenuItem>
              <MenuItem value="rest">Descanso</MenuItem>
              <MenuItem value="zone">Geo-cerca</MenuItem>
            </Select>
          </FormControl>

          <Button startIcon={<DownloadIcon />} variant="outlined" size="small">
            Exportar
          </Button>
        </Box>

        {/* Contenido principal */}
        <Grid container spacing={2} sx={{ height: "calc(100% - 100px)" }}>
          {/* Panel izquierdo: Mini-mapa */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🗺️ Mapa de Infracciones
                </Typography>

                <Box sx={{ height: "400px", width: "100%" }}>
                  <MapContainer
                    center={[-34.6037, -58.3816]} // Buenos Aires como centro
                    zoom={11}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                    {/* Marcadores de infracciones */}
                    {filteredData.map((infraction, index) => (
                      <Marker
                        key={index}
                        position={[infraction.lat, infraction.lng]}
                        eventHandlers={{
                          click: () => setSelectedUnit(infraction),
                        }}
                      >
                        <Popup>
                          <div>
                            <strong>{infraction.patente}</strong>
                            <br />
                            {infraction.tipo_infraccion}
                            <br />
                            {infraction.timestamp}
                          </div>
                        </Popup>
                      </Marker>
                    ))}

                    {/* Rutas de recorrido */}
                    {mapRoutes.map((route, index) => (
                      <Polyline
                        key={index}
                        positions={route.coordinates}
                        color={route.color}
                        weight={3}
                        opacity={0.7}
                      />
                    ))}
                  </MapContainer>
                </Box>

                {/* Leyenda del mapa */}
                <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Chip
                    size="small"
                    icon={
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          backgroundColor: "red",
                          borderRadius: "50%",
                        }}
                      />
                    }
                    label="Infracción de velocidad"
                  />
                  <Chip
                    size="small"
                    icon={
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          backgroundColor: "orange",
                          borderRadius: "50%",
                        }}
                      />
                    }
                    label="Infracción de descanso"
                  />
                  <Chip
                    size="small"
                    icon={
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          backgroundColor: "purple",
                          borderRadius: "50%",
                        }}
                      />
                    }
                    label="Geo-cerca"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Panel derecho: Análisis y listas */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Tabs
                  value={activeTab}
                  onChange={(e, newValue) => setActiveTab(newValue)}
                  sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
                >
                  <Tab label="📋 Lista detallada" />
                  <Tab label="📊 Estadísticas" />
                  <Tab label="⏱️ Timeline" />
                </Tabs>

                {/* Tab 1: Lista detallada */}
                {activeTab === 0 && (
                  <Box sx={{ height: "400px", overflow: "auto" }}>
                    <List>
                      {filteredData.map((infraction, index) => (
                        <ListItem
                          key={index}
                          button
                          onClick={() => {
                            onUnitSelect(infraction);
                            setSelectedUnit(infraction);
                          }}
                          selected={
                            selectedUnit?.Movil_ID === infraction.Movil_ID
                          }
                        >
                          <ListItemText
                            primary={
                              <Box
                                display="flex"
                                justifyContent="space-between"
                              >
                                <Typography variant="subtitle2">
                                  {infraction.patente}
                                </Typography>
                                <Chip
                                  size="small"
                                  label={infraction.tipo_infraccion}
                                  color={getInfractionColor(
                                    infraction.tipo_infraccion
                                  )}
                                />
                              </Box>
                            }
                            secondary={
                              <>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  📍 {infraction.ubicacion}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  🕒 {infraction.timestamp}
                                </Typography>
                                {infraction.velocidad && (
                                  <Typography variant="caption" color="error">
                                    🚗 {infraction.velocidad} km/h
                                  </Typography>
                                )}
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {/* Tab 2: Estadísticas */}
                {activeTab === 1 && (
                  <Box>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="h4" color="error">
                              {filteredData.length}
                            </Typography>
                            <Typography variant="caption">
                              Total infracciones
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={6}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="h4" color="warning.main">
                              {
                                new Set(filteredData.map((i) => i.Movil_ID))
                                  .size
                              }
                            </Typography>
                            <Typography variant="caption">
                              Unidades involucradas
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>

                      {/* Más estadísticas... */}
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>
                          📊 Por tipo de infracción:
                        </Typography>
                        {/* Gráfico de barras o lista de tipos */}
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* Tab 3: Timeline */}
                {activeTab === 2 && (
                  <Box sx={{ height: "400px", overflow: "auto" }}>
                    <Typography variant="subtitle2" gutterBottom>
                      ⏱️ Cronología de eventos:
                    </Typography>
                    {/* Timeline vertical de infracciones */}
                    {filteredData
                      .sort(
                        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
                      )
                      .map((infraction, index) => (
                        <Box
                          key={index}
                          sx={{ mb: 2, pl: 2, borderLeft: "2px solid #ddd" }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            {infraction.timestamp}
                          </Typography>
                          <Typography variant="subtitle2">
                            {infraction.patente} - {infraction.tipo_infraccion}
                          </Typography>
                          <Typography variant="caption">
                            📍 {infraction.ubicacion}
                          </Typography>
                        </Box>
                      ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

// Función auxiliar para colores de infracción
const getInfractionColor = (tipo) => {
  switch (tipo) {
    case "velocidad":
      return "error";
    case "descanso":
      return "warning";
    case "geocerca":
      return "info";
    default:
      return "default";
  }
};

export default InfractionDetailModal;
```

      badgeColor="error.main"
      iconColor="error.main"
      tooltipText={`Infracciones activas: ${activeInfractions.length}`}
      verticalOffset={{ desktop: 350, mobile: 250 }}
      sortBy={sortBy}
      onSortChange={() =>
        setSortBy(sortBy === "alphabetic" ? "time" : "alphabetic")
      }
      showSortButton={true}
      sortOptions={{ option1: "Patente", option2: "Tiempo" }}
      onUnitSelect={onUnitSelect}
    >
      {renderInfractionContent}
    </BaseExpandableAlert>

);
};

````

### **Paso 3: Actualizar BaseExpandableAlert para soportar botón expandir**

```jsx
// En BaseExpandableAlert.jsx - Agregar nueva prop
const BaseExpandableAlert = ({
  // ... props existentes
  showExpandButton = false,
  onExpandClick,
  expandButtonText = "Expandir",
  // ... resto de props
}) => {
  // En la sección del header expandido, después del botón de ordenamiento:
  {showExpandButton && open && (
    <Tooltip title={`Abrir vista detallada`}>
      <IconButton
        size="small"
        onClick={onExpandClick}
        sx={{
          color: "primary.main",
          backgroundColor: "primary.50",
          borderRadius: "8px",
          px: 1,
          mr: 1,
          "&:hover": {
            backgroundColor: "primary.100",
          },
        }}
      >
        <SearchIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  )}
};
````

### **Paso 4: Integrar en PrincipalPage.jsx**

```jsx
// Agregar después de IdleUnitsAlert
<IdleUnitsAlert markersData={markersData} onUnitSelect={handleUnitSelect} />
<InfractionAlert markersData={markersData} onUnitSelect={handleUnitSelect} />
<UnitDetails unitData={selectedUnit} />
```

## 📋 ROADMAP DE IMPLEMENTACIÓN

### **🎯 FASE 1: Lista rápida (Implementación inmediata)**

**Objetivo**: Proporcionar funcionalidad básica y familiar
**Tiempo estimado**: 3 horas
**Prioridad**: Alta

**Funcionalidades:**

- ✅ Lista expandible con infracciones activas e historial
- ✅ Sistema de ordenamiento (patente/tiempo)
- ✅ Gestión de historial con eliminación individual/masiva
- ✅ Integración con BaseExpandableAlert existente
- ✅ zIndex y posicionamiento correctos

### **🚀 FASE 2: Modal expandido (Mejora estratégica)**

**Objetivo**: Análisis profundo y gestión avanzada
**Tiempo estimado**: 16 horas
**Prioridad**: Media-Alta

**Funcionalidades:**

- 🗺️ Mini-mapa interactivo con React-Leaflet
- 📊 Panel de análisis con múltiples tabs
- 🔍 Sistema de filtros avanzados
- 📈 Estadísticas y métricas detalladas
- ⏱️ Timeline cronológico de eventos
- 💾 Exportación de reportes

### **🔮 FASE 3: Funcionalidades avanzadas (Futuro)**

**Objetivo**: IA y automatización
**Tiempo estimado**: Por definir
**Prioridad**: Baja

**Funcionalidades:**

- 🤖 Detección automática de patrones
- 🎯 Alertas predictivas
- 📱 Notificaciones push
- 🔄 Integración con sistemas externos

### **1. Gestión de historial:**

```jsx
const [historyInfractions, setHistoryInfractions] = useState([]);

// Eliminar individual
const removeFromHistory = (unitId) => {
  setHistoryInfractions((prev) =>
    prev.filter((unit) => unit.Movil_ID !== unitId)
  );
};

// Eliminar todo
const clearAllHistory = () => {
  setHistoryInfractions([]);
};
```

### **2. Detección y movimiento automático:**

```jsx
useEffect(() => {
  // Detectar unidades que ya no están en infracción
  const currentActiveIds = new Set(activeInfractions.map((u) => u.Movil_ID));
  const historyIds = new Set(historyInfractions.map((u) => u.Movil_ID));

  // Encontrar unidades que salieron de infracción
  const unitsToMoveToHistory = historyInfractions.filter(
    (unit) =>
      !currentActiveIds.has(unit.Movil_ID) && !historyIds.has(unit.Movil_ID)
  );

  if (unitsToMoveToHistory.length > 0) {
    setHistoryInfractions((prev) => [...prev, ...unitsToMoveToHistory]);
  }
}, [activeInfractions, historyInfractions]);
```

### **3. Componente de ítem con eliminación:**

```jsx
const InfractionItem = ({ unit, isHistory, onDelete }) => (
  <ListItem>
    <ListItemText
      primary={unit.patente}
      secondary={unit.estado}
      sx={{ opacity: isHistory ? 0.6 : 1 }}
    />
    {isHistory && (
      <IconButton onClick={() => onDelete(unit.Movil_ID)}>
        <DeleteIcon fontSize="small" />
      </IconButton>
    )}
  </ListItem>
);
```

## 📊 ESTIMACIÓN DE IMPLEMENTACIÓN (ACTUALIZADA)

### **FASE 1: Lista rápida (tareas originales):**

| Tarea                     | Tiempo estimado | Nota                                        |
| ------------------------- | --------------- | ------------------------------------------- |
| Crear InfractionAlert.jsx | 1 hora          | Reutiliza BaseExpandableAlert               |
| Integrar en PrincipalPage | 30 minutos      | Simple importación y posicionamiento        |
| Gestión de historial      | 1 hora          | Lógica de detección y movimiento automático |
| Testing y ajustes finales | 30 minutos      | Verificar funcionamiento y posicionamiento  |
| **TOTAL FASE 1**          | **3 horas**     | **Lista funcional básica**                  |

### **FASE 2: Modal con mini-mapa (nueva funcionalidad):**

| Tarea                           | Tiempo estimado | Nota                                 |
| ------------------------------- | --------------- | ------------------------------------ |
| Crear InfractionDetailModal.jsx | 4 horas         | Modal completo con tabs y filtros    |
| Integración de mini-mapa        | 3 horas         | React-Leaflet con marcadores y rutas |
| Sistema de filtros avanzados    | 2 horas         | Filtros por tiempo, tipo, unidad     |
| Panel de estadísticas           | 2 horas         | Gráficos y métricas de infracciones  |
| Timeline de eventos             | 1.5 horas       | Cronología visual de infracciones    |
| Funcionalidad de exportación    | 1.5 horas       | Exportar reportes en Excel/PDF       |
| Testing del modal completo      | 2 horas         | Testing de todas las funcionalidades |
| **TOTAL FASE 2**                | **16 horas**    | **Modal avanzado completo**          |

### **FUNCIONALIDADES DEL MODAL EXPANDIDO:**

#### **🗺️ Mini-mapa interactivo:**

- ✅ Marcadores de infracciones por tipo y severidad
- ✅ Rutas de recorrido con puntos problemáticos
- ✅ Clusters para zonas con alta densidad de infracciones
- ✅ Capas toggleables (velocidad, descanso, geo-cercas)
- ✅ Zoom automático a infracción seleccionada

#### **📊 Panel de análisis:**

- ✅ **Tab 1 - Lista detallada**: Infracciones con contexto completo
- ✅ **Tab 2 - Estadísticas**: KPIs, gráficos, tendencias
- ✅ **Tab 3 - Timeline**: Cronología de eventos con filtros

#### **🔍 Sistema de filtros:**

- ✅ Filtro temporal: Hoy, semana, mes, rango personalizado
- ✅ Filtro por tipo: Velocidad, descanso, geo-cerca, etc.
- ✅ Filtro por unidad/conductor específico
- ✅ Filtro por severidad: Crítica, alta, media, baja

#### **📈 Métricas y estadísticas:**

- ✅ Total de infracciones en período seleccionado
- ✅ Unidades más problemáticas (ranking)
- ✅ Tipos de infracción más frecuentes
- ✅ Zonas geográficas con mayor incidencia
- ✅ Tendencias por horario/día de semana
- ✅ Comparativas entre períodos

#### **💾 Funcionalidades de exportación:**

- ✅ Reporte PDF con mapa y estadísticas
- ✅ Excel con datos detallados para análisis
- ✅ Imágenes del mapa con marcadores
- ✅ Configuración de reportes automáticos

### **🎯 VALOR AGREGADO DEL MODAL:**

#### **Para Operadores:**

- 🔍 **Contexto visual** de las infracciones en el mapa
- 📊 **Patrones identificables** para toma de decisiones
- ⏱️ **Timeline claro** de eventos secuenciales
- 📱 **Interfaz intuitiva** con tabs organizados

#### **Para Supervisores:**

- 📈 **Métricas de gestión** para evaluación de desempeño
- 🎯 **Identificación de zonas problemáticas** para entrenamiento
- 📊 **Reportes ejecutivos** con datos procesados
- 🔄 **Análisis de tendencias** para mejora continua

#### **Para Gerencia:**

- 💰 **ROI de seguridad** mediante reducción de infracciones
- 📊 **Dashboard ejecutivo** con KPIs clave
- 📈 **Análisis predictivo** para planificación
- 🎯 **Compliance normativo** con reportes detallados
  | Implementar doble lista | 30 minutos | Estructura JSX |
  | Sistema de historial | 45 minutos | Estados y efectos |
  | Integración en PrincipalPage | 15 minutos | Una línea de código |
  | Testing y ajustes | 30 minutos | Validación funcional |
  | **Total** | **3 horas** | **Reducido 75% por reutilización** |

### **Comparación con estimación original:**

- **Estimación original**: 31 horas
- **Estimación con arquitectura reutilizable**: 3 horas
- **Ahorro**: 28 horas (90% reducción)

## 🚀 BENEFICIOS DE LA ARQUITECTURA REUTILIZABLE

1. **Tiempo de desarrollo**: Reducido de 31h a 3h
2. **Consistencia UX**: Comportamiento idéntico entre alertas
3. **Mantenimiento**: Cambios en BaseExpandableAlert afectan todas las alertas
4. **Testing**: Hook y componente base ya validados
5. **Escalabilidad**: Futuras alertas tomarán 2-3 horas cada una

---

## 📝 NOTAS PARA IMPLEMENTACIÓN

- **Prioridad**: Media (después de optimizaciones de ralentí)
- **Dependencias**: Ninguna (arquitectura ya implementada)
- **Testing**: Reutilizar casos de prueba de IdleUnitsAlert
- **Documentación**: Actualizar CONTEXTO_IA.md con nueva alerta

**La implementación está completamente planificada y lista para ejecutar cuando se requiera.**

---

## 🔧 APLICACIÓN DE OPTIMIZACIONES CRÍTICAS (BASADO EN RALENTÍ)

### **1. PREVENCIÓN DE BUCLES INFINITOS EN useEffect**

#### **Patrón crítico a aplicar:**

```jsx
// ✅ CORRECTO - Sin dependencias circulares
useEffect(() => {
  // Procesar infracciones activas y mover al historial
  const processInfractions = () => {
    // Lógica de procesamiento
  };
  processInfractions();
}, [
  activeInfractions,
  // NO incluir historyInfractions si se modifica dentro del efecto
  dispatch,
  // ... otras dependencias seguras
]);
```

#### **Regla aplicada:**

> **Nunca incluir en dependencias de useEffect el estado que el mismo efecto va a modificar**

### **2. VALIDACIÓN HTML CORRECTA**

#### **Componentes Typography configurados correctamente:**

```jsx
// ✅ En InfractionAlert.jsx
<Typography variant="h6" component="div">
  <div>Contenido con elementos div anidados</div>
</Typography>

// ✅ En InfractionItem.jsx
<ListItemText
  primaryTypographyProps={{ component: "div" }}
  secondaryTypographyProps={{ component: "div" }}
  primary={<div>Contenido de patente</div>}
  secondary={<div>Contenido de estado</div>}
/>
```

### **3. MEMOIZACIÓN COMPLETA PARA RENDIMIENTO ÓPTIMO**

#### **Arrays y objetos memoizados:**

```jsx
const InfractionAlert = ({ markersData, onUnitSelect }) => {
  // ✅ Arrays constantes memoizados
  const infractionStates = useMemo(
    () => [
      "infracción",
      "infraccion",
      "violación",
      "violacion",
      "exceso de velocidad",
      "infracción de velocidad",
      "infracción tiempo",
      "infracción movimiento"
    ],
    []
  );

  // ✅ Sets memoizados para comparaciones rápidas
  const activeInfractionIds = useMemo(
    () => new Set(activeInfractions.map((unit) => unit.Movil_ID)),
    [activeInfractions]
  );

  const historyInfractionIds = useMemo(
    () => new Set(historyInfractions.map((unit) => unit.Movil_ID)),
    [historyInfractions]
  );
```

#### **Funciones utilitarias memoizadas:**

```jsx
// ✅ Función de normalización memoizada
const normalizeString = useCallback(
  (str) =>
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim(),
  []
);

// ✅ Función de determinación de severidad memoizada
const determineInfractionSeverity = useCallback(
  (estado) => {
    const estadoLower = normalizeString(estado);

    if (estadoLower.includes("velocidad") || estadoLower.includes("exceso")) {
      return "high"; // error.main
    }
    if (estadoLower.includes("tiempo") || estadoLower.includes("descanso")) {
      return "medium"; // warning.main
    }
    return "low"; // info.main
  },
  [normalizeString]
);

// ✅ Función de formateo de tiempo memoizada
const formatInfractionTime = useCallback((fechaHora) => {
  const date = new Date(fechaHora);
  return date.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}, []);
```

#### **Handlers de eventos memoizados:**

```jsx
// ✅ Handler de eliminación individual memoizado
const handleRemoveFromHistory = useCallback((unitId, event) => {
  event.stopPropagation();
  setHistoryInfractions((prev) =>
    prev.filter((unit) => unit.Movil_ID !== unitId)
  );
}, []);

// ✅ Handler de limpiar historial memoizado
const handleClearAllHistory = useCallback((event) => {
  event.stopPropagation();
  setHistoryInfractions([]);
}, []);

// ✅ Handler de selección de unidad memoizado
const handleUnitSelect = useCallback(
  (unit) => {
    if (onUnitSelect) {
      const currentUnits = [...state.selectedUnits];
      const filteredUnits = currentUnits.filter((id) => id !== unit.Movil_ID);
      const updatedUnits = [...filteredUnits, unit.Movil_ID];
      onUnitSelect(updatedUnits);
    }
  },
  [onUnitSelect, state.selectedUnits]
);

// ✅ Handler de ordenamiento memoizado
const handleSortChange = useCallback(() => {
  setSortBy(sortBy === "alphabetic" ? "time" : "alphabetic");
}, [sortBy]);
```

#### **Componente InfractionItem memoizado:**

```jsx
// ✅ Componente completamente memoizado
const InfractionItem = React.memo(
  ({
    unit,
    index,
    isLast,
    isHistory,
    severityColor,
    formattedTime,
    onDelete,
    onUnitSelect,
  }) => (
    <ListItem
      key={unit.Movil_ID}
      disablePadding
      sx={{
        borderBottom: !isLast ? "1px solid" : "none",
        borderColor: "divider",
        opacity: isHistory ? 0.6 : 1,
      }}
    >
      {/* JSX del componente */}
    </ListItem>
  )
);
```

### **4. LÓGICA DE DETECCIÓN OPTIMIZADA**

#### **Detección de infracciones activas memoizada:**

```jsx
const activeInfractions = useMemo(() => {
  if (!markersData) return [];

  const currentTime = Date.now();
  const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

  return markersData.filter((unit) => {
    if (!unit.estado || !unit.fechaHora) return false;

    // Filtro por antigüedad
    const reportTime = new Date(unit.fechaHora).getTime();
    const timeDifference = currentTime - reportTime;

    if (timeDifference > TWELVE_HOURS_MS) {
      return false;
    }

    const estado = normalizeString(unit.estado);

    // Verificar si contiene palabras de infracción
    const hasInfractionState = infractionStates.some((infractionState) => {
      const normalizedInfractionState = normalizeString(infractionState);
      return estado.includes(normalizedInfractionState);
    });

    return hasInfractionState;
  });
}, [markersData, infractionStates, normalizeString]);
```

#### **Lógica de historial automático optimizada:**

```jsx
useEffect(() => {
  // Detectar unidades que salieron de infracción y moverlas al historial
  const processHistoryMovement = () => {
    // Obtener IDs de unidades actualmente en infracción
    const currentActiveIds = activeInfractionIds;

    // Encontrar unidades que estaban en infracción pero ya no están
    const previousActiveUnits = /* lógica para obtener unidades previas */;

    const unitsToMoveToHistory = previousActiveUnits.filter(
      (unit) => !currentActiveIds.has(unit.Movil_ID) &&
                !historyInfractionIds.has(unit.Movil_ID)
    );

    if (unitsToMoveToHistory.length > 0) {
      setHistoryInfractions((prev) => {
        // Evitar duplicados y limitar historial a 50 elementos
        const newHistory = [...prev, ...unitsToMoveToHistory];
        return newHistory.slice(0, 50); // Límite para rendimiento
      });
    }
  };

  processHistoryMovement();
}, [
  activeInfractions,
  activeInfractionIds,
  historyInfractionIds,
  // NO incluir historyInfractions - evita bucle infinito
]);
```

### **5. ORDENAMIENTO OPTIMIZADO**

#### **Ordenamiento de infracciones activas memoizado:**

```jsx
const sortedActiveInfractions = useMemo(() => {
  const units = [...activeInfractions];

  if (sortBy === "alphabetic") {
    units.sort((a, b) => (a.patente || "").localeCompare(b.patente || ""));
  } else if (sortBy === "time") {
    units.sort((a, b) => {
      const timeA = new Date(a.fechaHora).getTime();
      const timeB = new Date(b.fechaHora).getTime();
      return timeB - timeA; // Más recientes arriba
    });
  }

  return units;
}, [activeInfractions, sortBy]);
```

### **6. GESTIÓN DE ESTADOS CON CLEANUP**

#### **Cleanup automático de historial:**

```jsx
useEffect(() => {
  // Limpiar historial antiguo automáticamente
  const cleanupOldHistory = () => {
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const currentTime = Date.now();

    setHistoryInfractions((prev) =>
      prev.filter((unit) => {
        const unitTime = new Date(unit.fechaHora).getTime();
        return currentTime - unitTime < ONE_DAY_MS;
      })
    );
  };

  // Ejecutar limpieza cada 30 minutos
  const interval = setInterval(cleanupOldHistory, 30 * 60 * 1000);

  return () => clearInterval(interval);
}, []);
```

---

## 📊 MÉTRICAS DE RENDIMIENTO ESTIMADAS

### **Con optimizaciones aplicadas:**

- **Renders por segundo:** ~2-3 (vs 15-20 sin optimización)
- **Función recreations:** Solo cuando cambian dependencias
- **Gestión de memoria:** Historial limitado a 50 elementos
- **Cleanup automático:** Cada 30 minutos

### **Tiempo de implementación optimizado:**

- **Estimación original:** 3 horas
- **Con patrones optimizados:** 2-2.5 horas
- **Ahorro adicional:** 15-30% por aplicar patrones desde el inicio

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN OPTIMIZADA

### **Estructura base:**

- [ ] Crear `InfractionAlert.jsx` con estructura memoizada
- [ ] Implementar `InfractionItem.jsx` con React.memo
- [ ] Configurar imports con `useCallback`, `useMemo`, `React.memo`

### **Optimizaciones críticas:**

- [ ] Memoizar arrays constantes (`infractionStates`)
- [ ] Memoizar funciones utilitarias (`normalizeString`, `determineInfractionSeverity`)
- [ ] Memoizar handlers (`handleRemoveFromHistory`, `handleClearAllHistory`)
- [ ] Memoizar Sets para comparaciones (`activeInfractionIds`, `historyInfractionIds`)

### **Validaciones HTML:**

- [ ] Usar `component="div"` en Typography necesarios
- [ ] Configurar `primaryTypographyProps` y `secondaryTypographyProps`
- [ ] Validar anidamiento correcto de elementos

### **useEffect sin bucles:**

- [ ] Verificar dependencias de useEffect de gestión de historial
- [ ] NO incluir `historyInfractions` en dependencias si se modifica
- [ ] Implementar cleanup de intervalos

### **Testing con patrones de ralentí:**

- [ ] Validar detección de infracciones
- [ ] Verificar movimiento automático al historial
- [ ] Probar eliminación individual y masiva
- [ ] Confirmar ordenamiento correcto
- [ ] Validar cleanup automático

**Tiempo estimado con optimizaciones: 2-2.5 horas**

---

## ✅ RESUMEN DE PROPUESTA ACTUALIZADA

### **🎯 ENFOQUE DE DOS FASES:**

#### **FASE 1: Vista rápida (Lista actual)**

- **Propósito**: Gestión inmediata y eficiente de infracciones activas
- **Funcionalidad**: Lista expandible similar a IdleUnitsAlert con historial
- **Tiempo**: 3 horas de implementación
- **Beneficio**: Funcionalidad operativa inmediata

#### **FASE 2: Vista detallada (Modal con mini-mapa)**

- **Propósito**: Análisis profundo y gestión estratégica
- **Funcionalidad**: Modal completo con mapa interactivo, estadísticas y filtros
- **Tiempo**: 16 horas de implementación
- **Beneficio**: Herramienta de análisis y reporting avanzada

### **🔄 FLUJO DE USO PROPUESTO:**

```
1. Operador ve infracciones en lista rápida (Fase 1)
   ↓
2. Para casos simples: Gestiona desde la lista
   ↓
3. Para análisis profundo: Hace clic en "🔍 Expandir"
   ↓
4. Se abre modal con mini-mapa y herramientas avanzadas (Fase 2)
   ↓
5. Realiza análisis detallado, filtra, exporta reportes
   ↓
6. Cierra modal y vuelve a operación normal
```

### **💡 VALOR DIFERENCIAL:**

- **Flexibilidad**: Dos niveles de interacción según necesidad
- **Escalabilidad**: Sistema que crece con las necesidades del usuario
- **Usabilidad**: No sobrecarga la interfaz principal
- **Análisis**: Capacidades avanzadas cuando se requieren

### **🚀 PRÓXIMOS PASOS:**

1. **Implementar Fase 1** (lista rápida) para operación inmediata
2. **Validar UX** con usuarios reales
3. **Desarrollar Fase 2** (modal) basado en feedback
4. **Iterar y mejorar** según uso y necesidades

---

**El sistema está listo para implementación optimizada aplicando todos los patrones aprendidos en ralentí.**

_Documento actualizado: 27 de julio de 2025_  
_Versión: 2.0 - Incluye propuesta de modal expandido_  
_Estado: Listo para implementación por fases_

```

```
