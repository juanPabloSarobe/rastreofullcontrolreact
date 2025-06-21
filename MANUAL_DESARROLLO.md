# Manual de Desarrollo - FullControl GPS

## Información General del Proyecto

**FullControl GPS** es una aplicación web React para el rastreo y gestión de flotas de vehículos GPS en tiempo real. El sistema permite monitorear unidades, generar reportes, gestionar flotas y ver históricos de rutas.

### Tecnologías Utilizadas

- **Frontend**: React 19.0.0 con Vite 6.2.0
- **UI Framework**: Material-UI (MUI) v7.0.1 + Joy UI v5.0.0-beta.52
- **Mapas**: Leaflet 1.9.4 con React-Leaflet 5.0.0-rc.2
- **Gestión de Estado**: React Context API
- **Fechas**: Day.js 1.11.13 con MUI Date Pickers
- **Virtualización**: react-window 1.8.11
- **Reportes**: jsPDF 3.0.1
- **Build Tool**: Vite con ESLint

## Arquitectura del Proyecto

### Estructura de Directorios

```
src/
├── components/
│   ├── common/          # Componentes reutilizables
│   ├── pages/           # Páginas principales
│   └── dev/             # Herramientas de desarrollo
├── context/             # Context API para estado global
├── hooks/               # Custom hooks
├── utils/               # Utilidades y servicios
├── assets/              # Recursos estáticos
└── data/                # Datos estáticos (JSON)
```

### Componentes Principales

#### Páginas

- **Login.jsx**: Autenticación de usuarios
- **PrincipalPage.jsx**: Dashboard principal con mapa
- **HistoricalView.jsx**: Vista de históricos

#### Componentes Comunes

- **UnitSelector.jsx**: Selector de unidades con virtualización
- **UnitDetails.jsx**: Detalles de unidad seleccionada
- **MenuButton.jsx**: Menú principal de la aplicación
- **CustomMarker.jsx**: Marcadores personalizados en el mapa
- **FleetAdminModal.jsx**: Administración de flotas
- **ExportSpeedDial.jsx**: Exportación de datos (Excel, KML)
- **LocationReportModal.jsx**: ⭐ NUEVO - Reporte de posición con geocodificación

#### Modales y Notificaciones ⭐ NUEVO

- **LocationReportModal.jsx**: Generación de reportes de posición
  - Geocodificación automática de coordenadas
  - Exportación Excel con timestamps y protección
  - Notificaciones sonoras y visuales
  - Rate limiting para cumplimiento de políticas OSM
  - Vista móvil optimizada con tarjetas expandibles

## APIs y Endpoints

### Autenticación

```javascript
POST /api/servicio/login.php/login
Content-Type: application/x-www-form-urlencoded
Body: usuario={username}&clave={password}
```

### Datos de Unidades

```javascript
// Datos principales (cada 30s)
GET / api / servicio / equipos.php / pref;

// Datos lite (cada 30s)
GET / api / servicio / equipos.php / lite;
```

### Históricos

```javascript
// Histórico optimizado
GET /api/servicio/historico.php/optimo/?movil={id}&fechaInicial={date}&fechaFinal={date}

// Histórico detallado
GET /api/servicio/historico.php/historico?movil={id}&fechaInicial={date}&fechaFinal={date}
```

### Flotas

```javascript
// Listar flotas por usuario
GET /api/servicio/consultasFlota.php/flotaXUsuario/{userId}

// Rastrear flota específica
GET /api/servicio/consultasFlota.php/rastrearFlota/{fleetId}

// Asignar vehículo a flota
POST /api/servicio/consultasFlota.php/asignarVehiculo
FormData: flota={fleetId}&vehiculo={vehicleId}
```

### Exportación

```javascript
// Excel de históricos
GET /api/servicio/excel.php?movil={id}&fechaInicial={date}&fechaFinal={date}
```

### Geocodificación ⭐ NUEVO

El sistema incluye servicios de geocodificación para convertir coordenadas GPS a direcciones:

```javascript
// Proveedores disponibles (en orden de prioridad)
1. Nominatim (OpenStreetMap) - Principal
2. Photon (OpenStreetMap) - Respaldo
3. BigDataCloud - Emergencia

// Rate limiting para cumplimiento de políticas
const NOMINATIM_DELAY = 1100; // 1.1 segundos entre requests
```

#### Políticas de Uso

- **Nominatim**: Máximo 1 request por segundo + User-Agent obligatorio
- **Cumplimiento OSM**: Atribución requerida + límites respetados
- **Fallback automático**: Si un proveedor falla, usa el siguiente

## Estado Global (Context)

### Estructura del Estado

```javascript
{
  accessGranted: boolean,
  user: string,
  role: string, // "Administrador", "Proveedor", etc.
  viewMode: string, // "rastreo" | "historico"
  unitData: object,
  hideLowUnits: boolean,
  selectedUnits: array
}
```

### Acciones Disponibles

- `SET_ACCESS_GRANTED`
- `SET_USER`
- `SET_ROLE`
- `SET_VIEW_MODE`
- `SET_HISTORY_UNIT`
- `SET_HIDE_LOW_UNITS`
- `SET_SELECTED_UNITS`

## Custom Hooks

### usePrefFetch

Hook para fetch periódico de datos con control de habilitación:

```javascript
const { data, loading, error } = usePrefFetch(url, interval, enabled);
```

### useNotifications

Gestión de notificaciones del sistema:

```javascript
const {
  activeNotification,
  markAsRead,
  dismissNotification,
  createNotification,
} = useNotifications();
```

## Configuración de Desarrollo

### Variables de Entorno

```bash
VITE_APP_TARGET=https://plataforma.fullcontrolgps.com.ar
```

### Scripts de Desarrollo

```json
{
  "dev": "vite",
  "build": "vite build",
  "prebuild": "node ./update-version.js",
  "preview": "vite preview",
  "lint": "eslint ."
}
```

### Proxy de Desarrollo (vite.config.js)

```javascript
proxy: {
  "/api": {
    target: "https://plataforma.fullcontrolgps.com.ar",
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, "")
  }
}
```

## Características Técnicas

### Responsive Design

- **Mobile First**: Diseño optimizado para móviles
- **Breakpoints**: Utiliza MUI breakpoints (xs, sm, md, lg, xl)
- **Viewport Handling**: Control de altura de viewport móvil

### Optimizaciones de Performance

- **Virtualización**: react-window para listas largas
- **Memoización**: React.memo para componentes pesados
- **Debounce**: use-debounce para búsquedas
- **Lazy Loading**: Componentes de desarrollo

### Exportación Excel Avanzada ⭐ NUEVO

#### Generación de Archivos con Timestamp

```javascript
// Formateo de timestamp para nombre de archivo
const fileTimestamp = now
  .toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
  .replace(/[\/\s:]/g, "_");

// Resultado: 20_06_2025_14_30
const fileName = `Reporte_Posicion_Actual_${scope}_${fileTimestamp}.xlsx`;
```

#### Protección de Hojas Excel

```javascript
// Configuración de protección
ws["!protect"] = {
  password: "password",
  selectLockedCells: true,
  selectUnlockedCells: true,
  sort: true, // ✅ Permitir ordenar
  autoFilter: true, // ✅ Permitir filtros
  formatCells: false, // ❌ Bloquear formato
  insertRows: false, // ❌ Bloquear inserción
  deleteRows: false, // ❌ Bloquear eliminación
};
```

#### Geocodificación con Rate Limiting

```javascript
// Control de velocidad para políticas OSM
const processWithDelay = async (items, delay = 1100) => {
  for (const item of items) {
    await geocodeAddress(item);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
};

// Manejo de múltiples proveedores
const geocodeWithFallback = async (lat, lng) => {
  try {
    return await nominatimGeocode(lat, lng);
  } catch (error) {
    try {
      return await photonGeocode(lat, lng);
    } catch (error) {
      return await bigDataCloudGeocode(lat, lng);
    }
  }
};
```

### Sistema de Notificaciones ⭐ NUEVO

#### Audio Web API

```javascript
// Sonido de finalización
const playCompletionSound = () => {
  const audioContext = new AudioContext();
  const frequencies = [523.25, 659.25, 783.99]; // Do-Mi-Sol

  frequencies.forEach((freq, index) => {
    const oscillator = audioContext.createOscillator();
    oscillator.frequency.setValueAtTime(
      freq,
      audioContext.currentTime + index * 0.2
    );
    // ... configuración adicional
  });
};
```

#### Gestión de Permisos

```javascript
// Manejo inteligente de permisos de notificación
const requestNotificationPermission = async () => {
  if (Notification.permission === "default") {
    return await Notification.requestPermission();
  }
  return Notification.permission;
};

// Polling de cambios de permisos
useEffect(() => {
  const interval = setInterval(() => {
    setPermissionStatus(Notification.permission);
  }, 2000);
  return () => clearInterval(interval);
}, []);
```

### Gestión de Caché

- **UpdateService**: Sistema automático de detección de versiones
- **Cache Busting**: Timestamps en requests de versión
- **Service Worker**: Limpieza automática de caché

## Patrones de Desarrollo

### Manejo de Errores

```javascript
try {
  const response = await fetch(url, { credentials: "include" });
  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }
  const data = await response.json();
} catch (error) {
  console.error("Error detallado:", error);
}
```

### Componentes Modales

```javascript
<Modal
  open={open}
  onClose={(e, reason) => {
    if (reason !== "backdropClick") {
      onClose();
    }
  }}
  disableEscapeKeyDown
>
```

### Gestión de Loading States

```javascript
const [loading, setLoading] = useState(false);

const handleAction = async () => {
  try {
    setLoading(true);
    // Operación async
  } finally {
    setLoading(false);
  }
};
```

## Deployment

### Build de Producción

```bash
npm run build
```

### Archivos Generados

- `dist/assets/`: Archivos estáticos con hash
- `dist/index.html`: HTML principal
- `public/version.json`: Información de versión

### Sistema de Versiones

- **Pre-build**: Actualización automática de versión
- **Changelog**: Generación automática desde changelog.txt
- **Detección**: Sistema automático de nuevas versiones

## Testing y Debugging

### Herramientas de Desarrollo

- **UpdateTester**: Simulador de actualizaciones (solo en desarrollo)
- **React DevTools**: Para debugging del estado
- **Network Tab**: Monitoreo de requests API

### Logs y Debugging

```javascript
// Logs estructurados
console.error("Error específico:", error);
console.log("Estado actual:", state);

// Debug condicional
if (process.env.NODE_ENV === "development") {
  console.log("Debug info:", data);
}
```

### Debugging y Troubleshooting

#### Herramientas de Desarrollo

```javascript
// Debug de geocodificación
console.log("Geocoding provider:", provider);
console.log("Rate limit delay:", NOMINATIM_DELAY);
console.log("Request headers:", headers);

// Monitoreo de performance
const startTime = performance.now();
await geocodeUnit(unit);
const endTime = performance.now();
console.log(`Geocoding took ${endTime - startTime} milliseconds`);
```

#### Logs de Exportación Excel

```javascript
// Información del archivo generado
console.log("Excel filename:", fileName);
console.log("Timestamp format:", timestamp);
console.log("Protection settings:", ws["!protect"]);
console.log("Data rows:", geocodedData.length);
```

## Documentación del Proyecto

### Estructura de Documentación

La documentación está organizada en `docs/` con las siguientes carpetas:

```
docs/
├── mejoras/          # 11 archivos - Implementaciones detalladas
├── testing/          # 6 archivos - Guías de pruebas
├── cumplimiento/     # 3 archivos - Políticas y legal
└── estados/          # 5 archivos - Resúmenes ejecutivos
```

#### Archivos Clave de Documentación

**Mejoras Implementadas:**

- `MEJORAS_EXPORTACION_EXCEL.md` - Detalles técnicos Excel
- `CORRECCION_CONTEO_UNIDADES.md` - Fix de inconsistencia
- `MEJORAS_VISTA_MOVIL.md` - Optimización móvil
- `NOTIFICACION_SONORA_FINALIZACION.md` - Sistema audio

**Testing y Verificación:**

- `TESTING_EXPORTACION_EXCEL.md` - Pruebas Excel
- `LISTA_VERIFICACION_FINAL.md` - Checklist completo
- `TESTING_CUMPLIMIENTO_NOMINATIM.md` - Verificación OSM

**Cumplimiento Legal:**

- `CUMPLIMIENTO_POLITICA_NOMINATIM.md` - Políticas OSM
- `CORRECCION_URGENTE_GEOCODING.md` - Fixes críticos

### Versionado del Sistema

#### Control de Versiones Automático

```javascript
// update-version.js
const fs = require("fs");
const path = require("path");

const updateVersion = () => {
  const versionData = {
    version: new Date().toISOString(),
    build: process.env.BUILD_NUMBER || "local",
    features: [
      "Excel export with timestamps",
      "Geocoding with OSM compliance",
      "Mobile optimization",
      "Audio notifications",
    ],
  };

  fs.writeFileSync(
    path.join("public", "version.json"),
    JSON.stringify(versionData, null, 2)
  );
};
```

#### Sistema de Actualizaciones

```javascript
// src/utils/updateService.js
export const checkForUpdates = async () => {
  try {
    const response = await fetch("/version.json");
    const versionData = await response.json();

    const lastCheck = localStorage.getItem("lastVersionCheck");
    if (lastCheck !== versionData.version) {
      localStorage.setItem("lastVersionCheck", versionData.version);
      return { hasUpdates: true, version: versionData };
    }

    return { hasUpdates: false };
  } catch (error) {
    console.error("Error checking updates:", error);
    return { hasUpdates: false };
  }
};
```

## Best Practices Implementadas

### Geocodificación Responsable

```javascript
// ✅ CORRECTO: Rate limiting respetado
const geocodeWithPolicy = async (lat, lng) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "FullControlGPS/1.0 (contact@fullcontrolgps.com.ar)",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return await response.json();
  } finally {
    // Rate limiting obligatorio
    await new Promise((resolve) => setTimeout(resolve, 1100));
  }
};

// ❌ INCORRECTO: Sin rate limiting
const geocodeBad = async (lat, lng) => {
  return fetch(url); // Viola políticas OSM
};
```

### Manejo de Errores Robusto

```javascript
// Manejo completo de errores con fallback
const geocodeWithFallback = async (lat, lng) => {
  const providers = [
    { name: "Nominatim", fn: nominatimGeocode },
    { name: "Photon", fn: photonGeocode },
    { name: "BigDataCloud", fn: bigDataCloudGeocode },
  ];

  for (const provider of providers) {
    try {
      console.log(`Trying ${provider.name}...`);
      const result = await provider.fn(lat, lng);
      if (result && result.address) {
        return result;
      }
    } catch (error) {
      console.warn(`${provider.name} failed:`, error.message);
      continue;
    }
  }

  return { address: "Dirección no disponible" };
};
```

### Performance Optimization

```javascript
// Batch processing optimizado
const processBatch = async (units, batchSize = 10) => {
  const results = [];

  for (let i = 0; i < units.length; i += batchSize) {
    const batch = units.slice(i, i + batchSize);
    console.log(
      `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
        units.length / batchSize
      )}`
    );

    const batchResults = await Promise.allSettled(
      batch.map((unit) => geocodeWithFallback(unit.lat, unit.lng))
    );

    results.push(
      ...batchResults.map((result, index) => ({
        ...batch[index],
        address:
          result.status === "fulfilled"
            ? result.value.address
            : "Error en geocodificación",
      }))
    );

    // Progress update
    onProgress?.(Math.min(100, ((i + batchSize) / units.length) * 100));
  }

  return results;
};
```

### Seguridad de Datos

```javascript
// Sanitización de datos para Excel
const sanitizeForExcel = (value) => {
  if (typeof value === "string") {
    // Remover caracteres peligrosos
    return value.replace(/[=+\-@]/g, "").substring(0, 255);
  }
  return value;
};

// Validación de coordenadas
const isValidCoordinate = (lat, lng) => {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !isNaN(lat) &&
    !isNaN(lng)
  );
};
```

### Deployment y Producción

#### Build Process

```bash
# Scripts de build
npm run prebuild    # Actualiza version.json
npm run build      # Build de producción con Vite
npm run preview    # Preview local del build
```

#### Configuración de Producción

```javascript
// vite.config.js - Optimizaciones
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: ["@mui/material", "@mui/joy"],
          maps: ["leaflet", "react-leaflet"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    proxy: {
      "/api": {
        target: process.env.VITE_APP_TARGET,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
```

#### Monitoring y Analytics

```javascript
// Métricas de uso
const trackExcelExport = (scope, unitCount) => {
  console.log("Excel Export:", {
    scope,
    unitCount,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
  });
};

// Performance monitoring
const trackGeocoding = (provider, duration, success) => {
  console.log("Geocoding Performance:", {
    provider,
    duration: `${duration}ms`,
    success,
    timestamp: new Date().toISOString(),
  });
};
```

## Nuevas Funcionalidades Implementadas ⭐

### LocationReportModal - Reporte de Posición

**Archivo**: `src/components/common/LocationReportModal.jsx`

#### Características Principales

1. **Geocodificación Automática**

   - Conversión de coordenadas GPS a direcciones legibles
   - Múltiples proveedores con fallback automático
   - Rate limiting para cumplimiento de políticas

2. **Exportación Excel Avanzada**

   - Timestamps en nombres de archivo
   - Formato 24 horas obligatorio
   - Protección de hojas con permisos granulares

3. **Sistema de Notificaciones**

   - Audio Web API para sonidos de finalización
   - Notificaciones del navegador
   - Gestión inteligente de permisos

4. **Vista Móvil Optimizada**
   - Diseño de tarjetas expandibles
   - Interfaz táctil mejorada
   - Responsive design completo

#### Estructura del Componente

```javascript
const LocationReportModal = ({
  open,
  onClose,
  processedData,
  selectedUnits,
}) => {
  // Estados principales
  const [reportType, setReportType] = useState("selected");
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodedData, setGeocodedData] = useState([]);
  const [permissionStatus, setPermissionStatus] = useState("default");

  // Funciones principales
  const handleGeocoding = async () => {
    /* ... */
  };
  const exportToExcel = () => {
    /* ... */
  };
  const playCompletionSound = () => {
    /* ... */
  };

  return <Modal>{/* Contenido del modal */}</Modal>;
};
```

### Cumplimiento de Políticas OSM/Nominatim

#### Rate Limiting Implementado

```javascript
const NOMINATIM_DELAY = 1100; // 1.1 segundos entre requests
const MAX_RETRIES = 3;
const TIMEOUT = 10000; // 10 segundos timeout

// Procesamiento secuencial con delay
const processUnitsSequentially = async (units) => {
  const results = [];

  for (const unit of units) {
    try {
      const address = await geocodeWithDelay(unit.lat, unit.lng);
      results.push({ ...unit, address });

      // Delay obligatorio entre requests
      await new Promise((resolve) => setTimeout(resolve, NOMINATIM_DELAY));
    } catch (error) {
      console.error(`Geocoding failed for unit ${unit.id}:`, error);
      results.push({ ...unit, address: "No disponible" });
    }
  }

  return results;
};
```

#### Headers Requeridos

```javascript
const headers = {
  "User-Agent": "FullControlGPS/1.0 (contact@fullcontrolgps.com.ar)",
  Accept: "application/json",
  "Accept-Language": "es-AR,es;q=0.9",
};
```

### Gestión de Estados y Context

#### Estado Global de Notificaciones

```javascript
// useNotifications hook
const useNotifications = () => {
  const [permission, setPermission] = useState(Notification.permission);

  const requestPermission = async () => {
    if ("Notification" in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }
    return "denied";
  };

  const showNotification = (title, options = {}) => {
    if (permission === "granted") {
      return new Notification(title, {
        icon: "/favicon.ico",
        badge: "/favicon-96x96.png",
        ...options,
      });
    }
  };

  return { permission, requestPermission, showNotification };
};
```

---

**Última actualización**: Junio 2025
**Versión del proyecto**: Basado en package.json v0.0.0
**Nuevas funcionalidades**: Exportación Excel con timestamps, geocodificación OSM, notificaciones audio
