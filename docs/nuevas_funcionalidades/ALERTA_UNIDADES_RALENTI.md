# ALERTA DE UNIDADES EN RALENTÍ

## Resumen refinado de la funcionalidad:

El cliente desea implementar un sistema de alertas visuales para monitorear unidades que se encuentran en estado de ralentí. La funcionalidad debe:

1. **Mostrar siempre un botón circular** (similar al botón "Seleccionar Flota") que indique la cantidad de unidades en ralentí
2. **Badge siempre visible**: Mostrar 0 cuando no hay unidades en ralentí, o el número total de unidades detectadas
3. Detectar unidades en ralentí mediante el campo "estado" (posibles valores: "Inicio Ralenti", "Fin de ralenti", "Reporte en Ralenti", "ralentí" con acento)
4. Ubicarse estratégicamente en la interfaz:
   - Cuando no hay unidades seleccionadas: debajo del selector de unidades
   - Cuando hay unidades seleccionadas: debajo del detalle de la unidad
   - En vista móvil: siempre debajo del selector de unidades
5. Expandirse al hacer clic mostrando una lista con opciones de ordenamiento (alfabético y por tiempo en ralentí)
6. Permitir marcar unidades como "ignoradas" con un icono de ojo en el lado izquierdo de cada ítem
7. Permitir seleccionar unidades haciendo clic directamente en un ítem de la lista (sin botones adicionales)
8. Mostrar con código de colores los diferentes estados de ralentí (rojo para inicio/reporte, negro para fin)
9. Eliminar del listado las unidades ignoradas que ya no estén en estado de ralentí
10. **Timeout automático**: Remover unidades de la lista si no reciben actualizaciones por más de 1 hora

## Manual técnico preliminar:

### Descripción funcional:

El sistema de "Alertas de unidades en ralentí" permitirá visualizar y gestionar las unidades que están operando con el motor encendido sin movimiento (ralentí), lo que facilita la optimización de recursos, reducción de consumo de combustible y mejora la gestión operativa de la flota.

### Comportamiento del sistema:

1. **Detección de unidades en ralentí:**

   - Cada vez que se ejecuta el hook usePrefFetch para actualizar las ubicaciones, se verificará el campo "estado" de cada unidad
   - Se considerarán en ralentí las unidades cuyos estados contengan las palabras clave: "Inicio Ralenti", "Fin de ralenti", "Reporte en Ralenti", "ralentí"
   - La detección será insensible a mayúsculas/minúsculas y acentos
   - **Timeout**: Las unidades sin actualizaciones por más de 1 hora se eliminarán automáticamente de la lista

2. **Indicador visual:**

   - Un botón circular **siempre visible** mostrará el número de unidades en ralentí activas
   - **Badge con contador**: Mostrará "0" cuando no hay unidades en ralentí, o el número total cuando las hay
   - El botón tendrá un comportamiento de expansión al hacer hover, similar al botón "Seleccionar Flota"
   - **Ícono**: `DepartureBoardIcon` de Material-UI

3. **Posicionamiento inteligente:**

   - Sin unidades seleccionadas: se ubicará debajo del selector de unidades
   - Con unidades seleccionadas: se ubicará debajo del detalle de la unidad
   - Vista móvil: siempre debajo del selector de unidades, respetando la superposición del selector de unidades expandido
   - **Arquitectura**: Componente independiente en `PrincipalPage.jsx` siguiendo el patrón de `UnitSelector` y `FleetSelectorButton`

4. **Panel expandible:**

   - Al hacer clic en el icono, se expandirá lateralmente y luego hacia abajo con una animación de transición fluida
   - **Opciones de ordenamiento**:
     - Alfabético (por patente)
     - Por tiempo en ralentí (ascendente/descendente)
   - Mostrará una lista ordenada de unidades en ralentí

5. **Contador de tiempo:**

   - **Ubicación**: Solo en cada ítem de la lista desplegada
   - **Formato**: Estilo reloj (ej: "02:30:45")
   - **Cálculo**:
     - Basado exclusivamente en el campo `fechaHora` del endpoint pref (nunca hora actual)
     - Primera detección de ralentí → inicializar contador con `fechaHora`
     - Siguientes detecciones → sumar diferencia entre `fechaHora` actual y anterior
     - Si sale de ralentí → reiniciar contador a cero
     - Si vuelve a entrar → empezar desde cero otra vez

6. **Diseño del listado de unidades:**

   - Formato simple y compacto con información esencial (patente, conductor y tiempo en ralentí)
   - Icono de ojo en el lado izquierdo para marcar como "ignoradas"
   - Sin botones adicionales - la selección se realiza haciendo clic directamente en el ítem
   - Código de colores:
     - Rojo: para estados "Inicio Ralenti" y "Reporte en Ralenti"
     - Negro: para estado "Fin de ralenti"

7. **Sistema de ignorados:**

   - Las unidades marcadas como "ignoradas" se mostrarán en gris al final de la lista
   - Este estado persistirá únicamente durante la sesión activa (se reiniciará al cerrar sesión)
   - Las unidades ignoradas seguirán contando para el indicador numérico
   - Si una unidad ignorada deja de estar en ralentí, se eliminará completamente del listado
   - Si posteriormente vuelve a entrar en ralentí, aparecerá como una nueva unidad activa (no ignorada)

8. **Gestión de estado:**

   - **Contexto**: Utilizar el contexto existente de la aplicación (buena práctica)
   - **Persistencia**: Solo durante la sesión activa
   - **Actualizaciones**: En tiempo real con cada actualización del hook usePrefFetch

9. **Actualizaciones en tiempo real:**
   - Las unidades dejarán de aparecer en la lista automáticamente cuando su estado ya no indique ralentí
   - Nuevas unidades en ralentí aparecerán en la lista con la próxima actualización de datos
   - **Timeout automático**: Eliminación después de 1 hora sin actualizaciones

### Diseño de la interfaz:

- **Botón principal:** Circular con ícono `DepartureBoardIcon` de Material-UI
- **Indicador de conteo:** Círculo rojo con número en blanco, posicionado en la esquina superior derecha del botón (siempre visible, mínimo "0")
- **Panel expandido:**
  - Encabezado con título "Unidades en ralentí" y contador
  - **Controles de ordenamiento**: Botones para alternar entre alfabético y por tiempo
  - Lista simple y compacta sin tarjetas
  - Cada ítem de la lista incluirá:
    - Icono de ojo (izquierda) para ignorar la unidad
    - Patente y conductor
    - **Contador de tiempo en formato reloj** (HH:MM:SS)
    - Indicador de estado (rojo para inicio/reporte, negro para fin)
- **Estados visuales:**
  - Unidades con "Inicio Ralenti" o "Reporte en Ralenti": texto en rojo o indicador rojo
  - Unidades con "Fin de ralenti": texto en negro o indicador negro
  - Unidades ignoradas: estilo atenuado (gris), al final de la lista

### Tecnologías a utilizar:

1. **React Context:** Utilizar el contexto existente de la aplicación para gestionar estado
2. **MUI Components:** Aprovechando componentes existentes para mantener consistencia visual
3. **React Transition Group:** Para implementar las animaciones de expansión
4. **DepartureBoardIcon:** Ícono específico de Material-UI para el botón principal

## Presupuesto actualizado:

**Funcionalidad: Alerta de unidades en ralentí**

| Tarea                                   | Horas estimadas | Descripción                                                  |
| --------------------------------------- | --------------- | ------------------------------------------------------------ |
| Análisis y planificación                | 2               | Estudio del contexto existente, planificación de integración |
| Desarrollo de lógica de detección       | 4               | Algoritmos para identificar unidades en ralentí con timeout  |
| Contador de tiempo basado en fechaHora  | 3               | Implementación del contador usando solo datos del endpoint   |
| Desarrollo de interfaz de usuario       | 6               | Botón, indicador y panel expandible con animaciones          |
| Sistema de ordenamiento                 | 2               | Implementación de ordenamiento alfabético y por tiempo       |
| Implementación del sistema de ignorados | 3               | Lógica para marcar y filtrar unidades ignoradas              |
| Posicionamiento adaptativo              | 4               | Lógica para ubicar el componente según el contexto           |
| Integración con sistema de selección    | 3               | Permitir seleccionar unidades desde el panel                 |
| Pruebas y ajustes                       | 5               | Testing exhaustivo con diferentes escenarios                 |
| Documentación                           | 2               | Manual de usuario y documentación técnica                    |
| **Total**                               | **34 horas**    | **Aproximadamente 4-5 días de desarrollo**                   |

**Costo estimado:** $60/hora × 34 horas = **$2,040 USD**

## Alcance del proyecto:

- **Disponibilidad:** Todos los clientes de FullControl GPS
- **Bonificación:** 100% del costo será bonificado por tratarse de una funcionalidad de interés general
- **Costo final para el cliente:** **$0 USD**

## Línea de tiempo estimada:

- Análisis y planificación: 1 día
- Desarrollo principal: 4 días
- Pruebas y ajustes: 1-2 días
- **Tiempo total:** 6-7 días laborables

## Entregables:

1. Componente de alerta de unidades en ralentí completamente integrado
2. Sistema de detección automática de unidades en ralentí con timeout
3. **Contador de tiempo basado exclusivamente en fechaHora del endpoint**
4. **Sistema de ordenamiento** (alfabético y por tiempo en ralentí)
5. Lista eficiente para mostrar y gestionar unidades en ralentí
6. Sistema de marcado de unidades como "ignoradas"
7. Integración con el sistema de selección de unidades existente
8. **Botón siempre visible** con badge de contador
9. Documentación de uso para el cliente final

Esta funcionalidad mejorará la capacidad de supervisión de la flota, permitiendo una rápida identificación de unidades en ralentí que podrían estar desperdiciando combustible o requiriendo atención, con herramientas de gestión y ordenamiento avanzadas.
