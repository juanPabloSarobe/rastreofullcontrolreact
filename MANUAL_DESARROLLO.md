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

// Informes por contrato
GET /api/servicio/excelinformes.php?fechaInicial={date}&fechaFinal={date}&contrato={name}
```

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

## Buenas Prácticas

### Código

- **Componentes funcionales**: Usar siempre hooks
- **Prop destructuring**: Desestructurar props con defaults
- **Early returns**: Salidas tempranas en componentes
- **Memoización**: React.memo para componentes pesados

### Estilos

- **sx prop**: Preferir sx sobre styled components
- **Theme consistency**: Usar colores del tema MUI
- **Responsive values**: Objetos para breakpoints

### Performance

- **useCallback/useMemo**: Para funciones y valores costosos
- **Lazy loading**: Componentes no críticos
- **Image optimization**: WebP para imágenes

### Seguridad

- **Credentials**: Include en todas las requests API
- **Input validation**: Validar entradas de usuario
- **Error handling**: No exponer información sensible

## Troubleshooting

### Problemas Comunes

#### Cookies de Sesión

```javascript
// Verificar cookies
const cookies = document.cookie.split(";");
const sessionCookie = cookies.find((cookie) =>
  cookie.trim().startsWith("sesion=")
);
```

#### Problemas de CORS

- Verificar configuración del proxy en vite.config.js
- Asegurar `credentials: "include"` en requests

#### Performance en Móviles

- Usar `react-window` para listas largas
- Implementar debounce en búsquedas
- Optimizar re-renders con React.memo

## Contribución

### Git Flow

1. Feature branches desde `main`
2. Commits descriptivos
3. Pull requests con review
4. Testing antes de merge

### Convenciones de Código

- **Naming**: camelCase para variables, PascalCase para componentes
- **Files**: kebab-case para archivos
- **Imports**: Orden: React, librerías, componentes locales

---

**Última actualización**: Diciembre 2024
**Versión del proyecto**: Basado en package.json v0.0.0
