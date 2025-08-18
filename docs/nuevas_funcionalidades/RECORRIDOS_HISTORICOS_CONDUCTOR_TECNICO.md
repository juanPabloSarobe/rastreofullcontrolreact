# RECORRIDOS HISTÓRICOS POR CONDUCTOR - ESPECIFICACIONES TÉCNICAS

## Estructura general

La funcionalidad se divide en tres componentes principales:

1. **Histórico por Conductor** - Visualización en mapa (botón circular con acceso rápido)
2. **Histórico Avanzado por Conductor** - Exportación a Excel (opción en menú)
3. **ABM de Asignación de Conductores** - Sistema de administración

## ANÁLISIS COMPLETO DE COMPONENTES (Actualizado 18/08/2025)

### COMPONENTES EXISTENTES A MODIFICAR

#### 1. **Context.jsx** - Estados globales

**Ubicación:** `src/context/Context.jsx`
**Modificaciones necesarias:**

- Agregar nuevos estados para modo conductor:
  - `conductorMode: false`
  - `selectedConductor: null`
  - `conductorHistoryDate: null`
  - `conductorUnits: []`
- Nuevas acciones del reducer para manejar estos estados

#### 2. **MenuButton.jsx** - Menú principal

**Ubicación:** `src/components/common/MenuButton.jsx`
**Modificaciones necesarias:**

- Agregar nueva opción "Histórico Avanzado por Conductor" en el array `menuItems`
- Agregar estado y handler para el modal correspondiente
- Importar el nuevo componente `ConductorAdvancedHistoryModal`

#### 3. **PrincipalPage.jsx** - Página principal

**Ubicación:** `src/components/pages/PrincipalPage.jsx`
**Modificaciones necesarias:**

- Agregar el botón circular `ConductorHistoryButton` junto a `FleetSelectorButton`
- Manejar la lógica de renderizado condicional para modo conductor
- Integrar con el contexto para cambios de modo

#### 4. **MapContainer y componentes de mapa**

**Modificaciones necesarias:**

- Extender `HistoricalView.jsx` para soportar modo conductor
- Modificar `HistoricalMarkers.jsx` para mostrar datos filtrados por conductor
- Actualizar `HistoricalDetailView.jsx` para incluir información del conductor

#### 5. **AdvancedHistoryModal.jsx** - Modal existente

**Ubicación:** `src/components/common/AdvancedHistoryModal.jsx`
**Consideración:** Podemos reutilizar la estructura pero crear un componente separado para conductores

### COMPONENTES NUEVOS A CREAR

#### 1. **ConductorHistoryButton.jsx** - Botón circular

```
src/components/common/ConductorHistoryButton.jsx
```

- Botón circular similar a `FleetSelectorButton.jsx`
- Tooltip "Histórico por conductor"
- Ícono de persona
- Abre `ConductorHistoryModal`

#### 2. **ConductorHistoryModal.jsx** - Modal histórico simple

```
src/components/common/ConductorHistoryModal.jsx
```

- Selector de conductor (dropdown con búsqueda)
- Selector de rango de fechas (desde/hasta)
- Lista de vehículos del conductor
- Calendario para seleccionar día específico
- Botón para ver recorrido

#### 3. **ConductorAdvancedHistoryModal.jsx** - Modal histórico avanzado

```
src/components/common/ConductorAdvancedHistoryModal.jsx
```

- Similar al simple pero con rango de fechas completo
- Descarga directa a Excel
- Reutiliza estructura de `AdvancedHistoryModal.jsx`

#### 4. **ConductorSelector.jsx** - Componente reutilizable

```
src/components/common/ConductorSelector.jsx
```

- Dropdown con búsqueda de conductores
- Manejo del endpoint `/permisosConductores/215`
- Placeholder para datos hasta que el endpoint funcione
- Reutilizable entre diferentes modales

#### 5. **ConductorHistoricalView.jsx** - Vista de recorridos por conductor

```
src/components/pages/ConductorHistoricalView.jsx
```

- Extiende o adapta `HistoricalView.jsx`
- Muestra información del conductor
- Integra con endpoints modificados que incluyen parámetro `conductor`

### SERVICIOS Y HOOKS A MODIFICAR

#### 1. **Endpoints existentes a actualizar:**

- `historico.php/optimo/` - Agregar parámetro `conductor`
- `historico.php/historico` - Agregar parámetro `conductor`
- `excel.php` - Agregar parámetro `conductor`

#### 2. **Nuevos endpoints a integrar:**

- `/permisosConductores/215` - Lista de conductores (placeholder)
- `/vehiculosPorConductor/` - Vehículos usados por conductor

### FLUJO DE IMPLEMENTACIÓN RECOMENDADO

#### **Fase 1: Infraestructura base**

1. Modificar `Context.jsx` con nuevos estados
2. Crear `ConductorSelector.jsx` con placeholder de datos
3. Crear `ConductorHistoryButton.jsx`

#### **Fase 2: Modal histórico simple**

1. Crear `ConductorHistoryModal.jsx`
2. Integrar con `PrincipalPage.jsx`
3. Conectar con endpoint `/vehiculosPorConductor/`

#### **Fase 3: Visualización de recorridos**

1. Crear/adaptar `ConductorHistoricalView.jsx`
2. Modificar endpoints existentes para incluir parámetro conductor
3. Integrar con componentes de mapa existentes

#### **Fase 4: Histórico avanzado**

1. Crear `ConductorAdvancedHistoryModal.jsx`
2. Agregar opción en `MenuButton.jsx`
3. Conectar con endpoint de Excel modificado

### REUTILIZACIÓN DE COMPONENTES EXISTENTES

**Componentes que podemos reutilizar directamente:**

- `DateCalendar`, `DatePicker` (selección de fechas)
- `HistoricalMarkers.jsx` (marcadores en mapa)
- `HistoricalDetailView.jsx` (con modificaciones menores)
- `ExportSpeedDial.jsx` (exportación)
- `NoUnitSelectedModal.jsx` (para validaciones)

**Patrones de código existentes:**

- Estructura de modales de `AdvancedHistoryModal.jsx`
- Manejo de estados loading y error
- Integración con Context
- Estilos Material-UI consistentes

### CONSIDERACIONES TÉCNICAS

1. **Endpoints placeholder:** Usar datos mockeados para `/permisosConductores/215` hasta que esté disponible
2. **Rendimiento:** Los componentes existentes ya están optimizados para grandes volúmenes de datos
3. **Responsive:** Seguir los patrones existentes de `isMobile` para adaptabilidad
4. **Consistencia visual:** Mantener la paleta de colores (verde) y estilos existentes

## Desarrollo Front-end

### 1. Botón "Histórico por conductor":

- Componente circular similar al botón "Seleccionar Flota"
- Hover: Muestra tooltip "Histórico por conductor"
- Posicionamiento: Alineado con los otros botones circulares
- Icono: Silueta de persona

### 2. Modal de selección para histórico simple:

- Selector de conductor: Dropdown con búsqueda
- Selector de fecha: Calendario individual para seleccionar un día
- Lista de unidades: Se carga dinámicamente al seleccionar conductor y fecha
- Acción de clic en unidad: Mostrar recorrido en el mapa

### 3. Visualización de recorridos:

- Reutilizar el componente HistoricalView.jsx y HistoricalMarkers.jsx
- Adaptar para filtrar por conductor en lugar de solo por unidad
- Mantener las mismas funcionalidades visuales (marcadores, líneas, etc.)

### 4. Histórico avanzado:

- Nueva opción en MenuItems.jsx: "Histórico avanzado por conductor"
- Modal con selección de conductor y rango de fechas
- Proceso de descarga con indicador de progreso

### 5. Estados en Context:

```jsx
// Nuevos estados a añadir en Context.jsx
conductorMode: false, // Indica si está en modo histórico por conductor
selectedConductor: null, // Conductor seleccionado
conductorHistoryDate: null, // Fecha seleccionada para histórico de conductor
conductorUnits: [], // Unidades manejadas por el conductor seleccionado
```

### 6. Nuevos componentes a crear:

- `ConductorHistoryButton.jsx`: Botón circular para acceso rápido
- `ConductorHistoryModal.jsx`: Modal para histórico simple por conductor
- `ConductorAdvancedHistoryModal.jsx`: Modal para histórico avanzado
- `ConductorSelector.jsx`: Componente reutilizable de selección de conductor

## Integración y puntos clave

### 1. Flujo de datos:

1. Usuario hace clic en "Histórico por conductor"
2. Se carga lista de conductores asignados aca se usara el siguiente endpoint: https://plataforma.fullcontrolgps.com.ar/servicio/usuarios.php/permisosConductores/215 (Importante: al momento este endpoint no esta funcionando en el backend y no se como va a devolver los datos al final. usemos u placeholder para corregirlo despues.)
   esto devuelve un listado con los datos de los conductores que tiene permisos ese usuario para consultar.
3. Usuario selecciona conductor y fecha desde/hasta (con doble calendar)
   (ejemplo endpoint: https://plataforma.fullcontrolgps.com.ar/api/servicio/historico.php/vehiculosPorConductor/?fechaInicial=2025-07-25&&fechaFinal=2025-07-26&conductor=13864)
4. El endpoint devuelve los vehiculos que uso y los dias que uso cada vehiculo
5. Usuario selecciona una unidad (
   {
   "Vehiculos": [
   {
   "movil": 3147,
   "patente": "AC-141-PU",
   "dias": [
   "2025-08-01",
   "2025-08-02",
   "2025-08-04",
   "2025-08-05",
   "2025-08-07",
   "2025-08-08",
   "2025-08-09",
   "2025-08-10",
   "2025-08-11",
   "2025-08-12",
   "2025-08-13",
   "2025-08-14",
   "2025-08-15",
   "2025-08-16",
   "2025-08-17"
   ]
   },
   {
   "movil": 4503,
   "patente": "AD-098-EL",
   "dias": [
   "2025-08-12"
   ]
   },
   {
   "movil": 5610,
   "patente": "AF-162-FU",
   "dias": [
   "2025-08-16"
   ]
   }
   ]
   }
   )
6. Se cargan los datos en el nuevo formulario para seleccionar la unidad y un calendario unico para selecionar solo el dia que tenga datos. Similar a la vista HistoricalView.jsx, pero ahora que muestre tambien los datos del conductor.(con esos datos armar el formulario para que selecione la unidad y aca si solo un dia para mostrar.) teniendo selecionado el movil, debera mostrar el calendario con los dias que tiene datos, se debe poder cambiar el movil y actualiza el calendario con los datos, luego de elegir el dia se llamara al siguiente endpoint: (https://plataforma.fullcontrolgps.com.ar/api/servicio/historico.php/optimo/?movil=3147&&fechaInicial=2025-08-01&&fechaFinal=2025-08-02&conductor=13826), que devolvera los datos como el ejemplo que esta en la carpeta raiz historico.json. Aqui el componente completo al mostrar los resultados es similar a HistoricalView.
7. tener en cuenta tambien el componente HistoricalDetailView, aca el endpoint tambien se actualiza a https://plataforma.fullcontrolgps.com.ar/api/servicio/historico.php/historico?movil=6193&&fechaInicial=2025-08-02&&fechaFinal=2025-08-03&conductor=12183. es coo el endpoint original de dicho componente soloq ue le agrega el filtro por conductor.
8. nuevamente tambien se actualiza el endpoint para descargar el historico en excel, que ahora usa: https://plataforma.fullcontrolgps.com.ar/api/servicio/excel.php?movil=4503&&fechaInicial=2025-08-12&&fechaFinal=2025-08-13&conductor=13826

El historico avanzado por conductor, debe ser similar, nada mas que luego de selecionar la unidad que permita seleccionar las fechas desde/hasta en 2 calendarios. solo las fechas que tenga inforamcion la unidad seleccionada obviamente. y que directamente descargue el excel desde el endpoint https://plataforma.fullcontrolgps.com.ar/api/servicio/excel.php?movil=4503&&fechaInicial=2025-08-12&&fechaFinal=2025-08-13&conductor=13826.

### 2. Adaptaciones necesarias:

- Modificar `MapContainer.jsx` para soportar modo de conductor
- Extender el contexto con nuevos estados para conductor
- Adaptar componentes históricos para filtrar por conductor

### 3. Reutilización de código:

- Aprovechar componentes existentes como `DatePicker` y `HistoricalView`
- Mantener consistencia visual con el resto de la aplicación
- Utilizar los mismos estilos para botones y modales

### 4. Consideraciones de seguridad:

- Validar permisos para acceso a endpoints de conductores
- Verificar que solo se accedan a conductores asignados al usuario
- Implementar validación en backend para todas las consultas

### 5. Puntos de colaboración:

- Matías (backend): Implementación de endpoints y lógica de base de datos
- Frontend: Integración con contexto y desarrollo de componentes visuales
- Testing conjunto para verificar flujos completos

## Estimaciones técnicas

- **Complejidad backend:** Media-alta (nuevas tablas y relaciones)
- **Complejidad frontend:** Media (reutilización de componentes existentes)
- **Riesgos potenciales:**
  - Rendimiento en consultas de recorridos grandes
  - Consistencia en datos de conductores históricos

## Plan de implementación recomendado:

1. Desarrollo de esquema de base de datos y migración
2. Implementación de endpoints básicos (conductores y asignaciones)
3. Desarrollo del ABM de asignaciones
4. Implementación de componentes frontend para histórico simple
5. Desarrollo de endpoints de recorridos históricos
6. Implementación de histórico avanzado y exportación
7. Testing e integración final
