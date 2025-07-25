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
