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

#### **Estado 3: Lista expandida**

- **Header**: `[4] Unidades en infracción [📊 Tiempo] [X]`
- **Lista dual**:
  - Sección superior: Infracciones activas
  - Separador visual
  - Sección inferior: Historial con controles de eliminación

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

### **Paso 1: Crear InfractionAlert.jsx**

```jsx
import React, { useState, useMemo } from "react";
import { Box, Typography, List, Divider, IconButton } from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import DeleteIcon from "@mui/icons-material/Delete";
import BaseExpandableAlert from "./BaseExpandableAlert";

const InfractionAlert = ({ markersData, onUnitSelect }) => {
  const [sortBy, setSortBy] = useState("time");
  const [historyInfractions, setHistoryInfractions] = useState([]);

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
      {/* Lista activas */}
      {/* Separador */}
      {/* Lista historial */}
    </Box>
  );

  return (
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
  );
};
```

### **Paso 2: Integrar en PrincipalPage.jsx**

```jsx
// Agregar después de IdleUnitsAlert
<IdleUnitsAlert markersData={markersData} onUnitSelect={handleUnitSelect} />
<InfractionAlert markersData={markersData} onUnitSelect={handleUnitSelect} />
<UnitDetails unitData={selectedUnit} />
```

### **Paso 3: Ajustar posicionamiento dinámico**

El hook `useExpandableAlert` ya maneja el posicionamiento inteligente. Solo se necesita:

- Ajustar `verticalOffset` para posicionar debajo de IdleUnitsAlert
- Verificar que no se superponga con otros componentes

## 📋 FUNCIONALIDADES ESPECÍFICAS A IMPLEMENTAR

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

## 📊 ESTIMACIÓN DE IMPLEMENTACIÓN

### **Tareas específicas:**

| Tarea                        | Tiempo estimado | Nota                               |
| ---------------------------- | --------------- | ---------------------------------- |
| Crear InfractionAlert.jsx    | 1 hora          | Reutiliza BaseExpandableAlert      |
| Implementar doble lista      | 30 minutos      | Estructura JSX                     |
| Sistema de historial         | 45 minutos      | Estados y efectos                  |
| Integración en PrincipalPage | 15 minutos      | Una línea de código                |
| Testing y ajustes            | 30 minutos      | Validación funcional               |
| **Total**                    | **3 horas**     | **Reducido 75% por reutilización** |

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

**El sistema está listo para implementación optimizada aplicando todos los patrones aprendidos en ralentí.**

```

```
