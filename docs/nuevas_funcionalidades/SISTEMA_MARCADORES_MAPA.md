# SISTEMA DE MARCADORES EN MAPA - ESPECIFICACIONES TÉCNICAS

## Resumen Ejecutivo

### ¿Qué es el Sistema de Marcadores en Mapa?

Es una funcionalidad integral que permite a los usuarios del sistema de rastreo crear, gestionar y visualizar anotaciones personalizadas directamente sobre el mapa. Think of it as un "Microsoft Paint" pero para mapas GPS - los usuarios pueden dibujar, anotar y marcar lugares importantes de forma visual e interactiva.

### ¿Para qué sirve?

**Para empresas de logística y transporte:**

- Marcar zonas de carga/descarga, depósitos, puntos de entrega
- Delimitar áreas de trabajo o rutas preferenciales
- Anotar información importante sobre lugares específicos
- Calcular tiempos estimados de llegada (ETA) a destinos

**Para empresas de servicios:**

- Marcar ubicaciones de clientes, servicios programados
- Delimitar zonas de cobertura o territorios de trabajo
- Anotar información sobre accesos, restricciones, o características especiales
- Alertas automáticas cuando las unidades se acercan a destinos importantes

**Para administración y control:**

- Organizar información visual por capas (ventas, operaciones, mantenimiento)
- Compartir información entre usuarios del sistema
- Mantener un registro histórico de lugares y rutas importantes

### Funcionalidades Principales

#### 1. **Herramientas de Dibujo y Anotación**

- **Marcadores de punto:** Para ubicaciones específicas (clientes, depósitos, etc.)
- **Círculos:** Para delimitar áreas de influencia o zonas de trabajo
- **Rectángulos:** Para marcar áreas rectangulares (centros comerciales, zonas industriales)
- **Polígonos:** Para formas irregulares (barrios, zonas geográficas complejas)
- **Etiquetas de texto:** Para agregar información descriptiva
- **Iconos personalizados:** Biblioteca de iconos para diferentes tipos de lugares

#### 2. **Sistema de Organización por Capas**

- **Grupos temáticos:** Organizar marcadores por categorías (clientes, depósitos, rutas, etc.)
- **Control de visibilidad:** Mostrar/ocultar capas según necesidad
- **Colores personalizados:** Cada capa puede tener su propio esquema de colores
- **Permisos de acceso:** Capas privadas, compartidas o públicas

#### 3. **Sistema de Destinos y ETA** (Funcionalidad Avanzada)

- **Marcadores especiales:** Destinos con cálculo automático de tiempo de llegada
- **Alertas de proximidad:** Notificaciones cuando las unidades se acercan a destinos
- **Seguimiento en tiempo real:** Monitoreo continuo de distancia y ETA
- **Notificaciones sonoras:** Alertas audibles configurables

#### 4. **Gestión de Datos**

- **Persistencia:** Todos los marcadores se guardan en la base de datos
- **Sincronización:** Cambios en tiempo real entre usuarios
- **Importación/Exportación:** Capacidad de intercambiar datos con otros sistemas
- **Búsqueda y filtros:** Encontrar marcadores específicos rápidamente

### Beneficios del Sistema

#### **Operativos:**

- **Mejor planificación de rutas:** Visualización clara de puntos importantes
- **Reducción de tiempos muertos:** Información precisa sobre ubicaciones y accesos
- **Comunicación mejorada:** Información visual compartida entre equipos
- **Optimización de recursos:** Mejor asignación de unidades según proximidad a destinos

#### **Estratégicos:**

- **Base de datos geográfica:** Construcción de información valiosa sobre territorios
- **Análisis de cobertura:** Identificación de áreas con mayor/menor actividad
- **Histórico de operaciones:** Registro de lugares importantes y su evolución
- **Escalabilidad:** Sistema preparado para crecimiento futuro

#### **Técnicos:**

- **Integración seamless:** Se integra naturalmente con el sistema existente
- **Performance optimizada:** Diseñado para manejar grandes cantidades de marcadores
- **Responsive design:** Funciona tanto en desktop como en dispositivos móviles
- **APIs abiertas:** Posibilidad de integración con sistemas externos

### Casos de Uso Reales

#### **Empresa de Delivery:**

1. Marcan todos los restaurantes y zonas de entrega
2. Crean círculos para delimitar zonas de cobertura
3. Configuran alertas cuando los repartidores llegan cerca de destinos
4. Calculan ETAs automáticos para mejorar la experiencia del cliente

#### **Empresa de Logística:**

1. Marcan depósitos, centros de distribución y clientes principales
2. Delimitan zonas de trabajo para diferentes equipos
3. Anotan información sobre horarios, restricciones de acceso, contactos
4. Organizan por capas (urgentes, programados, mantenimiento)

#### **Empresa de Servicios Técnicos:**

1. Marcan ubicaciones de clientes con diferentes tipos de servicios
2. Usan iconos para identificar tipos de equipos o problemas
3. Crean polígonos para territorios de técnicos específicos
4. Configuran alertas para servicios prioritarios o programados

### Arquitectura del Sistema

El sistema está diseñado en **dos módulos principales**:

#### **Módulo Base - Sistema de Marcadores**

- Creación y edición de elementos visuales
- Gestión de capas y organización
- Herramientas de dibujo y personalización
- Control de permisos y visibilidad

#### **Módulo Avanzado - Sistema ETA y Destinos**

- Cálculo automático de tiempos de llegada
- Alertas de proximidad inteligentes
- Seguimiento de rutas en tiempo real
- Integración con APIs de routing externas

Esta separación permite implementar el sistema de forma **gradual y escalable**, comenzando con las funcionalidades básicas y agregando las avanzadas según las necesidades.

### Tecnologías Involucradas

#### **Frontend:**

- **React + Material-UI:** Interfaz moderna y responsive
- **Leaflet + Extensions:** Mapas interactivos con herramientas de dibujo
- **Context API:** Gestión de estado integrada con el sistema existente

#### **Backend:**

- **PHP + MySQL:** Integración con la arquitectura actual
- **APIs RESTful:** Endpoints estándar para todas las operaciones
- **JSON Storage:** Almacenamiento eficiente de coordenadas y propiedades

#### **APIs Externas:**

- **OpenRouteService:** Cálculo de rutas y ETAs precisos
- **Nominatim:** Geocoding para direcciones
- **Clustering algorithms:** Optimización de rendimiento con muchos marcadores

### Cronograma de Implementación

El desarrollo está planificado en **5 fases de 1-3 semanas cada una**:

1. **Sistema Base** (2-3 semanas): Marcadores básicos y CRUD
2. **Capas y Grupos** (1-2 semanas): Organización y visibilidad
3. **Herramientas Avanzadas** (2-3 semanas): Formas complejas e iconos
4. **Sistema ETA** (2-3 semanas): Destinos y cálculos automáticos
5. **Optimización** (1-2 semanas): Performance y testing

**Tiempo total estimado:** 8-13 semanas con posibilidad de entregas parciales funcionales.

---

## Descripción General

Sistema integral de marcadores y anotaciones en mapa que permite a los usuarios crear, gestionar y visualizar elementos gráficos personalizados sobre el mapa. Incluye formas geométricas, iconos, etiquetas de texto y un subsistema de destinos con cálculo de ETA.

## Estructura del Sistema

### 1. **Sistema Base de Marcadores**

- Creación y edición de marcadores visuales
- Gestión de capas y grupos
- Persistencia de datos
- Control de permisos y visibilidad

### 2. **Sistema de Destinos y ETA** (Funcionalidad Separada)

- Marcadores especiales para destinos
- Cálculo automático de ETA
- Alertas de proximidad
- Seguimiento de rutas

## Desarrollo Front-end

### 1. Componentes Principales

#### MapMarkersSystem.jsx

```jsx
// Componente principal del sistema de marcadores
const MapMarkersSystem = () => {
  // Estados principales
  const [markersEnabled, setMarkersEnabled] = useState(false);
  const [currentTool, setCurrentTool] = useState(null);
  const [activeLayer, setActiveLayer] = useState("default");
  const [markerGroups, setMarkerGroups] = useState([]);

  // Herramientas disponibles
  const tools = ["point", "circle", "rectangle", "polygon", "text", "icon"];

  return (
    <div className="map-markers-system">
      <MarkersToolbar />
      <MarkersLayerManager />
      <MarkersPropertiesPanel />
    </div>
  );
};
```

#### MarkersToolbar.jsx

```jsx
// Barra de herramientas flotante
const MarkersToolbar = () => {
  return (
    <Paper className="markers-toolbar">
      <ToggleButtonGroup>
        <ToggleButton value="point">
          <LocationOnIcon />
        </ToggleButton>
        <ToggleButton value="circle">
          <RadioButtonUncheckedIcon />
        </ToggleButton>
        <ToggleButton value="rectangle">
          <CropDinIcon />
        </ToggleButton>
        <ToggleButton value="polygon">
          <PolylineIcon />
        </ToggleButton>
        <ToggleButton value="text">
          <TextFieldsIcon />
        </ToggleButton>
        <ToggleButton value="icon">
          <InsertEmoticonIcon />
        </ToggleButton>
      </ToggleButtonGroup>
    </Paper>
  );
};
```

#### MarkersLayerManager.jsx

```jsx
// Gestor de capas y grupos
const MarkersLayerManager = () => {
  return (
    <Accordion>
      <AccordionSummary>
        <Typography>Capas de Marcadores</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <List>
          {markerGroups.map((group) => (
            <LayerItem key={group.id} group={group} />
          ))}
        </List>
        <Button onClick={createNewGroup}>
          <AddIcon /> Nueva Capa
        </Button>
      </AccordionDetails>
    </Accordion>
  );
};
```

#### MarkersPropertiesPanel.jsx

```jsx
// Panel de propiedades del marcador seleccionado
const MarkersPropertiesPanel = ({ selectedMarker }) => {
  return (
    <Paper className="properties-panel">
      <Typography variant="h6">Propiedades</Typography>

      {/* Propiedades básicas */}
      <TextField label="Nombre" />
      <TextField label="Descripción" multiline />

      {/* Propiedades visuales */}
      <ColorPicker label="Color" />
      <Slider label="Opacidad" min={0} max={100} />
      <Select label="Estilo de línea" />

      {/* Propiedades específicas por tipo */}
      {selectedMarker?.type === "text" && (
        <Typography variant="subtitle2">Texto</Typography>
      )}

      {selectedMarker?.type === "icon" && <IconSelector />}
    </Paper>
  );
};
```

### 2. Sistema de Iconos

#### IconSelector.jsx

```jsx
const IconSelector = () => {
  const iconCategories = {
    lugares: ["restaurant", "gas_station", "hospital", "school", "bank"],
    transporte: ["directions_car", "local_shipping", "directions_bus"],
    alertas: ["warning", "error", "info", "help"],
    custom: [], // Iconos personalizados subidos por el usuario
  };

  return (
    <Grid container spacing={1}>
      {Object.entries(iconCategories).map(([category, icons]) => (
        <Grid item xs={12} key={category}>
          <Typography variant="subtitle2">{category}</Typography>
          <Grid container spacing={1}>
            {icons.map((icon) => (
              <Grid item key={icon}>
                <IconButton onClick={() => selectIcon(icon)}>
                  <Icon>{icon}</Icon>
                </IconButton>
              </Grid>
            ))}
          </Grid>
        </Grid>
      ))}
    </Grid>
  );
};
```

### 3. Integración con Leaflet

#### LeafletMarkersLayer.jsx

```jsx
const LeafletMarkersLayer = () => {
  const map = useMap();
  const { markers, currentTool } = useMarkersContext();

  useEffect(() => {
    if (!currentTool) return;

    // Configurar herramientas de dibujo
    const drawControl = new L.Control.Draw({
      position: "topright",
      draw: {
        marker: currentTool === "point",
        circle: currentTool === "circle",
        rectangle: currentTool === "rectangle",
        polygon: currentTool === "polygon",
      },
    });

    map.addControl(drawControl);

    // Event listeners para creación de marcadores
    map.on(L.Draw.Event.CREATED, handleMarkerCreated);

    return () => {
      map.removeControl(drawControl);
      map.off(L.Draw.Event.CREATED, handleMarkerCreated);
    };
  }, [currentTool, map]);

  const handleMarkerCreated = (e) => {
    const { layer, layerType } = e;

    const newMarker = {
      id: generateId(),
      type: layerType,
      coordinates: getCoordinatesFromLayer(layer),
      properties: getDefaultProperties(layerType),
      groupId: activeLayer,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.id,
    };

    addMarker(newMarker);
  };

  return null; // Componente que solo maneja lógica
};
```

### 4. Estados en Context

```jsx
// Nuevos estados a añadir en Context.jsx
const markersContext = {
  // Sistema de marcadores
  markersEnabled: false,
  currentTool: null, // 'point', 'circle', 'rectangle', 'polygon', 'text', 'icon'
  activeLayer: "default",
  selectedMarker: null,

  // Datos de marcadores
  markers: [], // Array de todos los marcadores
  markerGroups: [], // Array de grupos/capas

  // Estados de UI
  showPropertiesPanel: false,
  showLayerManager: false,

  // Funciones
  setMarkersEnabled: () => {},
  setCurrentTool: () => {},
  setActiveLayer: () => {},
  addMarker: () => {},
  updateMarker: () => {},
  deleteMarker: () => {},
  selectMarker: () => {},
};
```

### 5. Botón de Acceso Principal

#### MapMarkersButton.jsx

```jsx
const MapMarkersButton = () => {
  const { markersEnabled, setMarkersEnabled } = useMarkersContext();

  return (
    <Tooltip title="Sistema de Marcadores">
      <Fab
        color={markersEnabled ? "primary" : "default"}
        onClick={() => setMarkersEnabled(!markersEnabled)}
        className="map-markers-button"
      >
        <EditLocationIcon />
      </Fab>
    </Tooltip>
  );
};
```

## Sistema de Destinos y ETA (Funcionalidad Separada)

### 1. Componentes del Sistema ETA

#### DestinationSystem.jsx

```jsx
const DestinationSystem = () => {
  const [destinations, setDestinations] = useState([]);
  const [etaCalculations, setEtaCalculations] = useState({});
  const [proximityAlerts, setProximityAlerts] = useState([]);

  return (
    <div className="destination-system">
      <DestinationToolbar />
      <DestinationsList />
      <ETAPanel />
      <ProximityAlertsPanel />
    </div>
  );
};
```

#### DestinationMarker.jsx

```jsx
const DestinationMarker = ({ destination, unit }) => {
  const [eta, setEta] = useState(null);
  const [distance, setDistance] = useState(null);

  useEffect(() => {
    if (unit && destination) {
      calculateETA(unit.position, destination.coordinates).then((result) => {
        setEta(result.eta);
        setDistance(result.distance);
      });
    }
  }, [unit.position, destination.coordinates]);

  return (
    <Marker position={destination.coordinates}>
      <Popup>
        <div className="destination-popup">
          <Typography variant="h6">{destination.name}</Typography>
          <Typography>Distancia: {distance}km</Typography>
          <Typography>ETA: {eta} minutos</Typography>
          <Typography>Unidad: {unit.patente}</Typography>
        </div>
      </Popup>
    </Marker>
  );
};
```

#### ETACalculator.js

```javascript
class ETACalculator {
  static async calculateETA(origin, destination, unit) {
    try {
      // Usar API de routing (OpenRouteService o similar)
      const route = await this.getRoute(origin, destination);

      const distance = route.distance; // en metros
      const duration = route.duration; // en segundos

      // Ajustar según velocidad promedio de la unidad
      const avgSpeed = await this.getUnitAverageSpeed(unit.id);
      const adjustedETA = this.adjustETABySpeed(duration, avgSpeed);

      return {
        eta: Math.round(adjustedETA / 60), // en minutos
        distance: Math.round(distance / 1000), // en km
        route: route.geometry,
      };
    } catch (error) {
      console.error("Error calculating ETA:", error);
      return this.calculateStraightLineETA(origin, destination);
    }
  }

  static calculateStraightLineETA(origin, destination) {
    const distance = this.calculateDistance(origin, destination);
    const avgSpeed = 50; // km/h por defecto
    const eta = (distance / avgSpeed) * 60; // en minutos

    return {
      eta: Math.round(eta),
      distance: Math.round(distance),
      route: null,
    };
  }

  static async getUnitAverageSpeed(unitId) {
    // Consultar velocidad promedio histórica de la unidad
    const response = await fetch(
      `/api/servicio/unidades.php/avg-speed?id=${unitId}`
    );
    const data = await response.json();
    return data.averageSpeed || 50; // Default 50 km/h
  }
}
```

### 2. Sistema de Alertas de Proximidad

#### ProximityAlertSystem.jsx

```jsx
const ProximityAlertSystem = () => {
  const { selectedUnits, destinations } = useContext(Context);
  const [activeAlerts, setActiveAlerts] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      checkProximityAlerts();
    }, 30000); // Verificar cada 30 segundos

    return () => clearInterval(interval);
  }, [selectedUnits, destinations]);

  const checkProximityAlerts = () => {
    selectedUnits.forEach((unit) => {
      destinations.forEach((destination) => {
        if (destination.alertEnabled) {
          const distance = calculateDistance(
            unit.position,
            destination.coordinates
          );

          if (distance <= destination.alertRadius) {
            triggerProximityAlert(unit, destination, distance);
          }
        }
      });
    });
  };

  const triggerProximityAlert = (unit, destination, distance) => {
    const alert = {
      id: generateId(),
      unitId: unit.Movil_ID,
      destinationId: destination.id,
      distance: Math.round(distance * 1000), // en metros
      timestamp: new Date().toISOString(),
      type: "proximity",
    };

    setActiveAlerts((prev) => [...prev, alert]);

    // Mostrar notificación
    showNotification({
      title: "Unidad cerca del destino",
      message: `${unit.patente} está a ${alert.distance}m de ${destination.name}`,
      severity: "info",
    });

    // Reproducir sonido si está habilitado
    if (destination.soundAlert) {
      playAlertSound();
    }
  };

  return (
    <Paper className="proximity-alerts">
      <Typography variant="h6">Alertas de Proximidad</Typography>
      <List>
        {activeAlerts.map((alert) => (
          <AlertItem key={alert.id} alert={alert} />
        ))}
      </List>
    </Paper>
  );
};
```

## Desarrollo Back-end

### 1. Base de Datos

#### Tabla: map_markers

```sql
CREATE TABLE map_markers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    group_id INT DEFAULT 1,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('point', 'circle', 'rectangle', 'polygon', 'text', 'icon') NOT NULL,
    coordinates JSON NOT NULL,
    properties JSON NOT NULL,
    visibility ENUM('private', 'shared', 'public') DEFAULT 'private',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES marker_groups(id) ON DELETE SET NULL,

    INDEX idx_user_id (user_id),
    INDEX idx_group_id (group_id),
    INDEX idx_type (type)
);
```

#### Tabla: marker_groups

```sql
CREATE TABLE marker_groups (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#FF0000',
    visibility ENUM('private', 'shared', 'public') DEFAULT 'private',
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,

    INDEX idx_user_id (user_id)
);
```

#### Tabla: destinations (Sistema ETA)

```sql
CREATE TABLE destinations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    alert_enabled BOOLEAN DEFAULT FALSE,
    alert_radius INT DEFAULT 500,
    sound_alert BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,

    INDEX idx_user_id (user_id),
    INDEX idx_coordinates (latitude, longitude)
);
```

#### Tabla: eta_calculations

```sql
CREATE TABLE eta_calculations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    unit_id INT NOT NULL,
    destination_id INT NOT NULL,
    distance_km DECIMAL(8, 2) NOT NULL,
    eta_minutes INT NOT NULL,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,

    INDEX idx_unit_destination (unit_id, destination_id),
    INDEX idx_calculated_at (calculated_at)
);
```

### 2. Endpoints API

#### Marcadores (/api/servicio/markers.php)

```php
// GET /api/servicio/markers.php - Obtener marcadores del usuario
function getMarkers($userId, $groupId = null) {
    global $conn;

    $query = "SELECT m.*, g.name as group_name, g.color as group_color
              FROM map_markers m
              LEFT JOIN marker_groups g ON m.group_id = g.id
              WHERE m.user_id = ?";

    if ($groupId) {
        $query .= " AND m.group_id = ?";
    }

    $query .= " ORDER BY m.created_at DESC";

    $stmt = $conn->prepare($query);
    if ($groupId) {
        $stmt->bind_param("ii", $userId, $groupId);
    } else {
        $stmt->bind_param("i", $userId);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $markers = [];
    while ($row = $result->fetch_assoc()) {
        $row['coordinates'] = json_decode($row['coordinates'], true);
        $row['properties'] = json_decode($row['properties'], true);
        $markers[] = $row;
    }

    return $markers;
}

// POST /api/servicio/markers.php - Crear nuevo marcador
function createMarker($data) {
    global $conn;

    $query = "INSERT INTO map_markers (user_id, group_id, name, description, type, coordinates, properties, visibility)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($query);
    $stmt->bind_param("iissssss",
        $data['user_id'],
        $data['group_id'],
        $data['name'],
        $data['description'],
        $data['type'],
        json_encode($data['coordinates']),
        json_encode($data['properties']),
        $data['visibility']
    );

    if ($stmt->execute()) {
        return [
            'id' => $conn->insert_id,
            'success' => true
        ];
    }

    return ['success' => false, 'error' => $stmt->error];
}

// PUT /api/servicio/markers.php - Actualizar marcador
function updateMarker($id, $data, $userId) {
    global $conn;

    $query = "UPDATE map_markers SET
              name = ?, description = ?, coordinates = ?, properties = ?, visibility = ?
              WHERE id = ? AND user_id = ?";

    $stmt = $conn->prepare($query);
    $stmt->bind_param("sssssii",
        $data['name'],
        $data['description'],
        json_encode($data['coordinates']),
        json_encode($data['properties']),
        $data['visibility'],
        $id,
        $userId
    );

    return $stmt->execute();
}

// DELETE /api/servicio/markers.php - Eliminar marcador
function deleteMarker($id, $userId) {
    global $conn;

    $query = "DELETE FROM map_markers WHERE id = ? AND user_id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("ii", $id, $userId);

    return $stmt->execute();
}
```

#### Grupos de Marcadores (/api/servicio/marker-groups.php)

```php
// GET /api/servicio/marker-groups.php - Obtener grupos del usuario
function getMarkerGroups($userId) {
    global $conn;

    $query = "SELECT g.*,
              COUNT(m.id) as marker_count
              FROM marker_groups g
              LEFT JOIN map_markers m ON g.id = m.group_id
              WHERE g.user_id = ?
              GROUP BY g.id
              ORDER BY g.display_order, g.name";

    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $userId);
    $stmt->execute();

    return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
}

// POST /api/servicio/marker-groups.php - Crear nuevo grupo
function createMarkerGroup($data) {
    global $conn;

    $query = "INSERT INTO marker_groups (user_id, name, description, color, visibility)
              VALUES (?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($query);
    $stmt->bind_param("issss",
        $data['user_id'],
        $data['name'],
        $data['description'],
        $data['color'],
        $data['visibility']
    );

    if ($stmt->execute()) {
        return [
            'id' => $conn->insert_id,
            'success' => true
        ];
    }

    return ['success' => false, 'error' => $stmt->error];
}
```

#### Sistema de Destinos (/api/servicio/destinations.php)

```php
// GET /api/servicio/destinations.php - Obtener destinos del usuario
function getDestinations($userId) {
    global $conn;

    $query = "SELECT * FROM destinations WHERE user_id = ? ORDER BY name";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $userId);
    $stmt->execute();

    return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
}

// POST /api/servicio/destinations.php - Crear nuevo destino
function createDestination($data) {
    global $conn;

    $query = "INSERT INTO destinations (user_id, name, description, latitude, longitude, alert_enabled, alert_radius, sound_alert)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($query);
    $stmt->bind_param("issddiib",
        $data['user_id'],
        $data['name'],
        $data['description'],
        $data['latitude'],
        $data['longitude'],
        $data['alert_enabled'],
        $data['alert_radius'],
        $data['sound_alert']
    );

    return $stmt->execute() ? $conn->insert_id : false;
}

// GET /api/servicio/eta.php - Calcular ETA para una unidad y destino
function calculateETA($unitId, $destinationId) {
    // Obtener posición actual de la unidad
    $unitPosition = getCurrentUnitPosition($unitId);
    if (!$unitPosition) {
        return ['error' => 'Unidad no encontrada'];
    }

    // Obtener información del destino
    $destination = getDestination($destinationId);
    if (!$destination) {
        return ['error' => 'Destino no encontrado'];
    }

    // Calcular distancia y ETA
    $distance = calculateDistance(
        $unitPosition['latitude'],
        $unitPosition['longitude'],
        $destination['latitude'],
        $destination['longitude']
    );

    // Obtener velocidad promedio de la unidad
    $avgSpeed = getUnitAverageSpeed($unitId);
    $eta = ($distance / $avgSpeed) * 60; // en minutos

    // Guardar cálculo en base de datos
    saveETACalculation($unitId, $destinationId, $distance, $eta);

    return [
        'distance_km' => round($distance, 2),
        'eta_minutes' => round($eta),
        'avg_speed' => $avgSpeed,
        'calculated_at' => date('Y-m-d H:i:s')
    ];
}
```

## Integración y Flujos de Trabajo

### 1. Flujo de Creación de Marcadores

1. Usuario activa el sistema de marcadores
2. Selecciona herramienta de dibujo
3. Hace clic/dibuja en el mapa
4. Se abre panel de propiedades
5. Usuario configura nombre, descripción, estilo
6. Sistema guarda marcador en base de datos
7. Marcador aparece en la capa activa

### 2. Flujo de Sistema ETA

1. Usuario crea destino en el mapa
2. Selecciona unidades para seguimiento
3. Sistema calcula ETA automáticamente cada minuto
4. Muestra información en popup del destino
5. Genera alertas de proximidad si están habilitadas
6. Actualiza cálculos cuando la unidad se mueve

### 3. Gestión de Capas

1. Usuario crea nueva capa/grupo
2. Puede mover marcadores entre capas
3. Controla visibilidad por capa
4. Exporta/importa capas completas
5. Comparte capas con otros usuarios

## Consideraciones Técnicas

### 1. Rendimiento

- Usar clustering para marcadores numerosos
- Lazy loading de propiedades de marcadores
- Cache de cálculos ETA frecuentes
- Optimización de consultas con índices apropiados

### 2. Seguridad

- Validación de permisos por marcador/grupo
- Sanitización de datos de entrada
- Rate limiting para API de cálculo ETA
- Validación de coordenadas geográficas

### 3. Escalabilidad

- Paginación para listados grandes
- Sistema de archivos para iconos personalizados
- CDN para recursos estáticos
- Compresión de datos JSON en base de datos

### 4. Compatibilidad

- Soporte para diferentes formatos de importación
- API REST estándar para integraciones
- Responsive design para móviles
- Fallbacks para APIs de routing externas

## Plan de Implementación

### Fase 1: Sistema Base de Marcadores (2-3 semanas)

- Estructura de base de datos
- Componentes básicos de UI
- CRUD de marcadores simples
- Integración con Leaflet

### Fase 2: Sistema de Capas y Grupos (1-2 semanas)

- Gestión de grupos
- Control de visibilidad
- Panel de capas
- Permisos básicos

### Fase 3: Herramientas Avanzadas (2-3 semanas)

- Formas geométricas complejas
- Sistema de iconos
- Propiedades avanzadas
- Importación/exportación

### Fase 4: Sistema de Destinos y ETA (2-3 semanas)

- Base de datos para destinos
- Cálculo de ETA
- Alertas de proximidad
- Panel de seguimiento

### Fase 5: Optimización y Testing (1-2 semanas)

- Optimización de rendimiento
- Testing integral
- Documentación
- Capacitación de usuarios

## Estimaciones Técnicas

- **Complejidad backend:** Alta (múltiples tablas, cálculos complejos)
- **Complejidad frontend:** Alta (múltiples componentes, integración Leaflet)
- **Riesgos potenciales:**
  - Rendimiento con muchos marcadores
  - Precisión de cálculos ETA
  - Integración con APIs externas de routing
  - Gestión de memoria en frontend

## Dependencias y Recursos

### Librerías Frontend

- leaflet-draw: Herramientas de dibujo
- react-color: Selector de colores
- @mui/x-date-pickers: Selectores de fecha/hora
- leaflet-markercluster: Clustering de marcadores

### APIs Externas

- OpenRouteService: Cálculo de rutas y ETA
- Nominatim: Geocoding reverso para direcciones
- OpenWeatherMap: Condiciones de tráfico (opcional)

### Recursos del Servidor

- Espacio adicional en base de datos: ~100MB inicial
- Procesamiento para cálculos ETA: CPU intensivo
- Ancho de banda para APIs externas: Moderado
- Almacenamiento de iconos personalizados: ~50MB
