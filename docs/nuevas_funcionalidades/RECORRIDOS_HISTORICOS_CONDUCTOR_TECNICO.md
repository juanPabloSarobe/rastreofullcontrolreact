# RECORRIDOS HISTÓRICOS POR CONDUCTOR - ESPECIFICACIONES TÉCNICAS

## Estructura general

La funcionalidad se divide en tres componentes principales:

1. **Histórico por Conductor** - Visualización en mapa (botón circular con acceso rápido)
2. **Histórico Avanzado por Conductor** - Exportación a Excel (opción en menú)
3. **ABM de Asignación de Conductores** - Sistema de administración

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

## Desarrollo Back-end

### 1. Base de datos:

- Nueva tabla `usuario_conductor` para relación muchos a muchos
- Campos: `id`, `usuario_id`, `conductor_id`, `fecha_asignacion`
- Crear script SQL para implementación y migración

### 2. Endpoints a desarrollar:

1. **GET `/api/servicio/conductores.php/asignados`**

   - Parámetros: Ninguno (usa sesión actual)
   - Respuesta: Array de conductores `[{id, nombre, documento, ...}]`
   - Código de respuesta: 200 OK
   - Errores: 401 No autorizado, 500 Error interno

2. **GET `/api/servicio/conductores.php/unidades`**

   - Parámetros: `?conductor_id={id}&fecha={fecha}`
   - Respuesta: Array de unidades `[{Movil_ID, patente, marca, ...}]`
   - Código de respuesta: 200 OK
   - Errores: 400 Parámetros incorrectos, 404 No encontrado, 500 Error interno

3. **GET `/api/servicio/historico.php/conductor`**

   - Parámetros: `?conductor_id={id}&unidad_id={id}&fecha={fecha}`
   - Respuesta: Array de puntos `[{latitud, longitud, velocidad, hora, ...}]`
   - Código de respuesta: 200 OK
   - Errores: 400 Parámetros incorrectos, 404 No encontrado, 500 Error interno

4. **GET `/api/servicio/reportes.php/conductor`**

   - Parámetros: `?conductor_id={id}&fecha_inicio={fecha}&fecha_fin={fecha}`
   - Respuesta: Archivo Excel con recorridos
   - Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
   - Errores: 400 Parámetros incorrectos, 404 No encontrado, 500 Error interno

5. **Endpoints para ABM de Asignaciones:**
   - GET `/api/admin/conductores.php/asignaciones` - Obtener todas las asignaciones
     - Respuesta: Array de asignaciones `[{id, usuario_id, conductor_id, ...}]`
   - POST `/api/admin/conductores.php/asignaciones` - Crear nueva asignación
     - Parámetros: `{usuario_id, conductor_id}`
     - Respuesta: `{id, usuario_id, conductor_id, fecha_asignacion}`
   - DELETE `/api/admin/conductores.php/asignaciones` - Eliminar asignación
     - Parámetros: `?id={id}`
     - Respuesta: `{success: true}`

### 3. Implementación PHP:

```php
// Ejemplo de implementación para obtener conductores asignados
function getConductoresAsignados($usuario_id) {
    global $conn;

    $query = "SELECT c.* FROM conductores c
              JOIN usuario_conductor uc ON c.id = uc.conductor_id
              WHERE uc.usuario_id = ?";

    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $usuario_id);
    $stmt->execute();

    $result = $stmt->get_result();
    $conductores = [];

    while ($row = $result->fetch_assoc()) {
        $conductores[] = $row;
    }

    return $conductores;
}

// Ejemplo para obtener unidades por conductor y fecha
function getUnidadesPorConductorYFecha($conductor_id, $fecha) {
    global $conn;

    // Consulta para obtener unidades conducidas en una fecha específica
    $query = "SELECT DISTINCT u.* FROM unidades u
              JOIN registros_viaje rv ON u.id = rv.unidad_id
              WHERE rv.conductor_id = ? AND DATE(rv.fecha_hora) = ?";

    $stmt = $conn->prepare($query);
    $stmt->bind_param("is", $conductor_id, $fecha);
    $stmt->execute();

    $result = $stmt->get_result();
    $unidades = [];

    while ($row = $result->fetch_assoc()) {
        $unidades[] = $row;
    }

    return $unidades;
}
```

## Integración y puntos clave

### 1. Flujo de datos:

1. Usuario hace clic en "Histórico por conductor"
2. Se carga lista de conductores asignados (`/api/servicio/conductores.php/asignados`)
3. Usuario selecciona conductor y fecha
4. Se cargan unidades para ese conductor y fecha (`/api/servicio/conductores.php/unidades`)
5. Usuario selecciona una unidad
6. Se carga y muestra el recorrido histórico (`/api/servicio/historico.php/conductor`)

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
