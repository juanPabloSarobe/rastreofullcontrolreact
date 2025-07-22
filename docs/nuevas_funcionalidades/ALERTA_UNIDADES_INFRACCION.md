# ALERTA DE UNIDADES EN INFRACCIÓN

## Resumen refinado de la funcionalidad:

El cliente desea implementar un sistema de alertas visuales para monitorear unidades que se encuentran en estado de infracción (de velocidad, tiempo de descanso, etc.). La funcionalidad debe:

1. Mostrar un icono circular (similar al botón "Seleccionar Flota" y al de "Unidades en ralentí") que indique la cantidad de unidades en infracción
2. Detectar unidades en infracción mediante el campo "estado" (cualquier texto que contenga la palabra "infracción" o "infraccion", independientemente de si es inicio, movimiento o fin)
3. Ubicarse estratégicamente en la interfaz:
   - Cuando no hay unidades seleccionadas: debajo del selector de unidades y del botón de ralentí
   - Cuando hay unidades seleccionadas: debajo del detalle de la unidad y del botón de ralentí
   - En vista móvil: siempre debajo del selector de unidades y del botón de ralentí
4. Expandirse al hacer clic mostrando dos listas ordenadas alfabéticamente:
   - Lista superior: Unidades actualmente en infracción (en rojo)
   - Lista inferior: Historial de unidades que tuvieron infracciones pero ya no (en gris)
5. Permitir seleccionar unidades haciendo clic directamente en un ítem de la lista (sin botones adicionales)
6. Mostrar todas las unidades con infracción activa en color rojo
7. Mantener registro de unidades con infracciones finalizadas:
   - Se muestran en color gris en la lista inferior
   - Permanecen visibles hasta el cierre de sesión o eliminación manual
   - Cada unidad en la lista de historial tiene un botón (icono de tacho) para eliminarla individualmente
   - Existe un botón en el encabezado de la lista de historial para eliminar todas las unidades con infracciones finalizadas

## Manual técnico preliminar:

### Descripción funcional:

El sistema de "Alertas de unidades en infracción" permitirá visualizar y gestionar las unidades que están cometiendo algún tipo de infracción (velocidad, descanso, etc.), lo que facilita la detección temprana de comportamientos riesgosos, mejora la seguridad vial y permite una respuesta rápida ante situaciones de incumplimiento normativo. Además, mantendrá un historial de infracciones durante la sesión para un mejor seguimiento de unidades problemáticas.

### Comportamiento del sistema:

1. **Detección de unidades en infracción:**

   - Cada vez que se ejecuta el hook usePrefFetch para actualizar las ubicaciones, se verificará el campo "estado" de cada unidad
   - Se considerarán en infracción las unidades cuyos estados contengan la palabra "infracción" o "infraccion" (con o sin tilde)
   - La detección será insensible a mayúsculas/minúsculas y acentos
   - Se incluirán todos los tipos de infracción: velocidad en distintas zonas, movimiento en infracción, tiempo de descanso, etc.

2. **Indicador visual:**

   - Un botón circular mostrará el número de unidades en infracción activas
   - Cuando hay unidades en infracción, se mostrará un círculo rojo con el número de unidades
   - El botón tendrá un comportamiento de expansión al hacer hover, similar al botón "Seleccionar Flota" y al de "Unidades en ralentí"

3. **Posicionamiento inteligente:**

   - Sin unidades seleccionadas: se ubicará debajo del selector de unidades y del botón de ralentí
   - Con unidades seleccionadas: se ubicará debajo del detalle de la unidad y del botón de ralentí
   - Vista móvil: siempre debajo del selector de unidades y del botón de ralentí, respetando la superposición del selector de unidades expandido

4. **Panel expandible:**

   - Al hacer clic en el icono, se expandirá lateralmente y luego hacia abajo con una animación de transición fluida
   - Mostrará dos listas de unidades claramente separadas:
     - Lista superior: Unidades actualmente en infracción
     - Lista inferior: Historial de unidades que ya no están en infracción

5. **Diseño del listado de unidades:**

   - Formato simple y compacto con información esencial (patente y conductor)
   - Sin botones adicionales para selección - la selección se realiza haciendo clic directamente en el ítem
   - Unidades actualmente en infracción: texto en rojo
   - Unidades con infracciones finalizadas: texto en gris

6. **Sistema de historial de infracciones:**

   - Cuando una unidad deja de estar en infracción, se mueve automáticamente a la lista de historial
   - Las unidades en la lista de historial permanecen hasta el cierre de sesión o eliminación manual
   - Cada unidad en el historial tiene un botón de eliminación (icono de tacho)
   - El encabezado de la lista de historial incluye un botón para "Eliminar todo el historial"

7. **Actualizaciones en tiempo real:**
   - Las unidades se mueven automáticamente entre la lista activa y la lista de historial según su estado actual
   - Nuevas unidades en infracción aparecerán en la lista activa con la próxima actualización de datos

### Diseño de la interfaz:

- **Botón principal:** Circular con ícono representativo (posiblemente un símbolo de exclamación o velocímetro)
- **Indicador de conteo:** Círculo rojo con número en blanco, posicionado en la esquina superior derecha del botón
- **Panel expandido:**
  - Encabezado con título "Unidades en infracción" y contador de infracciones activas
  - Lista activa: unidades actualmente en infracción, con texto en rojo
  - Separador visual
  - Encabezado secundario "Historial de infracciones" con botón de "Eliminar todo"
  - Lista de historial: unidades que ya no están en infracción, con texto en gris y botón de eliminación individual
- **Elementos de interacción:**
  - Clic en ítem de cualquier lista: selecciona la unidad en el mapa
  - Botón de tacho en ítems del historial: elimina esa unidad del historial
  - Botón "Eliminar todo" en encabezado del historial: limpia toda la lista de historial

### Tecnologías a utilizar:

1. **React Context:** Para gestionar el estado de las unidades en infracción y el historial durante la sesión
2. **MUI Components:** Aprovechando componentes existentes para mantener consistencia visual
3. **React Transition Group:** Para implementar las animaciones de expansión
4. **Local Storage:** Para mantener el historial de unidades con infracciones durante la sesión

## Presupuesto simple:

**Funcionalidad: Alerta de unidades en infracción**

| Tarea                                   | Horas estimadas | Descripción                                                   |
| --------------------------------------- | --------------- | ------------------------------------------------------------- |
| Análisis y planificación                | 3               | Estudio del código existente, planificación de la integración |
| Desarrollo de lógica de detección       | 4               | Algoritmos para identificar unidades en infracción            |
| Desarrollo de interfaz de usuario       | 6               | Botón, indicador y panel expandible con animaciones           |
| Implementación del sistema de historial | 4               | Lógica para gestionar unidades activas y en historial         |
| Posicionamiento adaptativo              | 4               | Lógica para ubicar el componente según el contexto            |
| Integración con sistema de selección    | 3               | Permitir seleccionar unidades desde el panel                  |
| Pruebas y ajustes                       | 5               | Testing exhaustivo con diferentes escenarios                  |
| Documentación                           | 2               | Manual de usuario y documentación técnica                     |
| **Total**                               | **31 horas**    | **Aproximadamente 4 días de desarrollo**                      |

**Costo estimado:** $60/hora × 31 horas = **$1,860 USD**

## Alcance del proyecto:

- **Disponibilidad:** Todos los clientes de FullControl GPS
- **Bonificación:** 100% del costo será bonificado por tratarse de una funcionalidad de interés general
- **Costo final para el cliente:** **$0 USD**

## Línea de tiempo estimada:

- Análisis y planificación: 1 día
- Desarrollo principal: 3 días
- Pruebas y ajustes: 1-2 días
- **Tiempo total:** 5-6 días laborables

## Entregables:

1. Componente de alerta de unidades en infracción completamente integrado
2. Sistema de detección automática de unidades en infracción
3. Sistema de doble lista: infracciones activas e historial de infracciones
4. Mecanismo para eliminar entradas individuales o completas del historial
5. Integración con el sistema de selección de unidades existente
6. Documentación de uso para el cliente final

Esta funcionalidad mejorará significativamente la capacidad de supervisión de la flota, permitiendo detectar rápidamente comportamientos de riesgo, mejorar la seguridad vial y asegurar el cumplimiento de normativas de tránsito y descanso de conductores, mientras mantiene un registro histórico de las infracciones ocurridas durante la sesión.
