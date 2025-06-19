# Contexto de IA - FullControl GPS

## Información del Proyecto

**Nombre**: FullControl GPS - Sistema de Rastreo de Flotas  
**Tipo**: Aplicación web React para monitoreo GPS en tiempo real  
**Estado**: En producción activa  
**Última actualización**: Junio 2025

## Resumen Ejecutivo

FullControl GPS es una aplicación web moderna construida en React 19 que permite a empresas y usuarios monitorear flotas de vehículos GPS en tiempo real. El sistema incluye funcionalidades de rastreo, generación de reportes, gestión de flotas, históricos de rutas, exportación de datos y **manual de usuario integrado**.

## Stack Tecnológico

### Frontend

- **React**: 19.0.0 (última versión estable)
- **Vite**: 6.2.0 (build tool y dev server)
- **Material-UI**: v7.0.1 + Joy UI v5.0.0-beta.52
- **Leaflet**: 1.9.4 con React-Leaflet 5.0.0-rc.2 para mapas
- **Day.js**: 1.11.13 para manejo de fechas

### Herramientas de Performance

- **react-window**: 1.8.11 para virtualización de listas largas
- **use-debounce**: 10.0.4 para optimizar búsquedas
- **React Context API**: Para gestión de estado global

### Utilidades

- **jsPDF**: 3.0.1 para generación de PDFs
- **ESLint**: Para linting y calidad de código

## Arquitectura del Sistema

### Estructura de Carpetas Principales

```
src/
├── components/
│   ├── common/       # 25+ componentes reutilizables
│   ├── pages/        # Login, PrincipalPage, HistoricalView
│   └── dev/          # UpdateTester (solo desarrollo)
├── context/          # Context.jsx - Estado global
├── hooks/            # usePrefFetch, useNotifications
├── utils/            # updateService.js, reportando.js
├── assets/           # Imágenes, logos (WebP optimizadas)
└── data/             # JSON estáticos, configuraciones
```

### Componentes Críticos

#### Páginas Principales

1. **Login.jsx**: Autenticación con Joy UI theme
2. **PrincipalPage.jsx**: Dashboard principal con mapa Leaflet
3. **HistoricalView.jsx**: Vista de históricos con calendario

#### Componentes Complejos

1. **UnitSelector.jsx**: Virtualizado con react-window, búsqueda con debounce
2. **UnitDetails.jsx**: Panel de información detallada responsive
3. **FleetAdminModal.jsx**: CRUD completo de flotas con drag&drop
4. **ExportSpeedDial.jsx**: Exportación a Excel y KML
5. **MenuButton.jsx**: Menú principal con roles de usuario

#### Modales Especializados

- **AdvancedHistoryModal.jsx**: Reportes de múltiples días
- **ContractReportsModal.jsx**: Informes por contrato
- **NotificationAdminModal.jsx**: Gestión de notificaciones
- **UnitWorksModal.jsx**: Obras asociadas a vehículos
- **UserManualModal.jsx**: Manual de usuario integrado con navegación por secciones

## APIs y Backend Integration

### Autenticación

```
POST /api/servicio/login.php/login
- Content-Type: application/x-www-form-urlencoded
- Cookies: rol, sesion, usuario
```

### Endpoints Principales

```
GET /api/servicio/equipos.php/pref       # Datos principales (30s)
GET /api/servicio/equipos.php/lite       # Datos ligeros (30s)
GET /api/servicio/historico.php/optimo/  # Histórico optimizado
GET /api/servicio/historico.php/historico # Histórico detallado
GET /api/servicio/excel.php              # Exportación Excel
GET /api/servicio/excelinformes.php      # Informes por contrato
```

### APIs de Flotas

```
GET /api/servicio/consultasFlota.php/flotaXUsuario/{userId}
GET /api/servicio/consultasFlota.php/rastrearFlota/{fleetId}
POST /api/servicio/consultasFlota.php/asignarVehiculo
POST /api/servicio/consultasFlota.php/quitarVehiculoaFlota
```

## Estado Global (Context API)

### Estructura del Estado

```javascript
{
  accessGranted: boolean,      // Control de autenticación
  user: string,               // Nombre del usuario logueado
  role: string,               // "Administrador", "Proveedor", etc.
  viewMode: string,           // "rastreo" | "historico"
  unitData: object,           // Datos de la unidad seleccionada
  hideLowUnits: boolean,      // Filtro para ocultar unidades de baja
  selectedUnits: array        // IDs de unidades seleccionadas
}
```

### Acciones Implementadas

- SET_ACCESS_GRANTED, SET_USER, SET_ROLE
- SET_VIEW_MODE, SET_HISTORY_UNIT
- SET_HIDE_LOW_UNITS, SET_SELECTED_UNITS

## Características Técnicas Avanzadas

### Responsive Design

- **Mobile First**: Diseño optimizado primero para móviles
- **Breakpoints MUI**: xs, sm, md, lg, xl
- **Viewport dinámico**: Control de altura CSS custom properties

### Performance Optimizations

- **Virtualización**: Listas de 1000+ vehículos sin lag
- **Memoización**: React.memo en componentes pesados
- **Debounce**: 300ms en búsquedas
- **Lazy Loading**: Componentes de desarrollo

### Sistema de Actualizaciones

- **UpdateService**: Detección automática de versiones
- **Cache busting**: Timestamps en version.json
- **Notificaciones**: Modal automático para nuevas versiones
- **Changelog**: Generación automática desde changelog.txt

## Configuraciones de Desarrollo

### Vite Configuration

```javascript
// Proxy para desarrollo
proxy: {
  "/api": {
    target: "https://plataforma.fullcontrolgps.com.ar",
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, "")
  }
}
```

### Scripts NPM

```json
{
  "dev": "vite",                              # Desarrollo local
  "build": "vite build",                      # Build producción
  "prebuild": "node ./update-version.js",    # Pre-build versioning
  "preview": "vite preview",                  # Preview build
  "lint": "eslint ."                          # Linting
}
```

## Funcionalidades Implementadas

### Core Features

1. **Rastreo en tiempo real** con actualización cada 30 segundos
2. **Históricos interactivos** con mapas y líneas de tiempo
3. **Gestión de flotas** con CRUD completo
4. **Exportación múltiple** (Excel, KML, PDF)
5. **Notificaciones push** para actualizaciones
6. **Manual de usuario integrado** accesible desde el menú principal

### Características de Usuario

1. **Multi-rol**: Administrador, Proveedor, Usuario estándar
2. **Responsive completo**: Desktop, tablet, móvil
3. **Búsqueda avanzada**: Con filtros y debounce
4. **Mapas múltiples**: OpenStreetMap, Google, Esri
5. **Certificados oficiales**: PDFs con datos técnicos
6. **Ayuda contextual**: Manual completo sin salir de la plataforma

### Features Técnicas

1. **Estado persistente**: LocalStorage para preferencias
2. **Manejo de errores**: Try-catch estructurado
3. **Loading states**: Para todas las operaciones async
4. **Modales no-blocking**: Escape y backdrop controlados
5. **Internacionalización**: Day.js en español

## Patrones de Código Establecidos

### Estructura de Componentes

```javascript
// Patrón estándar de componente
const ComponentName = ({ prop1, prop2 }) => {
  const [loading, setLoading] = useState(false);
  const { state, dispatch } = useContextValue();

  // Effects
  useEffect(() => {
    // Lógica de inicialización
  }, [dependencies]);

  // Handlers
  const handleAction = async () => {
    try {
      setLoading(true);
      // Lógica async
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    // JSX con sx prop para estilos
  );
};

export default ComponentName;
```

### Manejo de APIs

```javascript
// Patrón para requests
const response = await fetch(url, {
  method: "GET|POST",
  credentials: "include", // Importante para cookies
  headers: { "Content-Type": "application/json" },
  body: formData || JSON.stringify(data),
});

if (!response.ok) {
  throw new Error(`Error: ${response.status}`);
}
```

## Problemas Conocidos y Soluciones

### Performance Issues

1. **Listas largas**: Solucionado con react-window
2. **Re-renders**: Optimizado con React.memo y useCallback
3. **Mobile viewport**: Solucionado con CSS custom properties

### Browser Compatibility

1. **Cookies**: credentials: "include" en todas las requests
2. **Fetch API**: Polyfill no necesario (browsers modernos)
3. **CSS Grid**: Soporte completo en target browsers

### State Management

1. **Context re-renders**: Minimizado con estructura optimizada
2. **Async state**: Manejado con loading states
3. **Persistence**: LocalStorage para configuraciones

## Deployment y CI/CD

### Build Process

1. **Pre-build**: Actualización automática de versión
2. **Vite build**: Optimización y bundling
3. **Assets**: Hash automático para cache busting
4. **Manifest**: Generación para PWA capabilities

### Environment Variables

```bash
VITE_APP_TARGET=https://plataforma.fullcontrolgps.com.ar
NODE_ENV=development|production
```

## Roadmap y Mejoras Futuras

### Features Planeadas

1. **PWA completa**: Service workers, offline mode
2. **Notificaciones push**: WebPush API
3. **Geofencing**: Alertas por zonas
4. **Analytics**: Dashboard de métricas

### Optimizaciones Técnicas

1. **Micro-frontends**: Separación de módulos
2. **WebSockets**: Actualizaciones en tiempo real
3. **IndexedDB**: Caché local de datos
4. **Web Workers**: Procesamiento en background

## Consideraciones de Mantenimiento

### Actualizaciones de Dependencias

- **React**: Mantener en última stable
- **MUI**: Actualizaciones incrementales
- **Leaflet**: Verificar breaking changes
- **Vite**: Updates regulares para seguridad

### Monitoreo

- **Performance**: Core Web Vitals
- **Errores**: Console logs estructurados
- **Usage**: Analytics de características
- **API**: Response times y error rates

## Información de Contacto y Soporte

### Equipo Técnico

- **Desarrollo**: Equipo interno FullControl
- **Soporte**: WhatsApp +54 9 299 466-7595
- **Hosting**: Plataforma propia

### URLs Importantes

- **Producción**: https://plataforma.fullcontrolgps.com.ar
- **Administración**: /fulladm/
- **Informes**: /informes/

---

## Notas para Futuros Agentes de IA

### Contexto de Conversación

- Este proyecto está **en producción activa** con usuarios reales
- **Cualquier cambio** debe ser testeado exhaustivamente
- **Mantener compatibilidad** con funcionalidades existentes
- **Responsive design** es crítico (50%+ usuarios móviles)

### Prioridades de Desarrollo

1. **Performance**: La aplicación debe ser rápida
2. **Reliability**: Sin errores que interrumpan el servicio
3. **User Experience**: Interfaz intuitiva y fluida
4. **Mobile Support**: Funcionalidad completa en móviles

### Tecnologías NO Cambiar

- React Context API (funciona bien para este scope)
- Leaflet (integración compleja y estable)
- Material-UI (tema consistente establecido)
- Vite (performance excelente)

### Tecnologías a Considerar para Evolución

- TypeScript (para mayor type safety)
- React Query (para gestión de estado server)
- Zustand (alternativa más simple a Context)
- Framer Motion (para animaciones)

### Archivos Críticos NO Tocar Sin Análisis

- `src/context/Context.jsx` (estado global)
- `vite.config.js` (configuración de proxy)
- `src/utils/updateService.js` (sistema de versiones)
- `src/hooks/usePrefFetch.jsx` (polling de datos)
- `src/hooks/useNotifications.js` (sistema de notificaciones)
- `src/data/notifications.json` (notificaciones estáticas)

---

## 📚 MANUAL DE USUARIO INTEGRADO - IMPLEMENTACIÓN JUNIO 2025

### Descripción General

Se implementó un **manual de usuario completamente integrado** en la aplicación que permite a los clientes acceder a ayuda completa sin salir de la plataforma.

### Características Técnicas

#### Componente Principal

- **Archivo**: `src/components/common/UserManualModal.jsx`
- **Tecnología**: React + Material-UI con diseño responsivo
- **Colores**: Verde corporativo de FullControl GPS
- **Navegación**: Sidebar con secciones expandibles

#### Estructura del Manual

```javascript
// Secciones principales implementadas:
{
  "inicio": "Bienvenida e introducción",
  "acceso": "Proceso de login y acceso",
  "pantalla-principal": "Vista principal del mapa",
  "funciones": {
    "seleccion-vehiculos": "Selector de unidades",
    "informacion-detallada": "Detalles de vehículos",
    "tipos-mapas": "Cambio de capas de mapa"
  },
  "historico": "Vista de histórico diario",
  "reportes": {
    "tipos-reportes": "Resumen de tipos",
    "historico-avanzado": "Histórico múltiples días",
    "informes-parciales": "Reportes por contrato",
    "certificados": "Certificado de funcionamiento"
  },
  "flotas": "Gestión completa de flotas",
  "soporte": {
    "contacto": "WhatsApp y horarios",
    "problemas-comunes": "Troubleshooting",
    "consejos": "Mejores prácticas"
  }
}
```

#### Integración en MenuButton

```javascript
// Agregado en src/components/common/MenuButton.jsx
{
  icon: <HelpIcon fontSize="small" />,
  label: "Manual de Usuario",
  show: true, // Visible para todos los usuarios
  onClick: openUserManual
}
```

### Características de UX/UI

#### Diseño Responsivo

- **Mobile**: Header compacto, navegación colapsible
- **Desktop**: Sidebar fijo, contenido amplio
- **Tablet**: Hybrid layout adaptativo

#### Navegación

- **Secciones principales**: Con íconos descriptivos
- **Subsecciones**: Expandibles/colapsables
- **Estado activo**: Resaltado visual de sección actual
- **Scroll**: Smooth scrolling en contenido

#### Elementos Visuales

- **Cards**: Información organizada en tarjetas
- **Chips**: Etiquetas para funcionalidades
- **Botones de acción**: Enlaces directos a WhatsApp
- **Iconografía**: Emojis + Material-UI icons

### Contenido Implementado

#### Secciones Completas

1. **Histórico Avanzado**: Proceso completo, información incluida, consejos
2. **Informes Parciales**: Diferencias vista simple/avanzada, contenido del reporte
3. **Certificado de Funcionamiento**: Proceso, información incluida, usos legales
4. **Gestión de Flotas**: Selector, administración, casos de uso

#### Enlaces Funcionales

- **WhatsApp Soporte**: +54 9 299 466-7595
- **Ayuda con contraseña**: Link directo con mensaje predefinido
- **Ayuda con usuario**: Link directo con mensaje predefinido

### Accesibilidad y UX

#### Colores Corporativos

- **Verde principal**: #008000 (green)
- **Fondos**: rgba(0, 128, 0, 0.1) para destacados
- **Bordes**: green para cards importantes
- **Text**: Verde para títulos y subtítulos

#### Responsive Breakpoints

```javascript
// Material-UI breakpoints utilizados
{
  xs: 0,      // Mobile
  sm: 600,    // Tablet
  md: 900,    // Desktop pequeño
  lg: 1200,   // Desktop grande
  xl: 1536    // Desktop extra grande
}
```

---

## 📋 SISTEMA DE CHANGELOG - GESTIÓN DE ACTUALIZACIONES

### Propósito y Funcionamiento

El archivo `changelog.txt` es la **única fuente de información sobre actualizaciones** que se muestra a los clientes finales. Contiene **SOLO la última actualización** en formato texto plano.

### Estructura de Archivos

#### changelog.txt

- **Contiene**: Solo la actualización más reciente
- **Formato**: Texto plano sin markdown
- **Iconos**: Se pueden usar emojis (📅 ✅ 🆕 ⚡ 🔧)
- **Sin espacios**: No dejar líneas en blanco
- **Orientado al cliente**: Información útil para usuarios finales

#### historial-actualizaciones.txt

- **Contiene**: Todas las actualizaciones anteriores
- **Propósito**: Archivo de respaldo histórico
- **Formato**: Texto plano con iconos
- **Audiencia**: Equipo de desarrollo y registro interno
- **Contenido**: Historial completo de todas las actualizaciones implementadas
- **Función**: Servir como archivo de respaldo y referencia histórica

### ⚠️ LECCIONES APRENDIDAS - ERRORES COMUNES A EVITAR

#### 🚨 ERROR CRÍTICO: Confundir el propósito del changelog

**INCORRECTO**: Incluir instrucciones técnicas o información para desarrolladores

```
❌ INSTRUCCIONES PARA FUTURAS SESIONES DE IA:
🔔 IMPORTANTE: Cada nueva funcionalidad implementada DEBE agregarse...
```

**CORRECTO**: Solo información relevante para clientes

```
✅ NUEVO: Manual de Usuario Integrado - Acceda a la ayuda completa desde el menú principal (☰)
```

#### 🚨 ERROR CRÍTICO: Usar formato markdown

**INCORRECTO**: Usar numerales, asteriscos, formato markdown

```
❌ ### 📅 Junio 2025 - Versión 2025.06
❌ - ✅ **NUEVO: Funcionalidad**
```

**CORRECTO**: Texto plano sin formato markdown

```
✅ 📅 Junio 2025 - Versión 2025.06
✅ NUEVO: Manual de Usuario Integrado - Descripción clara
```

#### 🚨 ERROR CRÍTICO: Fechas incorrectas

**INCORRECTO**: Usar fechas del pasado o incorrectas

```
❌ Diciembre 2024 (cuando estamos en Junio 2025)
❌ v2024 (versión incorrecta)
```

**CORRECTO**: Usar fecha actual y versión correcta

```
✅ Junio 2025 - Versión 2025.06
✅ v2025
```

#### 🚨 ERROR CRÍTICO: Espacios en blanco innecesarios

**INCORRECTO**: Dejar líneas vacías

```
❌ 📅 Junio 2025 - Versión 2025.06

❌ ✅ NUEVO: Funcionalidad

❌ ✅ MEJORA: Otra funcionalidad
```

**CORRECTO**: Sin espacios en blanco

```
✅ 📅 Junio 2025 - Versión 2025.06
✅ NUEVO: Manual de Usuario Integrado - Descripción
✅ Guías Paso a Paso - Instrucciones detalladas
```

### Reglas de Actualización del Changelog

#### ✅ QUÉ DEBE INCLUIR

- **Nuevas funcionalidades** visibles para el usuario
- **Mejoras** que impacten la experiencia del usuario
- **Correcciones** importantes de bugs conocidos
- **Información de acceso** a nuevas funcionalidades
- **Lenguaje orientado al cliente final**

#### ❌ QUÉ NO DEBE INCLUIR

- Instrucciones técnicas para desarrolladores
- Detalles de implementación interna
- Información de códigos o APIs
- Configuraciones de backend
- Formato markdown (numerales ##, \*, etc.)
- Espacios en blanco innecesarios
- **Instrucciones para futuras sesiones de IA**
- **Información técnica que no interesa al cliente**

#### Formato Establecido

```
📅 [Mes Año] - Versión [YYYY.MM]
✅ TIPO: Nombre Funcionalidad - Descripción orientada al cliente
✅ TIPO: Otra Funcionalidad - Beneficio para el usuario
```

#### Tipos de Actualizaciones Válidos

- **NUEVO**: Funcionalidad completamente nueva
- **MEJORA**: Optimización de funcionalidad existente
- **CORRECCIÓN**: Fix de problema conocido
- **ACTUALIZACIÓN**: Cambio en funcionalidad existente

#### Iconos Recomendados

- 📅 Para fechas
- ✅ Para funcionalidades implementadas
- 🆕 Para características nuevas
- ⚡ Para mejoras de rendimiento
- 🔧 Para correcciones
- 📱 Para mejoras móviles
- 🎨 Para cambios de interfaz

### Ejemplo de Entrada Correcta vs Incorrecta

#### ✅ CORRECTO

```
📅 Junio 2025 - Versión 2025.06
✅ NUEVO: Manual de Usuario Integrado - Acceda a la ayuda completa desde el menú principal (☰) sin salir de la plataforma
✅ Guías Paso a Paso - Instrucciones detalladas para todas las funciones del sistema
✅ Soporte Directo - Enlaces integrados a WhatsApp para asistencia inmediata
```

#### ❌ INCORRECTO

```
### 📅 Junio 2025 - Versión 2025.06

- ✅ **NUEVO: Manual de Usuario Integrado** - Acceda a la ayuda completa desde el menú principal (☰) sin salir de la plataforma

---
**INSTRUCCIONES PARA FUTURAS SESIONES DE IA:**

🔔 **IMPORTANTE**: Cada nueva funcionalidad implementada DEBE agregarse a este changelog...
```

### Proceso de Actualización Correcto

#### Para Futuras Implementaciones

1. **Mover contenido actual** de changelog.txt a historial-actualizaciones.txt
2. **Implementar funcionalidad** en el código
3. **Probar** que funcione correctamente
4. **Actualizar changelog.txt** con solo la nueva funcionalidad
5. **Usar formato de texto plano** sin markdown
6. **Verificar fecha actual** y versión correcta
7. **Revisar que sea información útil para el cliente**

#### Flujo de Trabajo Establecido

```
1. Nueva funcionalidad lista →
2. Mover changelog actual a historial →
3. Escribir nueva entrada en changelog.txt →
4. Verificar formato (sin markdown, sin espacios) →
5. Confirmar fecha y versión correctas →
6. Asegurar que sea información orientada al cliente
```

### 📝 PLANTILLA PARA NUEVAS ENTRADAS

```
📅 [Mes Año] - Versión [YYYY.MM]
✅ NUEVO: [Nombre de la Funcionalidad] - [Descripción de beneficio para el cliente y cómo acceder]
✅ MEJORA: [Qué se mejoró] - [Beneficio específico para el usuario]
🔧 CORRECCIÓN: [Qué se corrigió] - [Cómo afecta positivamente al usuario]
```

### 🎯 OBJETIVO PRINCIPAL DEL CHANGELOG

**El changelog debe responder estas preguntas del cliente:**

1. ¿Qué funcionalidad nueva tengo disponible?
2. ¿Cómo accedo a esa funcionalidad?
3. ¿Qué beneficio me aporta?
4. ¿Se solucionó algún problema que yo tenía?

**El changelog NO debe:**

1. Explicar cómo se implementó técnicamente
2. Dar instrucciones a otros desarrolladores
3. Incluir detalles de código o APIs
4. Usar terminología técnica compleja

---

## Consideraciones de Mantenimiento

### Actualizaciones de Dependencias

- **React**: Mantener en última stable
- **MUI**: Actualizaciones incrementales
- **Leaflet**: Verificar breaking changes
- **Vite**: Updates regulares para seguridad

### Monitoreo

- **Performance**: Core Web Vitals
- **Errores**: Console logs estructurados
- **Usage**: Analytics de características
- **API**: Response times y error rates

## Información de Contacto y Soporte

### Equipo Técnico

- **Desarrollo**: Equipo interno FullControl
- **Soporte**: WhatsApp +54 9 299 466-7595
- **Hosting**: Plataforma propia

### URLs Importantes

- **Producción**: https://plataforma.fullcontrolgps.com.ar
- **Administración**: /fulladm/
- **Informes**: /informes/

---

## Notas para Futuros Agentes de IA

### Contexto de Conversación

- Este proyecto está **en producción activa** con usuarios reales
- **Cualquier cambio** debe ser testeado exhaustivamente
- **Mantener compatibilidad** con funcionalidades existentes
- **Responsive design** es crítico (50%+ usuarios móviles)

### Prioridades de Desarrollo

1. **Performance**: La aplicación debe ser rápida
2. **Reliability**: Sin errores que interrumpan el servicio
3. **User Experience**: Interfaz intuitiva y fluida
4. **Mobile Support**: Funcionalidad completa en móviles

### Tecnologías NO Cambiar

- React Context API (funciona bien para este scope)
- Leaflet (integración compleja y estable)
- Material-UI (tema consistente establecido)
- Vite (performance excelente)

### Tecnologías a Considerar para Evolución

- TypeScript (para mayor type safety)
- React Query (para gestión de estado server)
- Zustand (alternativa más simple a Context)
- Framer Motion (para animaciones)

### Archivos Críticos NO Tocar Sin Análisis

- `src/context/Context.jsx` (estado global)
- `vite.config.js` (configuración de proxy)
- `src/utils/updateService.js` (sistema de versiones)
- `src/hooks/usePrefFetch.jsx` (polling de datos)
- `src/hooks/useNotifications.js` (sistema de notificaciones)
- `src/data/notifications.json` (notificaciones estáticas)

---

## 📢 SISTEMA DE NOTIFICACIONES - IMPLEMENTADO

### Descripción General

Sistema completo de notificaciones push integrado que permite mostrar mensajes importantes a los usuarios, con gestión de estado persistente y roles de administrador.

### Características Técnicas

#### Hook Principal

- **Archivo**: `src/hooks/useNotifications.js`
- **Tecnología**: React hooks con localStorage
- **Persistencia**: Múltiples claves de localStorage
- **Roles**: Administradores pueden crear notificaciones

#### Hooks Personalizados

1. **usePrefFetch.jsx**: Polling de datos cada 30 segundos
2. **useNotifications.js**: Sistema completo de notificaciones con localStorage

#### Estructura de Datos

```javascript
// Estructura de notificación
{
  id: string,              // Identificador único
  title: string,           // Título de la notificación
  content: string,         // Contenido del mensaje
  imageUrl: string,        // URL de imagen opcional
  priority: "high|medium|low", // Prioridad de visualización
  expiresAt: string,       // Fecha de expiración ISO
  readBy: array,           // Array de usuarios que la leyeron
}
```

#### Claves de LocalStorage

```javascript
// Claves utilizadas para persistencia
{
  "fcgps_dismissed_notifications": [], // IDs descartadas permanentemente
  "fcgps_custom_notifications": [],    // Notificaciones creadas por admin
  "fcgps_read_notifications": []       // Registro de lecturas por usuario
}
```

### Funcionalidades Implementadas

#### Gestión de Notificaciones

1. **Carga automática**: Combina notificaciones estáticas y personalizadas
2. **Filtrado inteligente**: Solo muestra notificaciones vigentes y no leídas
3. **Priorización**: Ordenamiento por alta, media, baja prioridad
4. **Estado por usuario**: Cada usuario tiene su propio estado de lectura

#### Acciones de Usuario

1. **markAsRead()**: Marca como leída sin descartar
2. **dismissNotification()**: Descarta permanentemente
3. **createNotification()**: Solo administradores pueden crear

#### Sistema de Roles

- **Usuarios estándar**: Pueden leer y descartar notificaciones
- **Administradores**: Pueden crear nuevas notificaciones personalizadas

### Integración con la Aplicación

#### Componentes Relacionados

- **NotificationModal.jsx**: Modal para mostrar notificaciones
- **NotificationAdminModal.jsx**: Panel de administración para crear notificaciones
- **PrincipalPage.jsx**: Muestra notificaciones activas

#### Flujo de Trabajo

```javascript
// En PrincipalPage.jsx
const { activeNotification, markAsRead, dismissNotification } =
  useNotifications();

// Se muestra automáticamente si hay notificaciones pendientes
{
  activeNotification && (
    <NotificationModal
      message={activeNotification}
      onClose={() => markAsRead(activeNotification.id)}
      onDismiss={dismissNotification}
    />
  );
}
```

### Archivos de Datos

#### notifications.json

- **Ubicación**: `src/data/notifications.json`
- **Contenido**: Notificaciones estáticas del sistema
- **Formato**: Array de objetos de notificación

#### LocalStorage Dinámico

- **Notificaciones personalizadas**: Creadas por administradores
- **Estado de lectura**: Por usuario y por notificación
- **Descartes permanentes**: Para no volver a mostrar

### Características Avanzadas

#### Persistencia Multiusuario

- **Estado independiente**: Cada usuario tiene su propio registro
- **Sincronización**: Las notificaciones se marcan como leídas globalmente
- **Compatibilidad**: Funciona sin backend adicional

#### Sistema de Expiración

- **Verificación automática**: Solo muestra notificaciones vigentes
- **Formato ISO**: Fechas en formato estándar internacional
- **Limpieza automática**: No muestra notificaciones expiradas

#### Manejo de Errores

- **Try-catch**: En todas las operaciones de localStorage
- **Fallbacks**: Valores por defecto si hay errores de parsing
- **Logs**: Console.error para debugging

### Casos de Uso Implementados

#### Para Administradores

1. **Anuncios importantes**: Nuevas funcionalidades, mantenimientos
2. **Alertas críticas**: Problemas de sistema, actualizaciones obligatorias
3. **Promociones**: Nuevos servicios, características premium

#### Para Usuarios

1. **Información contextual**: Ayuda sobre nuevas funciones
2. **Actualizaciones**: Cambios que afectan su uso diario
3. **Soporte**: Enlaces directos a ayuda o contacto

---

## 📁 GESTIÓN DE ARCHIVOS DE CHANGELOG - HISTORIAL Y ACTUAL

### Archivos de Changelog en el Proyecto

#### changelog.txt

- **Ubicación**: Raíz del proyecto (`/changelog.txt`)
- **Propósito**: Mostrar SOLO la actualización más reciente a los clientes
- **Formato**: Texto plano sin markdown, sin espacios en blanco
- **Audiencia**: Clientes finales del sistema
- **Contenido**: Información orientada al usuario sobre nuevas funcionalidades
- **Actualización**: Se reemplaza completamente con cada nueva versión

#### historial-actualizaciones.txt

- **Ubicación**: Raíz del proyecto (`/historial-actualizaciones.txt`)
- **Propósito**: Archivo de respaldo que conserva TODAS las actualizaciones históricas
- **Formato**: Texto plano con iconos, organizado cronológicamente
- **Audiencia**: Equipo de desarrollo y registro interno
- **Contenido**: Historial completo de todas las actualizaciones implementadas
- **Función**: Servir como archivo de respaldo y referencia histórica

### Flujo de Trabajo para Actualizaciones

#### Proceso Establecido

```
1. Nueva funcionalidad implementada y probada
   ↓
2. Mover contenido actual de changelog.txt → historial-actualizaciones.txt
   ↓
3. Escribir nueva entrada en changelog.txt (solo la nueva funcionalidad)
   ↓
4. Verificar formato correcto (sin markdown, sin espacios)
   ↓
5. Confirmar fecha y versión actual
   ↓
6. Validar que sea información útil para el cliente
```

#### Ejemplo de Transferencia

**Antes de nueva actualización:**

- `changelog.txt`: Contiene actualización de Junio 2025
- `historial-actualizaciones.txt`: Contiene todas las anteriores

**Después de nueva actualización (Julio 2025):**

- `changelog.txt`: Solo actualización de Julio 2025
- `historial-actualizaciones.txt`: Todas las anteriores + la de Junio 2025

### Estructura de historial-actualizaciones.txt

#### Formato Establecido

```
📅 HISTORIAL DE ACTUALIZACIONES - FullControl GPS

🗓️ [Mes Año más reciente] - Versión [YYYY.MM]
✅ TIPO: Funcionalidad - Descripción
✅ TIPO: Otra funcionalidad - Descripción

🗓️ [Mes Año anterior] - Versión [YYYY.MM]
- Funcionalidad implementada en esa versión
- Otra mejora de esa versión

🗓️ Actualizaciones Anteriores
- Funcionalidades más antiguas sin formato específico
```

### Beneficios de este Sistema

#### Para el Cliente

- **Vista limpia**: Solo ve la información más relevante y reciente
- **Sin sobrecarga**: No se abruma con historial extenso
- **Información actual**: Siempre actualizada con lo último

#### Para el Equipo de Desarrollo

- **Historial completo**: Nunca se pierde información de versiones anteriores
- **Referencia**: Fácil consulta de qué se implementó y cuándo
- **Backup**: Seguridad de no perder información histórica

#### Para Futuras Sesiones de IA

- **Contexto histórico**: Puede consultar qué se ha implementado antes
- **Patrón establecido**: Sabe exactamente cómo manejar las actualizaciones
- **Prevención de duplicados**: Evita reimplementar funcionalidades existentes

### Mantenimiento de los Archivos

#### Responsabilidades

- **changelog.txt**: Mantener siempre actualizado con la última versión
- **historial-actualizaciones.txt**: Agregar versiones anteriores cuando se actualice

#### Verificaciones

- **Formato consistente**: Ambos archivos deben seguir el estilo establecido
- **Fechas correctas**: Verificar que las fechas correspondan a la realidad
- **Información completa**: No perder datos al transferir entre archivos

---

## Consideraciones de Mantenimiento

### Actualizaciones de Dependencias

- **React**: Mantener en última stable
- **MUI**: Actualizaciones incrementales
- **Leaflet**: Verificar breaking changes
- **Vite**: Updates regulares para seguridad

### Monitoreo

- **Performance**: Core Web Vitals
- **Errores**: Console logs estructurados
- **Usage**: Analytics de características
- **API**: Response times y error rates

## Información de Contacto y Soporte

### Equipo Técnico

- **Desarrollo**: Equipo interno FullControl
- **Soporte**: WhatsApp +54 9 299 466-7595
- **Hosting**: Plataforma propia

### URLs Importantes

- **Producción**: https://plataforma.fullcontrolgps.com.ar
- **Administración**: /fulladm/
- **Informes**: /informes/

---

## Notas para Futuros Agentes de IA

### Contexto de Conversación

- Este proyecto está **en producción activa** con usuarios reales
- **Cualquier cambio** debe ser testeado exhaustivamente
- **Mantener compatibilidad** con funcionalidades existentes
- **Responsive design** es crítico (50%+ usuarios móviles)

### Prioridades de Desarrollo

1. **Performance**: La aplicación debe ser rápida
2. **Reliability**: Sin errores que interrumpan el servicio
3. **User Experience**: Interfaz intuitiva y fluida
4. **Mobile Support**: Funcionalidad completa en móviles

### Tecnologías NO Cambiar

- React Context API (funciona bien para este scope)
- Leaflet (integración compleja y estable)
- Material-UI (tema consistente establecido)
- Vite (performance excelente)

### Tecnologías a Considerar para Evolución

- TypeScript (para mayor type safety)
- React Query (para gestión de estado server)
- Zustand (alternativa más simple a Context)
- Framer Motion (para animaciones)

### Archivos Críticos NO Tocar Sin Análisis

- `src/context/Context.jsx` (estado global)
- `vite.config.js` (configuración de proxy)
- `src/utils/updateService.js` (sistema de versiones)
- `src/hooks/usePrefFetch.jsx` (polling de datos)
- `src/hooks/useNotifications.js` (sistema de notificaciones)
- `src/data/notifications.json` (notificaciones estáticas)

---

### 📢 Sistema de Notificaciones - Consideraciones

#### Al implementar nuevas funcionalidades importantes:

1. **Evaluar** si amerita una notificación a usuarios
2. **Crear entrada** en notifications.json para anuncios permanentes
3. **Usar prioridades** correctamente (high solo para crítico)
4. **Incluir imágenes** si mejora la comprensión
5. **Configurar expiración** apropiada según importancia

#### Estructura recomendada para notifications.json:

```javascript
{
  "id": "manual-usuario-2025-06",
  "title": "📚 Nuevo Manual de Usuario",
  "content": "Ya está disponible el manual completo integrado en la plataforma. Accede desde el menú principal ☰ → Manual de Usuario.",
  "imageUrl": "",
  "priority": "medium",
  "expiresAt": "2025-07-19T23:59:59.000Z"
}
```

#### Para administradores del sistema:

- **Acceso**: Menu ☰ → "Gestionar Notificaciones"
- **Capacidades**: Crear notificaciones personalizadas con fecha de expiración
- **Mejores prácticas**: Usar títulos claros y contenido conciso

---

**Última actualización del contexto**: Junio 2025  
**Revisión**: 2.1  
**Próxima revisión recomendada**: Al implementar nuevas features mayores

**Funcionalidades agregadas en esta revisión**:

- Manual de usuario integrado
- Sistema de changelog documentado
- **Sistema de notificaciones completo**
- Estándares de UI verde corporativo
- Proceso de actualización establecido
